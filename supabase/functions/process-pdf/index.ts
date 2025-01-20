import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    console.log('Processing PDF from URL:', pdfUrl)

    // Call OpenAI with improved system prompt for better PDF extraction
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
            content: `You are a PDF content analyzer that extracts and structures information effectively. Follow these guidelines:
1. Focus on main sections and key points
2. Maintain hierarchical structure
3. Extract important details and examples
4. Preserve relationships between concepts
5. Summarize complex sections clearly
6. Format output in clear, structured text
7. Include section headers and subpoints
8. Limit each point to 1-2 sentences`
          },
          {
            role: 'user',
            content: `Please analyze and extract the key information from this PDF: ${pdfUrl}
            
Format the output as a structured document with:
- Clear section headers
- Bullet points for key concepts
- Brief summaries of main ideas
- Important relationships between topics`
          }
        ],
        temperature: 0.3,
        max_tokens: 2500,
      }),
    })

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text())
      throw new Error('Failed to process PDF with OpenAI')
    }

    const result = await openAIResponse.json()
    const extractedText = result.choices[0].message.content

    console.log('Successfully processed PDF, extracted length:', extractedText.length)

    return new Response(
      JSON.stringify({ 
        content: extractedText,
        status: 'success',
        processingDetails: {
          contentLength: extractedText.length,
          timestamp: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing PDF:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        errorType: 'pdf_processing_error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})