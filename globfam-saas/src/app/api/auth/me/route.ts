import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/auth/me - Get current authenticated user
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
    console.error('Auth me error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}