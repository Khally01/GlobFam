import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    
    // Check if tables exist
    const tables = [
      'organizations',
      'users', 
      'budget_categories',
      'assets',
      'transactions',
      'families'
    ]
    
    const tableChecks: Record<string, any> = {}
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        tableChecks[table] = {
          exists: !error,
          error: error?.message,
          rowCount: count
        }
      } catch (e) {
        tableChecks[table] = {
          exists: false,
          error: e instanceof Error ? e.message : 'Unknown error'
        }
      }
    }
    
    // Check if functions exist
    const functionChecks: Record<string, any> = {}
    
    try {
      // Test auth helper functions
      const { data: orgTest, error: orgError } = await supabase.rpc('auth.organization_id')
      functionChecks['auth.organization_id'] = {
        exists: !orgError,
        error: orgError?.message
      }
    } catch (e) {
      functionChecks['auth.organization_id'] = {
        exists: false,
        error: e instanceof Error ? e.message : 'Function not found'
      }
    }
    
    try {
      // Test setup_default_categories
      const { error: setupError } = await supabase.rpc('setup_default_categories', {
        org_id: '00000000-0000-0000-0000-000000000000'
      })
      functionChecks['setup_default_categories'] = {
        exists: !setupError || !setupError.message?.includes('does not exist'),
        error: setupError?.message
      }
    } catch (e) {
      functionChecks['setup_default_categories'] = {
        exists: false,
        error: e instanceof Error ? e.message : 'Function not found'
      }
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
        hasJwtSecret: !!process.env.SUPABASE_JWT_SECRET,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        // List all SUPABASE env vars
        allSupabaseEnvVars: Object.keys(process.env)
          .filter(key => key.includes('SUPABASE'))
          .map(key => key)
      },
      database: {
        tables: tableChecks,
        functions: functionChecks
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}