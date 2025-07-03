import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'

const updateAssetSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['BANK_ACCOUNT', 'INVESTMENT', 'PROPERTY', 'CRYPTO', 'LOAN', 'CASH', 'OTHER']).optional(),
  currency: z.string().optional(),
  current_balance: z.number().optional(),
  is_active: z.boolean().optional(),
  is_shared: z.boolean().optional(),
  account_number: z.string().optional(),
  institution_name: z.string().optional(),
  notes: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  family_id: z.string().nullable().optional(),
})

// GET /api/assets/[id] - Get a single asset
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

    // Get the asset
    const { data: asset, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', userProfile.organization_id)
      .eq('user_id', user.id)
      .single()

    if (error || !asset) {
      return NextResponse.json(
        { success: false, error: { message: 'Asset not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { asset }
    })
  } catch (error) {
    console.error('Asset GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/assets/[id] - Update an asset
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
    const validatedData = updateAssetSchema.parse(body)

    // Update the asset
    const { data: asset, error } = await supabase
      .from('assets')
      .update(validatedData)
      .eq('id', params.id)
      .eq('organization_id', userProfile.organization_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !asset) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to update asset or asset not found' } },
        { status: error ? 500 : 404 }
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

    console.error('Asset PUT error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// DELETE /api/assets/[id] - Delete an asset
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

    // Delete the asset
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', userProfile.organization_id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to delete asset' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Asset deleted successfully' }
    })
  } catch (error) {
    console.error('Asset DELETE error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}