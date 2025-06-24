import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// Budget validation schema
const createBudgetSchema = z.object({
  name: z.string().optional().default('Monthly Budget'),
  period: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']).default('monthly'),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  currency: z.string().length(3),
  categories: z.array(z.object({
    category: z.string(),
    amount: z.number().positive(),
    description: z.string().optional()
  }))
});

// Get budgets
router.get('/budgets', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: {
        userId: req.user!.id,
        organizationId: req.user!.organizationId
      },
      include: {
        categories: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Create budget
router.post('/budgets', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = createBudgetSchema.parse(req.body);
    
    const budget = await prisma.budget.create({
      data: {
        name: data.name,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        currency: data.currency,
        userId: req.user!.id,
        organizationId: req.user!.organizationId,
        categories: {
          create: data.categories.map(cat => ({
            category: cat.category,
            budgetedAmount: cat.amount,
            description: cat.description
          }))
        }
      },
      include: {
        categories: true
      }
    });

    res.json({ data: budget });
  } catch (error: any) {
    console.error('Create budget error:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid budget data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to save budget' });
    }
  }
});

// Update budget
router.put('/budgets/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: req.user!.id,
        organizationId: req.user!.organizationId
      }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Update budget
    const updated = await prisma.budget.update({
      where: { id },
      data: updates,
      include: {
        categories: true
      }
    });

    res.json({ data: updated });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// Delete budget
router.delete('/budgets/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: req.user!.id,
        organizationId: req.user!.organizationId
      }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await prisma.budget.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

export default router;