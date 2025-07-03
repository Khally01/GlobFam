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
  Camera,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { transactionsApi, assetsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import type { Transaction, Asset, TransactionType } from '@/lib/shared-types'
import { SimpleImportModal } from '@/components/import/simple-import-modal'
import { CategorizeModal } from '@/components/ai/categorize-modal'
import { EmptyTransactionsState } from './EmptyTransactionsState'
import { SkeletonTransactionList } from '@/components/ui/skeleton-transactions'
import { useDebounce } from '@/hooks/use-debounce'
import { ExportTransactions } from '@/components/transactions/ExportTransactions'
import { PhotoUploadModal } from '@/components/transactions/PhotoUploadModal'

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
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedAssetForPhoto, setSelectedAssetForPhoto] = useState<string>('')
  const [filter, setFilter] = useState<{
    type?: string
    category?: string
    assetId?: string
    search?: string
  }>({})
  const [hasInitialized, setHasInitialized] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0]
    }
  })

  const transactionType = form.watch('type')
  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (!hasInitialized) {
      fetchData()
      setHasInitialized(true)
    }
  }, [hasInitialized])

  useEffect(() => {
    if (hasInitialized) {
      fetchTransactions()
    }
  }, [filter, hasInitialized])

  useEffect(() => {
    if (debouncedSearch !== undefined) {
      setFilter(prev => ({...prev, search: debouncedSearch || undefined}))
    }
  }, [debouncedSearch])

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

  // Filter transactions on the frontend for immediate feedback
  const filteredTransactions = transactions.filter(transaction => {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      const matchesSearch = 
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.category.toLowerCase().includes(searchLower) ||
        transaction.amount.toString().includes(filter.search)
      if (!matchesSearch) return false
    }
    return true
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchTerm])

  if (loading) {
    return <SkeletonTransactionList />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="brand-title text-2xl sm:text-brand-h2">Transactions</h1>
          <p className="brand-subtitle text-sm sm:text-brand-body text-globfam-steel">
            Track your income and expenses
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportTransactions onExport={fetchTransactions} />
          <Button variant="outline" onClick={() => setShowImportModal(true)} className="border-globfam-border text-globfam-slate hover:bg-globfam-cloud hover:text-globfam-deep-blue text-sm sm:text-base">
            <Upload className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Import CSV</span>
            <span className="sm:hidden">Import</span>
          </Button>
          <Button variant="outline" onClick={() => {
            if (assets.length === 0) {
              toast({
                title: 'No assets found',
                description: 'Please create an asset first to upload receipts.',
                variant: 'destructive',
              })
            } else {
              setSelectedAssetForPhoto(assets[0].id)
              setShowPhotoModal(true)
            }
          }} className="border-globfam-border text-globfam-slate hover:bg-globfam-cloud hover:text-globfam-deep-blue text-sm sm:text-base">
            <Camera className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Upload Photo</span>
            <span className="sm:hidden">Photo</span>
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="brand-button text-sm sm:text-base">
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Create Transaction Form */}
      {showForm && (
        <Card className="brand-card">
          <CardHeader>
            <CardTitle className="text-globfam-deep-blue">Add New Transaction</CardTitle>
            <CardDescription className="text-globfam-steel">Record a new income or expense</CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(handleCreateTransaction)}>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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
                    {assets.length === 0 ? (
                      <option value="" disabled>No assets found - create one first</option>
                    ) : (
                      assets.map(asset => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name} ({asset.currency})
                        </option>
                      ))
                    )}
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
      <Card className="brand-card">
        <CardContent className="p-brand-sm">
          <div className="flex flex-col sm:flex-row gap-brand-sm">
            <div className="flex flex-wrap gap-brand-sm items-center flex-1">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-globfam-steel" />
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 w-48 border-globfam-border focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <select
                className="h-8 rounded-brand-md border border-globfam-border bg-white px-2 text-sm text-globfam-deep-blue focus:border-primary focus:ring-1 focus:ring-primary"
                value={filter.type || ''}
                onChange={(e) => setFilter({...filter, type: e.target.value || undefined})}
              >
                <option value="">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
                <option value="TRANSFER">Transfer</option>
              </select>
              <select
                className="h-8 rounded-brand-md border border-globfam-border bg-white px-2 text-sm text-globfam-deep-blue focus:border-primary focus:ring-1 focus:ring-primary"
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
              {(filter.type || filter.assetId || filter.search) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setFilter({})
                    setSearchTerm('')
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex gap-2">
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
      {transactions.length === 0 && assets.length === 0 ? (
        <EmptyTransactionsState 
          hasAssets={assets.length > 0} 
          onAddTransaction={() => setShowForm(true)}
        />
      ) : filteredTransactions.length === 0 && filter.search ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilter({})
                setSearchTerm('')
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : transactions.length === 0 ? (
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
        <Card className="brand-card">
          <CardHeader>
            <CardTitle className="text-globfam-deep-blue">Recent Transactions</CardTitle>
            <CardDescription className="text-globfam-steel">
              {filteredTransactions.length} of {transactions.length} transaction(s)
              {filter.search && ` matching "${filter.search}"`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedTransactions.map((transaction) => {
                const asset = assets.find(a => a.id === transaction.assetId)
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b border-globfam-border pb-3 last:border-0"
                  >
                    <div className="flex items-center gap-brand-xs">
                      <div
                        className={`rounded-full p-2 ${
                          transaction.type === 'INCOME'
                            ? 'bg-globfam-success/10 text-globfam-success'
                            : 'bg-globfam-alert/10 text-globfam-alert'
                        }`}
                      >
                        {transaction.type === 'INCOME' ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-globfam-deep-blue">{transaction.category}</p>
                        <p className="text-sm text-globfam-steel">
                          {transaction.description || 'No description'} • {asset?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          transaction.type === 'INCOME'
                            ? 'text-globfam-success'
                            : 'text-globfam-alert'
                        }`}
                      >
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {transaction.currency} {parseFloat(transaction.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-globfam-steel">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-brand-md pt-brand-sm border-t border-globfam-border">
                <div className="text-sm text-globfam-steel">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-globfam-border text-globfam-slate hover:bg-globfam-cloud hover:text-globfam-deep-blue disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            className={`w-8 h-8 p-0 ${page === currentPage ? 'bg-primary text-white' : 'border-globfam-border text-globfam-slate hover:bg-globfam-cloud hover:text-globfam-deep-blue'}`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      }
                      // Show ellipsis
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-1">...</span>
                      }
                      return null
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-globfam-border text-globfam-slate hover:bg-globfam-cloud hover:text-globfam-deep-blue disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Modal */}
      <SimpleImportModal
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

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        assetId={selectedAssetForPhoto}
        onSuccess={(transactionData) => {
          setShowPhotoModal(false)
          // Pre-fill the form with extracted data
          form.setValue('amount', transactionData.amount.toString())
          form.setValue('description', transactionData.description)
          form.setValue('date', transactionData.date)
          form.setValue('category', transactionData.category)
          form.setValue('assetId', selectedAssetForPhoto)
          form.setValue('type', 'EXPENSE')
          setShowForm(true)
          toast({
            title: 'Receipt uploaded',
            description: 'Please review and complete the transaction details.',
          })
        }}
      />
    </div>
  )
}