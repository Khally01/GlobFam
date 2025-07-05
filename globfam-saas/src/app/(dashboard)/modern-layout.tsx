'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ModernNav } from '@/components/layout/modern-nav'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api'

export default function ModernDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const authCheckRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    
    if (!authCheckRef.current) {
      authCheckRef.current = true
      checkAuth()
    }

    return () => {
      mountedRef.current = false
    }
  }, [])

  const checkAuth = async () => {
    try {
      const response = await authApi.getMe()
      
      if (!mountedRef.current) return
      
      if (!response.data.data?.user) {
        clearAuth()
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      if (mountedRef.current) {
        clearAuth()
        router.push('/login')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-10 h-10 bg-primary rounded-xl mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <ModernNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}