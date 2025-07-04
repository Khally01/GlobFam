'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/shared-ui'
import { 
  Home, 
  Wallet, 
  Receipt, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  TrendingUp,
  Target,
  Building2
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/lib/api'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Assets', href: '/dashboard/assets', icon: Wallet },
  { name: 'Transactions', href: '/dashboard/transactions', icon: Receipt },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
  { name: 'Budget', href: '/dashboard/budget', icon: Target },
  { name: 'Banking', href: '/dashboard/banking', icon: Building2 },
  { name: 'Family', href: '/dashboard/family', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, organization, clearAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const authCheckRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    // Set mounted ref
    mountedRef.current = true
    
    // Cleanup function
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      // Prevent multiple auth checks
      if (authCheckRef.current || !mountedRef.current) return
      authCheckRef.current = true

      try {
        // If we already have user data in store, use it
        if (user && organization) {
          console.log('Using existing user data from store')
          setLoading(false)
          return
        }

        // Fetch user data from API
        console.log('Fetching user data from API')
        const response = await authApi.getMe()
        
        if (!mountedRef.current) return

        // Check if the request was successful
        if (response.status !== 200) {
          throw new Error(`API returned status ${response.status}`)
        }

        // The axios response.data contains our API response
        const apiResponse = response.data as any
        
        if (apiResponse.success && apiResponse.data?.user) {
          const { user: userData } = apiResponse.data
          
          console.log('User data fetched successfully:', userData.email)
          
          // Update auth store
          useAuthStore.getState().setAuth({ 
            user: userData, 
            organization: userData.organization || null, 
            family: userData.family || null,
            token: 'supabase-managed'
          })

          setLoading(false)
        } else {
          console.error('Invalid API response:', apiResponse)
          throw new Error(apiResponse.error?.message || 'Failed to fetch user data')
        }
      } catch (error: any) {
        console.error('Auth check failed:', error.message || error)
        
        if (!mountedRef.current) return

        // If it's a 401, clear auth and redirect
        if (error.response?.status === 401 || error.message?.includes('401')) {
          clearAuth()
          router.push('/login')
        } else {
          // For other errors, show error state
          setLoading(false)
          // You might want to set an error state here
          console.error('Non-auth error, staying on page:', error)
        }
      } finally {
        authCheckRef.current = false // Allow retry if needed
      }
    }

    checkAuth()
  }, [user, organization]) // Re-run if user or org changes

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuth()
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-globfam-cloud">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-brand-purple"></div>
          <p className="mt-brand-xs text-sm text-globfam-steel">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-globfam-cloud">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-globfam-border transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-globfam-border px-brand-md">
            <Link href="/dashboard" className="brand-logo">
              GlobFam
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-brand-sm">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-brand-xs rounded-brand-md px-brand-sm py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-brand-purple'
                      : 'text-globfam-slate hover:bg-globfam-cloud hover:text-globfam-deep-blue'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-globfam-border p-brand-sm">
            <div className="flex items-center gap-brand-xs rounded-brand-md px-brand-sm py-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-globfam-deep-blue">{user?.name}</p>
                <p className="text-xs text-globfam-steel">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="mt-2 w-full justify-start gap-brand-xs text-globfam-slate hover:text-globfam-deep-blue hover:bg-globfam-cloud"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-16 items-center gap-brand-sm border-b border-globfam-border bg-white px-brand-md lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-globfam-slate hover:text-globfam-deep-blue">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="brand-logo text-xl">GlobFam</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-brand-md">{children}</div>
        </main>
      </div>
    </div>
  )
}