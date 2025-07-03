import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

// GET /api/transactions/analytics/summary - Get transaction analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    // Get user's organization_id
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { success: false, error: { message: 'User profile not found' } },
        { status: 404 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate') || format(startOfMonth(new Date()), 'yyyy-MM-dd')
    const endDate = searchParams.get('endDate') || format(endOfMonth(new Date()), 'yyyy-MM-dd')
    const assetId = searchParams.get('assetId')

    // Build base query
    let query = supabase
      .from('transactions')
      .select('type, amount, category, date')
      .eq('organization_id', userProfile.organization_id)
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)

    if (assetId) {
      query = query.eq('asset_id', assetId)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error('Error fetching transactions for analytics:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Failed to fetch analytics data' } },
        { status: 500 }
      )
    }

    // Calculate summary
    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      transactionCount: transactions?.length || 0,
      categoryBreakdown: {} as Record<string, number>,
      monthlyTrend: {} as Record<string, { income: number; expenses: number }>,
    }

    if (transactions) {
      transactions.forEach((transaction) => {
        if (transaction.type === 'INCOME') {
          summary.totalIncome += transaction.amount
        } else if (transaction.type === 'EXPENSE') {
          summary.totalExpenses += transaction.amount
        }

        // Category breakdown
        if (transaction.category) {
          summary.categoryBreakdown[transaction.category] = 
            (summary.categoryBreakdown[transaction.category] || 0) + transaction.amount
        }

        // Monthly trend
        const monthKey = format(new Date(transaction.date), 'yyyy-MM')
        if (!summary.monthlyTrend[monthKey]) {
          summary.monthlyTrend[monthKey] = { income: 0, expenses: 0 }
        }
        if (transaction.type === 'INCOME') {
          summary.monthlyTrend[monthKey].income += transaction.amount
        } else if (transaction.type === 'EXPENSE') {
          summary.monthlyTrend[monthKey].expenses += transaction.amount
        }
      })
    }

    summary.netIncome = summary.totalIncome - summary.totalExpenses

    // Get previous period for comparison
    const prevStartDate = format(subMonths(new Date(startDate), 1), 'yyyy-MM-dd')
    const prevEndDate = format(subMonths(new Date(endDate), 1), 'yyyy-MM-dd')

    let prevQuery = supabase
      .from('transactions')
      .select('type, amount')
      .eq('organization_id', userProfile.organization_id)
      .eq('user_id', user.id)
      .gte('date', prevStartDate)
      .lte('date', prevEndDate)

    if (assetId) {
      prevQuery = prevQuery.eq('asset_id', assetId)
    }

    const { data: prevTransactions } = await prevQuery

    let prevIncome = 0
    let prevExpenses = 0

    if (prevTransactions) {
      prevTransactions.forEach((transaction) => {
        if (transaction.type === 'INCOME') {
          prevIncome += transaction.amount
        } else if (transaction.type === 'EXPENSE') {
          prevExpenses += transaction.amount
        }
      })
    }

    // Calculate percentage changes
    const incomeChange = prevIncome > 0 
      ? ((summary.totalIncome - prevIncome) / prevIncome) * 100 
      : 0
    const expenseChange = prevExpenses > 0 
      ? ((summary.totalExpenses - prevExpenses) / prevExpenses) * 100 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          ...summary,
          previousPeriod: {
            income: prevIncome,
            expenses: prevExpenses,
            incomeChange,
            expenseChange,
          },
        }
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}