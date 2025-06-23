'use client'

import { useState, useEffect } from 'react'
import { Plus, Upload, Download, Filter, Search, FileSpreadsheet } from 'lucide-react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Badge } from '@/components/shared-ui'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Transaction {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  category: string
  description: string
  date: string
  currency: string
  assetId?: string
  asset?: {
    name: string
  }
  aiCategorized?: boolean
  recurring?: boolean
  tags?: string[]
}

interface ImportPreview {
  headers: string[]
  rows: any[]
  suggestedMapping: Record<string, string>
}

const transactionCategories = {
  INCOME: ['Salary', 'Freelance', 'Investment', 'Business', 'Rental', 'Other'],
  EXPENSE: ['Food', 'Transport', 'Housing', 'Utilities', 'Healthcare', 'Shopping', 'Entertainment', 'Education', 'Other'],
  TRANSFER: ['Between Accounts', 'Investment', 'Savings', 'Other']
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    currency: 'USD',
    assetId: '',
    recurring: false,
    tags: ''
  })

  useEffect(() => {
    fetchTransactions()
    fetchAssets()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/transactions')
      setTransactions(response.data.data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAssets = async () => {
    try {
      const response = await api.get('/api/assets')
      setAssets(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    }
  }

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      }
      
      await api.post('/api/transactions', payload)
      
      toast({
        title: 'Success',
        description: 'Transaction created successfully'
      })
      
      setShowCreateDialog(false)
      setFormData({
        amount: '',
        type: 'EXPENSE',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        currency: 'USD',
        assetId: '',
        recurring: false,
        tags: ''
      })
      fetchTransactions()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create transaction',
        variant: 'destructive'
      })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportFile(file)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/api/import/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setImportPreview(response.data.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to preview import file',
        variant: 'destructive'
      })
    }
  }

  const handleImport = async () => {
    if (!importFile || !importPreview) return

    const formData = new FormData()
    formData.append('file', importFile)
    formData.append('mapping', JSON.stringify(importPreview.suggestedMapping))

    try {
      const response = await api.post('/api/import/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      toast({
        title: 'Success',
        description: `Imported ${response.data.data.imported} transactions successfully`
      })
      
      setShowImportDialog(false)
      setImportFile(null)
      setImportPreview(null)
      fetchTransactions()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import transactions',
        variant: 'destructive'
      })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INCOME': return 'success'
      case 'EXPENSE': return 'destructive'
      case 'TRANSFER': return 'default'
      default: return 'default'
    }
  }

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading transactions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">Track your income and expenses</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Import Transactions</DialogTitle>
                <DialogDescription>
                  Upload a CSV or Excel file to import transactions
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {!importPreview ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-primary hover:underline">Upload a file</span>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      Supports CSV, Excel (.xlsx, .xls)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Preview</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {importPreview.headers.map((header, index) => (
                                <TableHead key={index}>{header}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {importPreview.rows.slice(0, 5).map((row, index) => (
                              <TableRow key={index}>
                                {importPreview.headers.map((header, colIndex) => (
                                  <TableCell key={colIndex}>
                                    {row[header] || '-'}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Showing first 5 of {importPreview.rows.length} rows
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleImport} className="flex-1">
                        Import {importPreview.rows.length} Transactions
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setImportFile(null)
                          setImportPreview(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogDescription>Record a new income, expense, or transfer</DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateTransaction} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData({ ...formData, type: value, category: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="TRANSFER">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {transactionCategories[formData.type as keyof typeof transactionCategories]?.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Grocery shopping at Whole Foods"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="assetId">Account (Optional)</Label>
                    <Select value={formData.assetId} onValueChange={(value) => setFormData({ ...formData, assetId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (Optional)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., groceries, monthly, tax-deductible"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separate tags with commas</p>
                </div>

                <Button type="submit" className="w-full">Add Transaction</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by adding your first transaction or importing from a file
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.description}
                        {transaction.aiCategorized && (
                          <Badge variant="secondary" className="text-xs">AI</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.asset?.name || '-'}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(transaction.type) as any}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}