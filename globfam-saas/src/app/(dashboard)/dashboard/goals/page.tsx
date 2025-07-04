'use client'

import { useState, useEffect } from 'react'
import { Plus, Target, TrendingUp, Calendar } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Badge } from '@/components/shared-ui'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { SkeletonGoals } from '@/components/ui/skeleton-goals'

interface Goal {
  id: string
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  currency: string
  targetDate: string
  type: 'SAVINGS' | 'DEBT_PAYOFF' | 'INVESTMENT' | 'PURCHASE' | 'EMERGENCY_FUND' | 'CUSTOM'
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
  progress?: number
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [contributingGoalId, setContributingGoalId] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    currency: 'USD',
    targetDate: '',
    category: 'SAVINGS'
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await api.get('/api/goals')
      const goalsData = response.data.data || []
      // Calculate progress for each goal
      const goalsWithProgress = goalsData.map((goal: any) => ({
        ...goal,
        progress: goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0
      }))
      setGoals(goalsWithProgress)
    } catch (error) {
      console.error('Failed to fetch goals:', error)
      toast({
        title: 'Error',
        description: 'Failed to load goals',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const goalData = {
        name: formData.name,
        description: formData.description,
        type: formData.category.toUpperCase(),
        targetAmount: parseFloat(formData.targetAmount),
        currency: formData.currency,
        targetDate: formData.targetDate
      }
      const response = await api.post('/api/goals', goalData)
      
      toast({
        title: 'Success',
        description: 'Goal created successfully'
      })
      
      setShowCreateDialog(false)
      setFormData({
        name: '',
        description: '',
        targetAmount: '',
        currency: 'USD',
        targetDate: '',
        category: 'SAVINGS'
      })
      fetchGoals()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create goal',
        variant: 'destructive'
      })
    }
  }

  const handleContribute = async (goalId: string, amount: string) => {
    try {
      const response = await api.post(`/api/goals/${goalId}/contribute`, {
        amount: parseFloat(amount),
        note: 'Manual contribution'
      })
      
      toast({
        title: 'Success',
        description: 'Contribution added successfully'
      })
      
      setContributingGoalId(null) // Close the dialog
      fetchGoals()
    } catch (error: any) {
      console.error('Contribution error:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to add contribution',
        variant: 'destructive'
      })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SAVINGS': return 'default'
      case 'DEBT_PAYOFF': return 'destructive'
      case 'INVESTMENT': return 'success'
      case 'PURCHASE': return 'secondary'
      case 'EMERGENCY_FUND': return 'outline'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success'
      case 'ACTIVE': return 'default'
      case 'PAUSED': return 'secondary'
      default: return 'default'
    }
  }

  if (loading) {
    return <SkeletonGoals />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="brand-title text-2xl sm:text-brand-h2">Financial Goals</h1>
          <p className="brand-subtitle text-sm sm:text-brand-body text-globfam-steel mt-1">Track and achieve your financial objectives</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="brand-button">
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>Set a new financial goal to track your progress</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAVINGS">Savings</SelectItem>
                      <SelectItem value="INVESTMENT">Investment</SelectItem>
                      <SelectItem value="DEBT_PAYOFF">Debt Payoff</SelectItem>
                      <SelectItem value="PURCHASE">Purchase</SelectItem>
                      <SelectItem value="EMERGENCY_FUND">Emergency Fund</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <Button type="submit" className="w-full">Create Goal</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card className="brand-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-globfam-deep-blue mb-2">No goals yet</h3>
            <p className="text-globfam-steel text-center mb-4">
              Start by creating your first financial goal
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="brand-button">
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card key={goal.id} className="brand-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-globfam-deep-blue">{goal.name}</CardTitle>
                    {goal.description && (
                      <CardDescription className="text-globfam-steel">{goal.description}</CardDescription>
                    )}
                  </div>
                  <Badge variant={getStatusColor(goal.status) as any}>
                    {goal.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-globfam-steel">Progress</span>
                    <span className="font-semibold text-globfam-deep-blue">{goal.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-globfam-cloud rounded-full h-2">
                    <div
                      className="bg-brand-gradient h-2 rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-globfam-steel">Current</span>
                    <p className="font-semibold text-globfam-deep-blue">
                      {formatCurrency(goal.currentAmount, goal.currency)}
                    </p>
                  </div>
                  <div>
                    <span className="text-globfam-steel">Target</span>
                    <p className="font-semibold text-globfam-deep-blue">
                      {formatCurrency(goal.targetAmount, goal.currency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-globfam-steel">
                  <Calendar className="h-4 w-4" />
                  <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 brand-button"
                    onClick={() => setContributingGoalId(goal.id)}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Contribute
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-globfam-border text-globfam-slate hover:bg-globfam-cloud hover:text-globfam-deep-blue">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contribution Dialog */}
      <Dialog open={!!contributingGoalId} onOpenChange={(open) => !open && setContributingGoalId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
            <DialogDescription>
              Add a contribution to your goal
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!contributingGoalId) return
              const formData = new FormData(e.currentTarget)
              const amount = formData.get('amount') as string
              handleContribute(contributingGoalId, amount)
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="contribution-amount">Amount</Label>
              <Input
                id="contribution-amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full">Add Contribution</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}