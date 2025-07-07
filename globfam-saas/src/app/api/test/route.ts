import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API routes are working correctly',
    timestamp: new Date().toISOString(),
    environment: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      nodeEnv: process.env.NODE_ENV,
    }
  })
}

export async function POST() {
  return NextResponse.json({
    status: 'ok',
    message: 'POST endpoint working',
    timestamp: new Date().toISOString()
  })
}