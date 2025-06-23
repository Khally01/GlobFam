'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/shared-ui'
import { useToast } from '@/hooks/use-toast'
import { authApi } from '@/lib/api'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, clearAuth } = useAuthStore()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleLogout = async () => {
    try {
      await authApi.logout()
      clearAuth()
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear auth even if API call fails
      clearAuth()
      router.push('/login')
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold">
            GlobFam
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-primary">
              Dashboard
            </Link>
            <Link href="/assets" className="hover:text-primary">
              Assets
            </Link>
            <Link href="/transactions" className="hover:text-primary">
              Transactions
            </Link>
            <Link href="/analytics" className="hover:text-primary">
              Analytics
            </Link>
            <Link href="/settings" className="hover:text-primary">
              Settings
            </Link>
            
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}