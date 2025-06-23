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
      const response = await api.post('/api/goals', {
        ...formData,
        type: formData.category,
        targetAmount: parseFloat(formData.targetAmount)
      })
      
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
      await api.post(`/api/goals/${goalId}/contributions`, {
        amount: parseFloat(amount),
        date: new Date().toISOString()
      })
      
      toast({
        title: 'Success',
        description: 'Contribution added successfully'
      })
      
      fetchGoals()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add contribution',
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
    return <div className="flex justify-center items-center h-64">Loading goals...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Goals</h1>
          <p className="text-muted-foreground mt-1">Track and achieve your financial objectives</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by creating your first financial goal
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                    {goal.description && (
                      <CardDescription>{goal.description}</CardDescription>
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
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{goal.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${goal.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current</span>
                    <p className="font-semibold">
                      {formatCurrency(goal.currentAmount, goal.currency)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target</span>
                    <p className="font-semibold">
                      {formatCurrency(goal.targetAmount, goal.currency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex-1">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Contribute
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Contribution</DialogTitle>
                        <DialogDescription>
                          Add a contribution to "{goal.name}"
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.currentTarget)
                          const amount = formData.get('amount') as string
                          handleContribute(goal.id, amount)
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="amount">Amount ({goal.currency})</Label>
                          <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">Add Contribution</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}