import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server-client'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  organizationName: z.string().min(2),
})

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + 
    '-' + 
    Math.random().toString(36).substring(2, 8)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, organizationName } = registerSchema.parse(body)

    const supabase = createServiceRoleClient()

    // Start a transaction by creating organization first
    const organizationSlug = generateSlug(organizationName)
    
    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organizationName,
        slug: organizationSlug,
        plan: 'STARTER',
        billing_email: email,
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
      })
      .select()
      .single()

    if (orgError) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to create organization' } },
        { status: 400 }
      )
    }

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          organization_id: organization.id,
        },
      },
    })

    if (authError || !authData.user) {
      // Rollback organization creation
      await supabase.from('organizations').delete().eq('id', organization.id)
      
      return NextResponse.json(
        { success: false, error: { message: authError?.message || 'Failed to create account' } },
        { status: 400 }
      )
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        role: 'OWNER',
        organization_id: organization.id,
        preferred_currency: 'USD',
        country: 'US',
        language: 'en',
        timezone: 'America/New_York',
      })

    if (profileError) {
      // This is critical - user is created in auth but not in our tables
      console.error('Failed to create user profile:', profileError)
      
      return NextResponse.json(
        { success: false, error: { message: 'Account created but profile setup failed. Please contact support.' } },
        { status: 500 }
      )
    }

    // Create default budget categories for the organization
    const { error: categoriesError } = await supabase.rpc('setup_default_categories', {
      org_id: organization.id
    })

    if (categoriesError) {
      console.error('Failed to create default categories:', categoriesError)
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          name,
          role: 'OWNER',
          organizationId: organization.id,
          organization,
        },
        session: authData.session,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}