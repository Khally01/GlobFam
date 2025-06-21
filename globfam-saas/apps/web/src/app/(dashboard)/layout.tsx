'use client'

import { useEffect, useState } from 'react'
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
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch user data if not in store
    if (!user) {
      authApi.getMe()
        .then((response) => {
          const { user, organization, family } = response.data.data
          useAuthStore.getState().setAuth({ 
            user, 
            organization, 
            family,
            token: localStorage.getItem('token') || ''
          })
        })
        .catch(() => {
          router.push('/login')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [user, router])

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logout()
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-muted/50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/dashboard" className="text-xl font-bold">
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
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-primary/10" />
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="mt-2 w-full justify-start gap-3"
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
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">GlobFam</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}