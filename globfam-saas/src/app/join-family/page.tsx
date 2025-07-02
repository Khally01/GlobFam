'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from '@/components/shared-ui'
import { Users, ArrowRight } from 'lucide-react'
import { familiesApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store/auth'

export default function JoinFamilyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user, updateFamily } = useAuthStore()
  const [inviteCode, setInviteCode] = useState(searchParams.get('code') || '')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    // If user is not logged in, redirect to login with return URL
    if (!user) {
      const returnUrl = `/join-family${inviteCode ? `?code=${inviteCode}` : ''}`
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
    }
  }, [user, inviteCode, router])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an invite code',
        variant: 'destructive'
      })
      return
    }

    setJoining(true)
    try {
      const response = await familiesApi.join(inviteCode.toUpperCase())
      updateFamily(response.data.data?.family)
      
      toast({
        title: 'Welcome to the family!',
        description: 'You have successfully joined the family group.',
      })
      
      // Redirect to family page
      router.push('/dashboard/family')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Invalid invite code',
        variant: 'destructive',
      })
    } finally {
      setJoining(false)
    }
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Join a Family</CardTitle>
          <CardDescription>
            Enter the invite code shared by your family member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Invite Code</label>
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                className="font-mono text-center text-lg tracking-wider"
                maxLength={6}
                required
                disabled={joining}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ask your family member for their invite code
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={joining || inviteCode.length < 6}
            >
              {joining ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Joining...
                </>
              ) : (
                <>
                  Join Family
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don't have a code? Ask your family member to share it from their Family page.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}