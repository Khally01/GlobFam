import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'

const updateTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  description: z.string().min(1).optional(),
  date: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  merchant: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_recurring: z.boolean().optional(),
  recurring_frequency: z.string().optional(),
})

// GET /api/transactions/[id] - Get a single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get the transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*, asset:assets!asset_id(*), transfer_asset:assets!transfer_asset_id(*)')
      .eq('id', params.id)
      .eq('organization_id', userProfile.organization_id)
      .eq('user_id', user.id)
      .single()

    if (error || !transaction) {
      return NextResponse.json(
        { success: false, error: { message: 'Transaction not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { transaction }
    })
  } catch (error) {
    console.error('Transaction GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/transactions/[id] - Update a transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const validatedData = updateTransactionSchema.parse(body)

    // Get the original transaction to handle balance updates
    const { data: originalTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', userProfile.organization_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !originalTransaction) {
      return NextResponse.json(
        { success: false, error: { message: 'Transaction not found' } },
        { status: 404 }
      )
    }

    // Update the transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(validatedData)
      .eq('id', params.id)
      .eq('organization_id', userProfile.organization_id)
      .eq('user_id', user.id)
      .select('*, asset:assets!asset_id(*), transfer_asset:assets!transfer_asset_id(*)')
      .single()

    if (error || !transaction) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to update transaction' } },
        { status: 500 }
      )
    }

    // TODO: Handle balance updates if amount or type changed
    // This would require reversing the original transaction effect and applying the new one

    return NextResponse.json({
      success: true,
      data: { transaction }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Transaction PUT error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get the transaction to handle balance updates
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', userProfile.organization_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !transaction) {
      return NextResponse.json(
        { success: false, error: { message: 'Transaction not found' } },
        { status: 404 }
      )
    }

    // Delete the transaction
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', userProfile.organization_id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to delete transaction' } },
        { status: 500 }
      )
    }

    // TODO: Reverse the balance effect of the deleted transaction

    return NextResponse.json({
      success: true,
      data: { message: 'Transaction deleted successfully' }
    })
  } catch (error) {
    console.error('Transaction DELETE error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}