import { PrismaClient } from '@prisma/client';
import { 
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  subMonths, 
  format,
  differenceInMonths 
} from 'date-fns';

interface ForecastScenario {
  name: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  inflationRate?: number;
}

interface MonthlyForecast {
  month: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedSavings: number;
  cumulativeSavings: number;
  confidence: number;
}

interface FinancialForecast {
  baseline: MonthlyForecast[];
  optimistic: MonthlyForecast[];
  pessimistic: MonthlyForecast[];
  insights: string[];
  milestones: FinancialMilestone[];
}

interface FinancialMilestone {
  amount: number;
  description: string;
  projectedDate?: Date;
  monthsToReach?: number;
}

export class ForecastingService {
  constructor(private prisma: PrismaClient) {}

  async generateForecast(
    userId: string,
    organizationId: string,
    months: number = 12
  ): Promise<FinancialForecast> {
    // Get historical data
    const historicalData = await this.getHistoricalData(userId, organizationId, 12);
    
    // Calculate baseline scenario
    const baseline = await this.calculateScenario(
      historicalData,
      months,
      'baseline'
    );
    
    // Calculate optimistic scenario (20% income increase, 10% expense decrease)
    const optimistic = await this.calculateScenario(
      historicalData,
      months,
      'optimistic',
      { incomeMultiplier: 1.2, expenseMultiplier: 0.9 }
    );
    
    // Calculate pessimistic scenario (10% income decrease, 10% expense increase)
    const pessimistic = await this.calculateScenario(
      historicalData,
      months,
      'pessimistic',
      { incomeMultiplier: 0.9, expenseMultiplier: 1.1 }
    );
    
    // Get current savings
    const currentSavings = await this.getCurrentSavings(userId, organizationId);
    
    // Generate insights
    const insights = this.generateInsights(historicalData, baseline);
    
    // Calculate milestones
    const milestones = this.calculateMilestones(baseline, currentSavings);
    
    return {
      baseline,
      optimistic,
      pessimistic,
      insights,
      milestones
    };
  }

  async generateCustomForecast(
    userId: string,
    organizationId: string,
    scenario: ForecastScenario,
    months: number = 12
  ): Promise<MonthlyForecast[]> {
    const currentSavings = await this.getCurrentSavings(userId, organizationId);
    const forecast: MonthlyForecast[] = [];
    
    let cumulativeSavings = currentSavings;
    const inflationRate = scenario.inflationRate || 0.02; // 2% default inflation
    
    for (let i = 1; i <= months; i++) {
      const inflationFactor = Math.pow(1 + inflationRate / 12, i);
      const projectedIncome = scenario.monthlyIncome;
      const projectedExpenses = scenario.monthlyExpenses * inflationFactor;
      const projectedSavings = projectedIncome - projectedExpenses;
      
      cumulativeSavings += projectedSavings;
      
      forecast.push({
        month: format(addMonths(new Date(), i), 'MMM yyyy'),
        projectedIncome,
        projectedExpenses,
        projectedSavings,
        cumulativeSavings,
        confidence: Math.max(50, 100 - (i * 3)) // Confidence decreases over time
      });
    }
    
    return forecast;
  }

  async whatIfAnalysis(
    userId: string,
    organizationId: string,
    scenarios: Array<{
      name: string;
      changes: {
        incomeChange?: number;
        expenseChange?: number;
        oneTimeExpense?: { amount: number; month: number };
        oneTimeIncome?: { amount: number; month: number };
      };
    }>
  ): Promise<any> {
    const historicalData = await this.getHistoricalData(userId, organizationId, 6);
    const baseline = await this.calculateScenario(historicalData, 12, 'baseline');
    
    const results = await Promise.all(
      scenarios.map(async (scenario) => {
        const modified = this.applyScenarioChanges(baseline, scenario.changes);
        return {
          name: scenario.name,
          forecast: modified,
          impact: this.calculateImpact(baseline, modified)
        };
      })
    );
    
    return {
      baseline,
      scenarios: results
    };
  }

