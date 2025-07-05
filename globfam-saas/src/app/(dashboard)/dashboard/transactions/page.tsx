'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Upload, Sparkles, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { transactionsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import type { Transaction } from '@/lib/shared-types'
import { AddTransactionModal } from '@/components/transactions/add-transaction-modal'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { SimpleImportModal } from '@/components/import/simple-import-modal'
import { CategorizeModal } from '@/components/ai/categorize-modal'
import { useAuthStore } from '@/store/auth'

export default function ModernTransactionsPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showCategorizeModal, setShowCategorizeModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTransactions()
    
    // Check if we should open the add modal
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true)
    }
  }, [searchParams])

  const fetchTransactions = async () => {
    try {
      const response = await transactionsApi.getAll()
      setTransactions(response.data.data?.transactions || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const formattedTransactions = transactions.map(tx => ({
    id: tx.id,
    title: tx.description || `${tx.type} transaction`,
    category: tx.category,
    member: user?.name || 'You',
    memberInitials: user?.name?.split(' ').map(n => n[0]).join('') || 'Y',
    date: new Date(tx.date).toLocaleDateString(),
    amount: tx.amount,
    type: tx.type.toLowerCase() as 'income' | 'expense' | 'transfer'
  }))

  const filteredTransactions = formattedTransactions.filter(tx =>
    tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Track your income, expenses, and transfers
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowImportModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowCategorizeModal(true)}
            disabled={transactions.length === 0}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Categorize
          </Button>
          
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl card-shadow">
        {loading ? (
          <div className="p-6">
            <p className="text-center text-muted-foreground">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No transactions found</p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Transaction
            </Button>
          </div>
        ) : (
          <RecentTransactions
            transactions={filteredTransactions}
            onViewAll={() => {}}
          />
        )}
      </div>

      {/* Modals */}
      <AddTransactionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchTransactions}
      />
      
      <SimpleImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={fetchTransactions}
      />
      
      {showCategorizeModal && (
        <CategorizeModal
          transactions={transactions}
          onClose={() => setShowCategorizeModal(false)}
          onCategorized={fetchTransactions}
        />
      )}
    </div>
  )
}