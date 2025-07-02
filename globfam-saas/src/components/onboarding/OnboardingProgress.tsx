'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/shared-ui'
import { 
  CheckCircle2, 
  Circle, 
  Wallet, 
  Receipt, 
  Users, 
  Globe,
  Target,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Progress } from '@/components/ui/progress'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: any
  completed: boolean
  action: string
  route: string
  priority: 'required' | 'recommended' | 'optional'
}

export function OnboardingProgress() {
  const router = useRouter()
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [loading, setLoading] = useState(true)
  const [showFullList, setShowFullList] = useState(false)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      // Check what the user has completed
      const [assetsRes, transactionsRes, goalsRes, familyRes] = await Promise.all([
        api.get('/api/assets').catch(() => ({ data: { data: { assets: [] } } })),
        api.get('/api/transactions').catch(() => ({ data: { data: { transactions: [] } } })),
        api.get('/api/goals').catch(() => ({ data: { data: [] } })),
        api.get('/api/families/current').catch(() => ({ data: { data: { family: null } } }))
      ])

      const hasAssets = (assetsRes.data.data?.assets || []).length > 0
      const hasTransactions = (transactionsRes.data.data?.transactions || []).length > 0
      const hasGoals = (goalsRes.data.data || []).length > 0
      const hasFamily = !!familyRes.data.data?.family

      const onboardingSteps: OnboardingStep[] = [
        {
          id: 'assets',
          title: 'Add Your First Asset',
          description: 'Track your bank accounts, properties, and investments',
          icon: Wallet,
          completed: hasAssets,
          action: 'Add Asset',
          route: '/dashboard/assets',
          priority: 'required'
        },
        {
          id: 'transactions',
          title: 'Import Transactions',
          description: 'Upload your bank statements or add transactions manually',
          icon: Receipt,
          completed: hasTransactions,
          action: 'Import Now',
          route: '/dashboard/banking',
          priority: 'required'
        },
        {
          id: 'goals',
          title: 'Set Financial Goals',
          description: 'Create savings goals and track your progress',
          icon: Target,
          completed: hasGoals,
          action: 'Create Goal',
          route: '/dashboard/goals',
          priority: 'recommended'
        },
        {
          id: 'family',
          title: 'Create or Join Family',
          description: 'Share finances with your family members',
          icon: Users,
          completed: hasFamily,
          action: hasFamily ? 'View Family' : 'Setup Family',
          route: '/dashboard/family',
          priority: 'recommended'
        },
        {
          id: 'visa',
          title: 'Add Visa Status',
          description: 'Track visa requirements and financial thresholds',
          icon: Globe,
          completed: false,
          action: 'Add Status',
          route: '/dashboard/settings',
          priority: 'optional'
        }
      ]

      setSteps(onboardingSteps)
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    } finally {
      setLoading(false)
    }
  }

  const completedSteps = steps.filter(s => s.completed).length
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0
  const requiredSteps = steps.filter(s => s.priority === 'required' && !s.completed)

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If all required steps are complete, show a compact version
  if (requiredSteps.length === 0 && !showFullList) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Great job! You're all set up</p>
                <p className="text-sm text-muted-foreground">
                  {completedSteps}/{steps.length} steps completed
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFullList(true)}
            >
              View All Steps
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Welcome to GlobFam!
            </CardTitle>
            <CardDescription>
              Complete these steps to unlock the full potential of your dashboard
            </CardDescription>
          </div>
          {showFullList && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFullList(false)}
            >
              Hide
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Setup Progress</span>
            <span className="font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                step.completed 
                  ? 'bg-muted/30 border-muted' 
                  : 'hover:border-primary/50 cursor-pointer'
              }`}
              onClick={() => !step.completed && router.push(step.route)}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${step.completed ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <step.icon className="h-4 w-4 text-muted-foreground" />
                    <h4 className={`font-medium ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {step.title}
                    </h4>
                    {step.priority === 'required' && !step.completed && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
              {!step.completed && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(step.route)
                  }}
                >
                  {step.action}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        {requiredSteps.length > 0 && (
          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <p className="text-sm font-medium mb-2">
              Complete {requiredSteps.length} required step{requiredSteps.length > 1 ? 's' : ''} to see your full dashboard
            </p>
            <Button 
              onClick={() => router.push(requiredSteps[0].route)}
              className="w-full sm:w-auto"
            >
              {requiredSteps[0].action}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}