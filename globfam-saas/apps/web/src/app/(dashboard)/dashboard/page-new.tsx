'use client'

import { useEffect, useState } from 'react'
import { assetsApi, transactionsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { Asset, Transaction } from '@/lib/shared-types/index'
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress'
import { NotionDashboard } from '@/components/dashboard/NotionDashboard'
import { EmptyDashboard } from '@/components/dashboard/EmptyDashboard'

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
        transactionsApi.getAll({ limit: 10 }),
        transactionsApi.getAnalytics()
      ])

      setAssets(assetsRes.data.data?.assets || [])
      setTransactions(transactionsRes.data.data?.transactions || [])
      setSummary(analyticsRes.data.data?.summary || null)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check if user has any data
  const hasData = assets.length > 0 || transactions.length > 0
  const isNewUser = !loading && !hasData

  // Show empty state for new users
  if (isNewUser) {
    return (
      <div className="space-y-6">
        <OnboardingProgress />
        <EmptyDashboard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Show onboarding progress if user hasn't completed all steps */}
      <OnboardingProgress />
      
      {/* Notion-inspired Dashboard */}
      <NotionDashboard 
        data={{
          assets,
          transactions,
          summary,
          loading
        }}
      />
    </div>
  )
}