import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase'
import { createClient as createBrowserClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    deployment: process.env.VERCEL_ENV || 'local',
  }

  // 1. Check Environment Variables
  diagnostics.envVars = {
    NEXT_PUBLIC_SUPABASE_URL: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 'NOT SET'
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    },
    // Check for alternative names from Vercel integration
    SUPABASE_URL: {
      exists: !!process.env.SUPABASE_URL,
      value: process.env.SUPABASE_URL ? 
        process.env.SUPABASE_URL.substring(0, 30) + '...' : 'NOT SET'
    },
    SUPABASE_ANON_KEY: {
      exists: !!process.env.SUPABASE_ANON_KEY,
      length: process.env.SUPABASE_ANON_KEY?.length || 0
    },
    SUPABASE_SERVICE_KEY: {
      exists: !!process.env.SUPABASE_SERVICE_KEY,
      length: process.env.SUPABASE_SERVICE_KEY?.length || 0
    },
    // List all env vars containing SUPABASE
    allSupabaseVars: Object.keys(process.env)
      .filter(key => key.includes('SUPABASE'))
      .map(key => ({ key, length: process.env[key]?.length || 0 }))
  }

  // 2. Test Supabase Connection with Anon Key
  diagnostics.supabaseConnection = {}
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('organizations').select('count', { count: 'exact', head: true })
    
    diagnostics.supabaseConnection.anon = {
      success: !error,
      error: error?.message,
      hint: error?.hint
    }
  } catch (e) {
    diagnostics.supabaseConnection.anon = {
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error'
    }
  }

  // 3. Test Service Role Client
  diagnostics.serviceRoleClient = {}
  try {
    const serviceClient = createServiceRoleClient()
    diagnostics.serviceRoleClient.creation = { success: true }
    
    // Try to count users
    const { count, error } = await serviceClient
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    diagnostics.serviceRoleClient.query = {
      success: !error,
      error: error?.message,
      userCount: count
    }
  } catch (e) {
    diagnostics.serviceRoleClient = {
      creation: { 
        success: false, 
        error: e instanceof Error ? e.message : 'Unknown error' 
      }
    }
  }

  // 4. Check Database Tables
  diagnostics.database = { tables: {} }
  const tables = [
    'organizations',
    'users',
    'budget_categories',
    'assets',
    'transactions',
    'families'
  ]

  try {
    const supabase = createClient()
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        diagnostics.database.tables[table] = {
          exists: !error,
          error: error?.message,
          rowCount: count
        }
      } catch (e) {
        diagnostics.database.tables[table] = {
          exists: false,
          error: e instanceof Error ? e.message : 'Unknown error'
        }
      }
    }
  } catch (e) {
    diagnostics.database.error = e instanceof Error ? e.message : 'Unknown error'
  }

  // 5. Check RLS Functions
  diagnostics.database.functions = {}
  try {
    // We need a direct connection to test functions
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                       process.env.SUPABASE_SERVICE_KEY ||
                       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const directClient = createBrowserClient(supabaseUrl, supabaseKey)
      
      // Test if setup_default_categories exists
      try {
        const { error } = await directClient.rpc('setup_default_categories', {
          org_id: '00000000-0000-0000-0000-000000000000'
        })
        
        diagnostics.database.functions.setup_default_categories = {
          exists: !error || !error.message?.includes('does not exist'),
          error: error?.message
        }
      } catch (e) {
        diagnostics.database.functions.setup_default_categories = {
          exists: false,
          error: e instanceof Error ? e.message : 'Function not found'
        }
      }
    }
  } catch (e) {
    diagnostics.database.functions.error = e instanceof Error ? e.message : 'Unknown error'
  }

  // 6. Check Current Auth Status
  diagnostics.auth = {}
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    diagnostics.auth = {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      error: error?.message
    }
  } catch (e) {
    diagnostics.auth.error = e instanceof Error ? e.message : 'Unknown error'
  }

  // 7. Recommendations
  diagnostics.recommendations = []
  
  if (!diagnostics.envVars.SUPABASE_SERVICE_ROLE_KEY.exists) {
    diagnostics.recommendations.push({
      severity: 'critical',
      message: 'SUPABASE_SERVICE_ROLE_KEY is missing. This is required for user registration.',
      action: 'Add SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables'
    })
  }

  if (diagnostics.serviceRoleClient.creation?.error?.includes('Service role key is required')) {
    diagnostics.recommendations.push({
      severity: 'critical',
      message: 'Service role client cannot be created',
      action: 'Ensure SUPABASE_SERVICE_ROLE_KEY is properly set in Vercel'
    })
  }

  if (!diagnostics.database.functions.setup_default_categories?.exists) {
    diagnostics.recommendations.push({
      severity: 'high',
      message: 'setup_default_categories function is missing',
      action: 'Run migration 00006_setup_default_categories.sql in Supabase SQL editor'
    })
  }

  Object.entries(diagnostics.database.tables).forEach(([table, info]: [string, any]) => {
    if (!info.exists) {
      diagnostics.recommendations.push({
        severity: 'critical',
        message: `Table '${table}' is missing`,
        action: `Run the initial schema migration in Supabase SQL editor`
      })
    }
  })

  return NextResponse.json(diagnostics, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  })
}