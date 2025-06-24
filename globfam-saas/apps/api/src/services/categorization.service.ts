import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { logger } from '../utils/logger';
import { SecurityConfig } from '../config/security.config';

export interface CategorizationResult {
  category: string;
  confidence: number;
  subcategory?: string;
  merchantName?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
}

export class CategorizationService {
  private prisma: PrismaClient;
  private openai: OpenAI | null;
  private categoryCache: Map<string, CategorizationResult> = new Map();

  // Predefined categories for better consistency
  private readonly CATEGORIES = {
    INCOME: ['Salary', 'Freelance', 'Investment', 'Refund', 'Transfer In', 'Other Income'],
    HOUSING: ['Rent', 'Mortgage', 'Property Tax', 'Home Insurance', 'Utilities', 'Maintenance'],
    TRANSPORTATION: ['Fuel', 'Public Transport', 'Uber/Taxi', 'Car Payment', 'Car Insurance', 'Maintenance'],
    FOOD: ['Groceries', 'Restaurants', 'Fast Food', 'Coffee Shops', 'Food Delivery'],
    SHOPPING: ['Clothing', 'Electronics', 'Home & Garden', 'Books', 'Sports & Hobbies'],
    ENTERTAINMENT: ['Movies', 'Streaming Services', 'Gaming', 'Concerts', 'Sports Events'],
    HEALTHCARE: ['Doctor', 'Dentist', 'Pharmacy', 'Health Insurance', 'Gym & Fitness'],
    EDUCATION: ['Tuition', 'Books & Supplies', 'Courses', 'Certifications'],
    FINANCIAL: ['Bank Fees', 'Interest', 'Investments', 'Loan Payments', 'Credit Card Payments'],
    INSURANCE: ['Life Insurance', 'Health Insurance', 'Property Insurance', 'Other Insurance'],
    UTILITIES: ['Electricity', 'Gas', 'Water', 'Internet', 'Phone', 'Trash'],
    PERSONAL: ['Hair & Beauty', 'Gifts', 'Donations', 'Subscriptions', 'Other Personal'],
    BUSINESS: ['Office Supplies', 'Software', 'Travel', 'Marketing', 'Professional Services'],
    TRANSFER: ['Transfer Out', 'Transfer Between Accounts', 'Cash Withdrawal']
  };

