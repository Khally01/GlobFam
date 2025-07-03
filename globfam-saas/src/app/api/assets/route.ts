import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase'
import { z } from 'zod'

const createAssetSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['BANK_ACCOUNT', 'INVESTMENT', 'PROPERTY', 'CRYPTO', 'LOAN', 'CASH', 'OTHER']),
  currency: z.string().default('USD'),
  current_balance: z.number().default(0),
  initial_balance: z.number().default(0),
  is_active: z.boolean().default(true),
  is_shared: z.boolean().default(false),
  account_number: z.string().optional(),
  institution_name: z.string().optional(),
  notes: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  family_id: z.string().optional(),
})

// GET /api/assets - Get all assets for the user
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
    const type = searchParams.get('type')
    const familyId = searchParams.get('familyId')

    // Build query
    let query = supabase
      .from('assets')
      .select('*')
      .eq('organization_id', userProfile.organization_id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }
    if (familyId) {
      query = query.eq('family_id', familyId)
    }

    const { data: assets, error } = await query

    if (error) {
      console.error('Error fetching assets:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Failed to fetch assets' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        assets: assets || []
      }
    })
  } catch (error) {
    console.error('Assets GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// POST /api/assets - Create a new asset
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
    const validatedData = createAssetSchema.parse(body)

    // Create the asset
    const { data: asset, error } = await supabase
      .from('assets')
      .insert({
        ...validatedData,
        user_id: user.id,
        organization_id: userProfile.organization_id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating asset:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Failed to create asset' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { asset }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Assets POST error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}