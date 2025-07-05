import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  currency?: string
}

export function MetricCard({ title, value, subtitle, trend, currency }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 card-shadow">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold tracking-tight">
            {value}
          </h3>
          {currency && (
            <span className="text-lg text-muted-foreground font-medium">{currency}</span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      
      {trend && (
        <div className={cn(
          "flex items-center gap-1 mt-4 text-sm font-medium",
          trend.isPositive ? "text-green-600" : "text-red-600"
        )}>
          {trend.isPositive ? (
            <ArrowUpIcon className="h-4 w-4" />
          ) : (
            <ArrowDownIcon className="h-4 w-4" />
          )}
          <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
        </div>
      )}
    </div>
  )
}