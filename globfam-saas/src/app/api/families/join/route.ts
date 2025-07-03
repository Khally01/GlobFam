import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'

const joinFamilySchema = z.object({
  inviteCode: z.string().min(1),
})

// POST /api/families/join - Join a family using invite code
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
      .select('organization_id, family_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { success: false, error: { message: 'User profile not found' } },
        { status: 404 }
      )
    }

    // Check if user is already in a family
    if (userProfile.family_id) {
      return NextResponse.json(
        { success: false, error: { message: 'You are already in a family. Leave your current family first.' } },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { inviteCode } = joinFamilySchema.parse(body)

    // Find family by invite code
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('*')
      .eq('invite_code', inviteCode)
      .eq('organization_id', userProfile.organization_id)
      .single()

    if (familyError || !family) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid invite code or family not found' } },
        { status: 404 }
      )
    }

    // Update user's family_id
    const { error: updateError } = await supabase
      .from('users')
      .update({ family_id: family.id })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to join family' } },
        { status: 500 }
      )
    }

    // Get family with members
    const { data: familyWithMembers } = await supabase
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
      .eq('id', family.id)
      .single()

    return NextResponse.json({
      success: true,
      data: { family: familyWithMembers || family }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Join family error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}