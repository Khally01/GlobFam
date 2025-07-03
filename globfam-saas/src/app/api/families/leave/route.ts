import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// POST /api/families/leave - Leave current family
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

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('family_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { success: false, error: { message: 'User profile not found' } },
        { status: 404 }
      )
    }

    if (!userProfile.family_id) {
      return NextResponse.json(
        { success: false, error: { message: 'You are not in a family' } },
        { status: 400 }
      )
    }

    // Check if user is the family creator
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('created_by_id')
      .eq('id', userProfile.family_id)
      .single()

    if (familyError || !family) {
      return NextResponse.json(
        { success: false, error: { message: 'Family not found' } },
        { status: 404 }
      )
    }

    // If user is the creator, check if there are other members
    if (family.created_by_id === user.id) {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', userProfile.family_id)
        .neq('id', user.id)

      if (count && count > 0) {
        return NextResponse.json(
          { success: false, error: { message: 'Cannot leave family as creator while other members exist. Transfer ownership or remove all members first.' } },
          { status: 400 }
        )
      }
    }

    // Update user's family_id to null
    const { error: updateError } = await supabase
      .from('users')
      .update({ family_id: null })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to leave family' } },
        { status: 500 }
      )
    }

    // If no members left and user was creator, delete the family
    if (family.created_by_id === user.id) {
      await supabase
        .from('families')
        .delete()
        .eq('id', userProfile.family_id)
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Successfully left family' }
    })
  } catch (error) {
    console.error('Leave family error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}