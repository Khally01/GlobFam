'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/shared-ui'
import { authApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    try {
      // API endpoint would go here
      // await authApi.forgotPassword(data)
      
      toast({
        title: 'Email sent!',
        description: 'Check your email for password reset instructions.',
      })
      setIsSubmitted(true)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We've sent password reset instructions to your email address.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/login" className="flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email and we'll send you instructions to reset your password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send reset email'}
          </Button>
          <Link href="/login" className="flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}