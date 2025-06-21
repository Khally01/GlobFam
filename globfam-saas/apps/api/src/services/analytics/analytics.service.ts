import { PrismaClient, Prisma } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

interface TimeRange {
  startDate: Date;
  endDate: Date;
}

interface SpendingByCategory {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface FinancialHealthScore {
  score: number; // 0-100
  factors: {
    savingsRate: number;
    expenseStability: number;
    incomeStability: number;
    debtToIncome: number;
    emergencyFund: number;
  };
  recommendations: string[];
}

export class AnalyticsService {
  constructor(private prisma: PrismaClient) {}

  async getSpendingByCategory(
    userId: string,
    organizationId: string,
    timeRange: TimeRange
  ): Promise<SpendingByCategory[]> {
    const spending = await this.prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        organizationId,
        type: 'EXPENSE',
        date: {
          gte: timeRange.startDate,
          lte: timeRange.endDate
        }
      },
      _sum: { amount: true },
      _count: true
    });

    const totalSpending = spending.reduce(
      (sum, item) => sum + (item._sum.amount?.toNumber() || 0),
      0
    );

    return spending
      .map(item => ({
        category: item.category,
        amount: item._sum.amount?.toNumber() || 0,
        percentage: totalSpending > 0 
          ? ((item._sum.amount?.toNumber() || 0) / totalSpending) * 100 
          : 0,
        count: item._count
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  async getMonthlyTrends(
    userId: string,
    organizationId: string,
    months: number = 12
  ): Promise<MonthlyTrend[]> {
    const trends: MonthlyTrend[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));

      const [income, expenses] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            userId,
            organizationId,
            type: 'INCOME',
            date: {
              gte: monthStart,
              lte: monthEnd
            }
          },
          _sum: { amount: true }
        }),
        this.prisma.transaction.aggregate({
          where: {
            userId,
            organizationId,
            type: 'EXPENSE',
            date: {
              gte: monthStart,
              lte: monthEnd
            }
          },
          _sum: { amount: true }
        })
      ]);

      const incomeAmount = income._sum.amount?.toNumber() || 0;
      const expenseAmount = expenses._sum.amount?.toNumber() || 0;

      trends.push({
        month: format(monthStart, 'MMM yyyy'),
        income: incomeAmount,
        expenses: expenseAmount,
        net: incomeAmount - expenseAmount
      });
    }

    return trends;
  }

  async getFinancialHealthScore(
    userId: string,
    organizationId: string
  ): Promise<FinancialHealthScore> {
    const threeMonthsAgo = subMonths(new Date(), 3);
    
    // Get recent financial data
    const [recentTransactions, totalAssets, totalDebt] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          userId,
          organizationId,
          date: { gte: threeMonthsAgo }
        },
        select: {
          type: true,
          amount: true,
          date: true,
          category: true
        }
      }),
      this.prisma.asset.aggregate({
        where: {
          userId,
          organizationId,
          type: { notIn: ['DEBT'] }
        },
        _sum: { amount: true }
      }),
      this.prisma.asset.aggregate({
        where: {
          userId,
          organizationId,
          type: 'DEBT'
        },
        _sum: { amount: true }
      })
    ]);

    // Calculate monthly averages
    const monthlyIncome = this.calculateMonthlyAverage(
      recentTransactions.filter(t => t.type === 'INCOME')
    );
    const monthlyExpenses = this.calculateMonthlyAverage(
      recentTransactions.filter(t => t.type === 'EXPENSE')
    );

    // Calculate factors
    const savingsRate = monthlyIncome > 0 
      ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 
      : 0;
    
    const expenseStability = this.calculateStability(
      recentTransactions.filter(t => t.type === 'EXPENSE')
    );
    
    const incomeStability = this.calculateStability(
      recentTransactions.filter(t => t.type === 'INCOME')
    );
    
    const debtAmount = totalDebt._sum.amount?.toNumber() || 0;
    const debtToIncome = monthlyIncome > 0 
      ? (debtAmount / (monthlyIncome * 12)) * 100 
      : 100;
    
    const liquidAssets = totalAssets._sum.amount?.toNumber() || 0;
    const emergencyFund = monthlyExpenses > 0 
      ? (liquidAssets / monthlyExpenses) 
      : 0;

    // Calculate overall score
    const score = this.calculateOverallScore({
      savingsRate,
      expenseStability,
      incomeStability,
      debtToIncome,
      emergencyFund
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      savingsRate,
      expenseStability,
      incomeStability,
      debtToIncome,
      emergencyFund
    });

    return {
      score,
      factors: {
        savingsRate: Math.max(0, Math.min(100, savingsRate)),
        expenseStability,
        incomeStability,
        debtToIncome: Math.max(0, Math.min(100, debtToIncome)),
        emergencyFund: Math.min(100, (emergencyFund / 6) * 100) // 6 months = 100%
      },
      recommendations
    };
  }

  async getCashFlowForecast(
    userId: string,
    organizationId: string,
    months: number = 3
  ): Promise<{ month: string; projected: number; confidence: number }[]> {
    // Get historical data for projection
    const historicalMonths = 6;
    const historicalTrends = await this.getMonthlyTrends(
      userId,
      organizationId,
      historicalMonths
    );

    if (historicalTrends.length < 3) {
      return []; // Not enough data for projection
    }

    // Simple linear projection
    const forecast = [];
    const avgMonthlyNet = historicalTrends.reduce((sum, t) => sum + t.net, 0) / historicalTrends.length;
    const currentBalance = await this.getCurrentBalance(userId, organizationId);

    let projectedBalance = currentBalance;
    for (let i = 1; i <= months; i++) {
      projectedBalance += avgMonthlyNet;
      const futureMonth = format(subMonths(new Date(), -i), 'MMM yyyy');
      
      // Confidence decreases with time
      const confidence = Math.max(50, 100 - (i * 10));
      
      forecast.push({
        month: futureMonth,
        projected: projectedBalance,
        confidence
      });
    }

    return forecast;
  }

  async getTopExpenses(
    userId: string,
    organizationId: string,
    timeRange: TimeRange,
    limit: number = 10
  ): Promise<any[]> {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        organizationId,
        type: 'EXPENSE',
        date: {
          gte: timeRange.startDate,
          lte: timeRange.endDate
        }
      },
      select: {
        id: true,
        description: true,
        amount: true,
        category: true,
        date: true,
        asset: {
          select: {
            name: true,
            currency: true
          }
        }
      },
      orderBy: { amount: 'desc' },
      take: limit
    });
  }

  async getBudgetComparison(
    userId: string,
    organizationId: string,
    budget: Record<string, number>,
    timeRange: TimeRange
  ): Promise<any> {
    const spending = await this.getSpendingByCategory(userId, organizationId, timeRange);
    
    return Object.entries(budget).map(([category, budgetAmount]) => {
      const actual = spending.find(s => s.category === category);
      const actualAmount = actual?.amount || 0;
      const difference = budgetAmount - actualAmount;
      const percentUsed = budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0;

      return {
        category,
        budgetAmount,
        actualAmount,
        difference,
        percentUsed,
        status: percentUsed > 100 ? 'over' : percentUsed > 80 ? 'warning' : 'good'
      };
    });
  }

  private calculateMonthlyAverage(transactions: any[]): number {
    if (transactions.length === 0) return 0;
    
    const total = transactions.reduce(
      (sum, t) => sum + (t.amount?.toNumber() || 0),
      0
    );
    
    return total / 3; // 3 months of data
  }

  private calculateStability(transactions: any[]): number {
    if (transactions.length < 2) return 100;

    // Group by month
    const monthlyTotals = new Map<string, number>();
    transactions.forEach(t => {
      const month = format(new Date(t.date), 'yyyy-MM');
      const current = monthlyTotals.get(month) || 0;
      monthlyTotals.set(month, current + (t.amount?.toNumber() || 0));
    });

    const values = Array.from(monthlyTotals.values());
    if (values.length < 2) return 100;

    // Calculate coefficient of variation
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? (stdDev / mean) : 0;

    // Convert to stability score (lower CV = higher stability)
    return Math.max(0, Math.min(100, 100 - (cv * 100)));
  }

  private calculateOverallScore(factors: any): number {
    const weights = {
      savingsRate: 0.3,
      expenseStability: 0.2,
      incomeStability: 0.2,
      debtToIncome: 0.15,
      emergencyFund: 0.15
    };

    let score = 0;
    score += Math.min(100, Math.max(0, factors.savingsRate)) * weights.savingsRate;
    score += factors.expenseStability * weights.expenseStability;
    score += factors.incomeStability * weights.incomeStability;
    score += Math.min(100, Math.max(0, 100 - factors.debtToIncome)) * weights.debtToIncome;
    score += Math.min(100, (factors.emergencyFund / 6) * 100) * weights.emergencyFund;

    return Math.round(score);
  }

  private generateRecommendations(factors: any): string[] {
    const recommendations = [];

    if (factors.savingsRate < 20) {
      recommendations.push('Aim to save at least 20% of your income');
    }
    if (factors.expenseStability < 70) {
      recommendations.push('Your expenses vary significantly. Consider creating a budget to stabilize spending');
    }
    if (factors.incomeStability < 70) {
      recommendations.push('Your income is irregular. Build a larger emergency fund');
    }
    if (factors.debtToIncome > 40) {
      recommendations.push('Your debt levels are high. Focus on paying down debt');
    }
    if (factors.emergencyFund < 3) {
      recommendations.push('Build an emergency fund of at least 3-6 months of expenses');
    }

    return recommendations;
  }

  private async getCurrentBalance(
    userId: string,
    organizationId: string
  ): Promise<number> {
    const assets = await this.prisma.asset.aggregate({
      where: {
        userId,
        organizationId,
        type: { in: ['CASH', 'BANK_ACCOUNT'] }
      },
      _sum: { amount: true }
    });

    return assets._sum.amount?.toNumber() || 0;
  }
}