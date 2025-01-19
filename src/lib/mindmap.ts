import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";

// Define the schema for validation
export const MindMapNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const MindMapEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export const MindMapStructureSchema = z.object({
  nodes: z.array(MindMapNodeSchema),
  edges: z.array(MindMapEdgeSchema),
});

// Infer TypeScript types from the schema
export type MindMapNode = z.infer<typeof MindMapNodeSchema>;
export type MindMapEdge = z.infer<typeof MindMapEdgeSchema>;
export type MindMapStructure = z.infer<typeof MindMapStructureSchema>;

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

    // Validate the response data
    const validatedData = MindMapStructureSchema.parse(data);
    console.log('Generated mind map structure:', validatedData)
    return validatedData;
  } catch (error) {
    console.error('Error in generateMindMap:', error)
    throw error
  }
}