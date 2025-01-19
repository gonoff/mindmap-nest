import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface MindMapCardProps {
  id: string;
  title: string;
  created_at: string;
  onDelete: (id: string) => Promise<void>;
}

export function MindMapCard({ id, title, created_at, onDelete }: MindMapCardProps) {
  const navigate = useNavigate();

  const formattedDate = format(new Date(created_at), "MMM d, yyyy 'at' h:mm a");

  return (
    <Card className="aspect-square relative group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Background gradient with pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[size:24px_24px]" />
      </div>
      
      {/* Content overlay with glass effect */}
      <div 
        className="absolute inset-0 cursor-pointer p-6 flex flex-col bg-gradient-to-b from-black/0 to-black/20 hover:to-black/30 transition-all duration-300"
        onClick={() => navigate(`/mindmap/${id}`)}
      >
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 drop-shadow-sm">
            {title}
          </h3>
          <p className="text-sm text-white/70 backdrop-blur-sm inline-block px-2 py-1 rounded-full bg-black/10">
            Created {formattedDate}
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-tl-full transform translate-x-16 translate-y-16" />
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-white/10 z-10"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mind Map</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}