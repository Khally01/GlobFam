import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  avatar: z.string().url().optional().nullable(),
  country: z.string().optional(),
  preferred_currency: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
})

// GET /api/users/profile - Get current user profile
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

    // Get user profile with organization
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*, organization:organizations(*), family:families(*)')
      .eq('id', user.id)
      .single()

    if (error || !userProfile) {
      return NextResponse.json(
        { success: false, error: { message: 'User profile not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          avatar: userProfile.avatar,
          country: userProfile.country,
          preferred_currency: userProfile.preferred_currency,
          language: userProfile.language,
          timezone: userProfile.timezone,
          organizationId: userProfile.organization_id,
          familyId: userProfile.family_id,
          organization: userProfile.organization,
          family: userProfile.family,
          created_at: userProfile.created_at,
          updated_at: userProfile.updated_at,
        }
      }
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// PUT /api/users/profile - Update current user profile
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

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Update user profile
    const { data: userProfile, error } = await supabase
      .from('users')
      .update(validatedData)
      .eq('id', user.id)
      .select('*, organization:organizations(*), family:families(*)')
      .single()

    if (error || !userProfile) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to update profile' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          avatar: userProfile.avatar,
          country: userProfile.country,
          preferred_currency: userProfile.preferred_currency,
          language: userProfile.language,
          timezone: userProfile.timezone,
          organizationId: userProfile.organization_id,
          familyId: userProfile.family_id,
          organization: userProfile.organization,
          family: userProfile.family,
          created_at: userProfile.created_at,
          updated_at: userProfile.updated_at,
        }
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Profile PUT error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}