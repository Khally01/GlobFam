'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button-globfam'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-globfam'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useToast } from '@/hooks/use-toast'
import { Globe, ArrowRight, Sparkles, Shield, TrendingUp } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authApi.login(formData)
      const { user, organization, family, token } = response.data.data

      setAuth({ user, organization, family, token })

      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your account.",
      })

      router.push('/dashboard')
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || 'Invalid email or password',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: Globe, text: "Multi-currency support" },
    { icon: Shield, text: "Bank-level security" },
    { icon: TrendingUp, text: "AI-powered insights" },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between w-full">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">GlobFam</h1>
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-6">
              Your Global Family Finance Hub
            </h2>
            <p className="text-xl text-white/80 mb-12">
              Track, manage, and grow your wealth across borders with intelligent insights and seamless collaboration.
            </p>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-white/90">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="text-lg">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12">
            <p className="text-white/60 text-sm">
              Trusted by families across 30+ countries
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="lg:hidden flex justify-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-primary rounded-xl">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold gradient-text">GlobFam</h1>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base" 
                  size="lg"
                  loading={loading}
                >
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link 
                      href="/register" 
                      className="font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Start free trial
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}