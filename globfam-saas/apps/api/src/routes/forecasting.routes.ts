import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { ForecastingService } from '../services/forecasting/forecasting.service';
import { prisma } from '../lib/prisma';

const router = Router();
const forecastingService = new ForecastingService(prisma);

// Get financial forecast
router.get('/forecasting/forecast', authenticate, async (req, res) => {
  try {
    const months = parseInt(req.query.months as string) || 12;
    
    const forecast = await forecastingService.generateForecast(
      req.user.id,
      req.user.organizationId,
      months
    );

    res.json(forecast);
  } catch (error) {
    console.error('Get forecast error:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

// Generate custom forecast
router.post('/forecasting/custom', authenticate, async (req, res) => {
  try {
    const schema = z.object({
      name: z.string(),
      monthlyIncome: z.number().positive(),
      monthlyExpenses: z.number().positive(),
      savingsRate: z.number().min(0).max(100),
      inflationRate: z.number().optional(),
      months: z.number().optional().default(12)
    });

    const { months, ...scenario } = schema.parse(req.body);
    
    const forecast = await forecastingService.generateCustomForecast(
      req.user.id,
      req.user.organizationId,
      scenario,
      months
    );

    res.json({ forecast });
  } catch (error) {
    console.error('Custom forecast error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to generate custom forecast' });
  }
});

// What-if analysis
router.post('/forecasting/what-if', authenticate, async (req, res) => {
  try {
    const schema = z.object({
      scenarios: z.array(z.object({
        name: z.string(),
        changes: z.object({
          incomeChange: z.number().optional(),
          expenseChange: z.number().optional(),
          oneTimeExpense: z.object({
            amount: z.number(),
            month: z.number()
          }).optional(),
          oneTimeIncome: z.object({
            amount: z.number(),
            month: z.number()
          }).optional()
        })
      }))
    });

    const { scenarios } = schema.parse(req.body);
    
    const analysis = await forecastingService.whatIfAnalysis(
      req.user.id,
      req.user.organizationId,
      scenarios
    );

    res.json(analysis);
  } catch (error) {
    console.error('What-if analysis error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to perform what-if analysis' });
  }
});

// Retirement projection
router.post('/forecasting/retirement', authenticate, async (req, res) => {
  try {
    const schema = z.object({
      targetRetirementAge: z.number().min(50).max(80),
      targetMonthlyIncome: z.number().positive()
    });

    const data = schema.parse(req.body);
    
    const projection = await forecastingService.getRetirementProjection(
      req.user.id,
      req.user.organizationId,
      data.targetRetirementAge,
      data.targetMonthlyIncome
    );

    res.json(projection);
  } catch (error) {
    console.error('Retirement projection error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to generate retirement projection' });
  }
});

export default router;