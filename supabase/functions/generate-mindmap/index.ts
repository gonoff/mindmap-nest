import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MindMapNode {
  id: string;
  label: string;
}

interface MindMapEdge {
  from: string;
  to: string;
}

interface MindMapStructure {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
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
            content: `You are a mind map generator. Given a text input, analyze it and create a mind map structure with nodes and edges. 
            The output should be a valid JSON object with "nodes" and "edges" arrays. 
            Each node should have an "id" and "label". Each edge should have "from" and "to" properties referencing node IDs.
            Keep it concise with maximum 10 nodes for clarity.`
          },
          {
            role: 'user',
            content: `Generate a mind map structure for the following text: ${content}`
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${await openAIResponse.text()}`)
    }

    const aiResult = await openAIResponse.json()
    const mindMapStructure = JSON.parse(aiResult.choices[0].message.content) as MindMapStructure

    // Validate the structure
    if (!mindMapStructure.nodes || !mindMapStructure.edges) {
      // Fallback for invalid or extremely short content
      const fallbackStructure: MindMapStructure = {
        nodes: [
          { id: 'main', label: content.length > 50 ? content.substring(0, 50) + '...' : content },
          { id: 'sub1', label: 'Key Point 1' },
          { id: 'sub2', label: 'Key Point 2' }
        ],
        edges: [
          { from: 'main', to: 'sub1' },
          { from: 'main', to: 'sub2' }
        ]
      }
      
      console.log('Using fallback structure:', fallbackStructure)
      return new Response(JSON.stringify(fallbackStructure), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Generated mind map structure:', mindMapStructure)
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