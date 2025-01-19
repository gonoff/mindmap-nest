import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateMindMap } from "@/lib/mindmap";
import { ContentInput } from "@/components/mindmap/ContentInput";
import { InputActions } from "@/components/mindmap/InputActions";

export default function NewMindMap() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTextSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some text or use another input method",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a mind map",
          variant: "destructive",
        });
        return;
      }

      // Generate mind map structure from content
      const mindMapStructure = await generateMindMap(content);

      // Create mind map entry with the generated structure
      const { data, error } = await supabase
        .from("mindmaps")
        .insert({
          title: content.split('\n')[0].slice(0, 50) || "New Mind Map",
          content: mindMapStructure,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Mind map created successfully",
      });

      navigate(`/mindmap/${data.id}`);
    } catch (error: any) {
      console.error('Error creating mind map:', error);
      toast({
        title: "Error creating mind map",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Mind Map</h1>
      </div>
      
      <div className="space-y-6">
        <ContentInput 
          content={content}
          setContent={setContent}
          isLoading={isLoading}
        />
        <InputActions 
          onTextSubmit={handleTextSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}