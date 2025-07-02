import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExchangeRates {
  [key: string]: number
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch exchange rates from external API
    const API_KEY = Deno.env.get('EXCHANGE_RATE_API_KEY')
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }

    const data = await response.json()
    const rates: ExchangeRates = data.conversion_rates

    // Store rates in cache table
    const { error } = await supabaseClient
      .from('exchange_rates')
      .upsert(
        Object.entries(rates).map(([currency, rate]) => ({
          base_currency: 'USD',
          target_currency: currency,
          rate: rate,
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'base_currency,target_currency' }
      )

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Exchange rates updated',
        count: Object.keys(rates).length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})