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
  currency: z.string().length(3),
  categories: z.array(z.object({
    category: z.string(),
    amount: z.number().positive()
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
        period: data.period.toUpperCase() as any,
        startDate: data.startDate,
        endDate: data.endDate,
        currency: data.currency,
        userId: req.user!.id,
        organizationId: req.user!.organizationId,
        categories: {
          create: data.categories.map(cat => ({
            category: cat.category,
            amount: cat.amount
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

// Monthly budget routes (YNAB-style)
const monthlyBudgetSchema = z.object({
  categoryId: z.string(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  budgeted: z.number().min(0)
});

// Get monthly budget
router.get('/budgets/monthly', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const budgetData = await monthlyBudgetService.getMonthlyBudget(
      req.user!.organizationId,
      month,
      year
    );

    res.json({ data: budgetData });
  } catch (error) {
    console.error('Get monthly budget error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly budget' });
  }
});

// Update monthly budget for a category
router.post('/budgets/monthly', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = monthlyBudgetSchema.parse(req.body);

    const updated = await monthlyBudgetService.updateMonthlyBudget(
      req.user!.organizationId,
      data.categoryId,
      data.month,
      data.year,
      data.budgeted
    );

    res.json({ data: updated });
  } catch (error: any) {
    console.error('Update monthly budget error:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid data', details: error.errors });
    } else if (error.statusCode === 404) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update monthly budget' });
    }
  }
});

// Recalculate monthly budgets
router.post('/budgets/monthly/recalculate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const results = await monthlyBudgetService.recalculateMonthlyBudgets(
      req.user!.organizationId,
      month,
      year
    );

    res.json({ data: results });
  } catch (error) {
    console.error('Recalculate monthly budgets error:', error);
    res.status(500).json({ error: 'Failed to recalculate budgets' });
  }
});

export default router;