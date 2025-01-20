import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MindMapNode {
  id: string;
  label: string;
  position: { x: number; y: number };
  style?: Record<string, unknown>;
  summary?: string;
}

interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  style?: Record<string, unknown>;
}

interface MindMapStructure {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

interface GPTResponse {
  nodes: Array<{
    id: string;
    label: string;
    summary?: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
  }>;
}

function calculateNodePosition(level: number, index: number, totalNodesInLevel: number) {
  const SPACING_MULTIPLIER = 200;
  const LEVEL_SPACING = 150;
  
  if (level === 0) return { x: 0, y: 0 };
  
  const angleStep = (2 * Math.PI) / totalNodesInLevel;
  const angle = index * angleStep - Math.PI / 2;
  const radius = level * LEVEL_SPACING;
  
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

async function generateMindMapWithGPT(content: string): Promise<MindMapStructure> {
  const prompt = `You are an AI assistant that creates mind maps from voice transcripts. You will receive a text transcription of someone's speech. Identify main topics, subtopics, and sub-subtopics, and produce a JSON with an array of nodes and edges. Each node must have a short, clear label. If there's repeated content, merge it into a single node. Return only JSON in this shape:

  { "nodes": [ { "id": "node-0", "label": "Main Topic A", "summary": "(optional summary)" }, ... ], "edges": [ { "from": "node-0", "to": "node-1" }, ... ] }
  
  Do not include any additional commentary or disclaimers.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    console.error('OpenAI API error:', await response.text());
    throw new Error('Failed to generate mind map structure');
  }

  const result = await response.json();
  const gptResponse: GPTResponse = JSON.parse(result.choices[0].message.content);

  // Convert GPT response to our mind map structure
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];
  const nodesByLevel: { [level: number]: MindMapNode[] } = {};

  // First pass: Create nodes and collect level information
  const nodeLevels = new Map<string, number>();
  
  // Calculate node levels based on edge relationships
  gptResponse.edges.forEach(({ from, to }) => {
    if (!nodeLevels.has(from)) nodeLevels.set(from, 0);
    nodeLevels.set(to, (nodeLevels.get(from) || 0) + 1);
  });

  // Create nodes with positions based on their levels
  gptResponse.nodes.forEach(node => {
    const level = nodeLevels.get(node.id) || 0;
    nodesByLevel[level] = nodesByLevel[level] || [];
    
    const newNode: MindMapNode = {
      id: node.id,
      label: node.label,
      position: { x: 0, y: 0 }, // Temporary position
      style: {
        background: level === 0 ? 'hsl(var(--primary))' : 'rgba(0, 0, 0, 0.8)',
        color: level === 0 ? 'hsl(var(--primary-foreground))' : '#fff',
        border: '1px solid hsl(var(--primary))',
        borderRadius: '8px',
        padding: '12px 20px',
        fontSize: level === 0 ? '18px' : '14px',
        fontWeight: level <= 1 ? 'bold' : 'normal',
        width: 'auto',
        maxWidth: '200px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }
    };
    
    if (node.summary) {
      newNode.summary = node.summary;
    }
    
    nodesByLevel[level].push(newNode);
    nodes.push(newNode);
  });

  // Calculate final positions
  Object.entries(nodesByLevel).forEach(([level, nodesInLevel]) => {
    nodesInLevel.forEach((node, index) => {
      node.position = calculateNodePosition(
        parseInt(level),
        index,
        nodesInLevel.length
      );
    });
  });

  // Create edges
  gptResponse.edges.forEach(({ from, to }) => {
    edges.push({
      id: `edge-${from}-${to}`,
      source: from,
      target: to,
      style: {
        stroke: 'hsl(var(--primary))',
        strokeWidth: 2,
        opacity: 0.8
      }
    });
  });

  return { nodes, edges };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    
    if (!content) {
      throw new Error('No content provided');
    }

    console.log('Processing content for mind map generation:', content.substring(0, 100) + '...');

    const mindMapStructure = await generateMindMapWithGPT(content);
    
    console.log('Generated mind map structure:', JSON.stringify(mindMapStructure));

    return new Response(
      JSON.stringify(mindMapStructure),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-mindmap function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});