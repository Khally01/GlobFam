'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui'
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, PiggyBank } from 'lucide-react'
import { analyticsApi } from '@/lib/api/analytics'
import type { 
  SpendingByCategory, 
  MonthlyTrend, 
  FinancialHealthScore,
  TopExpense 
} from '@/lib/api/analytics'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
]

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [spending, setSpending] = useState<SpendingByCategory[]>([])
  const [trends, setTrends] = useState<MonthlyTrend[]>([])
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null)
  const [topExpenses, setTopExpenses] = useState<TopExpense[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsApi.getSummary()
      const data = response.data as any // Type assertion to bypass TypeScript error
      
      setSpending(data.currentMonth.spending)
      setTrends(data.trends)
      setHealthScore(data.healthScore)
      setTopExpenses(data.currentMonth.topExpenses)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  const currentMonthData = trends.length > 0 ? trends[trends.length - 1] : null
  const lastMonthData = trends.length > 1 ? trends[trends.length - 2] : null
  
  const incomeChange = currentMonthData && lastMonthData
    ? ((currentMonthData.income - lastMonthData.income) / lastMonthData.income) * 100
    : 0
    
  const expenseChange = currentMonthData && lastMonthData
    ? ((currentMonthData.expenses - lastMonthData.expenses) / lastMonthData.expenses) * 100
    : 0

  const totalSpending = spending.reduce((sum, cat) => sum + cat.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your financial performance and insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${currentMonthData?.income.toLocaleString() || '0'}
            </div>
            <div className={`flex items-center text-sm ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {incomeChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(incomeChange).toFixed(1)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${currentMonthData?.expenses.toLocaleString() || '0'}
            </div>
            <div className={`flex items-center text-sm ${expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {expenseChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(expenseChange).toFixed(1)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentMonthData && currentMonthData.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${currentMonthData?.net.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentMonthData && currentMonthData.income > 0 
                ? `${((currentMonthData.net / currentMonthData.income) * 100).toFixed(1)}% savings rate`
                : 'No income data'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Financial Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${
                healthScore && healthScore.score >= 70 ? 'text-green-600' : 
                healthScore && healthScore.score >= 50 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {healthScore?.score || 0}/100
              </div>
              <div className={`p-1.5 rounded-full ${
                healthScore && healthScore.score >= 70 ? 'bg-green-100' : 
                healthScore && healthScore.score >= 50 ? 'bg-yellow-100' : 
                'bg-red-100'
              }`}>
                {healthScore && healthScore.score >= 70 ? 
                  <TrendingUp className="h-4 w-4 text-green-600" /> :
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                }
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {healthScore && healthScore.score >= 70 ? 'Excellent' : 
               healthScore && healthScore.score >= 50 ? 'Good' : 'Needs Attention'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses Trend</CardTitle>
            <CardDescription>Monthly comparison over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="2"
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spending by Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Current month breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spending.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} ${percentage.toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {spending.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Health Score Breakdown */}
        {healthScore && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Health Breakdown</CardTitle>
              <CardDescription>Key factors affecting your score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(healthScore.factors).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium">{value.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          value >= 70 ? 'bg-green-600' : 
                          value >= 50 ? 'bg-yellow-600' : 
                          'bg-red-600'
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {healthScore.recommendations.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {healthScore.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start">
                        <span className="mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Top Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Top Expenses</CardTitle>
            <CardDescription>Largest transactions this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topExpenses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No expenses this month</p>
              ) : (
                topExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{expense.description || 'No description'}</p>
                      <p className="text-xs text-muted-foreground">
                        {expense.category} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {expense.asset.currency} {parseFloat(expense.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{expense.asset.name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net Savings Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Net Savings</CardTitle>
          <CardDescription>Income minus expenses each month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Bar 
                dataKey="net" 
                fill={(data: any) => data.net >= 0 ? '#10b981' : '#ef4444'}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}