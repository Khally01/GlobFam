import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/families/current - Get current user's family
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

    // Get user profile with family
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('family_id, organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { success: false, error: { message: 'User profile not found' } },
        { status: 404 }
      )
    }

    if (!userProfile.family_id) {
      return NextResponse.json({
        success: true,
        data: { family: null }
      })
    }

    // Get family details with members
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select(`
        *,
        members:users!family_id(
          id,
          name,
          email,
          role,
          avatar,
          created_at
        )
      `)
      .eq('id', userProfile.family_id)
      .eq('organization_id', userProfile.organization_id)
      .single()

    if (familyError || !family) {
      return NextResponse.json(
        { success: false, error: { message: 'Family not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { family }
    })
  } catch (error) {
    console.error('Get family error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/families/current - Update current family
export async function PUT(request: NextRequest) {
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

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('family_id, organization_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile || !userProfile.family_id) {
      return NextResponse.json(
        { success: false, error: { message: 'User not in a family' } },
        { status: 404 }
      )
    }

    // Check if user is admin or owner
    if (!['OWNER', 'ADMIN'].includes(userProfile.role)) {
      return NextResponse.json(
        { success: false, error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description } = body

    // Update family
    const { data: family, error } = await supabase
      .from('families')
      .update({
        name: name || undefined,
        description: description || undefined,
      })
      .eq('id', userProfile.family_id)
      .eq('organization_id', userProfile.organization_id)
      .select()
      .single()

    if (error || !family) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to update family' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { family }
    })
  } catch (error) {
    console.error('Update family error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}