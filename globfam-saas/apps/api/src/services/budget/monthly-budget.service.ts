import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../middleware/errorHandler';

export class MonthlyBudgetService {
  constructor(private prisma: PrismaClient) {}

  async getMonthlyBudget(organizationId: string, month: number, year: number) {
    // Get all categories with their monthly budget data
    const categories = await this.prisma.budgetCategory.findMany({
      where: { 
        organizationId,
        isHidden: false
      },
      include: {
        monthlyBudgets: {
          where: {
            month,
            year
          }
        }
      }
    });

    // Calculate activity (spending) for each category
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        organizationId,
        date: {
          gte: startDate,
          lte: endDate
        },
        budgetCategoryId: {
          not: null
        }
      },
      select: {
        budgetCategoryId: true,
        amount: true,
        type: true
      }
    });

    // Calculate activity per category
    const activityMap: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.budgetCategoryId) {
        if (!activityMap[t.budgetCategoryId]) {
          activityMap[t.budgetCategoryId] = 0;
        }
        // For expenses, add to activity. For income, subtract from activity
        if (t.type === 'EXPENSE') {
          activityMap[t.budgetCategoryId] += Number(t.amount);
        } else if (t.type === 'INCOME') {
          activityMap[t.budgetCategoryId] -= Number(t.amount);
        }
      }
    });

    // Format the response
    const budgetData = categories.map(category => {
      const monthlyBudget = category.monthlyBudgets[0];
      const activity = activityMap[category.id] || 0;
      const budgeted = monthlyBudget ? Number(monthlyBudget.budgeted) : 0;
      const carryover = monthlyBudget ? Number(monthlyBudget.carryover) : 0;
      const available = budgeted + carryover - activity;

      return {
        categoryId: category.id,
        categoryName: category.name,
        budgeted,
        activity,
        available,
        carryover
      };
    });

    return budgetData;
  }

  async updateMonthlyBudget(
    organizationId: string,
    categoryId: string,
    month: number,
    year: number,
    budgeted: number
  ) {
    // Verify category belongs to organization
    const category = await this.prisma.budgetCategory.findFirst({
      where: { id: categoryId, organizationId }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Calculate activity for this month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        organizationId,
        budgetCategoryId: categoryId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    let activity = 0;
    transactions.forEach(t => {
      if (t.type === 'EXPENSE') {
        activity += Number(t.amount);
      } else if (t.type === 'INCOME') {
        activity -= Number(t.amount);
      }
    });

    // Get carryover from previous month
    let carryover = 0;
    if (month > 1) {
      const previousMonth = await this.prisma.monthlyBudget.findUnique({
        where: {
          categoryId_month_year: {
            categoryId,
            month: month - 1,
            year
          }
        }
      });
      if (previousMonth) {
        carryover = Number(previousMonth.available);
      }
    }

    const available = budgeted + carryover - activity;

    // Upsert monthly budget
    const monthlyBudget = await this.prisma.monthlyBudget.upsert({
      where: {
        categoryId_month_year: {
          categoryId,
          month,
          year
        }
      },
      update: {
        budgeted,
        activity,
        available,
        carryover
      },
      create: {
        categoryId,
        month,
        year,
        budgeted,
        activity,
        available,
        carryover,
        organizationId
      }
    });

    return monthlyBudget;
  }

  async recalculateMonthlyBudgets(organizationId: string, month: number, year: number) {
    // This method recalculates all budget data for a given month
    // Useful after importing transactions or making bulk changes
    
    const categories = await this.prisma.budgetCategory.findMany({
      where: { organizationId }
    });

    const results = [];
    for (const category of categories) {
      const monthlyBudget = await this.prisma.monthlyBudget.findUnique({
        where: {
          categoryId_month_year: {
            categoryId: category.id,
            month,
            year
          }
        }
      });

      if (monthlyBudget) {
        const updated = await this.updateMonthlyBudget(
          organizationId,
          category.id,
          month,
          year,
          Number(monthlyBudget.budgeted)
        );
        results.push(updated);
      }
    }

    return results;
  }
}