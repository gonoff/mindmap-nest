import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { content } = await req.json()
    
    if (!content) {
      throw new Error('No content provided')
    }

    console.log('Generating mind map for content:', content.substring(0, 100) + '...')

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
            content: `You are a mind map generator that creates comprehensive and detailed mind maps from text. Follow these guidelines:

1. Create a hierarchical structure that preserves ALL important information from the source text
2. The main topic should be the central node
3. Create primary branches for major themes or sections
4. Include secondary and tertiary nodes to capture details and supporting information
5. Preserve specific examples, data points, and key details from the source
6. Ensure relationships between concepts are properly represented through the node hierarchy
7. Use clear, concise labels that maintain the original meaning
8. Don't summarize or omit information - find ways to organize it all meaningfully

Return ONLY a JSON object with this structure (no markdown):
{
  "nodes": [
    { "id": "string", "label": "string", "position": { "x": number, "y": number } }
  ],
  "edges": [
    { "id": "string", "source": "string", "target": "string" }
  ]
}

Position nodes in a radial layout starting from (0,0) for the central node, with child nodes positioned around their parents in a way that prevents overlap.`
          },
          {
            role: 'user',
            content
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent and precise output
        max_tokens: 4000, // Increased token limit to handle more detailed responses
      }),
    })

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${errorText}`)
    }

    const aiResult = await openAIResponse.json()
    console.log('OpenAI response:', aiResult)

    if (!aiResult.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI')
    }

    let mindMapStructure
    try {
      mindMapStructure = JSON.parse(aiResult.choices[0].message.content)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', aiResult.choices[0].message.content)
      throw new Error('Failed to parse mind map structure from OpenAI response')
    }

    // Validate the structure
    if (!mindMapStructure.nodes || !mindMapStructure.edges || 
        !Array.isArray(mindMapStructure.nodes) || !Array.isArray(mindMapStructure.edges)) {
      console.error('Invalid mind map structure:', mindMapStructure)
      throw new Error('Invalid mind map structure received from OpenAI')
    }

    return new Response(JSON.stringify(mindMapStructure), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error generating mind map:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})