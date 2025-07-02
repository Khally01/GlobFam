import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const supabase = createClient()

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 401 }
      )
    }

    // Get user profile data
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*, organization:organizations(*)')
      .eq('id', data.user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { success: false, error: { message: 'User profile not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: userProfile.name,
          role: userProfile.role,
          organizationId: userProfile.organization_id,
          organization: userProfile.organization,
        },
        session: data.session,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}