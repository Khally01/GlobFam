'use client'

import { Card, CardContent } from '@/components/shared-ui'
import { Button } from '@/components/ui/button'
import { Receipt, Wallet, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EmptyTransactionsStateProps {
  hasAssets: boolean
  onAddTransaction: () => void
}

export function EmptyTransactionsState({ hasAssets, onAddTransaction }: EmptyTransactionsStateProps) {
  const router = useRouter()

  if (!hasAssets) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No assets yet</h3>
          <p className="text-muted-foreground mb-4">
            You need to add at least one asset before recording transactions
          </p>
          <Button onClick={() => router.push('/dashboard/assets')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Asset
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="text-center py-12">
        <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
        <p className="text-muted-foreground mb-4">
          Start tracking your income and expenses
        </p>
        <Button onClick={onAddTransaction}>
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Transaction
        </Button>
      </CardContent>
    </Card>
  )
}