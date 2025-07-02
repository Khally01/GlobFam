'use client'

import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui'
import { 
  Crown, 
  CreditCard, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react'
import { subscriptionsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { organization } = useAuthStore()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<any>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        subscriptionsApi.getCurrent(),
        subscriptionsApi.getPlans()
      ])
      
      setSubscription(subRes.data.data)
      setPlans(plansRes.data.data.plans)
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    try {
      const response = await subscriptionsApi.createCheckout({
        plan: planId as any,
        successUrl: `${window.location.origin}/dashboard/settings?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/settings?canceled=true`
      })

      if (response.data.data.checkoutUrl) {
        window.location.href = response.data.data.checkoutUrl
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create checkout',
        variant: 'destructive',
      })
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await subscriptionsApi.createPortal(window.location.href)
      if (response.data.data.portalUrl) {
        window.location.href = response.data.data.portalUrl
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to open billing portal',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="h-32 bg-muted rounded-lg"></div>
      </div>
    )
  }

  const currentPlan = organization?.plan || 'STARTER'
  const isTrialing = subscription?.isTrialing

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{currentPlan}</h3>
                {isTrialing && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                    Trial
                  </span>
                )}
              </div>
              {isTrialing ? (
                <p className="text-sm text-muted-foreground">
                  Trial ends: {subscription?.trialEndsAt ? 
                    new Date(subscription.trialEndsAt).toLocaleDateString() : 
                    'Unknown'
                  }
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {subscription?.subscription ? 'Active subscription' : 'No active subscription'}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {subscription?.subscription && (
                <Button variant="outline" onClick={handleManageBilling}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Billing
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan
            const isPopular = plan.id === 'FAMILY'
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${isPopular ? 'ring-2 ring-primary' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {isCurrentPlan && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </CardTitle>
                  <div>
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrentPlan ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={isPopular ? 'default' : 'outline'}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {currentPlan === 'STARTER' || !subscription?.subscription 
                        ? 'Upgrade' 
                        : 'Switch Plan'
                      }
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Trial Info */}
      {isTrialing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Free Trial Active</h3>
                <p className="text-sm text-blue-700">
                  Your 14-day free trial is active. Upgrade anytime to continue using GlobFam 
                  after your trial ends.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>See what's included in each plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Feature</th>
                  <th className="text-center py-2">Starter</th>
                  <th className="text-center py-2">Family</th>
                  <th className="text-center py-2">Premium</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="py-2">Countries Supported</td>
                  <td className="text-center">2</td>
                  <td className="text-center">Unlimited</td>
                  <td className="text-center">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Family Members</td>
                  <td className="text-center">1</td>
                  <td className="text-center">5</td>
                  <td className="text-center">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Bank Connections</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Advanced Analytics</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-2">Priority Support</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}