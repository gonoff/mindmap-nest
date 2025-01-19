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

    // Use OpenAI to analyze the content and generate a mind map structure
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a mind map generator. Given a text input, analyze it and create a mind map structure.
            Return ONLY a JSON object with this exact structure, no markdown or other formatting:
            {
              "nodes": [
                { "id": "string", "label": "string", "position": { "x": number, "y": number } }
              ],
              "edges": [
                { "id": "string", "source": "string", "target": "string" }
              ]
            }
            Keep it concise with maximum 10 nodes for clarity.
            Position nodes in a visually appealing way, with the main topic at (0,0) and related topics around it.`
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const aiResult = await openAIResponse.json();
    console.log('OpenAI response:', aiResult);

    if (!aiResult.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    let mindMapStructure;
    try {
      mindMapStructure = JSON.parse(aiResult.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', aiResult.choices[0].message.content);
      throw new Error('Failed to parse mind map structure from OpenAI response');
    }

    // Validate the structure
    if (!mindMapStructure.nodes || !mindMapStructure.edges || 
        !Array.isArray(mindMapStructure.nodes) || !Array.isArray(mindMapStructure.edges)) {
      console.error('Invalid mind map structure:', mindMapStructure);
      throw new Error('Invalid mind map structure received from OpenAI');
    }

    return new Response(JSON.stringify(mindMapStructure), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating mind map:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});