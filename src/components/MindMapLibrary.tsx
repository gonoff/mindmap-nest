import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MindMap {
  id: string;
  title: string;
  content: any;
  created_at: string;
}

export function MindMapLibrary() {
  const navigate = useNavigate();
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
              className="min-w-[300px] snap-start hover:shadow-lg transition-shadow cursor-pointer"
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