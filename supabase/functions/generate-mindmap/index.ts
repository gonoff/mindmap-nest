import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function calculateNodePosition(level: number, index: number, totalNodesInLevel: number) {
  const SPACING_MULTIPLIER = 200;
  const LEVEL_SPACING = 150;
  
  if (level === 0) return { x: 0, y: 0 };
  
  // Calculate angle based on index and total nodes in level
  const angleStep = (2 * Math.PI) / totalNodesInLevel;
  const angle = index * angleStep - Math.PI / 2; // Start from top
  
  // Calculate radius based on level
  const radius = level * LEVEL_SPACING;
  
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
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
            content: `You are a mind map generator that creates clear, hierarchical mind maps from text content. 
            Create a mind map with the following structure:

            1. Central Theme (level 0):
               - One central concept that captures the main topic
            
            2. Main Branches (level 1):
               - 4-6 key concepts that directly relate to the central theme
               - Use clear, concise labels (max 25 characters)
            
            3. Sub-branches (level 2):
               - 2-3 supporting ideas per main branch
               - Provide specific details or examples
               - Keep labels focused and brief
            
            Output ONLY valid JSON with this exact structure:
            {
              "nodes": [
                {
                  "id": "string",
                  "label": "string (max 25 chars)",
                  "level": number (0-2)
                }
              ],
              "edges": [
                {
                  "id": "string",
                  "source": "string (parent node id)",
                  "target": "string (child node id)"
                }
              ]
            }`
          },
          {
            role: 'user',
            content
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
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
        throw new Error('Invalid mind map structure')
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', aiResult.choices[0].message.content)
      throw new Error(`Failed to parse mind map structure: ${parseError.message}`)
    }

    // Group nodes by level for position calculation
    const nodesByLevel = rawMindMap.nodes.reduce((acc, node) => {
      acc[node.level] = acc[node.level] || [];
      acc[node.level].push(node);
      return acc;
    }, {});

    // Calculate positions for each node
    const processedNodes = rawMindMap.nodes.map(node => {
      const nodesInLevel = nodesByLevel[node.level];
      const indexInLevel = nodesInLevel.findIndex(n => n.id === node.id);
      const position = calculateNodePosition(node.level, indexInLevel, nodesInLevel.length);

      return {
        id: node.id,
        label: node.label,
        position,
        style: {
          background: node.level === 0 ? 'hsl(var(--primary))' : 'rgba(0, 0, 0, 0.8)',
          color: node.level === 0 ? 'hsl(var(--primary-foreground))' : '#fff',
          border: '1px solid hsl(var(--primary))',
          borderRadius: '8px',
          padding: '12px 20px',
          fontSize: node.level === 0 ? '18px' : '14px',
          fontWeight: node.level <= 1 ? 'bold' : 'normal',
          width: 'auto',
          maxWidth: '200px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        }
      }
    })

    const mindMapStructure = {
      nodes: processedNodes,
      edges: rawMindMap.edges.map(edge => ({
        ...edge,
        type: 'smoothstep',
        animated: true,
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