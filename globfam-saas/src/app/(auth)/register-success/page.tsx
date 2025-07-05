'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'

export default function RegisterSuccessPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We've sent you a confirmation link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              We've sent a confirmation email to your inbox. Please click the link in the email to verify your account.
            </p>
            <p className="text-sm text-muted-foreground">
              If you don't see the email, please check your spam folder.
            </p>
          </div>
          
          <div className="rounded-lg bg-muted p-4">
            <h4 className="font-medium mb-2">What's next?</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Check your email inbox</li>
              <li>Click the confirmation link</li>
              <li>Log in to your account</li>
            </ol>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Go to Login
              </Button>
            </Link>
            <p className="text-center text-sm text-muted-foreground">
              Didn't receive the email?{' '}
              <Link href="/resend-confirmation" className="text-primary hover:underline">
                Resend confirmation
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}