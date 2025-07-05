'use client'

import { useState } from 'react'
import { Plus, Coffee, Car, ShoppingCart, Home, Zap, Heart, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Template {
  id: string
  name: string
  icon: React.ReactNode
  category: string
  amount?: number
  color: string
}

interface QuickTemplatesProps {
  onSelectTemplate: (template: Template) => void
}

const defaultTemplates: Template[] = [
  { id: '1', name: 'Coffee', icon: <Coffee className="h-4 w-4" />, category: 'Food', amount: 5, color: 'bg-orange-100 text-orange-700' },
  { id: '2', name: 'Gas', icon: <Car className="h-4 w-4" />, category: 'Transport', amount: 50, color: 'bg-blue-100 text-blue-700' },
  { id: '3', name: 'Groceries', icon: <ShoppingCart className="h-4 w-4" />, category: 'Food', amount: 100, color: 'bg-green-100 text-green-700' },
  { id: '4', name: 'Rent', icon: <Home className="h-4 w-4" />, category: 'Housing', amount: 1500, color: 'bg-purple-100 text-purple-700' },
  { id: '5', name: 'Utilities', icon: <Zap className="h-4 w-4" />, category: 'Bills', amount: 150, color: 'bg-yellow-100 text-yellow-700' },
  { id: '6', name: 'Health', icon: <Heart className="h-4 w-4" />, category: 'Health', amount: 50, color: 'bg-red-100 text-red-700' },
  { id: '7', name: 'Work', icon: <Briefcase className="h-4 w-4" />, category: 'Income', amount: 0, color: 'bg-emerald-100 text-emerald-700' },
]

export function QuickTemplates({ onSelectTemplate }: QuickTemplatesProps) {
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([])

  const handleTemplateClick = (template: Template) => {
    // Add to recently used
    setRecentlyUsed(prev => [template.id, ...prev.filter(id => id !== template.id)].slice(0, 3))
    
    // Trigger the template selection
    onSelectTemplate(template)
  }

  // Sort templates to show recently used first
  const sortedTemplates = [...defaultTemplates].sort((a, b) => {
    const aIndex = recentlyUsed.indexOf(a.id)
    const bIndex = recentlyUsed.indexOf(b.id)
    
    if (aIndex === -1 && bIndex === -1) return 0
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    
    return aIndex - bIndex
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Quick Add</h3>
        <Button variant="ghost" size="sm" className="h-8">
          <Plus className="h-3 w-3 mr-1" />
          Customize
        </Button>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {sortedTemplates.map((template) => {
          const isRecent = recentlyUsed.includes(template.id)
          
          return (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                "hover:scale-105 active:scale-95",
                isRecent ? "ring-2 ring-primary/20" : "",
                "hover:shadow-md"
              )}
            >
              <div className={cn(
                "p-3 rounded-lg",
                template.color
              )}>
                {template.icon}
              </div>
              <span className="text-xs font-medium">{template.name}</span>
              {template.amount && template.amount > 0 && (
                <span className="text-xs text-muted-foreground">
                  ${template.amount}
                </span>
              )}
            </button>
          )
        })}
      </div>
      
      {recentlyUsed.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Recently used templates appear first
        </p>
      )}
    </div>
  )
}