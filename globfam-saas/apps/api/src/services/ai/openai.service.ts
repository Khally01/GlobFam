import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';

interface TransactionForCategorization {
  id: string;
  description: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  date: Date;
  currentCategory?: string;
}

interface CategorizationResult {
  transactionId: string;
  suggestedCategory: string;
  confidence: number;
  reasoning?: string;
}

export class OpenAIService {
  private openai: OpenAI | null = null;
  private isConfigured: boolean = false;
  
  constructor(private prisma: PrismaClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.isConfigured = true;
    } else {
      logger.warn('OpenAI API key not configured');
    }
  }

  async categorizeTransactions(
    transactions: TransactionForCategorization[],
    userId: string,
    organizationId: string
  ): Promise<CategorizationResult[]> {
    if (!this.isConfigured || !this.openai) {
      throw new Error('OpenAI service not configured');
    }

    try {
      // Get user's historical categorization patterns for better context
      const historicalCategories = await this.getUserCategorizationPatterns(userId);
      
      // Prepare the prompt
      const prompt = this.buildCategorizationPrompt(transactions, historicalCategories);
      
      // Call OpenAI
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a financial transaction categorization expert. Categorize transactions based on their descriptions and amounts. 
            For INCOME transactions, use categories like: Salary, Business, Investment, Rental, Gift, Other Income.
            For EXPENSE transactions, use categories like: Rent, Mortgage, Groceries, Utilities, Transport, Healthcare, Education, Childcare, Entertainment, Shopping, Insurance, Taxes, Other.
            Provide your response as a JSON array with transactionId, suggestedCategory, confidence (0-1), and reasoning.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const results: CategorizationResult[] = JSON.parse(response).categorizations;
      
      // Store categorization history
      await this.storeCategorizationHistory(results, userId, organizationId, 'gpt-3.5-turbo', prompt);
      
      return results;
    } catch (error) {
      logger.error('OpenAI categorization error:', error);
      throw new Error('Failed to categorize transactions');
    }
  }

  async generateFinancialInsights(
    userId: string,
    organizationId: string,
    timeframe: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ): Promise<string> {
    if (!this.isConfigured || !this.openai) {
      throw new Error('OpenAI service not configured');
    }

    try {
      // Get user's financial data
      const financialSummary = await this.getFinancialSummary(userId, organizationId, timeframe);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a personal financial advisor. Analyze the user's financial data and provide actionable insights, 
            identifying spending patterns, savings opportunities, and budget recommendations. Keep advice practical and specific.`
          },
          {
            role: 'user',
            content: `Analyze my ${timeframe} financial data and provide insights:\n${JSON.stringify(financialSummary, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0]?.message?.content || 'Unable to generate insights';
    } catch (error) {
      logger.error('OpenAI insights error:', error);
      throw new Error('Failed to generate insights');
    }
  }

  async suggestBudget(
    userId: string,
    organizationId: string,
    income: number,
    currency: string
  ): Promise<Record<string, number>> {
    if (!this.isConfigured || !this.openai) {
      throw new Error('OpenAI service not configured');
    }

    try {
      const historicalSpending = await this.getHistoricalSpending(userId, organizationId);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a budget planning expert. Based on the user's income and spending history, 
            suggest a practical monthly budget allocation. Consider the 50/30/20 rule but adjust based on actual patterns.
            Return a JSON object with category names as keys and suggested amounts as values.`
          },
          {
            role: 'user',
            content: `Monthly income: ${currency} ${income}\nHistorical spending:\n${JSON.stringify(historicalSpending, null, 2)}\n\nSuggest a monthly budget.`
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(response).budget;
    } catch (error) {
      logger.error('OpenAI budget suggestion error:', error);
      throw new Error('Failed to suggest budget');
    }
  }

  private buildCategorizationPrompt(
    transactions: TransactionForCategorization[],
    historicalPatterns: any
  ): string {
    const transactionList = transactions.map(t => ({
      id: t.id,
      description: t.description,
      amount: t.amount,
      type: t.type,
      date: t.date.toISOString().split('T')[0]
    }));

    return `Categorize these transactions based on their descriptions and types.
Historical patterns for context: ${JSON.stringify(historicalPatterns)}

Transactions to categorize:
${JSON.stringify(transactionList, null, 2)}

Return a JSON object with a "categorizations" array containing objects with transactionId, suggestedCategory, confidence (0-1), and reasoning.`;
  }

  private async getUserCategorizationPatterns(userId: string): Promise<any> {
    // Get the most common categories used by the user
    const patterns = await this.prisma.transaction.groupBy({
      by: ['category', 'type'],
      where: { userId },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 20
    });

    return patterns.reduce((acc, pattern) => {
      if (!acc[pattern.type]) acc[pattern.type] = [];
      acc[pattern.type].push({
        category: pattern.category,
        count: pattern._count.category
      });
      return acc;
    }, {} as Record<string, any[]>);
  }

  private async storeCategorizationHistory(
    results: CategorizationResult[],
    userId: string,
    organizationId: string,
    model: string,
    prompt: string
  ): Promise<void> {
    const categorizationHistory = results.map(result => ({
      transactionId: result.transactionId,
      suggestedCategory: result.suggestedCategory,
      confidence: result.confidence,
      model,
      prompt,
      response: { reasoning: result.reasoning }
    }));

    await this.prisma.aICategorizationHistory.createMany({
      data: categorizationHistory
    });
  }

  private async getFinancialSummary(
    userId: string,
    organizationId: string,
    timeframe: 'monthly' | 'quarterly' | 'yearly'
  ): Promise<any> {
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'quarterly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
    }

    // Get transactions summary
    const transactions = await this.prisma.transaction.groupBy({
      by: ['type', 'category'],
      where: {
        userId,
        organizationId,
        date: { gte: startDate }
      },
      _sum: { amount: true },
      _count: true
    });

    // Get assets summary
    const assets = await this.prisma.asset.groupBy({
      by: ['type', 'currency'],
      where: { userId, organizationId },
      _sum: { amount: true },
      _count: true
    });

    return {
      timeframe,
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      transactions,
      assets,
      totalIncome: transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + (t._sum.amount?.toNumber() || 0), 0),
      totalExpenses: transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + (t._sum.amount?.toNumber() || 0), 0)
    };
  }

  private async getHistoricalSpending(
    userId: string,
    organizationId: string
  ): Promise<Record<string, number>> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const spending = await this.prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        organizationId,
        type: 'EXPENSE',
        date: { gte: threeMonthsAgo }
      },
      _avg: { amount: true }
    });

    return spending.reduce((acc, item) => {
      acc[item.category] = item._avg.amount?.toNumber() || 0;
      return acc;
    }, {} as Record<string, number>);
  }
}