'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Globe,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { assetsApi, transactionsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { Asset, Transaction } from '@/lib/shared-types'

export default function DashboardPage() {
  const { user, family } = useAuthStore()
  const [assets, setAssets] = useState<Asset[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [assetsRes, transactionsRes, analyticsRes] = await Promise.all([
        assetsApi.getAll(),
        transactionsApi.getAll({ limit: 5 }),
        transactionsApi.getAnalytics()
      ])

      setAssets(assetsRes.data.data.assets)
      setTransactions(transactionsRes.data.data.transactions)
      setSummary(analyticsRes.data.data.summary)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  // Calculate totals
  const totalByCurrency = assets.reduce((acc, asset) => {
    const amount = parseFloat(asset.amount)
    acc[asset.currency] = (acc[asset.currency] || 0) + amount
    return acc
  }, {} as Record<string, number>)

  const mainCurrency = user?.preferredCurrency || 'USD'
  const mainTotal = totalByCurrency[mainCurrency] || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">
          Here's an overview of your family's finances
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Assets"
          value={`${mainCurrency} ${mainTotal.toLocaleString()}`}
          description="Across all countries"
          icon={Wallet}
          trend={12.5}
        />
        <StatsCard
          title="Countries"
          value={new Set(assets.map(a => a.country)).size.toString()}
          description="With tracked assets"
          icon={Globe}
        />
        <StatsCard
          title="Family Members"
          value={family ? '1' : '0'}
          description="In your family group"
          icon={Users}
        />
        <StatsCard
          title="This Month"
          value={`${mainCurrency} ${(summary?.byCurrency[mainCurrency]?.income || 0).toLocaleString()}`}
          description="Total income"
          icon={TrendingUp}
          trend={8.2}
        />
      </div>

      {/* Currency Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Assets by Currency</CardTitle>
          <CardDescription>Your wealth distribution across currencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(totalByCurrency).map(([currency, amount]) => (
              <div key={currency} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="font-medium">{currency}</span>
                </div>
                <span className="text-lg font-semibold">
                  {amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transactions yet. Add your first transaction to get started.
              </p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        transaction.type === 'INCOME'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {transaction.type === 'INCOME' ? (
                        <ArrowDownRight className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === 'INCOME'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {transaction.currency} {parseFloat(transaction.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  description: string
  icon: any
  trend?: number
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1">
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-sm font-medium ${
                trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(trend)}%
            </span>
            <span className="text-sm text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}