  // Common merchant patterns for rule-based categorization
  private readonly MERCHANT_PATTERNS = [
    { pattern: /woolworths|coles|aldi|iga|metro/i, category: 'FOOD', subcategory: 'Groceries' },
    { pattern: /uber|ola|didi|taxi|cabcharge/i, category: 'TRANSPORTATION', subcategory: 'Uber/Taxi' },
    { pattern: /netflix|spotify|disney|stan|binge|youtube/i, category: 'ENTERTAINMENT', subcategory: 'Streaming Services' },
    { pattern: /telstra|optus|vodafone|tpg/i, category: 'UTILITIES', subcategory: 'Phone' },
    { pattern: /origin|agl|energy australia/i, category: 'UTILITIES', subcategory: 'Electricity' },
    { pattern: /amazon|ebay|kmart|target|big w/i, category: 'SHOPPING', subcategory: 'General' },
    { pattern: /pharmacy|chemist warehouse|priceline/i, category: 'HEALTHCARE', subcategory: 'Pharmacy' },
    { pattern: /mcdonald|kfc|subway|domino|pizza/i, category: 'FOOD', subcategory: 'Fast Food' },
    { pattern: /gym|fitness|anytime fitness|f45/i, category: 'HEALTHCARE', subcategory: 'Gym & Fitness' },
    { pattern: /rent|property management/i, category: 'HOUSING', subcategory: 'Rent' },
    { pattern: /mortgage|home loan/i, category: 'HOUSING', subcategory: 'Mortgage' },
    { pattern: /salary|wage|pay/i, category: 'INCOME', subcategory: 'Salary' },
    { pattern: /transfer|trf|xfer/i, category: 'TRANSFER', subcategory: 'Transfer Between Accounts' },
    { pattern: /atm|cash withdrawal|cash out/i, category: 'TRANSFER', subcategory: 'Cash Withdrawal' }
  ];

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        // In production, you might store encrypted keys in database
        // For now, we use environment variable directly
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          // Add timeout and retry logic
          timeout: 20000, // 20 seconds
          maxRetries: 2
        });
      } catch (error) {
        logger.error('Failed to initialize OpenAI client:', error);
      }
    }
  }

  /**
   * Categorize a single transaction
   */
  async categorizeTransaction(
    description: string,
    amount: number,
    type: 'INCOME' | 'EXPENSE',
    existingCategory?: string
  ): Promise<CategorizationResult> {
    // Check cache first
    const cacheKey = `${description.toLowerCase()}_${type}`;
    if (this.categoryCache.has(cacheKey)) {
      return this.categoryCache.get(cacheKey)!;
    }

    // Try rule-based categorization first
    const ruleBasedResult = this.categorizeByRules(description, amount, type);
    if (ruleBasedResult.confidence >= 0.8) {
      this.categoryCache.set(cacheKey, ruleBasedResult);
      return ruleBasedResult;
    }

    // If AI is available and rule-based confidence is low, use AI
    if (this.openai && ruleBasedResult.confidence < 0.8) {
      try {
        const aiResult = await this.categorizeWithAI(description, amount, type);
        this.categoryCache.set(cacheKey, aiResult);
        return aiResult;
      } catch (error) {
        logger.error('AI categorization failed:', error);
        // Fall back to rule-based result
      }
    }

    // Cache and return rule-based result
    this.categoryCache.set(cacheKey, ruleBasedResult);
    return ruleBasedResult;
  }

  /**
   * Categorize multiple transactions in batch
   */
  async categorizeTransactions(
    transactions: Array<{
      description: string;
      amount: number;
      type: 'INCOME' | 'EXPENSE';
      existingCategory?: string;
    }>
  ): Promise<CategorizationResult[]> {
    // Process in batches if using AI
    const results: CategorizationResult[] = [];
    
    for (const transaction of transactions) {
      const result = await this.categorizeTransaction(
        transaction.description,
        transaction.amount,
        transaction.type,
        transaction.existingCategory
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Rule-based categorization
   */
  private categorizeByRules(
    description: string,
    amount: number,
    type: 'INCOME' | 'EXPENSE'
  ): CategorizationResult {
    const lowerDesc = description.toLowerCase();
    
    // Check merchant patterns
    for (const pattern of this.MERCHANT_PATTERNS) {
      if (pattern.pattern.test(lowerDesc)) {
        return {
          category: pattern.category,
          subcategory: pattern.subcategory,
          confidence: 0.9,
          merchantName: this.extractMerchantName(description),
          isRecurring: this.checkIfRecurring(description),
          recurringFrequency: this.detectRecurringFrequency(description)
        };
      }
    }

    // Default categories based on transaction type
    if (type === 'INCOME') {
      if (lowerDesc.includes('salary') || lowerDesc.includes('wage')) {
        return {
          category: 'INCOME',
          subcategory: 'Salary',
          confidence: 0.85,
          isRecurring: true,
          recurringFrequency: 'monthly'
        };
      }
      return {
        category: 'INCOME',
        subcategory: 'Other Income',
        confidence: 0.6
      };
    }

    // For expenses, make an educated guess based on amount
    if (amount > 1000) {
      return { category: 'HOUSING', subcategory: 'Rent', confidence: 0.5 };
    } else if (amount > 100 && amount < 300) {
      return { category: 'SHOPPING', subcategory: 'General', confidence: 0.4 };
    } else if (amount < 50) {
      return { category: 'FOOD', subcategory: 'Restaurants', confidence: 0.4 };
    }

    return { category: 'OTHER', confidence: 0.3 };
  }

  /**
   * AI-powered categorization using OpenAI
   */
  private async categorizeWithAI(
    description: string,
    amount: number,
    type: 'INCOME' | 'EXPENSE'
  ): Promise<CategorizationResult> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }

    const prompt = `
      Categorize this financial transaction:
      Description: "${description}"
      Amount: ${amount}
      Type: ${type}
      
      Available categories: ${Object.keys(this.CATEGORIES).join(', ')}
      
      Respond with JSON format:
      {
        "category": "CATEGORY_NAME",
        "subcategory": "Subcategory Name",
        "confidence": 0.0-1.0,
        "merchantName": "extracted merchant name or null",
        "isRecurring": true/false,
        "recurringFrequency": "weekly/biweekly/monthly/quarterly/yearly or null"
      }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial transaction categorization expert. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 150
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Sanitize AI response before parsing
      const sanitized = SecurityConfig.sanitizeAIResponse(content);
      return JSON.parse(sanitized);
    } catch (error) {
      logger.error('AI categorization error:', error);
      // Fall back to rule-based
      return this.categorizeByRules(description, amount, type);
    }
  }

  /**
   * Extract merchant name from transaction description
   */
  private extractMerchantName(description: string): string | undefined {
    // Remove common prefixes and suffixes
    let cleaned = description
      .replace(/^(VISA|EFTPOS|DEBIT|CREDIT|PURCHASE|PAYMENT)\s+/i, '')
      .replace(/\s+(SYDNEY|MELBOURNE|BRISBANE|PERTH|AU|AUS|AUSTRALIA).*$/i, '')
      .replace(/\s+\d{4,}.*$/, '') // Remove trailing numbers
      .trim();

    // Extract first meaningful part
    const parts = cleaned.split(/\s{2,}|\s+(?=\d)/);
    return parts[0] || undefined;
  }

  /**
   * Check if transaction appears to be recurring
   */
  private checkIfRecurring(description: string): boolean {
    const recurringPatterns = /subscription|recurring|monthly|weekly|membership|premium/i;
    return recurringPatterns.test(description);
  }

  /**
   * Detect recurring frequency from description
   */
  private detectRecurringFrequency(description: string): CategorizationResult['recurringFrequency'] {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('weekly')) return 'weekly';
    if (lowerDesc.includes('fortnightly') || lowerDesc.includes('biweekly')) return 'biweekly';
    if (lowerDesc.includes('monthly')) return 'monthly';
    if (lowerDesc.includes('quarterly')) return 'quarterly';
    if (lowerDesc.includes('yearly') || lowerDesc.includes('annual')) return 'yearly';
    
    return undefined;
  }

  /**
   * Get spending insights based on categorized transactions
   */
  async getSpendingInsights(
    organizationId: string,
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        organizationId,
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const categoryTotals: Record<string, number> = {};
    const merchantFrequency: Record<string, number> = {};
    const recurringTransactions: any[] = [];

    for (const transaction of transactions) {
      // Sum by category
      const category = transaction.category || 'UNCATEGORIZED';
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(transaction.amount.toString());

      // Track merchant frequency
      if (transaction.metadata && (transaction.metadata as any).merchantName) {
        const merchant = (transaction.metadata as any).merchantName;
        merchantFrequency[merchant] = (merchantFrequency[merchant] || 0) + 1;
      }

      // Identify recurring
      if (transaction.metadata && (transaction.metadata as any).isRecurring) {
        recurringTransactions.push(transaction);
      }
    }

    // Get top spending categories
    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    // Get frequent merchants
    const frequentMerchants = Object.entries(merchantFrequency)
      .filter(([, count]) => count > 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([merchant, count]) => ({ merchant, count }));

    return {
      topCategories,
      frequentMerchants,
      recurringTransactions,
      totalSpending: Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0),
      categoryBreakdown: categoryTotals
    };
  }
}