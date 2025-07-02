'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/shared-ui'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useToast } from '@/hooks/use-toast'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { setAuth, user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(data)
      const { user, organization, token } = response.data.data

      setAuth({ user, organization, token })
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      })

      // Force navigation to dashboard
      window.location.href = '/dashboard'
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid email or password',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="brand-card border-globfam-border shadow-brand-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-brand-h3 text-globfam-deep-blue">Welcome back</CardTitle>
        <CardDescription className="text-globfam-steel">
          Enter your email and password to sign in
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-brand-sm">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-globfam-deep-blue">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              disabled={isLoading}
              className="border-globfam-border focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {errors.email && (
              <p className="text-sm text-globfam-alert">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-globfam-deep-blue">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isLoading}
              className="border-globfam-border focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {errors.password && (
              <p className="text-sm text-globfam-alert">{errors.password.message}</p>
            )}
          </div>
          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-brand-sm">
          <Button type="submit" className="w-full brand-button" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
          <div className="text-center text-sm text-globfam-steel">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}