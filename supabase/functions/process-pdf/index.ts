import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { pdfUrl } = await req.json()

    if (!pdfUrl) {
      throw new Error('No PDF URL provided')
    }

    console.log('Downloading PDF from URL:', pdfUrl)

    // Download the PDF file
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) {
      console.error('Failed to download PDF:', pdfResponse.status, pdfResponse.statusText)
      throw new Error(`Failed to download PDF: ${pdfResponse.statusText}`)
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Convert ArrayBuffer to Base64
    const pdfArrayBuffer = await pdfResponse.arrayBuffer()
    const pdfBase64 = btoa(
      new Uint8Array(pdfArrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    )

    console.log('PDF downloaded and converted to base64')

    // Parse PDF into chunks
    console.log('Calling parse-pdf function...')
    const { data: parseData, error: parseError } = await supabase.functions.invoke('parse-pdf', {
      body: { base64PDF: pdfBase64 }
    })
    
    if (parseError) {
      console.error('Error from parse-pdf function:', parseError)
      throw new Error(`Parse PDF error: ${parseError.message}`)
    }
    
    if (!parseData?.chunks) {
      console.error('No chunks returned from parse-pdf:', parseData)
      throw new Error('No text chunks extracted from PDF')
    }

    console.log(`PDF parsed into ${parseData.chunks.length} chunks`)

    // Summarize chunks
    console.log('Calling summarize-chunks function...')
    const { data: summaryData, error: summaryError } = await supabase.functions.invoke('summarize-chunks', {
      body: { chunks: parseData.chunks }
    })
    
    if (summaryError) {
      console.error('Error from summarize-chunks function:', summaryError)
      throw new Error(`Summarize chunks error: ${summaryError.message}`)
    }
    
    if (!summaryData?.summary) {
      console.error('No summary returned from summarize-chunks:', summaryData)
      throw new Error('Failed to generate summary')
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
        message: error.message,
        details: error.stack
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