'use client'

import { useEffect, useState } from 'react'
import { ModernNav } from '@/components/layout/modern-nav'

export default function DebugDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    // Collect debug information
    const info = {
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      },
      window: {
        location: window.location.href,
        origin: window.location.origin,
      },
      timestamp: new Date().toISOString()
    }
    setDebugInfo(info)

    // Test API health
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setDebugInfo(prev => ({
          ...prev,
          apiHealth: data
        }))
      })
      .catch(err => {
        setDebugInfo(prev => ({
          ...prev,
          apiError: err.message
        }))
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="font-bold mb-2">Debug Information</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        {children}
      </main>
    </div>
  )
}