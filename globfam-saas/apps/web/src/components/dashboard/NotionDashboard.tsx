'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  Activity,
  Calendar,
  Target,
  Sparkles
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from 'recharts'

interface DashboardData {
  assets: any[]
  transactions: any[]
  summary: any
  loading: boolean
}

export function NotionDashboard({ data }: { data: DashboardData }) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  
  // Mock data for charts (in real app, this would come from API)
  const monthlyData = [
    { month: 'Jan', income: 5000, expenses: 3200, savings: 1800 },
    { month: 'Feb', income: 5200, expenses: 3100, savings: 2100 },
    { month: 'Mar', income: 5000, expenses: 3500, savings: 1500 },
    { month: 'Apr', income: 5500, expenses: 3000, savings: 2500 },
    { month: 'May', income: 5300, expenses: 3200, savings: 2100 },
    { month: 'Jun', income: 5800, expenses: 3400, savings: 2400 },
  ]

  const categorySpending = [
    { category: 'Housing', amount: 1500, percentage: 35 },
    { category: 'Food', amount: 800, percentage: 18 },
    { category: 'Transport', amount: 600, percentage: 14 },
    { category: 'Entertainment', amount: 400, percentage: 9 },
    { category: 'Other', amount: 1000, percentage: 24 },
  ]

  if (data.loading) {
    return <DashboardSkeleton />
  }

  const totalAssets = data.assets.reduce((sum, asset) => sum + parseFloat(asset.amount), 0)
  const monthlyIncome = data.transactions
    .filter((t: any) => t.type === 'INCOME' && isCurrentMonth(t.date))
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)
  const monthlyExpenses = data.transactions
    .filter((t: any) => t.type === 'EXPENSE' && isCurrentMonth(t.date))
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Your Financial Overview
          </h1>
          <p className="text-muted-foreground mt-2">
            Track, analyze, and optimize your global finances
          </p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Net Worth"
          value={formatCurrency(totalAssets, 'AUD')}
          change={12.5}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          title="Monthly Income"
          value={formatCurrency(monthlyIncome, 'AUD')}
          change={8.2}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Monthly Expenses"
          value={formatCurrency(monthlyExpenses, 'AUD')}
          change={-3.4}
          icon={TrendingDown}
          color="red"
        />
        <MetricCard
          title="Savings Rate"
          value={`${Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)}%`}
          change={5.1}
          icon={PieChart}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cash Flow Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Cash Flow Trends
            </CardTitle>
            <CardDescription>Income vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value, 'AUD')}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: 'none',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#income)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#expenses)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Spending Breakdown */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Spending Breakdown
            </CardTitle>
            <CardDescription>Where your money goes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categorySpending.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.category}</span>
                    <span>{formatCurrency(item.amount, 'AUD')}</span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <QuickAction
              title="Add Transaction"
              description="Record income or expense"
              icon={DollarSign}
              href="/dashboard/transactions"
            />
            <QuickAction
              title="Import Bank Data"
              description="Upload CSV or connect bank"
              icon={Activity}
              href="/dashboard/banking"
            />
            <QuickAction
              title="Set New Goal"
              description="Create savings target"
              icon={Target}
              href="/dashboard/goals"
            />
            <QuickAction
              title="View Analytics"
              description="Deep dive into finances"
              icon={PieChart}
              href="/dashboard/analytics"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: number
  icon: any
  color: 'blue' | 'green' | 'red' | 'purple'
}

function MetricCard({ title, value, change, icon: Icon, color }: MetricCardProps) {
  const isPositive = change > 0
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(change)}%
          </div>
        </div>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
      </CardContent>
    </Card>
  )
}

interface QuickActionProps {
  title: string
  description: string
  icon: any
  href: string
}

function QuickAction({ title, description, icon: Icon, href }: QuickActionProps) {
  return (
    <a
      href={href}
      className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="p-3 rounded-full bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </a>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 bg-muted rounded w-1/3"></div>
      <div className="grid gap-6 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg"></div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-96 bg-muted rounded-lg"></div>
        <div className="h-96 bg-muted rounded-lg"></div>
      </div>
    </div>
  )
}

function isCurrentMonth(date: string) {
  const d = new Date(date)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}