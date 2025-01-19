import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { MindMapStructure } from '@/lib/mindmap';

export default function MindMapViewer() {
  const { id } = useParams();
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
      const { data: mindmap, error } = await supabase
        .from('mindmaps')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!mindmap) {
        toast({
          title: 'Mind map not found',
          description: 'The requested mind map could not be found.',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      setTitle(mindmap.title);
      // Add type assertion to ensure TypeScript knows this is a MindMapStructure
      const content = mindmap.content as MindMapStructure;
      setNodes(content.nodes.map(node => ({
        ...node,
        type: 'default',
        data: { label: node.label },
      })));
      setEdges(content.edges);
    } catch (error) {
      console.error('Error fetching mind map:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mind map.',
        variant: 'destructive',
      });
    }
  };

  const saveMindMap = async () => {
    try {
      const { error } = await supabase
        .from('mindmaps')
        .update({
          content: {
            nodes: nodes.map(node => ({
              id: node.id,
              label: node.data.label,
            })),
            edges,
          } as MindMapStructure,
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

  useEffect(() => {
    fetchMindMap();
  }, [id]);

  return (
    <div className="h-screen w-full">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-background"
      >
        <Panel position="top-right" className="flex gap-2">
          {isEditing ? (
            <Button onClick={saveMindMap}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </Panel>
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </div>
  );
}