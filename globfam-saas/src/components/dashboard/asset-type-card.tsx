import { 
  Wallet, 
  Bitcoin, 
  Home, 
  Landmark, 
  PiggyBank,
  TrendingUp,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AssetTypeCardProps {
  type: 'cash' | 'crypto' | 'property' | 'bank' | 'investment'
  name: string
  balance: string
  currency?: string
  change?: {
    value: number
    percentage: number
  }
  count?: number
  onAdd?: () => void
}

const assetIcons = {
  cash: Wallet,
  crypto: Bitcoin,
  property: Home,
  bank: Landmark,
  investment: TrendingUp,
}

const assetColors = {
  cash: 'bg-green-50 text-green-600',
  crypto: 'bg-orange-50 text-orange-600',
  property: 'bg-blue-50 text-blue-600',
  bank: 'bg-purple-50 text-purple-600',
  investment: 'bg-pink-50 text-pink-600',
}

export function AssetTypeCard({ 
  type, 
  name, 
  balance, 
  currency = 'USD',
  change,
  count,
  onAdd 
}: AssetTypeCardProps) {
  const Icon = assetIcons[type] || PiggyBank
  
  return (
    <div className="bg-white rounded-2xl p-6 card-shadow card-shadow-hover transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "p-3 rounded-xl",
          assetColors[type]
        )}>
          <Icon className="h-6 w-6" />
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">{name}</p>
          {count !== undefined && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {count} {count === 1 ? 'account' : 'accounts'}
            </span>
          )}
        </div>
        
        <h3 className="text-2xl font-bold">
          {balance}
          <span className="text-base text-muted-foreground ml-1">{currency}</span>
        </h3>
        
        {change && (
          <div className="flex items-center gap-2 text-sm">
            <span className={cn(
              "font-medium",
              change.percentage >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {change.percentage >= 0 ? '+' : ''}{change.value} ({change.percentage}%)
            </span>
            <span className="text-muted-foreground">this month</span>
          </div>
        )}
      </div>
    </div>
  )
}