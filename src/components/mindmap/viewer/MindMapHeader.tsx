import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MindMapHeaderProps {
  title: string;
}

export function MindMapHeader({ title }: MindMapHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/library')}
        className="h-8 w-8"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-xl font-semibold">{title}</h1>
    </div>
  );
}