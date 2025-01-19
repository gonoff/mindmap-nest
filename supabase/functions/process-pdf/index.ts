import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    // Call OpenAI to extract text from PDF URL
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a PDF content extractor. Extract and summarize the main points from the PDF URL provided.'
          },
          {
            role: 'user',
            content: `Please extract and summarize the key points from this PDF: ${pdfUrl}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!openAIResponse.ok) {
      throw new Error('Failed to process PDF with OpenAI')
    }

    const result = await openAIResponse.json()
    const extractedText = result.choices[0].message.content

    return new Response(
      JSON.stringify({ content: extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing PDF:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})