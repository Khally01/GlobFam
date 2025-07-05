import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Transaction {
  id: string
  title: string
  category: string
  categoryColor?: string
  member: string
  memberInitials: string
  date: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  onViewAll?: () => void
}

const categoryColors: Record<string, string> = {
  Education: 'bg-blue-100 text-blue-700',
  Freelance: 'bg-green-100 text-green-700',
  Transfer: 'bg-purple-100 text-purple-700',
  Food: 'bg-orange-100 text-orange-700',
  Investment: 'bg-emerald-100 text-emerald-700',
}

export function RecentTransactions({ transactions, onViewAll }: RecentTransactionsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div 
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 bg-primary text-white">
                <AvatarFallback className="bg-primary text-white font-medium">
                  {transaction.memberInitials}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <p className="font-medium">{transaction.title}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    categoryColors[transaction.category] || 'bg-gray-100 text-gray-700'
                  )}>
                    {transaction.category}
                  </span>
                  <span className="text-muted-foreground">
                    {transaction.member} • {transaction.date}
                  </span>
                </div>
              </div>
            </div>
            
            <p className={cn(
              "text-lg font-semibold",
              transaction.type === 'income' ? 'text-green-600' : 
              transaction.type === 'expense' ? 'text-gray-900' : 
              'text-blue-600'
            )}>
              {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
              ${Math.abs(transaction.amount).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}