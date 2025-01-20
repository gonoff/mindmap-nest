import { MoreVertical, Edit2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface MindMapCardProps {
  id: string;
  title: string;
  created_at: string;
  onDelete: (id: string) => Promise<void>;
  onRename: (id: string, newTitle: string) => Promise<void>;
}

export function MindMapCard({ id, title, created_at, onDelete, onRename }: MindMapCardProps) {
  const navigate = useNavigate();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const formattedDate = format(new Date(created_at), "MMM d, yyyy");
  const formattedTime = format(new Date(created_at), "h:mm a");

  const handleRename = async () => {
    await onRename(id, newTitle);
    setIsRenaming(false);
  };

  return (
    <Card className="relative group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 animate-floating hover:scale-[1.01] hover:-translate-y-1 bg-orange-500/20 h-[120px] shadow-[0_0_15px_rgba(249,115,22,0.3)]">
      {/* Background gradient with pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/30 transition-all duration-300 group-hover:scale-105">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[size:24px_24px]" />
      </div>
      
      {/* Content overlay with glass effect */}
      <div 
        className="relative cursor-pointer p-3 flex flex-col justify-between bg-gradient-to-b from-black/0 to-black/30 hover:to-black/40 transition-all duration-500 h-full"
        onClick={() => !isRenaming && navigate(`/mindmap/${id}`)}
      >
        <div className="flex-1">
          {isRenaming ? (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-black"
                autoFocus
              />
              <Button onClick={handleRename} variant="secondary" size="sm">
                Save
              </Button>
              <Button onClick={() => setIsRenaming(false)} variant="ghost" size="sm">
                Cancel
              </Button>
            </div>
          ) : (
            <h3 className="text-sm font-bold text-foreground line-clamp-1 drop-shadow-sm">
              {title}
            </h3>
          )}
        </div>

        <div className="flex flex-col items-end text-[10px] text-foreground/70 backdrop-blur-sm px-1.5 py-0.5 rounded-md bg-black/20 w-fit ml-auto">
          <span>{formattedDate}</span>
          <span>{formattedTime}</span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-foreground hover:bg-white/10 z-10 h-6 w-6"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setIsRenaming(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Delete
              </DropdownMenuItem>
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
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}