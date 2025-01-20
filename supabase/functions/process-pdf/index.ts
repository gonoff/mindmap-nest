import "https://deno.land/x/xhr@0.1.0/mod.ts"
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
    // Get the PDF content from the request
    const formData = await req.formData()
    const file = formData.get('file')
    const title = formData.get('title')?.toString() || 'Untitled Mind Map'
    
    if (!file || !(file instanceof File)) {
      throw new Error('No PDF file provided')
    }

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader)
    if (userError || !user) {
      throw new Error('Invalid authorization')
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64PDF = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    console.log('Processing PDF file...')

    // Step 1: Parse PDF into chunks
    const { data: parseData, error: parseError } = await supabase.functions.invoke('parse-pdf', {
      body: { base64PDF }
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

    // Step 3: Generate mind map structure
    const { data: mindMapData, error: mindMapError } = await supabase.functions.invoke('generate-mindmap', {
      body: { content: summaryData.summary }
    })
    
    if (mindMapError) {
      console.error('Error generating mind map:', mindMapError)
      throw new Error('Failed to generate mind map')
    }

    console.log('Mind map structure generated')

    // Step 4: Save to database
    const { data: savedMindMap, error: saveError } = await supabase
      .from('mindmaps')
      .insert({
        title: title,
        content: mindMapData,
        user_id: user.id
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving mind map:', saveError)
      throw new Error('Failed to save mind map')
    }

    console.log('Mind map saved successfully')

    return new Response(
      JSON.stringify({
        status: 'success',
        data: savedMindMap
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