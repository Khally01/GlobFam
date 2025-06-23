'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui'

export default function DashboardPage() {
  const router = useRouter()
  const { user, organization } = useAuthStore()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user || !organization) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to GlobFam, {user.name}!</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>Your current organization details</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{organization.name}</p>
            <p className="text-sm text-muted-foreground">Plan: {organization.plan}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with GlobFam</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <a href="/assets" className="text-primary hover:underline">
                  → Add your first asset
                </a>
              </li>
              <li>
                <a href="/transactions" className="text-primary hover:underline">
                  → Record a transaction
                </a>
              </li>
              <li>
                <a href="/settings" className="text-primary hover:underline">
                  → Configure settings
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Account information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Name: {user.name}</p>
            <p className="text-sm">Email: {user.email}</p>
            <p className="text-sm">Role: {user.role}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Welcome to your GlobFam dashboard! This is where you'll manage your family's global finances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              GlobFam helps you track assets, transactions, and financial goals across multiple currencies and countries.
            </p>
            <p>
              Start by adding your assets (bank accounts, properties, investments) and recording your transactions.
              Our AI-powered insights will help you make better financial decisions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}