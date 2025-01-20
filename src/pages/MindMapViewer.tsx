import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MindMapControls } from '@/components/mindmap/viewer/MindMapControls';
import { MindMapHeader } from '@/components/mindmap/viewer/MindMapHeader';
import { useMindMapData } from '@/components/mindmap/viewer/useMindMapData';

export default function MindMapViewer() {
  const { id } = useParams();
  const {
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
  } = useMindMapData(id);

  useEffect(() => {
    fetchMindMap();
  }, [id]);

  return (
    <div className="h-screen w-full">
      <MindMapHeader title={title} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{
          padding: 0.5,
          minZoom: 0.5,
          maxZoom: 1.5
        }}
        minZoom={0.2}
        maxZoom={2}
        className="bg-background"
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <MindMapControls
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={saveMindMap}
        />
        <Controls />
        <MiniMap 
          nodeColor={(node: Node) => {
            return (node.style?.background as string) || 'hsl(var(--primary))';
          }}
          maskColor="hsl(var(--background))"
        />
        <Background />
      </ReactFlow>
    </div>
  );
}