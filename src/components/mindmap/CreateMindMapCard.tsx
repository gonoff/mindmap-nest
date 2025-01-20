import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function CreateMindMapCard() {
  const navigate = useNavigate();

  return (
    <Card
      className="h-[120px] border-dashed hover:border-primary cursor-pointer flex items-center justify-center bg-background/50 hover:bg-background/80 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.3)]"
      onClick={() => navigate("/new")}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Plus className="h-4 w-4" />
        <span className="text-sm">New</span>
      </div>
    </Card>
  );
}