  async getRetirementProjection(
    userId: string,
    organizationId: string,
    targetRetirementAge: number,
    targetMonthlyIncome: number
  ): Promise<any> {
    // Get user age (simplified - in real app, get from user profile)
    const currentAge = 30; // This should come from user data
    const yearsToRetirement = targetRetirementAge - currentAge;
    const monthsToRetirement = yearsToRetirement * 12;
    
    // Get current financial situation
    const historicalData = await this.getHistoricalData(userId, organizationId, 12);
    const avgMonthlySavings = historicalData.avgNetSavings;
    const currentSavings = await this.getCurrentSavings(userId, organizationId);
    
    // Calculate required retirement fund (25x annual expenses rule)
    const requiredRetirementFund = targetMonthlyIncome * 12 * 25;
    
    // Project savings growth with compound interest (7% annual return)
    const annualReturn = 0.07;
    const monthlyReturn = annualReturn / 12;
    
    let projectedSavings = currentSavings;
    for (let i = 0; i < monthsToRetirement; i++) {
      projectedSavings = projectedSavings * (1 + monthlyReturn) + avgMonthlySavings;
    }
    
    // Calculate if on track
    const onTrack = projectedSavings >= requiredRetirementFund;
    const shortfall = Math.max(0, requiredRetirementFund - projectedSavings);
    
    // Calculate required monthly savings to meet goal
    const requiredMonthlySavings = this.calculateRequiredMonthlySavings(
      currentSavings,
      requiredRetirementFund,
      monthsToRetirement,
      monthlyReturn
    );
    
    return {
      currentAge,
      targetRetirementAge,
      yearsToRetirement,
      currentSavings,
      currentMonthlySavings: avgMonthlySavings,
      requiredRetirementFund,
      projectedRetirementSavings: projectedSavings,
      onTrack,
      shortfall,
      requiredMonthlySavings,
      additionalMonthlySavingsNeeded: Math.max(0, requiredMonthlySavings - avgMonthlySavings)
    };
  }

