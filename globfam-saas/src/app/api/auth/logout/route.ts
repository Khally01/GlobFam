import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server-client'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}