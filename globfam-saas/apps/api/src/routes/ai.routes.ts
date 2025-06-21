import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { OpenAIService } from '../services/ai/openai.service';
import { prisma } from '../lib/prisma';

const router = Router();
const openAIService = new OpenAIService(prisma);

// Categorize transactions
router.post('/ai/categorize', authenticate, async (req, res) => {
  try {
    const schema = z.object({
      transactionIds: z.array(z.string()).optional(),
      limit: z.number().optional().default(50)
    });

    const { transactionIds, limit } = schema.parse(req.body);

    // Get uncategorized or specified transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        organizationId: req.user.organizationId,
        ...(transactionIds ? { id: { in: transactionIds } } : {
          OR: [
            { category: 'Other' },
            { category: 'Other Income' }
          ]
        })
      },
      select: {
        id: true,
        description: true,
        amount: true,
        type: true,
        date: true,
        category: true
      },
      take: limit,
      orderBy: { date: 'desc' }
    });

    if (transactions.length === 0) {
      return res.json({
        categorizations: [],
        message: 'No transactions to categorize'
      });
    }

    const results = await openAIService.categorizeTransactions(
      transactions.map(t => ({
        ...t,
        amount: t.amount.toString(),
        currentCategory: t.category
      })),
      req.user.id,
      req.user.organizationId
    );

    res.json({ categorizations: results });
  } catch (error) {
    console.error('Categorization error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to categorize transactions' 
    });
  }
});

// Apply categorization suggestions
router.post('/ai/categorize/apply', authenticate, async (req, res) => {
  try {
    const schema = z.object({
      categorizations: z.array(z.object({
        transactionId: z.string(),
        category: z.string(),
        accepted: z.boolean()
      }))
    });

    const { categorizations } = schema.parse(req.body);

    // Apply accepted categorizations
    const updates = await Promise.all(
      categorizations
        .filter(c => c.accepted)
        .map(c => 
          prisma.transaction.update({
            where: { 
              id: c.transactionId,
              userId: req.user.id,
              organizationId: req.user.organizationId
            },
            data: { category: c.category }
          })
        )
    );

    // Update AI categorization history with feedback
    await Promise.all(
      categorizations.map(c =>
        prisma.aICategorizationHistory.updateMany({
          where: { 
            transactionId: c.transactionId 
          },
          data: {
            accepted: c.accepted,
            userFeedback: c.accepted ? 'correct' : 'incorrect'
          }
        })
      )
    );

    res.json({
      updated: updates.length,
      message: `Applied ${updates.length} categorizations`
    });
  } catch (error) {
    console.error('Apply categorization error:', error);
    res.status(500).json({ 
      error: 'Failed to apply categorizations' 
    });
  }
});

// Get financial insights
router.get('/ai/insights', authenticate, async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as 'monthly' | 'quarterly' | 'yearly') || 'monthly';
    
    const insights = await openAIService.generateFinancialInsights(
      req.user.id,
      req.user.organizationId,
      timeframe
    );

    res.json({ insights, timeframe });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate insights' 
    });
  }
});

// Get budget suggestions
router.post('/ai/budget', authenticate, async (req, res) => {
  try {
    const schema = z.object({
      monthlyIncome: z.number().positive(),
      currency: z.string().length(3)
    });

    const { monthlyIncome, currency } = schema.parse(req.body);

    const budget = await openAIService.suggestBudget(
      req.user.id,
      req.user.organizationId,
      monthlyIncome,
      currency
    );

    res.json({ budget, currency });
  } catch (error) {
    console.error('Budget suggestion error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to suggest budget' 
    });
  }
});

// Get categorization history
router.get('/ai/categorization-history', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    
    const history = await prisma.aICategorizationHistory.findMany({
      where: {
        transaction: {
          userId: req.user.id,
          organizationId: req.user.organizationId
        }
      },
      include: {
        transaction: {
          select: {
            id: true,
            description: true,
            amount: true,
            category: true,
            date: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.json(history);
  } catch (error) {
    console.error('Get categorization history error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categorization history' 
    });
  }
});

export default router;