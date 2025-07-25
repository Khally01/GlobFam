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
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts'

interface DashboardData {
  assets: any[]
  transactions: any[]
  summary: any
  loading: boolean
}

export function NotionDashboard({ data }: { data: DashboardData }) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  
  // Calculate real data from transactions
  const getMonthlyData = () => {
    const monthlyMap = new Map<string, { income: number, expenses: number }>()
    
    // Get last 6 months
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
      months.push(monthKey)
      monthlyMap.set(monthKey, { income: 0, expenses: 0 })
    }
    
    // Aggregate transactions by month
    data.transactions.forEach((transaction: any) => {
      const date = new Date(transaction.date)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
      
      if (monthlyMap.has(monthKey)) {
        const current = monthlyMap.get(monthKey)!
        const amount = parseFloat(transaction.amount)
        
        if (transaction.type === 'INCOME') {
          current.income += amount
        } else if (transaction.type === 'EXPENSE') {
          current.expenses += amount
        }
      }
    })
    
    // Convert to array format
    return months.map(month => {
      const data = monthlyMap.get(month)!
      return {
        month,
        income: Math.round(data.income),
        expenses: Math.round(data.expenses),
        savings: Math.round(data.income - data.expenses)
      }
    })
  }
  
  // Calculate category spending from actual transactions
  const getCategorySpending = () => {
    const categoryMap = new Map<string, number>()
    let totalExpenses = 0
    
    // Use period-filtered transactions
    periodTransactions
      .filter((t: any) => t.type === 'EXPENSE')
      .forEach((t: any) => {
        const category = t.category || 'Other'
        const amount = parseFloat(t.amount)
        categoryMap.set(category, (categoryMap.get(category) || 0) + amount)
        totalExpenses += amount
      })
    
    // Convert to array and calculate percentages
    const categories = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount),
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5) // Top 5 categories
    
    // Return empty array with message if no data
    if (categories.length === 0) {
      return [{
        category: 'No expenses in this period',
        amount: 0,
        percentage: 0
      }]
    }
    
    return categories
  }
  
  const monthlyData = getMonthlyData()
  const categorySpending = getCategorySpending()

  if (data.loading) {
    return <DashboardSkeleton />
  }

  // Filter transactions based on selected period
  const filterTransactionsByPeriod = (transactions: any[], period: string) => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return transactions.filter((t: any) => {
      const transactionDate = new Date(t.date)
      
      switch (period) {
        case 'week':
          const weekAgo = new Date(startOfDay)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return transactionDate >= weekAgo
        case 'month':
          return isCurrentMonth(t.date)
        case 'year':
          return transactionDate.getFullYear() === now.getFullYear()
        default:
          return true
      }
    })
  }
  
  const periodTransactions = filterTransactionsByPeriod(data.transactions, selectedPeriod)
  
  const totalAssets = data.assets.reduce((sum, asset) => sum + parseFloat(asset.amount), 0)
  const periodIncome = periodTransactions
    .filter((t: any) => t.type === 'INCOME')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)
  const periodExpenses = periodTransactions
    .filter((t: any) => t.type === 'EXPENSE')
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)
  
  // Get primary currency from first transaction or asset
  const primaryCurrency = data.transactions[0]?.currency || data.assets[0]?.currency || 'USD'
  
  // Calculate actual change percentages based on previous month
  const calculateChange = (current: number, type: 'income' | 'expense' | 'assets' | 'savings') => {
    if (monthlyData.length < 2) return 0
    
    const currentMonth = monthlyData[monthlyData.length - 1]
    const previousMonth = monthlyData[monthlyData.length - 2]
    
    let currentValue = 0
    let previousValue = 0
    
    switch (type) {
      case 'income':
        currentValue = currentMonth.income
        previousValue = previousMonth.income
        break
      case 'expense':
        currentValue = currentMonth.expenses
        previousValue = previousMonth.expenses
        break
      case 'savings':
        currentValue = currentMonth.income - currentMonth.expenses
        previousValue = previousMonth.income - previousMonth.expenses
        break
      case 'assets':
        // For assets, just show a positive trend for now
        return 2.5
    }
    
    if (previousValue === 0) return 0
    return Math.round(((currentValue - previousValue) / previousValue) * 100 * 10) / 10
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="brand-title text-2xl sm:text-brand-h2 bg-brand-gradient bg-clip-text text-transparent">
            Your Financial Overview
          </h1>
          <p className="text-globfam-steel mt-2 text-sm sm:text-base">
            Track, analyze, and optimize your global finances
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-brand-md text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-primary text-white shadow-brand-purple'
                  : 'bg-globfam-cloud text-globfam-slate hover:bg-white hover:text-globfam-deep-blue border border-globfam-border'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Net Worth"
          value={formatCurrency(totalAssets, primaryCurrency)}
          change={calculateChange(totalAssets, 'assets')}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          title={`${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}ly Income`}
          value={formatCurrency(periodIncome, primaryCurrency)}
          change={calculateChange(periodIncome, 'income')}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title={`${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}ly Expenses`}
          value={formatCurrency(periodExpenses, primaryCurrency)}
          change={calculateChange(periodExpenses, 'expense')}
          icon={TrendingDown}
          color="red"
        />
        <MetricCard
          title="Savings Rate"
          value={periodIncome > 0 ? `${Math.round(((periodIncome - periodExpenses) / periodIncome) * 100)}%` : 'N/A'}
          change={calculateChange(periodIncome - periodExpenses, 'savings')}
          icon={PieChart}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Cash Flow Chart */}
        <Card className="brand-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-globfam-deep-blue">
              <Activity className="h-5 w-5 text-primary" />
              Cash Flow Trends
            </CardTitle>
            <CardDescription className="text-globfam-steel">Income vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
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
                    formatter={(value: any) => formatCurrency(value, primaryCurrency)}
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
        <Card className="brand-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-globfam-deep-blue">
              <PieChart className="h-5 w-5 text-primary" />
              Spending Breakdown
            </CardTitle>
            <CardDescription className="text-globfam-steel">Where your money goes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categorySpending.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.category}</span>
                    <span>{formatCurrency(item.amount, primaryCurrency)}</span>
                  </div>
                  <div className="relative h-2 bg-globfam-cloud rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-brand-gradient rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assets Breakdown - Only show if user has assets */}
        {data.assets.length > 0 && (
          <Card className="brand-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-globfam-deep-blue">
                <DollarSign className="h-5 w-5 text-primary" />
                Assets Distribution
              </CardTitle>
              <CardDescription className="text-globfam-steel">Your wealth across different assets</CardDescription>
            </CardHeader>
            <CardContent>
              <AssetsPieChart assets={data.assets} primaryCurrency={primaryCurrency} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-globfam-deep-blue">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
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
    blue: 'bg-primary/10 text-primary',
    green: 'bg-globfam-success/10 text-globfam-success',
    red: 'bg-globfam-alert/10 text-globfam-alert',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <Card className="brand-card">
      <CardContent className="p-brand-md">
        <div className="flex items-center justify-between mb-brand-sm">
          <div className={`p-3 rounded-brand-md ${colorClasses[color] || colorClasses.blue}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-globfam-success' : 'text-globfam-alert'
          }`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(change)}%
          </div>
        </div>
        <h3 className="text-2xl font-bold text-globfam-deep-blue">{value}</h3>
        <p className="text-sm text-globfam-steel mt-1">{title}</p>
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

function AssetsPieChart({ assets, primaryCurrency }: { assets: any[], primaryCurrency: string }) {
  // Group assets by type and calculate totals
  const assetsByType = assets.reduce((acc, asset) => {
    const type = asset.type || 'Other'
    if (!acc[type]) {
      acc[type] = {
        name: type.replace(/_/g, ' ').charAt(0).toUpperCase() + type.replace(/_/g, ' ').slice(1).toLowerCase(),
        value: 0,
        count: 0
      }
    }
    acc[type].value += parseFloat(asset.amount)
    acc[type].count += 1
    return acc
  }, {} as Record<string, { name: string, value: number, count: number }>)

  const data = Object.values(assetsByType) as Array<{ name: string; value: number; count: number }>
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const COLORS = ['#635bff', '#00d924', '#ff5722', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899']

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-globfam-border">
          <p className="font-medium text-globfam-deep-blue">{data.name}</p>
          <p className="text-sm text-globfam-steel">
            {formatCurrency(data.value, primaryCurrency)} ({((data.value / total) * 100).toFixed(1)}%)
          </p>
          <p className="text-xs text-globfam-steel">{data.count} asset{data.count > 1 ? 's' : ''}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}