'use client'

import { useEffect, useState, useRef } from 'react'
import { assetsApi, transactionsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { Asset, Transaction } from '@/lib/shared-types/index'
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress'
import { NotionDashboard } from '@/components/dashboard/NotionDashboard'
import { EmptyDashboard } from '@/components/dashboard/EmptyDashboard'
import { SkeletonDashboard } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { user, family } = useAuthStore()
  const [assets, setAssets] = useState<Asset[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const isFetching = useRef(false)

  useEffect(() => {
    // Prevent multiple fetches
    if (!isFetching.current) {
      isFetching.current = true
      fetchDashboardData()
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const [assetsRes, transactionsRes, analyticsRes] = await Promise.all([
        assetsApi.getAll().catch(err => {
          console.error('Assets API error:', err)
          return { data: { data: { assets: [] } } }
        }),
        transactionsApi.getAll().catch(err => {
          console.error('Transactions API error:', err)
          return { data: { data: { transactions: [] } } }
        }),
        transactionsApi.getAnalytics().catch(err => {
          console.error('Analytics API error:', err)
          return { data: { data: { summary: null } } }
        })
      ])

      setAssets(assetsRes.data.data?.assets || [])
      setTransactions(transactionsRes.data.data?.transactions || [])
      setSummary(analyticsRes.data.data?.summary || null)
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      setError(error.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }

  // Check if user has any data
  const hasData = assets.length > 0 || transactions.length > 0
  const isNewUser = !loading && !hasData && !error

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-globfam-alert mb-brand-sm">{error}</p>
          <button 
            onClick={() => {
              isFetching.current = false
              setError(null)
              fetchDashboardData()
            }}
            className="brand-button"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show empty state for new users
  if (isNewUser) {
    return (
      <div className="space-y-6">
        <OnboardingProgress />
        <EmptyDashboard />
      </div>
    )
  }

  // Show skeleton loader while loading
  if (loading) {
    return <SkeletonDashboard />
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
          loading: false
        }}
      />
    </div>
  )
}