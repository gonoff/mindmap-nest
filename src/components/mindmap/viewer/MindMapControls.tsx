import { Panel } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Edit2, Save } from 'lucide-react';

interface MindMapControlsProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
}

export function MindMapControls({ isEditing, onEdit, onSave }: MindMapControlsProps) {
  return (
    <Panel position="top-right" className="flex gap-2">
      {isEditing ? (
        <Button onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      ) : (
        <Button onClick={onEdit}>
          <Edit2 className="mr-2 h-4 w-4" />
          Edit
        </Button>
      )}
    </Panel>
  );
}