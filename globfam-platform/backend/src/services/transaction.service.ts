import { Transaction, TransactionType, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

interface CreateTransactionDto {
  accountId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  description: string;
  categoryId?: string;
  date: Date;
  notes?: string;
}

interface TransactionFilters {
  userId: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export class TransactionService {
  static async createTransaction(userId: string, data: CreateTransactionDto): Promise<Transaction> {
    // Verify account ownership
    const account = await prisma.account.findFirst({
      where: {
        id: data.accountId,
        userId,
      },
    });

    if (!account) {
      throw new AppError('Account not found', 404);
    }

    // Auto-categorize if no category provided
    if (!data.categoryId) {
      data.categoryId = await this.suggestCategory(data.description, data.type);
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId: data.accountId,
        amount: data.amount,
        currency: data.currency as any,
        type: data.type,
        description: data.description,
        categoryId: data.categoryId,
        date: data.date,
        notes: data.notes,
      },
      include: {
        category: true,
        account: true,
      },
    });

    // Update account balance
    const balanceChange = data.type === 'INCOME' 
      ? Number(data.amount) 
      : data.type === 'EXPENSE' 
      ? -Number(data.amount) 
      : 0;

    if (balanceChange !== 0) {
      await prisma.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });
    }

    // Update budget tracking
    if (data.type === 'EXPENSE' && data.categoryId) {
      await this.updateBudgetSpending(userId, data.categoryId, data.amount);
    }

    logger.info(`Transaction created: ${transaction.id} for user ${userId}`);
    return transaction;
  }

  static async getTransactions(filters: TransactionFilters) {
    const where: Prisma.TransactionWhereInput = {
      userId: filters.userId,
    };

    if (filters.accountId) where.accountId = filters.accountId;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.type) where.type = filters.type;
    
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    if (filters.minAmount || filters.maxAmount) {
      where.amount = {};
      if (filters.minAmount) where.amount.gte = filters.minAmount;
      if (filters.maxAmount) where.amount.lte = filters.maxAmount;
    }

    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
        { merchantName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          account: true,
        },
        orderBy: { date: 'desc' },
        take: 50,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total };
  }

  static async getTransactionById(userId: string, transactionId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      include: {
        category: true,
        account: true,
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return transaction;
  }

  static async updateTransaction(
    userId: string, 
    transactionId: string, 
    data: Partial<CreateTransactionDto>
  ) {
    // Verify ownership
    const existing = await this.getTransactionById(userId, transactionId);

    // If amount or type changed, we need to adjust account balance
    const balanceAdjustment = this.calculateBalanceAdjustment(existing, data);

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        amount: data.amount,
        description: data.description,
        categoryId: data.categoryId,
        date: data.date,
        notes: data.notes,
      },
      include: {
        category: true,
        account: true,
      },
    });

    // Apply balance adjustment if needed
    if (balanceAdjustment !== 0) {
      await prisma.account.update({
        where: { id: existing.accountId },
        data: {
          balance: { increment: balanceAdjustment },
        },
      });
    }

    return updated;
  }

  static async deleteTransaction(userId: string, transactionId: string) {
    const transaction = await this.getTransactionById(userId, transactionId);

    // Reverse the balance change
    const balanceAdjustment = transaction.type === 'INCOME' 
      ? -Number(transaction.amount)
      : transaction.type === 'EXPENSE'
      ? Number(transaction.amount)
      : 0;

    await prisma.$transaction([
      prisma.transaction.delete({
        where: { id: transactionId },
      }),
      prisma.account.update({
        where: { id: transaction.accountId },
        data: {
          balance: { increment: balanceAdjustment },
        },
      }),
    ]);

    logger.info(`Transaction deleted: ${transactionId}`);
  }

  static async getSpendingByCategory(userId: string, period: 'week' | 'month' | 'year') {
    const startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const spending = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startDate },
      },
      _sum: {
        amount: true,
      },
    });

    // Get category details
    const categoryIds = spending.map(s => s.categoryId).filter(Boolean) as string[];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const categoryMap = new Map(categories.map(c => [c.id, c]));

    return spending.map(s => ({
      category: s.categoryId ? categoryMap.get(s.categoryId) : null,
      total: s._sum.amount || 0,
    }));
  }

  static async getCashFlow(userId: string, months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group by month
    const monthlyData = new Map<string, { income: number; expenses: number }>();

    transactions.forEach(t => {
      const monthKey = `${t.date.getFullYear()}-${(t.date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, expenses: 0 });
      }

      const data = monthlyData.get(monthKey)!;
      if (t.type === 'INCOME') {
        data.income += Number(t.amount);
      } else if (t.type === 'EXPENSE') {
        data.expenses += Number(t.amount);
      }
    });

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
    }));
  }

  private static async suggestCategory(description: string, type: TransactionType): Promise<string | null> {
    // Simple keyword-based categorization
    const lowerDesc = description.toLowerCase();
    
    const categoryMappings = {
      EXPENSE: [
        { keywords: ['grocery', 'woolworth', 'coles', 'aldi', 'food'], category: 'Groceries' },
        { keywords: ['restaurant', 'cafe', 'coffee', 'mcdonald', 'kfc'], category: 'Dining' },
        { keywords: ['uber', 'taxi', 'fuel', 'petrol', 'parking'], category: 'Transport' },
        { keywords: ['rent', 'mortgage', 'electricity', 'water', 'gas', 'internet'], category: 'Housing' },
        { keywords: ['school', 'tuition', 'books', 'education'], category: 'Education' },
        { keywords: ['doctor', 'pharmacy', 'hospital', 'medical'], category: 'Healthcare' },
      ],
      INCOME: [
        { keywords: ['salary', 'wage', 'payroll'], category: 'Salary' },
        { keywords: ['dividend', 'interest'], category: 'Investment' },
        { keywords: ['freelance', 'contract'], category: 'Freelance' },
      ],
    };

    const mappings = categoryMappings[type] || [];
    
    for (const mapping of mappings) {
      if (mapping.keywords.some(keyword => lowerDesc.includes(keyword))) {
        const category = await prisma.category.findFirst({
          where: { name: mapping.category, type },
        });
        return category?.id || null;
      }
    }

    return null;
  }

  private static calculateBalanceAdjustment(
    existing: Transaction,
    updates: Partial<CreateTransactionDto>
  ): number {
    const oldAmount = Number(existing.amount);
    const newAmount = updates.amount ? Number(updates.amount) : oldAmount;
    
    const oldImpact = existing.type === 'INCOME' ? oldAmount : -oldAmount;
    const newImpact = existing.type === 'INCOME' ? newAmount : -newAmount;
    
    return newImpact - oldImpact;
  }

  private static async updateBudgetSpending(userId: string, categoryId: string, amount: number) {
    // Find active budget for the user's family
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId },
      include: { family: true },
    });

    if (!familyMember) return;

    const now = new Date();
    const activeBudget = await prisma.budget.findFirst({
      where: {
        familyId: familyMember.familyId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (!activeBudget) return;

    // Update budget item spending
    await prisma.budgetItem.updateMany({
      where: {
        budgetId: activeBudget.id,
        categoryId,
      },
      data: {
        spent: { increment: amount },
      },
    });
  }
}