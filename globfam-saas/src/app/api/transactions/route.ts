import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'

const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  description: z.string().min(1),
  date: z.string(), // Will be converted to Date
  category: z.string().optional(),
  subcategory: z.string().optional(),
  merchant: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_recurring: z.boolean().default(false),
  recurring_frequency: z.string().optional(),
  asset_id: z.string(),
  transfer_asset_id: z.string().optional(),
})

// GET /api/transactions - Get all transactions for the user
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
    const assetId = searchParams.get('assetId')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('transactions')
      .select('*, asset:assets!asset_id(*), transfer_asset:assets!transfer_asset_id(*)', { count: 'exact' })
      .eq('organization_id', userProfile.organization_id)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (assetId) {
      query = query.eq('asset_id', assetId)
    }
    if (type) {
      query = query.eq('type', type)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data: transactions, error, count } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Failed to fetch transactions' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactions || [],
        total: count || 0,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('Transactions GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
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
    const validatedData = createTransactionSchema.parse(body)

    // Verify the asset belongs to the user
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('id')
      .eq('id', validatedData.asset_id)
      .eq('user_id', user.id)
      .eq('organization_id', userProfile.organization_id)
      .single()

    if (assetError || !asset) {
      return NextResponse.json(
        { success: false, error: { message: 'Asset not found or unauthorized' } },
        { status: 404 }
      )
    }

    // If transfer, verify the transfer asset
    if (validatedData.transfer_asset_id) {
      const { data: transferAsset, error: transferError } = await supabase
        .from('assets')
        .select('id')
        .eq('id', validatedData.transfer_asset_id)
        .eq('user_id', user.id)
        .eq('organization_id', userProfile.organization_id)
        .single()

      if (transferError || !transferAsset) {
        return NextResponse.json(
          { success: false, error: { message: 'Transfer asset not found or unauthorized' } },
          { status: 404 }
        )
      }
    }

    // Create the transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        ...validatedData,
        user_id: user.id,
        organization_id: userProfile.organization_id,
      })
      .select('*, asset:assets!asset_id(*), transfer_asset:assets!transfer_asset_id(*)')
      .single()

    if (error) {
      console.error('Error creating transaction:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Failed to create transaction' } },
        { status: 500 }
      )
    }

    // Update asset balance
    if (validatedData.type === 'INCOME') {
      await supabase.rpc('increment_asset_balance', {
        asset_id: validatedData.asset_id,
        amount: validatedData.amount
      })
    } else if (validatedData.type === 'EXPENSE') {
      await supabase.rpc('decrement_asset_balance', {
        asset_id: validatedData.asset_id,
        amount: validatedData.amount
      })
    } else if (validatedData.type === 'TRANSFER' && validatedData.transfer_asset_id) {
      // Decrease from source asset
      await supabase.rpc('decrement_asset_balance', {
        asset_id: validatedData.asset_id,
        amount: validatedData.amount
      })
      // Increase to destination asset
      await supabase.rpc('increment_asset_balance', {
        asset_id: validatedData.transfer_asset_id,
        amount: validatedData.amount
      })
    }

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

    console.error('Transactions POST error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}