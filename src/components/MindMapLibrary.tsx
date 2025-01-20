import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "./layout/Header";
import { MindMapCard } from "./mindmap/MindMapCard";
import { CreateMindMapCard } from "./mindmap/CreateMindMapCard";

interface MindMap {
  id: string;
  title: string;
  content: any;
  created_at: string;
}

export function MindMapLibrary() {
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

  const handleRename = async (id: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from("mindmaps")
        .update({ title: newTitle })
        .eq("id", id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["mindmaps"] });

      toast({
        title: "Mind map renamed",
        description: "The mind map has been successfully renamed.",
      });
    } catch (error) {
      toast({
        title: "Error renaming mind map",
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
      <Header />
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {mindMaps?.map((mindMap) => (
          <MindMapCard
            key={mindMap.id}
            id={mindMap.id}
            title={mindMap.title}
            created_at={mindMap.created_at}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        ))}
        
        <CreateMindMapCard />
      </div>
    </div>
  );
}