import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function CreateMindMapCard() {
  const navigate = useNavigate();

  return (
    <Card
      className="aspect-square border-dashed hover:border-primary cursor-pointer flex items-center justify-center bg-background/50 hover:bg-background/80 transition-colors"
      onClick={() => navigate("/new")}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Plus className="h-8 w-8" />
        <span className="text-sm">Create New Mind Map</span>
      </div>
    </Card>
  );
}