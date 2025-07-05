'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { 
  CalendarIcon, 
  Camera, 
  Mic, 
  FileText,
  Sparkles,
  Plus,
  Minus,
  ArrowRightLeft
} from 'lucide-react'
import { ReceiptScanner } from './receipt-scanner'
import { QuickTemplates } from './quick-templates'
import { transactionsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store/auth'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().optional(),
  date: z.date(),
  assetId: z.string().optional(),
})

type TransactionForm = z.infer<typeof transactionSchema>

interface AddTransactionModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultType?: 'income' | 'expense' | 'transfer'
}

const expenseCategories = [
  'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 
  'Health', 'Education', 'Housing', 'Other'
]

const incomeCategories = [
  'Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'
]

export function AddTransactionModal({ 
  open, 
  onClose, 
  onSuccess,
  defaultType = 'expense' 
}: AddTransactionModalProps) {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [activeTab, setActiveTab] = useState('manual')
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      date: new Date(),
      amount: 0,
      category: '',
    },
  })

  const transactionType = watch('type')
  const selectedDate = watch('date')

  const handleScanComplete = (data: any) => {
    setValue('amount', data.amount)
    setValue('description', data.description || data.merchant)
    setValue('category', data.category)
    setValue('date', new Date(data.date))
    setActiveTab('manual')
    toast({
      title: 'Receipt scanned!',
      description: 'Transaction details have been filled.',
    })
  }

  const handleTemplateSelect = (template: any) => {
    setValue('category', template.category)
    setValue('description', template.name)
    if (template.amount) {
      setValue('amount', template.amount)
    }
    
    // Focus on amount field if not set
    if (!template.amount) {
      document.getElementById('amount')?.focus()
    }
  }

  const onSubmit = async (data: TransactionForm) => {
    setIsSubmitting(true)
    try {
      await transactionsApi.create({
        ...data,
        amount: transactionType === 'expense' ? -Math.abs(data.amount) : data.amount,
      })
      
      toast({
        title: 'Transaction added!',
        description: 'Your transaction has been recorded.',
      })
      
      reset()
      onSuccess?.()
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add transaction. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = transactionType === 'income' ? incomeCategories : expenseCategories

  return (
    <>
      <Dialog open={open && !showScanner} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Record a new transaction using any method below
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">
                <FileText className="h-4 w-4 mr-2" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="scan">
                <Camera className="h-4 w-4 mr-2" />
                Scan
              </TabsTrigger>
              <TabsTrigger value="voice" disabled>
                <Mic className="h-4 w-4 mr-2" />
                Voice
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4 mt-4">
              {/* Quick Templates */}
              <QuickTemplates onSelectTemplate={handleTemplateSelect} />
              
              <div className="border-t pt-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Transaction Type */}
                  <div className="grid grid-cols-3 gap-2">
                    {(['expense', 'income', 'transfer'] as const).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={transactionType === type ? 'default' : 'outline'}
                        onClick={() => setValue('type', type)}
                        className="capitalize"
                      >
                        {type === 'expense' && <Minus className="h-4 w-4 mr-1" />}
                        {type === 'income' && <Plus className="h-4 w-4 mr-1" />}
                        {type === 'transfer' && <ArrowRightLeft className="h-4 w-4 mr-1" />}
                        {type}
                      </Button>
                    ))}
                  </div>

                  {/* Amount and Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register('amount', { valueAsNumber: true })}
                      />
                      {errors.amount && (
                        <p className="text-sm text-destructive">{errors.amount.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={watch('category')} 
                        onValueChange={(value) => setValue('category', value)}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-destructive">{errors.category.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What was this transaction for?"
                      className="min-h-[60px]"
                      {...register('description')}
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setValue('date', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Transaction'}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="scan" className="space-y-4 mt-4">
              <div className="text-center py-8">
                <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Scan Receipt</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Take a photo or upload an image of your receipt
                </p>
                <Button onClick={() => setShowScanner(true)}>
                  <Camera className="h-4 w-4 mr-2" />
                  Open Scanner
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4 mt-4">
              <div className="text-center py-8">
                <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Voice Input</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Coming soon! Say "I spent $50 on groceries" to add transactions
                </p>
                <Button disabled variant="outline">
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ReceiptScanner
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onScanComplete={handleScanComplete}
      />
    </>
  )
}