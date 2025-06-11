import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, AssetType } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Asset validation schema
const createAssetSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(AssetType),
  subtype: z.string().optional(),
  country: z.string().length(2),
  currency: z.string().length(3),
  amount: z.number().or(z.string()).transform(val => String(val)),
  metadata: z.record(z.any()).optional(),
  familyId: z.string().optional()
});

const updateAssetSchema = createAssetSchema.partial();

// Get all assets for user/family
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { type, country, familyId } = req.query;

    const where: any = {
      organizationId: req.user!.organizationId,
      OR: [
        { userId: req.user!.id },
        { familyId: req.query.familyId as string }
      ]
    };

    if (type) where.type = type;
    if (country) where.country = country;

    const assets = await prisma.asset.findMany({
      where,
      include: {
        valuations: {
          orderBy: { date: 'desc' },
          take: 1
        },
        _count: {
          select: { transactions: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Calculate total by currency
    const totalsByCurrency = assets.reduce((acc, asset) => {
      const currency = asset.currency;
      if (!acc[currency]) acc[currency] = 0;
      acc[currency] += parseFloat(asset.amount.toString());
      return acc;
    }, {} as Record<string, number>);

    res.json({
      data: {
        assets,
        summary: {
          total: assets.length,
          totalsByCurrency,
          byType: assets.reduce((acc, asset) => {
            acc[asset.type] = (acc[asset.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single asset
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
        OR: [
          { userId: req.user!.id },
          { family: { members: { some: { id: req.user!.id } } } }
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        family: {
          select: { id: true, name: true }
        },
        transactions: {
          orderBy: { date: 'desc' },
          take: 10
        },
        valuations: {
          orderBy: { date: 'desc' },
          take: 12
        }
      }
    });

    if (!asset) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Asset not found'
      });
    }

    res.json({ data: { asset } });
  } catch (error) {
    next(error);
  }
});

// Create asset
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createAssetSchema.parse(req.body);

    // Verify family access if familyId provided
    if (data.familyId) {
      const family = await prisma.family.findFirst({
        where: {
          id: data.familyId,
          organizationId: req.user!.organizationId,
          members: { some: { id: req.user!.id } }
        }
      });

      if (!family) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'No access to this family'
        });
      }
    }

    const asset = await prisma.asset.create({
      data: {
        ...data,
        userId: data.familyId ? null : req.user!.id,
        organizationId: req.user!.organizationId
      }
    });

    logger.info(`Asset created: ${asset.id} by user ${req.user!.id}`);

    res.status(201).json({
      message: 'Asset created successfully',
      data: { asset }
    });
  } catch (error) {
    next(error);
  }
});

// Update asset
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = updateAssetSchema.parse(req.body);

    // Verify ownership
    const existing = await prisma.asset.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
        OR: [
          { userId: req.user!.id },
          { family: { members: { some: { id: req.user!.id } } } }
        ]
      }
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Asset not found'
      });
    }

    const asset = await prisma.asset.update({
      where: { id: req.params.id },
      data: {
        ...data,
        lastSyncedAt: new Date()
      }
    });

    res.json({
      message: 'Asset updated successfully',
      data: { asset }
    });
  } catch (error) {
    next(error);
  }
});

// Delete asset
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Verify ownership
    const asset = await prisma.asset.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
        OR: [
          { userId: req.user!.id },
          { family: { members: { some: { id: req.user!.id } } } }
        ]
      }
    });

    if (!asset) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Asset not found'
      });
    }

    await prisma.asset.delete({
      where: { id: req.params.id }
    });

    logger.info(`Asset deleted: ${req.params.id} by user ${req.user!.id}`);

    res.json({
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Add valuation
const valuationSchema = z.object({
  value: z.number().or(z.string()).transform(val => String(val)),
  currency: z.string().length(3),
  source: z.string(),
  date: z.string().datetime().optional()
});

router.post('/:id/valuations', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = valuationSchema.parse(req.body);

    // Verify ownership
    const asset = await prisma.asset.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
        OR: [
          { userId: req.user!.id },
          { family: { members: { some: { id: req.user!.id } } } }
        ]
      }
    });

    if (!asset) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Asset not found'
      });
    }

    const valuation = await prisma.valuation.create({
      data: {
        assetId: req.params.id,
        value: data.value,
        currency: data.currency,
        source: data.source,
        date: data.date ? new Date(data.date) : new Date()
      }
    });

    // Update asset amount with latest valuation
    await prisma.asset.update({
      where: { id: req.params.id },
      data: {
        amount: data.value,
        currency: data.currency
      }
    });

    res.status(201).json({
      message: 'Valuation added',
      data: { valuation }
    });
  } catch (error) {
    next(error);
  }
});

export default router;