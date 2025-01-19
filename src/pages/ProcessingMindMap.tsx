import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateMindMap } from "@/lib/mindmap";
import { supabase } from "@/integrations/supabase/client";

export default function ProcessingMindMap() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const { content, title } = location.state as { content: string; title: string };

  useEffect(() => {
    const processContent = async () => {
      try {
        // Simulate initial processing
        setProgress(25);
        await new Promise(resolve => setTimeout(resolve, 800));

        // Get the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to create a mind map",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        // Update progress before generation
        setProgress(50);
        await new Promise(resolve => setTimeout(resolve, 800));

        // Generate mind map structure from content
        const mindMapStructure = await generateMindMap(content);

        // Update progress after generation
        setProgress(75);
        await new Promise(resolve => setTimeout(resolve, 800));

        // Create mind map entry with the generated structure
        const { data, error } = await supabase
          .from("mindmaps")
          .insert({
            title: title,
            content: mindMapStructure,
            user_id: user.id
          })
          .select()
          .single();

        if (error) throw error;

        // Final progress update
        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));

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
        navigate("/new");
      }
    };

    processContent();
  }, [content, navigate, toast, title]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-orange-50 to-white">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="relative">
            <Brain className="w-20 h-20 text-orange-500 animate-pulse" />
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">
          Generating Your Mind Map
        </h1>
        
        <p className="text-gray-600">
          Our AI is analyzing your content and creating a beautiful mind map visualization.
          This may take a few moments...
        </p>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500">
            {progress < 25 && "Initializing..."}
            {progress >= 25 && progress < 50 && "Processing content..."}
            {progress >= 50 && progress < 75 && "Generating mind map..."}
            {progress >= 75 && progress < 100 && "Finalizing..."}
            {progress === 100 && "Complete!"}
          </p>
        </div>
      </div>
    </div>
  );
}