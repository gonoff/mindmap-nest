import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreateMindMapModal } from "./CreateMindMapModal";
import { useToast } from "@/components/ui/use-toast";

interface MindMap {
  id: string;
  title: string;
  content: any;
  created_at: string;
}

export function MindMapLibrary() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading mind maps...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Mind Maps</h2>
      </div>
      
      <div className="relative">
        <div className="flex overflow-x-auto pb-6 gap-4 snap-x">
          {mindMaps?.map((mindMap) => (
            <Card key={mindMap.id} className="min-w-[300px] snap-start hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="truncate">{mindMap.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Created: {new Date(mindMap.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
          
          <Button
            variant="outline"
            size="icon"
            className="min-w-[300px] h-[160px] border-dashed flex flex-col gap-2 hover:border-primary snap-start"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm">Create New Mind Map</span>
          </Button>
        </div>
      </div>

      <CreateMindMapModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </div>
  );
}