import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  children
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-brand-xl px-4 text-center",
      className
    )}>
      {Icon && (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-brand-sm">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-globfam-deep-blue mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-globfam-steel max-w-sm mb-brand-md">
          {description}
        </p>
      )}
      
      {children}
      
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-brand-xs mt-brand-md">
          {action && (
            <Button
              variant={action.variant || 'default'}
              onClick={action.onClick}
              className={action.variant === 'default' ? 'brand-button' : ''}
            >
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="border-globfam-border text-globfam-slate hover:bg-globfam-cloud hover:text-globfam-deep-blue"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}