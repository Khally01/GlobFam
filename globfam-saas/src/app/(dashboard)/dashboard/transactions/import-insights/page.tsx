'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Sparkles,
  Filter,
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  PieChart,
  BarChart3
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface ImportedTransaction {
  id: string
  date: string
  description: string
  amount: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  currency: string
  metadata?: {
    imported?: boolean
    aiCategorized?: boolean
    confidence?: number
    merchantName?: string
    isRecurring?: boolean
    recurringFrequency?: string
  }
}

interface CategoryInsight {
  category: string
  amount: number
  count: number
  percentage: number
}

export default function ImportInsightsPage() {
  const [transactions, setTransactions] = useState<ImportedTransaction[]>([])
  const [categoryInsights, setCategoryInsights] = useState<CategoryInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ai' | 'recurring'>('all')
  const [recategorizingId, setRecategorizingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchTransactionInsights()
  }, [])

  const fetchTransactionInsights = async () => {
    try {
      setLoading(true)
      
      // Fetch recent imported transactions
      const response = await api.get('/transactions?imported=true&limit=100')
      const txns = response.data?.data?.transactions || response.data?.transactions || []
      
      setTransactions(txns)
      
      // Calculate category insights
      const insights = calculateCategoryInsights(txns)
      setCategoryInsights(insights)
    } catch (error) {
      console.error('Error fetching transaction insights:', error)
      toast({
        title: 'Error',
        description: 'Failed to load transaction insights',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateCategoryInsights = (txns: ImportedTransaction[]): CategoryInsight[] => {
    const categoryMap = new Map<string, { amount: number; count: number }>()
    let totalAmount = 0

    txns.forEach(txn => {
      if (txn.type === 'EXPENSE') {
        const amount = parseFloat(txn.amount)
        totalAmount += amount
        
        const existing = categoryMap.get(txn.category) || { amount: 0, count: 0 }
        categoryMap.set(txn.category, {
          amount: existing.amount + amount,
          count: existing.count + 1
        })
      }
    })

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: (data.amount / totalAmount) * 100
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  const recategorizeTransaction = async (transactionId: string) => {
    try {
      setRecategorizingId(transactionId)
      
      const response = await api.post(`/ai/recategorize/${transactionId}`)
      
      toast({
        title: 'Success',
        description: 'Transaction recategorized successfully'
      })
      
      // Refresh data
      await fetchTransactionInsights()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to recategorize transaction',
        variant: 'destructive'
      })
    } finally {
      setRecategorizingId(null)
    }
  }

  const filteredTransactions = transactions.filter(txn => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'ai') return txn.metadata?.aiCategorized
    if (selectedFilter === 'recurring') return txn.metadata?.isRecurring
    return true
  })

  const aiCategorizedCount = transactions.filter(t => t.metadata?.aiCategorized).length
  const recurringCount = transactions.filter(t => t.metadata?.isRecurring).length
  const avgConfidence = transactions
    .filter(t => t.metadata?.confidence)
    .reduce((sum, t) => sum + (t.metadata?.confidence || 0), 0) / aiCategorizedCount || 0

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Transaction Insights</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered categorization and analysis of your imported transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Imported</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Categorized</p>
                <p className="text-2xl font-bold">{aiCategorizedCount}</p>
              </div>
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recurring</p>
                <p className="text-2xl font-bold">{recurringCount}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{(avgConfidence * 100).toFixed(0)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Spending by Category
          </CardTitle>
          <CardDescription>
            AI-analyzed spending patterns from your imported transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryInsights.slice(0, 8).map((insight) => (
              <div key={insight.category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{insight.category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {insight.count} transactions
                    </Badge>
                  </div>
                  <span>{formatCurrency(insight.amount, 'AUD')}</span>
                </div>
                <Progress value={insight.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction List with Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Imported Transactions</CardTitle>
              <CardDescription>
                View and manage your categorized transactions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                All
              </Button>
              <Button
                variant={selectedFilter === 'ai' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('ai')}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                AI Categorized
              </Button>
              <Button
                variant={selectedFilter === 'recurring' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('recurring')}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Recurring
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Amount</th>
                  <th className="text-center p-2">AI Status</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.slice(0, 20).map((txn) => (
                  <tr key={txn.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{formatDate(txn.date)}</td>
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{txn.description}</p>
                        {txn.metadata?.merchantName && (
                          <p className="text-xs text-muted-foreground">
                            {txn.metadata.merchantName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{txn.category}</Badge>
                        {txn.metadata?.isRecurring && (
                          <Badge variant="secondary" className="text-xs">
                            {txn.metadata.recurringFrequency}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <span className={txn.type === 'INCOME' ? 'text-green-600' : ''}>
                        {txn.type === 'EXPENSE' && '-'}
                        {formatCurrency(Math.abs(parseFloat(txn.amount)), txn.currency)}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      {txn.metadata?.aiCategorized ? (
                        <div className="flex items-center justify-center gap-1">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-xs">
                            {((txn.metadata.confidence || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Manual</span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => recategorizeTransaction(txn.id)}
                        disabled={recategorizingId === txn.id}
                      >
                        {recategorizingId === txn.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          'Recategorize'
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}