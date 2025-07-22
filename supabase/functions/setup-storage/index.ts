import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Encryption constants (matches Go implementation)
const ENCRYPTION_KEY = '9__dHEdhjcXhhBlji2aGs1DZvn1p3v6t'
const TUNNEL_URL = 'https://zda7qzpeeucs.share.zrok.io/api/secure'

// Proper AES-CBC encryption utilities (matches Go implementation)
async function encryptRequest(data: any): Promise<{ data: string, iv: string }> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(ENCRYPTION_KEY)
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-CBC" },
    false,
    ["encrypt"]
  )
  
  // Generate random IV (16 bytes)
  const iv = crypto.getRandomValues(new Uint8Array(16))
  
  // Encrypt the data
  const dataBuffer = encoder.encode(JSON.stringify(data))
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    dataBuffer
  )
  
  // Convert to base64
  const encryptedArray = new Uint8Array(encrypted)
  const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray))
  const ivBase64 = btoa(String.fromCharCode(...iv))
  
  return {
    data: encryptedBase64,
    iv: ivBase64
  }
}

async function decryptResponse(encryptedData: string, ivBase64: string): Promise<any> {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  
  const keyData = encoder.encode(ENCRYPTION_KEY)
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  )
  
  // Convert from base64
  const iv = new Uint8Array(atob(ivBase64).split('').map(c => c.charCodeAt(0)))
  const encrypted = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)))
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    encrypted
  )
  
  return JSON.parse(decoder.decode(decrypted))
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Polling function (matches Go pattern)
async function pollForResponse(requestId: string): Promise<any> {
  const timeout = 45000 // 45 seconds
  const pollInterval = 2000 // 2 seconds
  const startTime = Date.now()
  
  console.log(`🔄 Polling for response to request ID: ${requestId}`)
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(TUNNEL_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        console.log(`⚠️ Poll error: ${response.status}, retrying...`)
        await new Promise(resolve => setTimeout(resolve, pollInterval))
        continue
      }

      const responseData = await response.json()
      
      // Check if it's a timeout response
      if (responseData.timeout) {
        console.log('⏱️ Server timeout, continuing to poll...')
        await new Promise(resolve => setTimeout(resolve, pollInterval))
        continue
      }

      // Try to decrypt if it's an encrypted response
      if (responseData.data && responseData.iv) {
        try {
          // Proper AES decryption
          const decryptedResult = await decryptResponse(responseData.data, responseData.iv)
          
          // Check if this response matches our request ID
          if (decryptedResult.request_id === requestId) {
            console.log(`✅ Received matching response for request ID: ${requestId}`)
            return decryptedResult
          } else {
            console.log(`📨 Received response for different request ID: ${decryptedResult.request_id} (waiting for ${requestId})`)
          }
        } catch (decryptError) {
          console.log(`⚠️ Decryption error: ${decryptError.message}, retrying...`)
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    } catch (error) {
      console.log(`⚠️ Poll error: ${error.message}, retrying...`)
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }
  }
  
  throw new Error(`Timeout waiting for response to request ${requestId}`)
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

    // Generate request ID
    const requestId = generateRequestId()

    // Create request data (matches Go implementation exactly)
    const requestData = {
      endpoint: '/api/create-company',
      method: 'POST',
      payload: companyData,
      request_id: requestId
    }

    console.log(`📤 Sending create-company request: ${requestId}`)

    // Proper AES encryption
    const encryptedRequest = await encryptRequest(requestData)

    // Send to tunnel (matches Go pattern)
    const response = await fetch(TUNNEL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encryptedRequest)
    })

    if (!response.ok) {
      throw new Error(`SFTPGo API error: ${response.status}`)
    }

    const ackResp = await response.json()
    console.log(`📤 Request sent, server acknowledged: ${ackResp.message || 'Request received'}`)

    // Poll for response
    const result = await pollForResponse(requestId)

    // Handle response structure (matches Go implementation)
    console.log('📥 Full response:', JSON.stringify(result, null, 2))
    
    // Extract API key from nested response structure (matches Go code)
    let apiKey = null
    let responseData = null
    
    if (result.success && result.data) {
      // Handle nested structure: result.data.data.api_key
      if (result.data.data && result.data.data.api_key) {
        apiKey = result.data.data.api_key
        responseData = result.data.data
      } else if (result.data.api_key) {
        apiKey = result.data.api_key
        responseData = result.data
      }
    }

    if (!apiKey) {
      throw new Error('No API key received from SFTPGo server')
    }

    console.log(`🔑 Extracted API key: ${apiKey.substring(0, 10)}...`)

    // Update purchase with SFTPGo API key
    await supabaseClient
      .from('user_purchases')
      .update({
        sftpgo_api_key: apiKey,
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
        api_key: apiKey,
        setup_completed: true
      })

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