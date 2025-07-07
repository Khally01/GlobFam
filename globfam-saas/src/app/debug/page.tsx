'use client'

import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui'
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { redirect } from 'next/navigation'

// Only allow this page in development
if (process.env.NODE_ENV === 'production') {
  redirect('/')
}

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message?: string
  data?: any
}

export default function DebugPage() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    setTests([])

    // Test 1: Environment Variables
    const envTest: TestResult = {
      name: 'Environment Variables',
      status: 'pending'
    }
    setTests(prev => [...prev, envTest])

    try {
      const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      envTest.status = hasSupabaseUrl && hasSupabaseKey ? 'success' : 'error'
      envTest.data = {
        NEXT_PUBLIC_SUPABASE_URL: hasSupabaseUrl ? 'Set' : 'Missing',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: hasSupabaseKey ? 'Set' : 'Missing',
        NODE_ENV: process.env.NODE_ENV
      }
      envTest.message = envTest.status === 'success' 
        ? 'All critical environment variables are set'
        : 'Missing critical environment variables'
    } catch (error: any) {
      envTest.status = 'error'
      envTest.message = error.message
    }
    setTests(prev => [...prev.slice(0, -1), envTest])

    // Test 2: API Health Check
    const apiTest: TestResult = {
      name: 'API Health Check',
      status: 'pending'
    }
    setTests(prev => [...prev, apiTest])

    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      
      apiTest.status = response.ok ? 'success' : 'error'
      apiTest.data = data
      apiTest.message = response.ok 
        ? 'API is responding correctly'
        : `API returned status ${response.status}`
    } catch (error: any) {
      apiTest.status = 'error'
      apiTest.message = `Failed to reach API: ${error.message}`
    }
    setTests(prev => [...prev.slice(0, -1), apiTest])

    // Test 3: Test Endpoint
    const testEndpoint: TestResult = {
      name: 'Test Endpoint',
      status: 'pending'
    }
    setTests(prev => [...prev, testEndpoint])

    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      
      testEndpoint.status = response.ok ? 'success' : 'error'
      testEndpoint.data = data
      testEndpoint.message = response.ok 
        ? 'Test endpoint is working'
        : `Test endpoint returned status ${response.status}`
    } catch (error: any) {
      testEndpoint.status = 'error'
      testEndpoint.message = `Failed to reach test endpoint: ${error.message}`
    }
    setTests(prev => [...prev.slice(0, -1), testEndpoint])

    // Test 4: Supabase Connection
    const supabaseTest: TestResult = {
      name: 'Supabase Connection',
      status: 'pending'
    }
    setTests(prev => [...prev, supabaseTest])

    try {
      // Try to create a Supabase client
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Try a simple query
      const { error } = await supabase.from('organizations').select('count').limit(0)
      
      supabaseTest.status = !error ? 'success' : 'error'
      supabaseTest.message = !error 
        ? 'Successfully connected to Supabase'
        : `Supabase error: ${error.message}`
    } catch (error: any) {
      supabaseTest.status = 'error'
      supabaseTest.message = `Failed to initialize Supabase: ${error.message}`
    }
    setTests(prev => [...prev.slice(0, -1), supabaseTest])

    // Test 5: Browser Information
    const browserTest: TestResult = {
      name: 'Browser Information',
      status: 'success',
      data: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      },
      message: 'Browser information collected'
    }
    setTests(prev => [...prev, browserTest])

    setIsRunning(false)
  }

  useEffect(() => {
    // Auto-run tests on mount
    runTests()
  }, [])

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🐛 Debug Information</span>
            <span className="text-sm font-normal text-muted-foreground">
              Development Only
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              This page is only available in development mode. It will not be accessible in production.
            </p>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">System Tests</h3>
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              Re-run Tests
            </Button>
          </div>

          <div className="space-y-3">
            {tests.map((test, index) => (
              <div 
                key={index}
                className={`border rounded-lg p-4 space-y-2 transition-all ${getStatusColor(test.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  {test.message && (
                    <span className="text-sm text-muted-foreground">
                      {test.message}
                    </span>
                  )}
                </div>
                
                {test.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                      View Details
                    </summary>
                    <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/api/health'}>
                View API Health
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/api/test'}>
                View Test Endpoint
              </Button>
              <Button variant="outline" onClick={() => localStorage.clear()}>
                Clear Local Storage
              </Button>
              <Button variant="outline" onClick={() => {
                document.cookie.split(";").forEach((c) => {
                  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
                window.location.reload();
              }}>
                Clear Cookies
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}