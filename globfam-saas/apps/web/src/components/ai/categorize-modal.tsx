"use client"

import { useState } from 'react'
import { Sparkles, Check, X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'

interface CategorizationResult {
  transactionId: string
  suggestedCategory: string
  confidence: number
  reasoning?: string
  transaction?: {
    description: string
    amount: string
    date: string
    category: string
  }
}

interface CategorizeModalProps {
  isOpen: boolean
  onClose: () => void
  transactionIds?: string[]
  onComplete: () => void
}

const CATEGORIES = {
  INCOME: ['Salary', 'Business', 'Investment', 'Rental', 'Gift', 'Other Income'],
  EXPENSE: [
    'Rent', 'Mortgage', 'Groceries', 'Utilities', 'Transport',
    'Healthcare', 'Education', 'Childcare', 'Entertainment',
    'Shopping', 'Insurance', 'Taxes', 'Other'
  ]
}

export function CategorizeModal({ isOpen, onClose, transactionIds, onComplete }: CategorizeModalProps) {
  const [loading, setLoading] = useState(false)
  const [categorizations, setCategorizations] = useState<CategorizationResult[]>([])
  const [acceptedCategories, setAcceptedCategories] = useState<Record<string, { accepted: boolean; category: string }>>({})
  const [applying, setApplying] = useState(false)
  const { toast } = useToast()

  const handleCategorize = async () => {
    setLoading(true)
    try {
      const response = await api.post('/api/ai/categorize', {
        transactionIds,
        limit: transactionIds ? undefined : 50
      })

      const results = response.data.categorizations || []
      setCategorizations(results)
      
      // Auto-accept high confidence suggestions
      const autoAccepted: Record<string, { accepted: boolean; category: string }> = {}
      results.forEach((result: CategorizationResult) => {
        if (result.confidence >= 0.8) {
          autoAccepted[result.transactionId] = {
            accepted: true,
            category: result.suggestedCategory
          }
        }
      })
      setAcceptedCategories(autoAccepted)
    } catch (error) {
      console.error('Categorization error:', error)
      toast({
        title: 'Error',
        description: 'Failed to categorize transactions',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    setApplying(true)
    try {
      const categorizationsToApply = Object.entries(acceptedCategories).map(([transactionId, data]) => ({
        transactionId,
        category: data.category,
        accepted: data.accepted
      }))

      await api.post('/api/ai/categorize/apply', {
        categorizations: categorizationsToApply
      })

      toast({
        title: 'Success',
        description: `Applied ${categorizationsToApply.filter(c => c.accepted).length} categorizations`
      })

      onComplete()
      handleClose()
    } catch (error) {
      console.error('Apply error:', error)
      toast({
        title: 'Error',
        description: 'Failed to apply categorizations',
        variant: 'destructive'
      })
    } finally {
      setApplying(false)
    }
  }

  const handleClose = () => {
    setCategorizations([])
    setAcceptedCategories({})
    onClose()
  }

  const toggleAcceptance = (transactionId: string, category: string) => {
    setAcceptedCategories(prev => ({
      ...prev,
      [transactionId]: {
        accepted: !prev[transactionId]?.accepted,
        category
      }
    }))
  }

  const updateCategory = (transactionId: string, newCategory: string) => {
    setAcceptedCategories(prev => ({
      ...prev,
      [transactionId]: {
        accepted: true,
        category: newCategory
      }
    }))
  }

  const acceptedCount = Object.values(acceptedCategories).filter(c => c.accepted).length

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Transaction Categorization
          </DialogTitle>
        </DialogHeader>

        {!loading && categorizations.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Smart Categorization</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Use AI to automatically categorize your transactions based on their descriptions.
              High-confidence suggestions will be auto-selected.
            </p>
            <Button onClick={handleCategorize} size="lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Start Categorization
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Analyzing transactions...</p>
          </div>
        )}

        {!loading && categorizations.length > 0 && (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
              {categorizations.map((result) => {
                const isAccepted = acceptedCategories[result.transactionId]?.accepted
                const currentCategory = acceptedCategories[result.transactionId]?.category || result.suggestedCategory
                
                return (
                  <div
                    key={result.transactionId}
                    className={`border rounded-lg p-4 transition-colors ${
                      isAccepted ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{result.transaction?.description || 'Transaction'}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>${result.transaction?.amount}</span>
                          <span>{new Date(result.transaction?.date || '').toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            Confidence: 
                            <span className={`font-medium ${
                              result.confidence >= 0.8 ? 'text-green-600' : 
                              result.confidence >= 0.6 ? 'text-yellow-600' : 
                              'text-red-600'
                            }`}>
                              {Math.round(result.confidence * 100)}%
                            </span>
                          </span>
                        </div>
                        {result.reasoning && (
                          <p className="text-sm text-muted-foreground mt-2">{result.reasoning}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select
                          value={currentCategory}
                          onValueChange={(value) => updateCategory(result.transactionId, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.EXPENSE.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant={isAccepted ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleAcceptance(result.transactionId, currentCategory)}
                        >
                          {isAccepted ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t pt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {acceptedCount} of {categorizations.length} categorizations selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleApply} 
                  disabled={acceptedCount === 0 || applying}
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    `Apply ${acceptedCount} Categorization${acceptedCount !== 1 ? 's' : ''}`
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}