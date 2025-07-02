'use client'

import { Card, CardContent, Button } from '@/components/shared-ui'
import { 
  Wallet, 
  Receipt, 
  Target, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  Plus
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export function EmptyDashboard() {
  const router = useRouter()

  const quickStartItems = [
    {
      icon: Wallet,
      title: 'Add Your First Asset',
      description: 'Start by adding your bank accounts, properties, or investments',
      action: 'Add Asset',
      route: '/dashboard/assets',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: FileSpreadsheet,
      title: 'Import Transactions',
      description: 'Upload bank statements to automatically categorize spending',
      action: 'Import CSV',
      route: '/dashboard/banking',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Target,
      title: 'Set Financial Goals',
      description: 'Create savings targets and track your progress',
      action: 'Create Goal',
      route: '/dashboard/goals',
      color: 'bg-purple-100 text-purple-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="text-center py-12">
        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Financial Hub</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Let's get started by adding your financial data. Once you've added some assets and transactions,
          you'll see beautiful insights and analytics here.
        </p>
      </div>

      {/* Quick Start Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {quickStartItems.map((item) => (
          <Card 
            key={item.title}
            className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => router.push(item.route)}
          >
            <CardContent className="p-6">
              <div className={`inline-flex p-3 rounded-lg ${item.color} mb-4`}>
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
              <Button className="w-full group">
                {item.action}
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Preview */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-8">
            <h2 className="text-2xl font-semibold mb-4">What You'll See Once Set Up</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <PreviewItem
                icon={TrendingUp}
                title="Cash Flow Analysis"
                description="Track income vs expenses"
              />
              <PreviewItem
                icon={Receipt}
                title="Smart Categories"
                description="AI-powered transaction sorting"
              />
              <PreviewItem
                icon={Target}
                title="Goal Progress"
                description="Visual savings tracking"
              />
              <PreviewItem
                icon={Wallet}
                title="Multi-Currency"
                description="Global asset overview"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Actions */}
      <div className="flex flex-col items-center text-center py-8">
        <p className="text-muted-foreground mb-4">
          Prefer to explore first?
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/settings')}>
            Account Settings
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/family')}>
            Family Setup
          </Button>
        </div>
      </div>
    </div>
  )
}

interface PreviewItemProps {
  icon: any
  title: string
  description: string
}

function PreviewItem({ icon: Icon, title, description }: PreviewItemProps) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}