  private async getHistoricalData(
    userId: string,
    organizationId: string,
    months: number
  ): Promise<any> {
    const startDate = startOfMonth(subMonths(new Date(), months));
    
    const transactions = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        organizationId,
        date: { gte: startDate }
      },
      _sum: { amount: true },
      _count: true
    });
    
    const income = transactions.find(t => t.type === 'INCOME')?._sum.amount?.toNumber() || 0;
    const expenses = transactions.find(t => t.type === 'EXPENSE')?._sum.amount?.toNumber() || 0;
    
    const avgMonthlyIncome = income / months;
    const avgMonthlyExpenses = expenses / months;
    const avgNetSavings = avgMonthlyIncome - avgMonthlyExpenses;
    
    // Calculate variance for confidence
    const monthlyData = await this.getMonthlyBreakdown(userId, organizationId, months);
    const incomeVariance = this.calculateVariance(monthlyData.map(m => m.income));
    const expenseVariance = this.calculateVariance(monthlyData.map(m => m.expenses));
    
    return {
      avgMonthlyIncome,
      avgMonthlyExpenses,
      avgNetSavings,
      incomeVariance,
      expenseVariance,
      monthlyData
    };
  }

  private async calculateScenario(
    historicalData: any,
    months: number,
    type: 'baseline' | 'optimistic' | 'pessimistic',
    modifiers?: { incomeMultiplier?: number; expenseMultiplier?: number }
  ): Promise<MonthlyForecast[]> {
    const forecast: MonthlyForecast[] = [];
    const currentSavings = 0; // This should be calculated from actual data
    
    let cumulativeSavings = currentSavings;
    const incomeMultiplier = modifiers?.incomeMultiplier || 1;
    const expenseMultiplier = modifiers?.expenseMultiplier || 1;
    
    for (let i = 1; i <= months; i++) {
      const seasonalFactor = this.getSeasonalFactor(i);
      const projectedIncome = historicalData.avgMonthlyIncome * incomeMultiplier * seasonalFactor.income;
      const projectedExpenses = historicalData.avgMonthlyExpenses * expenseMultiplier * seasonalFactor.expense;
      const projectedSavings = projectedIncome - projectedExpenses;
      
      cumulativeSavings += projectedSavings;
      
      // Calculate confidence based on variance and time
      const baseConfidence = type === 'baseline' ? 85 : 70;
      const timeDecay = i * 2;
      const varianceImpact = (historicalData.incomeVariance + historicalData.expenseVariance) * 10;
      const confidence = Math.max(50, baseConfidence - timeDecay - varianceImpact);
      
      forecast.push({
        month: format(addMonths(new Date(), i), 'MMM yyyy'),
        projectedIncome,
        projectedExpenses,
        projectedSavings,
        cumulativeSavings,
        confidence
      });
    }
    
    return forecast;
  }

  private getSeasonalFactor(monthIndex: number): { income: number; expense: number } {
    // Simple seasonal adjustment (can be made more sophisticated)
    const month = new Date().getMonth() + monthIndex;
    const normalizedMonth = month % 12;
    
    // Higher expenses in December (holidays), lower in February
    const expenseFactor = normalizedMonth === 11 ? 1.2 : // December
                         normalizedMonth === 1 ? 0.9 :   // February
                         1.0;
    
    // Income generally stable
    const incomeFactor = 1.0;
    
    return { income: incomeFactor, expense: expenseFactor };
  }

  private async getCurrentSavings(
    userId: string,
    organizationId: string
  ): Promise<number> {
    const liquidAssets = await this.prisma.asset.aggregate({
      where: {
        userId,
        organizationId,
        type: { in: ['CASH', 'BANK_ACCOUNT'] }
      },
      _sum: { amount: true }
    });
    
    return liquidAssets._sum.amount?.toNumber() || 0;
  }

  private async getMonthlyBreakdown(
    userId: string,
    organizationId: string,
    months: number
  ): Promise<any[]> {
    const monthlyData = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(monthStart);
      
      const [income, expenses] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            userId,
            organizationId,
            type: 'INCOME',
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        }),
        this.prisma.transaction.aggregate({
          where: {
            userId,
            organizationId,
            type: 'EXPENSE',
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        })
      ]);
      
      monthlyData.push({
        month: format(monthStart, 'MMM yyyy'),
        income: income._sum.amount?.toNumber() || 0,
        expenses: expenses._sum.amount?.toNumber() || 0
      });
    }
    
    return monthlyData;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private generateInsights(historicalData: any, forecast: MonthlyForecast[]): string[] {
    const insights: string[] = [];
    
    // Savings rate insight
    const savingsRate = historicalData.avgNetSavings / historicalData.avgMonthlyIncome * 100;
    if (savingsRate < 10) {
      insights.push('Your savings rate is below 10%. Consider reducing expenses or increasing income.');
    } else if (savingsRate > 20) {
      insights.push('Great job! You\'re saving over 20% of your income.');
    }
    
    // Trend insight
    const firstMonth = forecast[0];
    const lastMonth = forecast[forecast.length - 1];
    if (lastMonth.cumulativeSavings > firstMonth.cumulativeSavings * 2) {
      insights.push('Your savings are projected to more than double in the forecast period.');
    }
    
    // Expense variance insight
    if (historicalData.expenseVariance > historicalData.avgMonthlyExpenses * 0.2) {
      insights.push('Your expenses vary significantly. Consider creating a budget to stabilize spending.');
    }
    
    return insights;
  }

  private calculateMilestones(
    forecast: MonthlyForecast[],
    currentSavings: number
  ): FinancialMilestone[] {
    const milestones: FinancialMilestone[] = [];
    const targets = [1000, 5000, 10000, 25000, 50000, 100000];
    
    targets.forEach(target => {
      if (currentSavings < target) {
        const monthIndex = forecast.findIndex(m => m.cumulativeSavings >= target);
        if (monthIndex !== -1) {
          milestones.push({
            amount: target,
            description: `Reach $${target.toLocaleString()} in savings`,
            projectedDate: addMonths(new Date(), monthIndex + 1),
            monthsToReach: monthIndex + 1
          });
        }
      }
    });
    
    return milestones;
  }

  private applyScenarioChanges(
    baseline: MonthlyForecast[],
    changes: any
  ): MonthlyForecast[] {
    return baseline.map((month, index) => {
      let income = month.projectedIncome;
      let expenses = month.projectedExpenses;
      
      // Apply percentage changes
      if (changes.incomeChange) {
        income *= (1 + changes.incomeChange / 100);
      }
      if (changes.expenseChange) {
        expenses *= (1 + changes.expenseChange / 100);
      }
      
      // Apply one-time changes
      if (changes.oneTimeIncome && changes.oneTimeIncome.month === index + 1) {
        income += changes.oneTimeIncome.amount;
      }
      if (changes.oneTimeExpense && changes.oneTimeExpense.month === index + 1) {
        expenses += changes.oneTimeExpense.amount;
      }
      
      const savings = income - expenses;
      
      return {
        ...month,
        projectedIncome: income,
        projectedExpenses: expenses,
        projectedSavings: savings,
        cumulativeSavings: (index > 0 ? baseline[index - 1].cumulativeSavings : 0) + savings
      };
    });
  }

  private calculateImpact(
    baseline: MonthlyForecast[],
    modified: MonthlyForecast[]
  ): any {
    const lastBaseline = baseline[baseline.length - 1];
    const lastModified = modified[modified.length - 1];
    
    return {
      savingsDifference: lastModified.cumulativeSavings - lastBaseline.cumulativeSavings,
      percentageChange: ((lastModified.cumulativeSavings - lastBaseline.cumulativeSavings) / 
                        lastBaseline.cumulativeSavings) * 100
    };
  }

  private calculateRequiredMonthlySavings(
    currentSavings: number,
    targetAmount: number,
    months: number,
    monthlyReturn: number
  ): number {
    // Using future value of annuity formula
    const futureValueFactor = (Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn;
    const futureValueOfCurrent = currentSavings * Math.pow(1 + monthlyReturn, months);
    const requiredFutureValue = targetAmount - futureValueOfCurrent;
    
    return requiredFutureValue / futureValueFactor;
  }
}