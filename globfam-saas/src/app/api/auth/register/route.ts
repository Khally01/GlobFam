import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'
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

    let supabase
    try {
      supabase = createServiceRoleClient()
    } catch (serviceRoleError) {
      console.error('Failed to create service role client:', serviceRoleError)
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'Server configuration error. Please contact support.',
            details: 'Service role key not configured'
          } 
        },
        { status: 500 }
      )
    }

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
      console.error('Organization creation failed:', orgError)
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'Failed to create organization',
            details: orgError.message,
            hint: orgError.hint
          } 
        },
        { status: 400 }
      )
    }

    // Sign up the user with email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          organization_id: organization.id,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.globfam.com.au'}/confirm-email`,
      },
    })

    if (authError) {
      // Rollback organization creation
      await supabase.from('organizations').delete().eq('id', organization.id)
      
      // Check if user already exists
      if (authError.message?.includes('already registered')) {
        return NextResponse.json(
          { success: false, error: { message: 'An account with this email already exists. Please sign in instead.' } },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: { message: authError.message || 'Failed to create account' } },
        { status: 400 }
      )
    }

    if (!authData.user) {
      // Rollback organization creation
      await supabase.from('organizations').delete().eq('id', organization.id)
      
      return NextResponse.json(
        { success: false, error: { message: 'Failed to create account - no user returned' } },
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
      
      // Try to provide more specific error info
      let errorMessage = 'Account created but profile setup failed.'
      if (profileError.message?.includes('violates foreign key constraint')) {
        errorMessage = 'Database constraint error - please ensure all migrations are applied.'
      } else if (profileError.message?.includes('permission denied')) {
        errorMessage = 'Permission denied - service role key may not have sufficient permissions.'
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: errorMessage,
            details: profileError.message,
            hint: profileError.hint || 'Please contact support'
          } 
        },
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
      { success: false, error: { message: error instanceof Error ? error.message : 'Internal server error' } },
      { status: 500 }
    )
  }
}