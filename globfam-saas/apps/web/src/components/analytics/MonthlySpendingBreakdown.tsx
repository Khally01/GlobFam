'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { analyticsApi } from '@/lib/api/analytics'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B']

export function MonthlySpendingBreakdown() {
  const [spending, setSpending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('current')

  useEffect(() => {
    fetchSpendingData()
  }, [timeRange])

  const fetchSpendingData = async () => {
    try {
      const response = await analyticsApi.getSpendingByCategory()
      const data = response.data.data?.spending || []
      
      // Transform data for pie chart
      const chartData = data.map((item: any) => ({
        name: item.category,
        value: item.amount,
        percentage: item.percentage
      }))
      
      setSpending(chartData)
    } catch (error) {
      console.error('Error fetching spending data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending Breakdown</CardTitle>
          <CardDescription>See where your money goes each month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalSpending = spending.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Spending Breakdown</CardTitle>
        <CardDescription>
          Total spent this month: {formatCurrency(totalSpending, 'AUD')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {spending.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">No spending data available</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spending}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percentage }) => `${percentage}%`}
                  >
                    {spending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value, 'AUD')} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold mb-3">Category Breakdown</h4>
              {spending.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(item.value, 'AUD')}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}