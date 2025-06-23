'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@/components/shared-ui'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar,
  Target,
  Sparkles,
  Bell,
  DollarSign
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface Insight {
  type: 'warning' | 'success' | 'info' | 'alert'
  title: string
  description: string
  value?: string
  icon: any
}

interface BillReminder {
  merchant: string
  averageAmount: number
  currency: string
  dueInDays: number
  lastPaidDate: string
}

export function IntelligentInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [billReminders, setBillReminders] = useState<BillReminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      // Fetch various data for insights
      const [goalsRes, analyticsRes] = await Promise.all([
        api.get('/api/goals'),
        api.get('/api/analytics/summary')
      ])

      const goals = goalsRes.data.data || []
      const analytics = analyticsRes.data.data || {}

      // Generate insights
      const newInsights: Insight[] = []

      // Goal approaching insights
      goals.forEach((goal: any) => {
        const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
        if (progress >= 80 && progress < 100) {
          newInsights.push({
            type: 'success',
            title: `Almost there! ${goal.name}`,
            description: `You're ${Math.round(100 - progress)}% away from your goal`,
            value: formatCurrency(goal.targetAmount - goal.currentAmount, goal.currency),
            icon: Target
          })
        }
      })

      // Spending insights
      if (analytics.currentMonth?.topExpenses?.length > 0) {
        const topExpense = analytics.currentMonth.topExpenses[0]
        newInsights.push({
          type: 'info',
          title: 'Highest expense this month',
          description: topExpense.description,
          value: formatCurrency(parseFloat(topExpense.amount), topExpense.asset.currency),
          icon: TrendingUp
        })
      }

      // Mock bill reminders (in real app, this would analyze recurring transactions)
      const mockBills: BillReminder[] = [
        {
          merchant: 'Netflix',
          averageAmount: 15.99,
          currency: 'AUD',
          dueInDays: 3,
          lastPaidDate: '2024-01-15'
        },
        {
          merchant: 'Electricity Bill',
          averageAmount: 150,
          currency: 'AUD',
          dueInDays: 7,
          lastPaidDate: '2024-01-10'
        }
      ]

      setBillReminders(mockBills)
      setInsights(newInsights)
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-32 bg-muted rounded-lg"></div>
        <div className="animate-pulse h-32 bg-muted rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Intelligent Insights
          </CardTitle>
          <CardDescription>
            AI-powered financial insights based on your spending patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add more transactions to unlock personalized insights
            </p>
          ) : (
            insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <insight.icon className={`h-5 w-5 mt-0.5 ${
                  insight.type === 'warning' ? 'text-yellow-500' :
                  insight.type === 'success' ? 'text-green-500' :
                  insight.type === 'alert' ? 'text-red-500' :
                  'text-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                  {insight.value && (
                    <p className="text-sm font-semibold mt-1">{insight.value}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Bill Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Bills
          </CardTitle>
          <CardDescription>
            Never miss a payment with smart bill tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {billReminders.map((bill, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  bill.dueInDays <= 3 ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <DollarSign className={`h-4 w-4 ${
                    bill.dueInDays <= 3 ? 'text-red-600' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-sm">{bill.merchant}</p>
                  <p className="text-xs text-muted-foreground">
                    Due in {bill.dueInDays} days
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {bill.currency} {bill.averageAmount.toFixed(2)}
                </p>
                {bill.dueInDays <= 3 && (
                  <Badge variant="destructive" className="text-xs">
                    <Bell className="h-3 w-3 mr-1" />
                    Due Soon
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}