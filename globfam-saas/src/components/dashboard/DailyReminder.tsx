'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Upload, Camera, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function DailyReminder() {
  const [dismissed, setDismissed] = useState(false)
  const [hasTransactionsToday, setHasTransactionsToday] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if reminder was dismissed today
    const dismissedDate = localStorage.getItem('reminderDismissed')
    const today = new Date().toDateString()
    
    if (dismissedDate === today) {
      setDismissed(true)
    }

    // TODO: Check if user has logged any transactions today
    // This would require an API call to check transactions for today
  }, [])

  const handleDismiss = () => {
    const today = new Date().toDateString()
    localStorage.setItem('reminderDismissed', today)
    setDismissed(true)
  }

  const handleAddTransaction = () => {
    router.push('/dashboard/transactions')
  }

  if (dismissed || hasTransactionsToday) {
    return null
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 rounded-full p-3">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Don't forget to log today's transactions!
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Keep your finances up-to-date by adding your daily expenses and income.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleAddTransaction}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="h-4 w-4 mr-1" />
                Add Transaction
              </Button>
              
              <Button
                onClick={() => router.push('/dashboard/transactions?import=true')}
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Upload className="h-4 w-4 mr-1" />
                Import CSV
              </Button>
              
              <Button
                onClick={() => router.push('/dashboard/transactions?photo=true')}
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                disabled // Will be enabled when photo upload is implemented
              >
                <Camera className="h-4 w-4 mr-1" />
                Take Photo (Coming Soon)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}