import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to calculate node positions in a radial layout
function calculateNodePosition(level: number, index: number, totalNodesInLevel: number, parentX = 0, parentY = 0) {
  const LEVEL_RADIUS = 250; // Increased spacing between levels
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
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a mind map generator that creates well-organized, hierarchical mind maps from text. Follow these guidelines:

1. Create a clear hierarchical structure with no more than 3-4 levels deep
2. The main topic should be the central node (level 0)
3. Create 4-6 primary branches for major themes (level 1)
4. Add secondary nodes (level 2) only for important subtopics
5. Limit the number of nodes per level:
   - Level 1: 4-6 nodes
   - Level 2: 3-4 nodes per parent
   - Level 3: 2-3 nodes per parent if needed
6. Keep node labels concise (max 30 characters)
7. Ensure even distribution of nodes around their parent
8. Preserve key information while maintaining clarity

Return ONLY a JSON object with this structure:
{
  "nodes": [
    { 
      "id": "string",
      "label": "string",
      "level": number, // 0 for center, 1 for main branches, etc.
      "parentId": "string" // optional, for positioning
    }
  ],
  "edges": [
    { "id": "string", "source": "string", "target": "string" }
  ]
}`
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
    console.log('OpenAI response:', aiResult)

    if (!aiResult.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI')
    }

    let rawMindMap
    try {
      rawMindMap = JSON.parse(aiResult.choices[0].message.content)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', aiResult.choices[0].message.content)
      throw new Error('Failed to parse mind map structure from OpenAI response')
    }

    // Process the nodes to add positions
    const processedNodes = rawMindMap.nodes.map(node => {
      // Group nodes by level
      const nodesInSameLevel = rawMindMap.nodes.filter(n => n.level === node.level);
      const levelIndex = nodesInSameLevel.findIndex(n => n.id === node.id);
      
      // Find parent node if it exists
      const parentNode = node.parentId 
        ? rawMindMap.nodes.find(n => n.id === node.parentId)
        : null;
      
      // Calculate position based on level and parent
      const position = calculateNodePosition(
        node.level,
        levelIndex,
        nodesInSameLevel.length,
        parentNode?.position?.x,
        parentNode?.position?.y
      );

      return {
        id: node.id,
        label: node.label,
        position,
        // Add styling based on level
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
      };
    });

    const mindMapStructure = {
      nodes: processedNodes,
      edges: rawMindMap.edges.map(edge => ({
        ...edge,
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }
      }))
    };

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