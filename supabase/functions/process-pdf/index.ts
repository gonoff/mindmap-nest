import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { pdfUrl } = await req.json()

    if (!pdfUrl) {
      throw new Error('No PDF URL provided')
    }

    console.log('Processing PDF from URL:', pdfUrl)

    // Download the PDF file
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) {
      throw new Error('Failed to download PDF')
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the PDF content
    const pdfBuffer = await pdfResponse.arrayBuffer()
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)))

    console.log('PDF downloaded and converted to base64')

    // Step 1: Parse PDF into chunks
    const { data: parseData, error: parseError } = await supabase.functions.invoke('parse-pdf', {
      body: { base64PDF: pdfBase64 }
    })
    
    if (parseError || !parseData?.chunks) {
      console.error('Error parsing PDF:', parseError)
      throw new Error('Failed to parse PDF')
    }

    console.log(`PDF parsed into ${parseData.chunks.length} chunks`)

    // Step 2: Summarize chunks
    const { data: summaryData, error: summaryError } = await supabase.functions.invoke('summarize-chunks', {
      body: { chunks: parseData.chunks }
    })
    
    if (summaryError || !summaryData?.summary) {
      console.error('Error summarizing chunks:', summaryError)
      throw new Error('Failed to summarize content')
    }

    console.log('Content summarized successfully')

    return new Response(
      JSON.stringify({ 
        status: 'success',
        content: summaryData.summary 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error processing PDF:', error)
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})