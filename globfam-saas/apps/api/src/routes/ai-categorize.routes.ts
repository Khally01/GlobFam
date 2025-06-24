import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { CategorizationService } from '../services/categorization.service';
import prisma from '../lib/prisma';

const router = Router();
const categorizationService = new CategorizationService(prisma);

// Categorize uncategorized transactions
router.post('/ai/categorize-transactions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { importId, limit = 100 } = req.body;

    // Get uncategorized transactions
    const query: any = {
      organizationId: req.user!.organizationId,
      OR: [
        { category: 'Other' },
        { category: 'Other Income' },
        { metadata: { path: '$.needsCategorization', equals: true } }
      ]
    };

    if (importId) {
      query.importHistoryId = importId;
    }

    const transactions = await prisma.transaction.findMany({
      where: query,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    if (transactions.length === 0) {
      return res.json({ 
        message: 'No transactions need categorization',
        categorized: 0
      });
    }

    // Process in batches for efficiency
    const BATCH_SIZE = 10;
    let categorizedCount = 0;
    const errors: any[] = [];

    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      const batch = transactions.slice(i, i + BATCH_SIZE);
      
      // Process batch in parallel
      const promises = batch.map(async (transaction) => {
        try {
          const result = await categorizationService.categorizeTransaction(
            transaction.description || '',
            parseFloat(transaction.amount.toString()),
            transaction.type
          );

          // Update transaction with AI categorization
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              category: result.subcategory || result.category,
              metadata: {
                ...(transaction.metadata as any || {}),
                aiCategorized: true,
                confidence: result.confidence,
                merchantName: result.merchantName,
                isRecurring: result.isRecurring,
                recurringFrequency: result.recurringFrequency,
                needsCategorization: false
              }
            }
          });

          // Also create categorization history
          await prisma.aICategorizationHistory.create({
            data: {
              transactionId: transaction.id,
              originalCategory: transaction.category,
              suggestedCategory: result.subcategory || result.category,
              confidence: result.confidence,
              accepted: true,
              model: 'gpt-3.5-turbo',
              response: result as any
            }
          });

          categorizedCount++;
        } catch (error) {
          console.error('Failed to categorize transaction:', transaction.id, error);
          errors.push({ transactionId: transaction.id, error: error.message });
        }
      });

      await Promise.all(promises);
    }

    res.json({
      message: 'Categorization complete',
      categorized: categorizedCount,
      total: transactions.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Categorization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get categorization suggestions for review
router.get('/ai/categorization-review', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const recentCategorizations = await prisma.aICategorizationHistory.findMany({
      where: {
        transaction: {
          organizationId: req.user!.organizationId
        },
        accepted: true,
        confidence: { lt: 0.8 } // Low confidence suggestions
      },
      include: {
        transaction: {
          select: {
            id: true,
            description: true,
            amount: true,
            date: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ suggestions: recentCategorizations });
  } catch (error: any) {
    console.error('Get categorization review error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;