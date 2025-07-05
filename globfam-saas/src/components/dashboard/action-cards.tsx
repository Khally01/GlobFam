import { Plus, Target, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function ActionCards() {
  const router = useRouter()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="gradient-blue text-white rounded-2xl p-6 card-shadow">
        <h3 className="text-xl font-semibold mb-2">Add Transaction</h3>
        <p className="text-blue-100 mb-6">Record income, expenses, or transfers</p>
        <Button 
          variant="secondary" 
          className="bg-white/20 hover:bg-white/30 text-white border-0"
          onClick={() => router.push('/dashboard/transactions?action=add')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Now
        </Button>
      </div>
      
      <div className="gradient-green text-white rounded-2xl p-6 card-shadow">
        <h3 className="text-xl font-semibold mb-2">Set Budget</h3>
        <p className="text-green-100 mb-6">Create budgets for different categories</p>
        <Button 
          variant="secondary" 
          className="bg-white/20 hover:bg-white/30 text-white border-0"
          onClick={() => router.push('/dashboard/budget')}
        >
          <Target className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
      </div>
      
      <div className="gradient-orange text-white rounded-2xl p-6 card-shadow">
        <h3 className="text-xl font-semibold mb-2">Connect Bank</h3>
        <p className="text-orange-100 mb-6">Link your bank accounts for automatic sync</p>
        <Button 
          variant="secondary" 
          className="bg-white/20 hover:bg-white/30 text-white border-0"
          onClick={() => router.push('/dashboard/banking')}
        >
          <Link className="h-4 w-4 mr-2" />
          Connect
        </Button>
      </div>
    </div>
  )
}