import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, TransactionType } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Transaction validation schema
const createTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  category: z.string(),
  amount: z.number().or(z.string()).transform(val => String(val)),
  currency: z.string().length(3),
  description: z.string().optional(),
  date: z.string().datetime(),
  assetId: z.string(),
  metadata: z.record(z.any()).optional()
});

// Get transactions with filters
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { 
      assetId, 
      type, 
      category, 
      startDate, 
      endDate,
      limit = '50',
      offset = '0'
    } = req.query;

    const where: any = {
      organizationId: req.user!.organizationId,
      OR: [
        { userId: req.user!.id },
        { asset: { family: { members: { some: { id: req.user!.id } } } } }
      ]
    };

    if (assetId) where.assetId = assetId;
    if (type) where.type = type;
    if (category) where.category = category;
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          asset: {
            select: { id: true, name: true, type: true }
          },
          user: {
            select: { id: true, name: true }
          }
        },
        orderBy: { date: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      data: {
        transactions,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction by ID
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
        OR: [
          { userId: req.user!.id },
          { asset: { family: { members: { some: { id: req.user!.id } } } } }
        ]
      },
      include: {
        asset: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Transaction not found'
      });
    }

    res.json({ data: { transaction } });
  } catch (error) {
    next(error);
  }
});

// Create transaction
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createTransactionSchema.parse(req.body);

    // Verify asset access
    const asset = await prisma.asset.findFirst({
      where: {
        id: data.assetId,
        organizationId: req.user!.organizationId,
        OR: [
          { userId: req.user!.id },
          { family: { members: { some: { id: req.user!.id } } } }
        ]
      }
    });

    if (!asset) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'No access to this asset'
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        date: new Date(data.date),
        userId: req.user!.id,
        organizationId: req.user!.organizationId
      },
      include: {
        asset: {
          select: { id: true, name: true, type: true }
        }
      }
    });

    // Update asset balance
    const amount = parseFloat(data.amount);
    const currentAmount = parseFloat(asset.amount.toString());
    let newAmount = currentAmount;

    if (data.type === 'INCOME') {
      newAmount += amount;
    } else if (data.type === 'EXPENSE') {
      newAmount -= amount;
    }

    await prisma.asset.update({
      where: { id: data.assetId },
      data: { amount: newAmount.toString() }
    });

    res.status(201).json({
      message: 'Transaction created',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
});

// Update transaction
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createTransactionSchema.partial().parse(req.body);

    // Verify ownership
    const existing = await prisma.transaction.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
        userId: req.user!.id
      },
      include: { asset: true }
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Transaction not found'
      });
    }

    // Revert the original transaction's effect on asset
    const oldAmount = parseFloat(existing.amount.toString());
    const currentAssetAmount = parseFloat(existing.asset.amount.toString());
    let revertedAmount = currentAssetAmount;

    if (existing.type === 'INCOME') {
      revertedAmount -= oldAmount;
    } else if (existing.type === 'EXPENSE') {
      revertedAmount += oldAmount;
    }

    // Apply new transaction amount
    if (data.amount && data.type) {
      const newAmount = parseFloat(data.amount);
      if (data.type === 'INCOME') {
        revertedAmount += newAmount;
      } else if (data.type === 'EXPENSE') {
        revertedAmount -= newAmount;
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined
      }
    });

    // Update asset balance
    await prisma.asset.update({
      where: { id: existing.assetId },
      data: { amount: revertedAmount.toString() }
    });

    res.json({
      message: 'Transaction updated',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
});

// Delete transaction
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Verify ownership
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
        userId: req.user!.id
      },
      include: { asset: true }
    });

    if (!transaction) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Transaction not found'
      });
    }

    // Revert transaction effect on asset balance
    const amount = parseFloat(transaction.amount.toString());
    const currentAmount = parseFloat(transaction.asset.amount.toString());
    let newAmount = currentAmount;

    if (transaction.type === 'INCOME') {
      newAmount -= amount;
    } else if (transaction.type === 'EXPENSE') {
      newAmount += amount;
    }

    await prisma.$transaction([
      prisma.transaction.delete({
        where: { id: req.params.id }
      }),
      prisma.asset.update({
        where: { id: transaction.assetId },
        data: { amount: newAmount.toString() }
      })
    ]);

    res.json({
      message: 'Transaction deleted'
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction analytics
router.get('/analytics/summary', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { startDate, endDate, assetId } = req.query;

    const where: any = {
      organizationId: req.user!.organizationId,
      OR: [
        { userId: req.user!.id },
        { asset: { family: { members: { some: { id: req.user!.id } } } } }
      ]
    };

    if (assetId) where.assetId = assetId;
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      select: {
        type: true,
        category: true,
        amount: true,
        currency: true,
        date: true
      }
    });

    // Calculate summaries
    const summary = transactions.reduce((acc, tx) => {
      const amount = parseFloat(tx.amount.toString());
      
      // By type
      if (!acc.byType[tx.type]) {
        acc.byType[tx.type] = { total: 0, count: 0 };
      }
      acc.byType[tx.type].total += amount;
      acc.byType[tx.type].count += 1;

      // By category
      if (!acc.byCategory[tx.category]) {
        acc.byCategory[tx.category] = { total: 0, count: 0 };
      }
      acc.byCategory[tx.category].total += amount;
      acc.byCategory[tx.category].count += 1;

      // By currency
      if (!acc.byCurrency[tx.currency]) {
        acc.byCurrency[tx.currency] = { income: 0, expense: 0 };
      }
      if (tx.type === 'INCOME') {
        acc.byCurrency[tx.currency].income += amount;
      } else if (tx.type === 'EXPENSE') {
        acc.byCurrency[tx.currency].expense += amount;
      }

      return acc;
    }, {
      byType: {} as Record<string, { total: number; count: number }>,
      byCategory: {} as Record<string, { total: number; count: number }>,
      byCurrency: {} as Record<string, { income: number; expense: number }>
    });

    res.json({
      data: {
        summary,
        period: {
          startDate: startDate || 'all-time',
          endDate: endDate || 'current'
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;