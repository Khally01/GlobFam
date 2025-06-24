'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

interface LoadingBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function LoadingBoundary({ children, fallback }: LoadingBoundaryProps) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { isAuthenticated, token } = useAuthStore()

  useEffect(() => {
    // Check if we have auth token
    const checkAuth = async () => {
      try {
        // Get token from multiple sources
        const storedToken = localStorage.getItem('token')
        const cookieToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1]

        if (!storedToken && !cookieToken) {
          router.push('/login')
          return
        }

        // Verify the token is valid by making a simple API call
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken || cookieToken}`
          }
        })

        if (!response.ok) {
          throw new Error('Invalid token')
        }

        setIsReady(true)
      } catch (err) {
        console.error('Auth check failed:', err)
        // Clear invalid tokens
        localStorage.removeItem('token')
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  if (!isReady) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}