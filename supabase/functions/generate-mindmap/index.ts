import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Topic {
  title: string;
  subtopics?: Topic[];
}

interface Summary {
  topics: Topic[];
}

interface MindMapNode {
  id: string;
  label: string;
  position: { x: number; y: number };
  style?: Record<string, unknown>;
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

function generateMindMap(summary: Summary): MindMapStructure {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];
  let nodeIndex = 0;

  // First pass: Create nodes and collect level information
  const nodesByLevel: { [level: number]: MindMapNode[] } = {};
  
  function processNode(topic: Topic, level: number, parentId?: string) {
    const currentId = `node-${nodeIndex++}`;
    
    // Store node in its level group
    nodesByLevel[level] = nodesByLevel[level] || [];
    const node: MindMapNode = {
      id: currentId,
      label: topic.title,
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
    
    nodesByLevel[level].push(node);
    nodes.push(node);
    
    // Create edge if there's a parent
    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${currentId}`,
        source: parentId,
        target: currentId,
        style: {
          stroke: 'hsl(var(--primary))',
          strokeWidth: 2,
          opacity: 0.8
        }
      });
    }
    
    // Process subtopics
    if (topic.subtopics) {
      topic.subtopics.forEach(subtopic => {
        processNode(subtopic, level + 1, currentId);
      });
    }
  }
  
  // Process all root topics
  summary.topics.forEach(topic => {
    processNode(topic, 0);
  });
  
  // Second pass: Calculate and set final positions
  Object.entries(nodesByLevel).forEach(([level, nodesInLevel]) => {
    nodesInLevel.forEach((node, index) => {
      node.position = calculateNodePosition(
        parseInt(level),
        index,
        nodesInLevel.length
      );
    });
  });
  
  return { nodes, edges };
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

    console.log('Generating mind map from summary:', JSON.stringify(content))

    const mindMapStructure = generateMindMap(content)
    
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