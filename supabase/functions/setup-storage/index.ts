import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { purchaseId, userEmail } = await req.json()

    if (!purchaseId || !userEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing purchaseId or userEmail' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get purchase details
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('user_purchases')
      .select(`
        *,
        storage_plans (
          name,
          storage_gb,
          plan_type
        )
      `)
      .eq('id', purchaseId)
      .single()

    if (purchaseError || !purchase) {
      throw new Error('Purchase not found')
    }

    // Generate random admin password
    const adminPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)

    // Prepare company creation request
    const companyData = {
      company_email: userEmail,
      quota_gb: purchase.storage_plans.storage_gb,
      admin_password: adminPassword
    }

    // Encrypt and send request to SFTPGo
    const ENCRYPTION_KEY = '9__dHEdhjcXhhBlji2aGs1DZvn1p3v6t'
    const TUNNEL_URL = 'https://zda7qzpeeucs.share.zrok.io'

    // Generate request ID
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create request data
    const requestData = {
      endpoint: '/api/create-company',
      method: 'POST',
      payload: companyData,
      request_id: requestId
    }

    // Simple encryption using btoa for now (in production, use proper AES encryption)
    const encryptedData = btoa(JSON.stringify(requestData))
    const iv = btoa(Math.random().toString(36))

    const encryptedRequest = {
      data: encryptedData,
      iv: iv
    }

    // Send to tunnel
    const response = await fetch(`${TUNNEL_URL}/api/secure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encryptedRequest)
    })

    if (!response.ok) {
      throw new Error(`SFTPGo API error: ${response.status}`)
    }

    const result = await response.json()

    // Update purchase with SFTPGo API key
    if (result.success && result.data?.api_key) {
      await supabaseClient
        .from('user_purchases')
        .update({
          sftpgo_api_key: result.data.api_key,
          storage_setup_completed: true
        })
        .eq('id', purchaseId)

      // Create storage account record
      await supabaseClient
        .from('storage_accounts')
        .insert({
          user_id: purchase.user_id,
          purchase_id: purchaseId,
          account_email: userEmail,
          account_password: adminPassword,
          storage_quota_gb: purchase.storage_plans.storage_gb,
          setup_completed: true
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result.data,
        adminPassword: adminPassword 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Setup storage error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})