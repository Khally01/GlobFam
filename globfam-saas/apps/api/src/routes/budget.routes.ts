import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { MonthlyBudgetService } from '../services/budget/monthly-budget.service';

const router = Router();
const monthlyBudgetService = new MonthlyBudgetService(prisma);

// Budget validation schema
const createBudgetSchema = z.object({
  name: z.string().optional().default('Monthly Budget'),
  period: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom']).default('monthly'),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  currency: z.string().length(3)
});

// Get budgets (legacy)
router.get('/budgets', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: {
        userId: req.user!.id,
        organizationId: req.user!.organizationId
      },
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Create budget (legacy)
router.post('/budgets', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = createBudgetSchema.parse(req.body);
    
    const budget = await prisma.budget.create({
      data: {
        name: data.name,
        period: data.period.toUpperCase() as any,
        startDate: data.startDate,
        endDate: data.endDate,
        currency: data.currency,
        userId: req.user!.id,
        organizationId: req.user!.organizationId
      },
      include: {
        items: true
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

// Update budget (legacy)
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
        items: true
      }
    });

    res.json({ data: updated });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// Delete budget (legacy)
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

    await prisma.budget.delete({ where: { id } });

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

// Get monthly budget (new YNAB-style)
router.get('/budgets/monthly', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.query;
    
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month as string) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year as string) : currentDate.getFullYear();

    const monthlyBudget = await monthlyBudgetService.getMonthlyBudget(
      req.user!.organizationId,
      targetMonth,
      targetYear
    );

    res.json({ data: monthlyBudget });
  } catch (error) {
    console.error('Get monthly budget error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly budget' });
  }
});

// Update monthly budget for a category (new YNAB-style)
router.post('/budgets/monthly', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, month, year, budgeted } = req.body;

    if (!categoryId || budgeted === undefined) {
      return res.status(400).json({ error: 'Category ID and budgeted amount are required' });
    }

    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const updated = await monthlyBudgetService.updateMonthlyBudget(
      req.user!.organizationId,
      categoryId,
      targetMonth,
      targetYear,
      budgeted
    );

    res.json({ data: updated });
  } catch (error) {
    console.error('Update monthly budget error:', error);
    res.status(500).json({ error: 'Failed to update monthly budget' });
  }
});

// Recalculate monthly budgets
router.post('/budgets/monthly/recalculate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    await monthlyBudgetService.recalculateMonthlyBudgets(
      req.user!.organizationId,
      month,
      year
    );

    res.json({ message: 'Monthly budgets recalculated successfully' });
  } catch (error) {
    console.error('Recalculate monthly budgets error:', error);
    res.status(500).json({ error: 'Failed to recalculate monthly budgets' });
  }
});

export default router;