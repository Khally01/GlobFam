import { Budget, BudgetPeriod, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

interface CreateBudgetDto {
  familyId: string;
  name: string;
  period: BudgetPeriod;
  startDate: Date;
  items: Array<{
    categoryId: string;
    amount: number;
  }>;
}

interface BudgetSummary {
  budget: Budget;
  totalBudgeted: number;
  totalSpent: number;
  percentageUsed: number;
  daysRemaining: number;
  categories: Array<{
    category: any;
    budgeted: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
  }>;
}

export class BudgetService {
  static async createBudget(userId: string, data: CreateBudgetDto): Promise<Budget> {
    // Verify user is part of the family and has permission
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        userId,
        familyId: data.familyId,
        role: { in: ['ADMIN', 'PARENT'] },
      },
    });

    if (!familyMember) {
      throw new AppError('You do not have permission to create budgets for this family', 403);
    }

    // Calculate end date based on period
    const endDate = this.calculateEndDate(data.startDate, data.period);

    // Deactivate any overlapping budgets
    await prisma.budget.updateMany({
      where: {
        familyId: data.familyId,
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: data.startDate } },
              { endDate: { gte: data.startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      },
      data: { isActive: false },
    });

    // Create budget with items
    const budget = await prisma.budget.create({
      data: {
        familyId: data.familyId,
        name: data.name,
        period: data.period,
        startDate: data.startDate,
        endDate,
        items: {
          create: data.items.map(item => ({
            categoryId: item.categoryId,
            amount: item.amount,
          })),
        },
      },
      include: {
        items: {
          include: {
            category: true,
          },
        },
      },
    });

    logger.info(`Budget created: ${budget.id} for family ${data.familyId}`);
    return budget;
  }

  static async getBudgets(userId: string, familyId?: string) {
    // Get user's families
    const familyIds = familyId ? [familyId] : await this.getUserFamilyIds(userId);

    const budgets = await prisma.budget.findMany({
      where: {
        familyId: { in: familyIds },
      },
      include: {
        family: true,
        items: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return budgets;
  }

  static async getActiveBudget(userId: string, familyId: string): Promise<BudgetSummary | null> {
    // Verify user has access to this family
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId, familyId },
    });

    if (!familyMember) {
      throw new AppError('You do not have access to this family', 403);
    }

    const now = new Date();
    const budget = await prisma.budget.findFirst({
      where: {
        familyId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        items: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!budget) {
      return null;
    }

    // Calculate summary
    const totalBudgeted = budget.items.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalSpent = budget.items.reduce((sum, item) => sum + Number(item.spent), 0);
    const percentageUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
    const daysRemaining = Math.ceil((budget.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const categories = budget.items.map(item => ({
      category: item.category,
      budgeted: Number(item.amount),
      spent: Number(item.spent),
      remaining: Number(item.amount) - Number(item.spent),
      percentageUsed: Number(item.amount) > 0 
        ? (Number(item.spent) / Number(item.amount)) * 100 
        : 0,
    }));

    return {
      budget,
      totalBudgeted,
      totalSpent,
      percentageUsed,
      daysRemaining,
      categories,
    };
  }

  static async updateBudget(userId: string, budgetId: string, data: Partial<CreateBudgetDto>) {
    // Verify permission
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId },
      include: { family: true },
    });

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    const familyMember = await prisma.familyMember.findFirst({
      where: {
        userId,
        familyId: budget.familyId,
        role: { in: ['ADMIN', 'PARENT'] },
      },
    });

    if (!familyMember) {
      throw new AppError('You do not have permission to update this budget', 403);
    }

    // Update budget
    const updated = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        name: data.name,
        isActive: data.startDate ? true : undefined,
      },
    });

    // Update items if provided
    if (data.items) {
      // Delete existing items
      await prisma.budgetItem.deleteMany({
        where: { budgetId },
      });

      // Create new items
      await prisma.budgetItem.createMany({
        data: data.items.map(item => ({
          budgetId,
          categoryId: item.categoryId,
          amount: item.amount,
        })),
      });
    }

    return updated;
  }

  static async getBudgetAnalytics(userId: string, familyId: string, months: number = 6) {
    // Verify access
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId, familyId },
    });

    if (!familyMember) {
      throw new AppError('You do not have access to this family', 403);
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get historical budgets
    const budgets = await prisma.budget.findMany({
      where: {
        familyId,
        startDate: { gte: startDate },
      },
      include: {
        items: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    // Calculate analytics
    const analytics = budgets.map(budget => {
      const totalBudgeted = budget.items.reduce((sum, item) => sum + Number(item.amount), 0);
      const totalSpent = budget.items.reduce((sum, item) => sum + Number(item.spent), 0);
      const savings = totalBudgeted - totalSpent;
      const adherence = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

      return {
        period: `${budget.startDate.toISOString().slice(0, 7)}`,
        budgeted: totalBudgeted,
        spent: totalSpent,
        savings,
        adherence,
        topCategories: budget.items
          .sort((a, b) => Number(b.spent) - Number(a.spent))
          .slice(0, 3)
          .map(item => ({
            name: item.category.name,
            spent: Number(item.spent),
          })),
      };
    });

    // Calculate trends
    const avgAdherence = analytics.reduce((sum, a) => sum + a.adherence, 0) / analytics.length;
    const totalSavings = analytics.reduce((sum, a) => sum + a.savings, 0);
    
    return {
      analytics,
      summary: {
        averageAdherence: avgAdherence,
        totalSavings,
        budgetsCreated: budgets.length,
      },
    };
  }

  static async createBudgetFromTemplate(userId: string, familyId: string, template: 'basic' | 'family' | 'aggressive') {
    // Get average spending from last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const familyMembers = await prisma.familyMember.findMany({
      where: { familyId },
      select: { userId: true },
    });

    const userIds = familyMembers.map(m => m.userId);

    const spending = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId: { in: userIds },
        type: 'EXPENSE',
        date: { gte: threeMonthsAgo },
      },
      _sum: {
        amount: true,
      },
    });

    // Apply template multiplier
    const multipliers = {
      basic: 1.0,      // Same as average
      family: 0.9,     // 10% reduction
      aggressive: 0.7, // 30% reduction
    };

    const multiplier = multipliers[template];
    const items = spending
      .filter(s => s.categoryId)
      .map(s => ({
        categoryId: s.categoryId!,
        amount: Math.round((Number(s._sum.amount) / 3) * multiplier),
      }));

    // Create budget
    return this.createBudget(userId, {
      familyId,
      name: `${template.charAt(0).toUpperCase() + template.slice(1)} Budget`,
      period: 'MONTHLY',
      startDate: new Date(),
      items,
    });
  }

  private static calculateEndDate(startDate: Date, period: BudgetPeriod): Date {
    const endDate = new Date(startDate);
    
    switch (period) {
      case 'WEEKLY':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'MONTHLY':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'YEARLY':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }
    
    return endDate;
  }

  private static async getUserFamilyIds(userId: string): Promise<string[]> {
    const families = await prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });
    
    return families.map(f => f.familyId);
  }
}