import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function calculateNodePosition(level: number, index: number, totalNodesInLevel: number, parentX = 0, parentY = 0) {
  const LEVEL_RADIUS = 250;
  const angle = (2 * Math.PI * index) / totalNodesInLevel - Math.PI / 2;
  
  return {
    x: parentX + LEVEL_RADIUS * level * Math.cos(angle),
    y: parentY + LEVEL_RADIUS * level * Math.sin(angle)
  };
}

serve(async (req) => {
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
            content: `You are a mind map generator that creates clear, hierarchical mind maps from text. Output ONLY valid JSON with this structure:
{
  "nodes": [
    {
      "id": "string",
      "label": "string (30 chars max)",
      "level": number (0 for center, 1-3 for branches)
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "string (node id)",
      "target": "string (node id)"
    }
  ]
}

Follow these guidelines:
1. Create a clear central theme (level 0)
2. 4-6 main concepts (level 1)
3. 2-4 supporting ideas per main concept (level 2)
4. Optional details (level 3, max 2 per level 2 node)
5. Keep labels clear and concise (under 30 chars)
6. Ensure logical connections between nodes
7. Maintain hierarchical structure
8. Focus on key relationships`
          },
          {
            role: 'user',
            content
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    })

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${errorText}`)
    }

    const aiResult = await openAIResponse.json()
    console.log('OpenAI response:', JSON.stringify(aiResult))

    if (!aiResult.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI')
    }

    let rawMindMap
    try {
      rawMindMap = JSON.parse(aiResult.choices[0].message.content.trim())
      
      if (!Array.isArray(rawMindMap.nodes) || !Array.isArray(rawMindMap.edges)) {
        throw new Error('Invalid mind map structure: missing nodes or edges arrays')
      }

      rawMindMap.nodes.forEach((node: any, index: number) => {
        if (!node.id || !node.label || typeof node.level !== 'number') {
          throw new Error(`Invalid node at index ${index}: ${JSON.stringify(node)}`)
        }
      })

      rawMindMap.edges.forEach((edge: any, index: number) => {
        if (!edge.id || !edge.source || !edge.target) {
          throw new Error(`Invalid edge at index ${index}: ${JSON.stringify(edge)}`)
        }
      })

    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', aiResult.choices[0].message.content)
      throw new Error(`Failed to parse mind map structure: ${parseError.message}`)
    }

    const processedNodes = rawMindMap.nodes.map(node => {
      const nodesInSameLevel = rawMindMap.nodes.filter(n => n.level === node.level)
      const levelIndex = nodesInSameLevel.findIndex(n => n.id === node.id)
      
      const parentEdge = rawMindMap.edges.find(e => e.target === node.id)
      const parentNode = parentEdge 
        ? rawMindMap.nodes.find(n => n.id === parentEdge.source)
        : null
      
      const position = calculateNodePosition(
        node.level,
        levelIndex,
        nodesInSameLevel.length,
        parentNode?.position?.x,
        parentNode?.position?.y
      )

      return {
        id: node.id,
        label: node.label,
        position,
        style: {
          background: node.level === 0 ? 'hsl(var(--primary))' : 'hsl(var(--background))',
          color: node.level === 0 ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--primary))',
          borderRadius: '8px',
          padding: '12px 20px',
          fontSize: node.level === 0 ? '16px' : '14px',
          fontWeight: node.level <= 1 ? 'bold' : 'normal',
          width: 'auto',
          maxWidth: '200px',
        }
      }
    })

    const mindMapStructure = {
      nodes: processedNodes,
      edges: rawMindMap.edges.map(edge => ({
        ...edge,
        type: 'smoothstep',
        animated: false,
        style: { 
          stroke: 'hsl(var(--primary))',
          strokeWidth: 2,
          opacity: 0.8
        }
      }))
    }

    console.log('Generated mind map structure:', JSON.stringify(mindMapStructure))

    return new Response(
      JSON.stringify(mindMapStructure),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

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