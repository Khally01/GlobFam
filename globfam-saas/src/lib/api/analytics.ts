import { api } from '../api'
import type { ApiResponse } from '@/lib/shared-types'

export interface SpendingByCategory {
  category: string
  amount: number
  percentage: number
  count: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expenses: number
  net: number
}

export interface FinancialHealthScore {
  score: number
  factors: {
    savingsRate: number
    expenseStability: number
    incomeStability: number
    debtToIncome: number
    emergencyFund: number
  }
  recommendations: string[]
}

export interface CashFlowForecast {
  month: string
  projected: number
  confidence: number
}

export interface TopExpense {
  id: string
  description: string
  amount: string
  category: string
  date: string
  asset: {
    name: string
    currency: string
  }
}

export interface BudgetComparison {
  category: string
  budgetAmount: number
  actualAmount: number
  difference: number
  percentUsed: number
  status: 'good' | 'warning' | 'over'
}

export const analyticsApi = {
  getSpendingByCategory: (params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<{ spending: SpendingByCategory[]; timeRange: any }>>(
      '/api/analytics/spending-by-category',
      { params }
    ),

  getMonthlyTrends: (months: number = 12) =>
    api.get<ApiResponse<{ trends: MonthlyTrend[] }>>(
      '/api/analytics/monthly-trends',
      { params: { months } }
    ),

  getHealthScore: () =>
    api.get<ApiResponse<FinancialHealthScore>>('/api/analytics/health-score'),

  getCashFlowForecast: (months: number = 3) =>
    api.get<ApiResponse<{ forecast: CashFlowForecast[] }>>(
      '/api/analytics/cash-flow-forecast',
      { params: { months } }
    ),

  getTopExpenses: (params?: { startDate?: string; endDate?: string; limit?: number }) =>
    api.get<ApiResponse<{ expenses: TopExpense[]; timeRange: any }>>(
      '/api/analytics/top-expenses',
      { params }
    ),

  getBudgetComparison: (data: {
    budget: Record<string, number>
    startDate?: string
    endDate?: string
  }) =>
    api.post<ApiResponse<{ comparison: BudgetComparison[]; timeRange: any }>>(
      '/api/analytics/budget-comparison',
      data
    ),

  getSummary: () =>
    api.get<ApiResponse<{
      currentMonth: {
        spending: SpendingByCategory[]
        topExpenses: TopExpense[]
      }
      trends: MonthlyTrend[]
      healthScore: FinancialHealthScore
    }>>('/api/analytics/summary')
}