'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MetricCard } from './metric-card'
import { AssetTypeCard } from './asset-type-card'
import { CurrencyPortfolio } from './currency-portfolio'
import { RecentTransactions } from './recent-transactions'
import { ActionCards } from './action-cards'
import type { Asset, Transaction } from '@/lib/shared-types/index'
import { useAuthStore } from '@/store/auth'

interface ModernDashboardProps {
  data: {
    assets: Asset[]
    transactions: Transaction[]
    summary: any
    loading: boolean
  }
}

export function ModernDashboard({ data }: ModernDashboardProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const { assets, transactions, summary } = data

  // Calculate asset totals by type
  const assetsByType = assets.reduce((acc, asset) => {
    const type = asset.type.toLowerCase()
    if (!acc[type]) {
      acc[type] = { total: 0, count: 0, items: [] }
    }
    acc[type].total += parseFloat(asset.amount || '0')
    acc[type].count += 1
    acc[type].items.push(asset)
    return acc
  }, {} as Record<string, { total: number; count: number; items: Asset[] }>)

  // Calculate total portfolio value
  const totalPortfolioValue = assets.reduce((sum, asset) => sum + parseFloat(asset.amount || '0'), 0)

  // Get recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(tx => ({
      id: tx.id,
      title: tx.description || `${tx.type} transaction`,
      category: tx.category,
      member: user?.name || 'You',
      memberInitials: user?.name?.split(' ').map(n => n[0]).join('') || 'Y',
      date: new Date(tx.date).toLocaleDateString(),
      amount: parseFloat(tx.amount),
      type: tx.type.toLowerCase() as 'income' | 'expense' | 'transfer'
    }))

  // Mock currency data (you would calculate this from actual multi-currency assets)
  const currencies = [
    { currency: 'USD', amount: 142580, usdEquivalent: 142580, percentage: 50.1, flag: '🇺🇸' },
    { currency: 'AUD', amount: 85420, usdEquivalent: 56890, percentage: 20, flag: '🇦🇺' },
    { currency: 'EUR', amount: 42150, usdEquivalent: 45800, percentage: 16.1, flag: '🇪🇺' },
    { currency: 'GBP', amount: 25680, usdEquivalent: 32450, percentage: 11.4, flag: '🇬🇧' },
    { currency: 'CAD', amount: 8940, usdEquivalent: 6847, percentage: 2.4, flag: '🇨🇦' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your family's finances across the globe.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Portfolio Value"
          value={totalPortfolioValue.toLocaleString()}
          currency="USD"
          subtitle="Across all accounts"
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="Monthly Income"
          value={(summary?.totalIncome || 0).toLocaleString()}
          currency="USD"
          subtitle="This month"
          trend={{ value: 8.2, isPositive: true }}
        />
        <MetricCard
          title="Monthly Expenses"
          value={(summary?.totalExpenses || 0).toLocaleString()}
          currency="USD"
          subtitle="Under budget"
          trend={{ value: -3.1, isPositive: false }}
        />
        <MetricCard
          title="Savings Rate"
          value="33.1"
          subtitle="Above target"
          trend={{ value: 2.4, isPositive: true }}
        />
      </div>

      {/* Asset Type Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Assets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AssetTypeCard
            type="bank"
            name="Bank Accounts"
            balance={(assetsByType['bank_account']?.total || 0).toLocaleString()}
            count={assetsByType['bank_account']?.count || 0}
            change={{ value: 2500, percentage: 3.2 }}
            onAdd={() => router.push('/dashboard/assets?action=add&type=bank')}
          />
          <AssetTypeCard
            type="cash"
            name="Cash"
            balance={(assetsByType['cash']?.total || 0).toLocaleString()}
            count={assetsByType['cash']?.count || 0}
            change={{ value: 500, percentage: 5.1 }}
            onAdd={() => router.push('/dashboard/assets?action=add&type=cash')}
          />
          <AssetTypeCard
            type="crypto"
            name="Crypto"
            balance={(assetsByType['crypto']?.total || 0).toLocaleString()}
            count={assetsByType['crypto']?.count || 0}
            change={{ value: -1200, percentage: -8.3 }}
            onAdd={() => router.push('/dashboard/assets?action=add&type=crypto')}
          />
          <AssetTypeCard
            type="property"
            name="Property"
            balance={(assetsByType['property']?.total || 0).toLocaleString()}
            count={assetsByType['property']?.count || 0}
            change={{ value: 15000, percentage: 2.1 }}
            onAdd={() => router.push('/dashboard/assets?action=add&type=property')}
          />
        </div>
      </div>

      {/* Currency Portfolio and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrencyPortfolio 
          currencies={currencies}
          totalUSD={totalPortfolioValue}
        />
        <RecentTransactions 
          transactions={recentTransactions}
          onViewAll={() => router.push('/dashboard/transactions')}
        />
      </div>

      {/* Action Cards */}
      <ActionCards />

      {/* Family Spending Summary */}
      <div className="bg-white rounded-2xl p-6 card-shadow">
        <p className="text-sm text-muted-foreground text-center">
          Total Family Spending: <span className="font-semibold text-foreground">
            ${(summary?.totalExpenses || 0).toLocaleString()}/month
          </span>
        </p>
      </div>
    </div>
  )
}