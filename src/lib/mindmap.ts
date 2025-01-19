import { supabase } from "@/integrations/supabase/client";

export interface MindMapNode {
  id: string;
  label: string;
}

export interface MindMapEdge {
  from: string;
  to: string;
}

export interface MindMapStructure {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export const generateMindMap = async (content: string): Promise<MindMapStructure> => {
  try {
    console.log('Calling generate-mindmap function with content:', content.substring(0, 100) + '...')
    
    const { data, error } = await supabase.functions.invoke('generate-mindmap', {
      body: { content }
    })

    if (error) {
      console.error('Error from generate-mindmap function:', error)
      throw new Error(error.message || 'Failed to generate mind map')
    }

    console.log('Generated mind map structure:', data)
    return data as MindMapStructure
  } catch (error) {
    console.error('Error in generateMindMap:', error)
    throw error
  }
}