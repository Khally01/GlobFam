'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from '@/components/shared-ui'
import { PlusCircle, Target, TrendingUp, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { analyticsApi } from '@/lib/api/analytics'
import { api } from '@/lib/api'
import type { BudgetComparison } from '@/lib/api/analytics'
import { useToast } from '@/hooks/use-toast'

const DEFAULT_CATEGORIES = [
  'Rent', 'Mortgage', 'Groceries', 'Utilities', 'Transport',
  'Healthcare', 'Education', 'Childcare', 'Entertainment',
  'Shopping', 'Insurance', 'Taxes', 'Other'
]

interface BudgetItem {
  category: string
  amount: number
}

export default function BudgetPage() {
  const [loading, setLoading] = useState(false)
  const [budget, setBudget] = useState<BudgetItem[]>([])
  const [comparison, setComparison] = useState<BudgetComparison[]>([])
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadBudget()
  }, [])

  const loadBudget = async () => {
    setLoading(true)
    try {
      // In a real app, you'd load saved budget from the backend
      const savedBudget = localStorage.getItem('userBudget')
      if (savedBudget) {
        const parsed = JSON.parse(savedBudget)
        setBudget(parsed.budget || [])
        setMonthlyIncome(parsed.income || '')
        
        // Get comparison with actual spending
        if (parsed.budget && parsed.budget.length > 0) {
          const budgetMap = parsed.budget.reduce((acc: Record<string, number>, item: BudgetItem) => {
            acc[item.category] = item.amount
            return acc
          }, {})
          
          const response = await analyticsApi.getBudgetComparison({ budget: budgetMap })
          setComparison((response.data as any).comparison)
        }
      } else {
        // Initialize with default categories
        setBudget(DEFAULT_CATEGORIES.map(cat => ({ category: cat, amount: 0 })))
      }
    } catch (error) {
      console.error('Error loading budget:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBudget = async () => {
    try {
      // Save to localStorage (in real app, save to backend)
      const budgetData = {
        budget,
        income: monthlyIncome
      }
      localStorage.setItem('userBudget', JSON.stringify(budgetData))
      
      // Create budget with categories
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      const response = await api.post('/api/budgets', {
        name: 'Monthly Budget',
        period: 'monthly',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        currency: 'AUD',
        categories: budget.filter(item => item.amount > 0).map(item => ({
          category: item.category,
          amount: item.amount
        }))
      })
      
      setEditMode(false)
      toast({
        title: 'Budget saved!',
        description: 'Your budget has been updated successfully.'
      })
    } catch (error) {
      console.error('Error saving budget:', error)
      toast({
        title: 'Error',
        description: 'Failed to save budget',
        variant: 'destructive'
      })
    }
  }

  const handleAISuggestion = async () => {
    if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {
      toast({
        title: 'Income required',
        description: 'Please enter your monthly income first',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await api.post('/api/ai/budget', {
        monthlyIncome: parseFloat(monthlyIncome),
        currency: 'USD' // You can get this from user preferences
      })
      
      const suggestedBudget = (response.data as any).budget
      const newBudget = Object.entries(suggestedBudget).map(([category, amount]) => ({
        category,
        amount: amount as number
      }))
      
      setBudget(newBudget)
      toast({
        title: 'AI Budget Generated!',
        description: 'Review and adjust the suggested budget as needed.'
      })
    } catch (error) {
      console.error('Error getting AI suggestion:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate budget suggestion',
        variant: 'destructive'
      })
    }
  }

  const updateBudgetItem = (index: number, amount: string) => {
    const newBudget = [...budget]
    newBudget[index].amount = parseFloat(amount) || 0
    setBudget(newBudget)
  }

  const addCategory = () => {
    if (newCategory.trim()) {
      setBudget([...budget, { category: newCategory.trim(), amount: 0 }])
      setNewCategory('')
    }
  }

  const removeCategory = (index: number) => {
    setBudget(budget.filter((_, i) => i !== index))
  }

  const totalBudget = budget.reduce((sum, item) => sum + item.amount, 0)
  const totalSpent = comparison.reduce((sum, item) => sum + item.actualAmount, 0)
  const remaining = totalBudget - totalSpent

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budget Planner</h1>
          <p className="text-muted-foreground">
            Plan and track your monthly budget
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleAISuggestion}
            disabled={!monthlyIncome}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            AI Suggestion
          </Button>
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBudget}>
                Save Budget
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>
              Edit Budget
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <Input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="0"
                className="text-2xl font-bold h-auto p-0 border-0 focus:ring-0"
              />
            ) : (
              <div className="text-2xl font-bold">
                ${parseFloat(monthlyIncome || '0').toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBudget.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {monthlyIncome && totalBudget > 0 
                ? `${((totalBudget / parseFloat(monthlyIncome)) * 100).toFixed(0)}% of income`
                : 'Set income first'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Spent So Far
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSpent.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {totalBudget > 0 
                ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% of budget`
                : 'No budget set'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(remaining).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {remaining >= 0 ? 'Under budget' : 'Over budget'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
          <CardDescription>
            {editMode 
              ? 'Set budget amounts for each category'
              : 'Your monthly budget breakdown and actual spending'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budget.map((item, index) => {
              const comp = comparison.find(c => c.category === item.category)
              const percentUsed = comp ? comp.percentUsed : 0
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.category}</span>
                      {comp && !editMode && (
                        <span className={`text-sm ${
                          comp.status === 'good' ? 'text-green-600' : 
                          comp.status === 'warning' ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {comp.status === 'good' && <CheckCircle className="h-4 w-4 inline mr-1" />}
                          {comp.status === 'warning' && <AlertTriangle className="h-4 w-4 inline mr-1" />}
                          {comp.status === 'over' && <AlertTriangle className="h-4 w-4 inline mr-1" />}
                          ${comp.actualAmount.toLocaleString()} spent
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editMode ? (
                        <>
                          <Input
                            type="number"
                            value={item.amount || ''}
                            onChange={(e) => updateBudgetItem(index, e.target.value)}
                            placeholder="0"
                            className="w-32 text-right"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCategory(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <span className="font-semibold">
                          ${item.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {!editMode && item.amount > 0 && (
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            percentUsed <= 80 ? 'bg-green-600' : 
                            percentUsed <= 100 ? 'bg-yellow-600' : 
                            'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(percentUsed, 100)}%` }}
                        />
                      </div>
                      {percentUsed > 100 && (
                        <span className="absolute right-0 top-3 text-xs text-red-600">
                          {percentUsed.toFixed(0)}% - Over budget!
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            
            {editMode && (
              <div className="flex gap-2 pt-4 border-t">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category"
                  onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                />
                <Button onClick={addCategory} variant="outline">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget Tips */}
      {comparison.length > 0 && !editMode && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Insights</CardTitle>
            <CardDescription>Based on your spending patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comparison.filter(c => c.status === 'over').length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <span>
                    You're over budget in {comparison.filter(c => c.status === 'over').length} categories. 
                    Consider adjusting your spending or increasing budget allocations.
                  </span>
                </div>
              )}
              {comparison.filter(c => c.status === 'good' && c.percentUsed < 50).length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>
                    Great job! You're well under budget in {comparison.filter(c => c.status === 'good' && c.percentUsed < 50).length} categories.
                  </span>
                </div>
              )}
              {remaining > parseFloat(monthlyIncome || '0') * 0.2 && (
                <div className="flex items-start gap-2 text-sm">
                  <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>
                    You have significant budget remaining. Consider allocating more to savings or investments.
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}