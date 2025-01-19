import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Home, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface MindMap {
  id: string;
  title: string;
  content: any;
  created_at: string;
}

export function MindMapLibrary() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mindMaps, isLoading } = useQuery({
    queryKey: ["mindmaps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mindmaps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching mind maps",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as MindMap[];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("mindmaps")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["mindmaps"] });

      toast({
        title: "Mind map deleted",
        description: "The mind map has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error deleting mind map",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading mind maps...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-transparent"
          onClick={() => navigate("/")}
        >
          <Home className="h-8 w-8 text-[#F97316]" />
        </Button>
        <h2 className="text-2xl font-bold">Your Mind Maps</h2>
      </div>
      
      <div className="relative">
        <div className="flex overflow-x-auto pb-6 gap-4 snap-x">
          {mindMaps?.map((mindMap) => (
            <Card 
              key={mindMap.id} 
              className="min-w-[300px] snap-start hover:shadow-lg transition-shadow relative group"
            >
              <div 
                className="cursor-pointer"
                onClick={() => navigate(`/mindmap/${mindMap.id}`)}
              >
                <CardHeader>
                  <CardTitle className="truncate">{mindMap.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(mindMap.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Mind Map</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{mindMap.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(mindMap.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          ))}
          
          <Button
            variant="outline"
            size="icon"
            className="min-w-[300px] h-[160px] border-dashed flex flex-col gap-2 hover:border-primary snap-start"
            onClick={() => navigate("/new")}
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm">Create New Mind Map</span>
          </Button>
        </div>
      </div>
    </div>
  );
}