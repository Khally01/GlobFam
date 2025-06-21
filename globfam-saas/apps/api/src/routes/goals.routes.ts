import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { GoalsService } from '../services/goals/goals.service';
import { prisma } from '../lib/prisma';
import { GoalType, GoalStatus } from '@prisma/client';

const router = Router();
const goalsService = new GoalsService(prisma);

// Validation schemas
const createGoalSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['SAVINGS', 'DEBT_PAYOFF', 'INVESTMENT', 'PURCHASE', 'EMERGENCY_FUND', 'CUSTOM']),
  targetAmount: z.number().positive(),
  currency: z.string().length(3),
  targetDate: z.string().transform(str => new Date(str)),
  autoContribute: z.boolean().optional().default(false),
  contributionAmount: z.number().positive().optional(),
  contributionFrequency: z.enum(['weekly', 'biweekly', 'monthly']).optional()
});

const contributeSchema = z.object({
  amount: z.number().positive(),
  note: z.string().optional(),
  transactionId: z.string().optional()
});

// Get all goals
router.get('/goals', authenticate, async (req, res) => {
  try {
    const status = req.query.status as GoalStatus | undefined;
    
    const goals = await goalsService.getGoals(
      req.user.id,
      req.user.organizationId,
      status
    );

    res.json({ goals });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Get goal insights
router.get('/goals/insights', authenticate, async (req, res) => {
  try {
    const insights = await goalsService.getGoalInsights(
      req.user.id,
      req.user.organizationId
    );

    res.json(insights);
  } catch (error) {
    console.error('Get goal insights error:', error);
    res.status(500).json({ error: 'Failed to fetch goal insights' });
  }
});

// Get single goal
router.get('/goals/:id', authenticate, async (req, res) => {
  try {
    const goal = await goalsService.getGoalById(
      req.params.id,
      req.user.id,
      req.user.organizationId
    );

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

// Create goal
router.post('/goals', authenticate, async (req, res) => {
  try {
    const data = createGoalSchema.parse(req.body);
    
    const goal = await goalsService.createGoal(
      req.user.id,
      req.user.organizationId,
      data
    );

    res.status(201).json({ goal });
  } catch (error) {
    console.error('Create goal error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Update goal
router.put('/goals/:id', authenticate, async (req, res) => {
  try {
    const data = createGoalSchema.partial().parse(req.body);
    
    const goal = await goalsService.updateGoal(
      req.params.id,
      req.user.id,
      req.user.organizationId,
      data
    );

    res.json({ goal });
  } catch (error) {
    console.error('Update goal error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Contribute to goal
router.post('/goals/:id/contribute', authenticate, async (req, res) => {
  try {
    const data = contributeSchema.parse(req.body);
    
    const goal = await goalsService.contributeToGoal(
      req.user.id,
      req.user.organizationId,
      {
        goalId: req.params.id,
        ...data
      }
    );

    res.json({ goal });
  } catch (error) {
    console.error('Contribute to goal error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to contribute to goal' });
  }
});

// Delete goal
router.delete('/goals/:id', authenticate, async (req, res) => {
  try {
    await goalsService.deleteGoal(
      req.params.id,
      req.user.id,
      req.user.organizationId
    );

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default router;