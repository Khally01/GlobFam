'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui'

export default function DebugAuthPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    setResults({})

    // Test 1: Check if API routes are accessible
    try {
      const testResponse = await fetch('/api/auth/login', {
        method: 'GET', // This should return 405 Method Not Allowed, not 404
      })
      setResults(prev => ({
        ...prev,
        apiRouteExists: {
          status: testResponse.status,
          statusText: testResponse.statusText,
          url: testResponse.url,
          ok: testResponse.status !== 404,
        }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        apiRouteExists: { error: error.message }
      }))
    }

    // Test 2: Try a proper login request
    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword'
        }),
      })
      const loginData = await loginResponse.json()
      setResults(prev => ({
        ...prev,
        loginTest: {
          status: loginResponse.status,
          statusText: loginResponse.statusText,
          data: loginData,
        }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        loginTest: { error: error.message }
      }))
    }

    // Test 3: Check environment variables
    setResults(prev => ({
      ...prev,
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV,
      }
    }))

    // Test 4: Check window location
    setResults(prev => ({
      ...prev,
      location: {
        origin: window.location.origin,
        pathname: window.location.pathname,
        href: window.location.href,
      }
    }))

    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Auth Debug Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTests} disabled={loading}>
            {loading ? 'Running tests...' : 'Run Auth Debug Tests'}
          </Button>

          {Object.keys(results).length > 0 && (
            <div className="mt-4 space-y-4">
              <h3 className="font-semibold">Test Results:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Run Auth Debug Tests" to check API routes</li>
              <li>Check if apiRouteExists.ok is true (status should not be 404)</li>
              <li>Check if environment variables are present</li>
              <li>The loginTest will likely fail with 401 or validation error, which is expected</li>
              <li>If apiRouteExists returns 404, the API routes are not being recognized</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}