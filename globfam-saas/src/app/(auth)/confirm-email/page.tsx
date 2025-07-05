'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Supabase sends confirmation as URL fragments
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const type = hashParams.get('type')
        
        if (type === 'signup' && accessToken) {
          // Email is already confirmed by Supabase when they click the link
          // The presence of access_token with type=signup means confirmation succeeded
          setStatus('success')
          
          // Redirect to email confirmed page
          setTimeout(() => {
            router.push('/email-confirmed')
          }, 2000)
          return
        }

        // Handle other confirmation types (recovery, invite, etc.)
        if (!accessToken) {
          throw new Error('Invalid confirmation link')
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error)
        setErrorMessage(error.message || 'Failed to confirm email')
        setStatus('error')
      }
    }

    confirmEmail()
  }, [router, searchParams, supabase])

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Confirming your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Email Confirmed!</h3>
                <p className="text-muted-foreground">
                  Your email has been successfully confirmed. You'll be redirected to the login page in a few seconds.
                </p>
              </div>
              <Link href="/login">
                <Button>Go to Login</Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <XCircle className="h-12 w-12 text-red-600" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Confirmation Failed</h3>
                <p className="text-muted-foreground">{errorMessage}</p>
              </div>
              <div className="flex gap-4">
                <Link href="/register">
                  <Button variant="outline">Back to Register</Button>
                </Link>
                <Link href="/login">
                  <Button>Go to Login</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}