import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { prisma } from '../lib/prisma';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

const router = Router();
const analyticsService = new AnalyticsService(prisma);

// Get spending by category
router.get('/analytics/spending-by-category', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const timeRange = {
      startDate: startDate ? new Date(startDate as string) : startOfMonth(subMonths(new Date(), 1)),
      endDate: endDate ? new Date(endDate as string) : endOfMonth(new Date())
    };

    const spending = await analyticsService.getSpendingByCategory(
      req.user!.id,
      req.user!.organizationId,
      timeRange
    );

    res.json({ spending, timeRange });
  } catch (error) {
    console.error('Get spending by category error:', error);
    res.status(500).json({ error: 'Failed to fetch spending data' });
  }
});

// Get monthly trends
router.get('/analytics/monthly-trends', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const months = parseInt(req.query.months as string) || 12;
    
    const trends = await analyticsService.getMonthlyTrends(
      req.user!.id,
      req.user!.organizationId,
      months
    );

    res.json({ trends });
  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly trends' });
  }
});

// Get financial health score
router.get('/analytics/health-score', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const healthScore = await analyticsService.getFinancialHealthScore(
      req.user!.id,
      req.user!.organizationId
    );

    res.json(healthScore);
  } catch (error) {
    console.error('Get health score error:', error);
    res.status(500).json({ error: 'Failed to calculate health score' });
  }
});

// Get cash flow forecast
router.get('/analytics/cash-flow-forecast', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const months = parseInt(req.query.months as string) || 3;
    
    const forecast = await analyticsService.getCashFlowForecast(
      req.user!.id,
      req.user!.organizationId,
      months
    );

    res.json({ forecast });
  } catch (error) {
    console.error('Get cash flow forecast error:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

// Get top expenses
router.get('/analytics/top-expenses', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, limit } = req.query;
    
    const timeRange = {
      startDate: startDate ? new Date(startDate as string) : startOfMonth(new Date()),
      endDate: endDate ? new Date(endDate as string) : endOfMonth(new Date())
    };

    const expenses = await analyticsService.getTopExpenses(
      req.user!.id,
      req.user!.organizationId,
      timeRange,
      limit ? parseInt(limit as string) : 10
    );

    res.json({ expenses, timeRange });
  } catch (error) {
    console.error('Get top expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch top expenses' });
  }
});

// Get budget comparison
router.post('/analytics/budget-comparison', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      budget: z.record(z.number()),
      startDate: z.string().optional(),
      endDate: z.string().optional()
    });

    const { budget, startDate, endDate } = schema.parse(req.body);
    
    const timeRange = {
      startDate: startDate ? new Date(startDate) : startOfMonth(new Date()),
      endDate: endDate ? new Date(endDate) : endOfMonth(new Date())
    };

    const comparison = await analyticsService.getBudgetComparison(
      req.user!.id,
      req.user!.organizationId,
      budget,
      timeRange
    );

    res.json({ comparison, timeRange });
  } catch (error) {
    console.error('Get budget comparison error:', error);
    res.status(500).json({ error: 'Failed to compare budget' });
  }
});

// Get analytics summary (combines multiple analytics)
router.get('/analytics/summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const currentMonth = {
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date())
    };

    const [spending, trends, healthScore, topExpenses] = await Promise.all([
      analyticsService.getSpendingByCategory(
        req.user!.id,
        req.user!.organizationId,
        currentMonth
      ),
      analyticsService.getMonthlyTrends(
        req.user!.id,
        req.user!.organizationId,
        6
      ),
      analyticsService.getFinancialHealthScore(
        req.user!.id,
        req.user!.organizationId
      ),
      analyticsService.getTopExpenses(
        req.user!.id,
        req.user!.organizationId,
        currentMonth,
        5
      )
    ]);

    res.json({
      currentMonth: {
        spending,
        topExpenses
      },
      trends,
      healthScore
    });
  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

export default router;