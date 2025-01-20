import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MindMapStructure, MindMapStructureSchema } from '@/lib/mindmap';
import { Connection, Edge, Node, useNodesState, useEdgesState, addEdge } from '@xyflow/react';

export function useMindMapData(id: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const fetchMindMap = async () => {
    try {
      if (!id) {
        toast({
          title: 'Error',
          description: 'Mind map ID is missing',
          variant: 'destructive',
        });
        navigate('/library');
        return;
      }

      const { data: mindmap, error } = await supabase
        .from('mindmaps')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!mindmap) {
        toast({
          title: 'Mind map not found',
          description: 'The requested mind map could not be found.',
          variant: 'destructive',
        });
        navigate('/library');
        return;
      }

      setTitle(mindmap.title);
      
      const content = MindMapStructureSchema.parse(mindmap.content);
      
      setNodes(content.nodes.map(node => ({
        ...node,
        type: 'default',
        data: { label: node.label },
        draggable: true,
        connectable: isEditing,
        position: node.position || { x: 0, y: 0 },
        style: node.style || {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
        },
      })));
      
      setEdges(content.edges.map(edge => ({
        ...edge,
        animated: true,
        style: edge.style || {
          stroke: 'hsl(var(--primary))',
        },
      })));
    } catch (error) {
      console.error('Error fetching mind map:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mind map.',
        variant: 'destructive',
      });
      navigate('/library');
    }
  };

  const saveMindMap = async () => {
    try {
      if (!id) return;

      const mindMapContent: MindMapStructure = {
        nodes: nodes.map(node => ({
          id: node.id,
          label: node.data.label,
          position: node.position,
          style: node.style,
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          style: edge.style,
        })),
      };

      const validatedContent = MindMapStructureSchema.parse(mindMapContent);

      const { error } = await supabase
        .from('mindmaps')
        .update({
          content: validatedContent,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Mind map saved successfully.',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving mind map:', error);
      toast({
        title: 'Error',
        description: 'Failed to save mind map.',
        variant: 'destructive',
      });
    }
  };

  return {
    title,
    isEditing,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    fetchMindMap,
    saveMindMap,
    setIsEditing,
  };
}