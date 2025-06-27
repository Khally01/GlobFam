'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { ArrowLeft, ArrowRight, Plus, DollarSign, AlertCircle } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/shared-ui'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface BudgetCategory {
  id: string
  name: string
  order: number
  isHidden: boolean
  color?: string
  groupId: string
}

interface BudgetCategoryGroup {
  id: string
  name: string
  order: number
  isSystem: boolean
  categories: BudgetCategory[]
}

interface MonthlyBudgetData {
  categoryId: string
  budgeted: number
  activity: number
  available: number
}

export default function MonthlyBudgetPage() {
  const [groups, setGroups] = useState<BudgetCategoryGroup[]>([])
  const [budgetData, setBudgetData] = useState<Record<string, MonthlyBudgetData>>({})
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [tempBudgetValue, setTempBudgetValue] = useState('')
  const { toast } = useToast()

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']

  useEffect(() => {
    fetchBudgetData()
  }, [selectedMonth])

  const fetchBudgetData = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await api.get('/api/budget-categories')
      setGroups(categoriesResponse.data.data || [])

      // Fetch monthly budget data
      const month = selectedMonth.getMonth() + 1
      const year = selectedMonth.getFullYear()
      const budgetResponse = await api.get(`/api/budgets/monthly?month=${month}&year=${year}`)
      
      // Transform budget data into a map for easy lookup
      const budgetMap: Record<string, MonthlyBudgetData> = {}
      if (budgetResponse.data.data) {
        budgetResponse.data.data.forEach((item: any) => {
          budgetMap[item.categoryId] = {
            categoryId: item.categoryId,
            budgeted: item.budgeted,
            activity: item.activity,
            available: item.available
          }
        })
      }
      setBudgetData(budgetMap)
    } catch (error) {
      console.error('Failed to fetch budget data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load budget data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousMonth = () => {
    const newMonth = new Date(selectedMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setSelectedMonth(newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = new Date(selectedMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setSelectedMonth(newMonth)
  }

  const handleBudgetEdit = (categoryId: string) => {
    const currentBudget = budgetData[categoryId]?.budgeted || 0
    setTempBudgetValue(currentBudget.toString())
    setEditingCategoryId(categoryId)
  }

  const handleBudgetSave = async (categoryId: string) => {
    try {
      const amount = parseFloat(tempBudgetValue) || 0
      const month = selectedMonth.getMonth() + 1
      const year = selectedMonth.getFullYear()

      await api.post('/api/budgets/monthly', {
        categoryId,
        month,
        year,
        budgeted: amount
      })

      // Update local state
      setBudgetData(prev => ({
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          budgeted: amount,
          available: amount - (prev[categoryId]?.activity || 0)
        }
      }))

      setEditingCategoryId(null)
      toast({
        title: 'Success',
        description: 'Budget updated successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update budget',
        variant: 'destructive'
      })
    }
  }

  const calculateGroupTotals = (group: BudgetCategoryGroup) => {
    let budgeted = 0
    let activity = 0
    let available = 0

    group.categories.forEach(category => {
      const data = budgetData[category.id]
      if (data) {
        budgeted += data.budgeted
        activity += data.activity
        available += data.available
      }
    })

    return { budgeted, activity, available }
  }

  const calculateTotalToBeBudgeted = () => {
    // This would normally come from income minus budgeted amounts
    // For now, we'll show a placeholder
    return 5000 // Example income
  }

  const calculateTotalBudgeted = () => {
    return Object.values(budgetData).reduce((sum, data) => sum + data.budgeted, 0)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/budget">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Budget</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          </div>
          <h1 className="brand-title text-xl sm:text-2xl lg:text-brand-h2">Monthly Budget</h1>
          <p className="brand-subtitle text-xs sm:text-sm lg:text-brand-body text-globfam-steel mt-1">
            YNAB-style zero-based budgeting
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="outline" onClick={handlePreviousMonth}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 sm:px-4 font-medium text-sm sm:text-base">
            <span className="hidden sm:inline">{monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}</span>
            <span className="sm:hidden">{monthNames[selectedMonth.getMonth()].slice(0, 3)} {selectedMonth.getFullYear()}</span>
          </span>
          <Button variant="outline" onClick={handleNextMonth}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* To Be Budgeted Card */}
      <Card className="brand-card bg-primary text-white">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">To Be Budgeted</h3>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(calculateTotalToBeBudgeted() - calculateTotalBudgeted(), 'USD')}
              </p>
              <p className="text-sm opacity-90 mt-1">
                All money should be budgeted to zero
              </p>
            </div>
            <DollarSign className="h-12 w-12 opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Budget Table */}
      <Card className="brand-card">
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
          <CardDescription>
            Give every dollar a job - assign your money to categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-globfam-border">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-globfam-steel text-xs sm:text-sm">Category</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-globfam-steel text-xs sm:text-sm">Budgeted</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-globfam-steel text-xs sm:text-sm">Activity</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-globfam-steel text-xs sm:text-sm">Available</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const groupTotals = calculateGroupTotals(group)
                  return (
                    <React.Fragment key={group.id}>
                      {/* Group Header */}
                      <tr className="bg-globfam-cloud">
                        <td className="py-3 px-4 font-semibold text-globfam-deep-blue">
                          {group.name}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {formatCurrency(groupTotals.budgeted, 'USD')}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {formatCurrency(groupTotals.activity, 'USD')}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {formatCurrency(groupTotals.available, 'USD')}
                        </td>
                      </tr>
                      
                      {/* Categories */}
                      {group.categories.map((category) => {
                        const data = budgetData[category.id] || { budgeted: 0, activity: 0, available: 0 }
                        const isEditing = editingCategoryId === category.id
                        
                        return (
                          <tr key={category.id} className="border-b border-globfam-border hover:bg-gray-50">
                            <td className="py-3 px-4 pl-8">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: category.color || '#635bff' }}
                                />
                                {category.name}
                              </div>
                            </td>
                            <td className="text-right py-3 px-4">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Input
                                    type="number"
                                    value={tempBudgetValue}
                                    onChange={(e) => setTempBudgetValue(e.target.value)}
                                    className="w-24 text-right"
                                    autoFocus
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleBudgetSave(category.id)
                                      }
                                    }}
                                  />
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleBudgetSave(category.id)}
                                  >
                                    Save
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleBudgetEdit(category.id)}
                                  className="hover:text-primary cursor-pointer"
                                >
                                  {formatCurrency(data.budgeted, 'USD')}
                                </button>
                              )}
                            </td>
                            <td className="text-right py-3 px-4">
                              {formatCurrency(data.activity, 'USD')}
                            </td>
                            <td className={`text-right py-3 px-4 font-medium ${
                              data.available < 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {formatCurrency(data.available, 'USD')}
                            </td>
                          </tr>
                        )
                      })}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="brand-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-globfam-steel">
              Total Budgeted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-globfam-deep-blue">
              {formatCurrency(calculateTotalBudgeted(), 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card className="brand-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-globfam-steel">
              Total Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-globfam-deep-blue">
              {formatCurrency(
                Object.values(budgetData).reduce((sum, data) => sum + data.activity, 0),
                'USD'
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="brand-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-globfam-steel">
              Total Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-globfam-deep-blue">
              {formatCurrency(
                Object.values(budgetData).reduce((sum, data) => sum + data.available, 0),
                'USD'
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Tips */}
      <Card className="brand-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Budget Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-globfam-steel">
            <li>• Budget to zero - every dollar should have a job</li>
            <li>• Cover your true expenses by budgeting for irregular expenses</li>
            <li>• Roll with the punches - move money between categories as needed</li>
            <li>• Age your money - spend money that has been sitting for a while</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}