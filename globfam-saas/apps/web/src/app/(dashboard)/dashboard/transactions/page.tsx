'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Button, 
  Input, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/shared-ui'
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Calendar,
  Search,
  Upload,
  Sparkles
} from 'lucide-react'
import { transactionsApi, assetsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import type { Transaction, Asset, TransactionType } from '@/lib/shared-types'
import { ImportModal } from '@/components/import/import-modal'
import { CategorizeModal } from '@/components/ai/categorize-modal'

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  category: z.string().min(1, 'Category is required'),
  amount: z.string().min(1, 'Amount is required'),
  currency: z.string().length(3, 'Currency code must be 3 characters'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  assetId: z.string().min(1, 'Asset is required'),
})

type TransactionForm = z.infer<typeof transactionSchema>

const INCOME_CATEGORIES = [
  'Salary', 'Business', 'Investment', 'Rental', 'Gift', 'Other'
]

const EXPENSE_CATEGORIES = [
  'Rent', 'Mortgage', 'Groceries', 'Utilities', 'Transport', 
  'Healthcare', 'Education', 'Childcare', 'Entertainment', 
  'Shopping', 'Insurance', 'Taxes', 'Other'
]

export default function TransactionsPage() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showCategorizeModal, setShowCategorizeModal] = useState(false)
  const [filter, setFilter] = useState<{
    type?: string
    category?: string
    assetId?: string
  }>({})

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0]
    }
  })

  const transactionType = form.watch('type')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [filter])

  const fetchData = async () => {
    try {
      const [transactionsRes, assetsRes] = await Promise.all([
        transactionsApi.getAll(),
        assetsApi.getAll()
      ])
      
      setTransactions(transactionsRes.data.data?.transactions || [])
      setAssets(assetsRes.data.data?.assets || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await transactionsApi.getAll(filter)
      setTransactions(response.data.data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleCreateTransaction = async (data: TransactionForm) => {
    setCreating(true)
    try {
      const asset = assets.find(a => a.id === data.assetId)
      await transactionsApi.create({
        ...data,
        currency: asset?.currency || data.currency,
        date: new Date(data.date).toISOString()
      })
      
      await fetchData()
      
      toast({
        title: 'Transaction created!',
        description: 'Your transaction has been recorded.',
      })
      
      form.reset({
        type: 'EXPENSE',
        date: new Date().toISOString().split('T')[0]
      })
      setShowForm(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create transaction',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const categories = transactionType === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg"></div>
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
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Track your income and expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Create Transaction Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Transaction</CardTitle>
            <CardDescription>Record a new income or expense</CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(handleCreateTransaction)}>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...form.register('type')}
                    disabled={creating}
                  >
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                    <option value="TRANSFER">Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...form.register('category')}
                    disabled={creating}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...form.register('amount')}
                    disabled={creating}
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.amount.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Asset</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...form.register('assetId')}
                    disabled={creating}
                  >
                    <option value="">Select asset</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.currency})
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.assetId && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.assetId.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    {...form.register('date')}
                    disabled={creating}
                  />
                  {form.formState.errors.date && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.date.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Input
                    placeholder="e.g., Grocery shopping"
                    {...form.register('description')}
                    disabled={creating}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Transaction'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <select
              className="h-8 rounded border border-input bg-background px-2 text-sm"
              value={filter.type || ''}
              onChange={(e) => setFilter({...filter, type: e.target.value || undefined})}
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
              <option value="TRANSFER">Transfer</option>
            </select>
            <select
              className="h-8 rounded border border-input bg-background px-2 text-sm"
              value={filter.assetId || ''}
              onChange={(e) => setFilter({...filter, assetId: e.target.value || undefined})}
            >
              <option value="">All Assets</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
            {(filter.type || filter.assetId) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFilter({})}
              >
                Clear
              </Button>
            )}
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCategorizeModal(true)}
                disabled={transactions.length === 0}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Categorize
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ArrowUpRight className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your income and expenses
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>{transactions.length} transaction(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => {
                const asset = assets.find(a => a.id === transaction.assetId)
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-2 ${
                          transaction.type === 'INCOME'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.type === 'INCOME' ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description || 'No description'} • {asset?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          transaction.type === 'INCOME'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {transaction.currency} {parseFloat(transaction.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        assets={assets}
        onImportComplete={() => {
          setShowImportModal(false)
          fetchData()
        }}
      />

      {/* AI Categorize Modal */}
      <CategorizeModal
        isOpen={showCategorizeModal}
        onClose={() => setShowCategorizeModal(false)}
        onComplete={() => {
          setShowCategorizeModal(false)
          fetchData()
        }}
      />
    </div>
  )
}