import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Brain, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateMindMap } from "@/lib/mindmap";
import { supabase } from "@/integrations/supabase/client";

export default function ProcessingMindMap() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Validate location state
    if (!location.state?.content || !location.state?.title) {
      console.error("Missing required state:", location.state);
      toast({
        title: "Error",
        description: "Missing required content. Please try again.",
        variant: "destructive",
      });
      navigate("/new");
      return;
    }

    const { content, title } = location.state;

    const processContent = async () => {
      try {
        // Check authentication first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          toast({
            title: "Authentication Error",
            description: "Please sign in again to continue.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        // Initial delay and progress
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProgress(20);

        // Get the current user's ID with delay
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        await new Promise(resolve => setTimeout(resolve, 1200));
        setProgress(35);
        
        if (userError || !user) {
          console.error("User error:", userError);
          toast({
            title: "Authentication required",
            description: "Please sign in to create a mind map",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        // Processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProgress(50);

        console.log('Generating mind map with content:', content.substring(0, 100) + '...');

        // Generate mind map structure from content
        const mindMapStructure = await generateMindMap(content);
        await new Promise(resolve => setTimeout(resolve, 1200));
        setProgress(75);

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

        if (error) {
          console.error('Error inserting mind map:', error);
          throw error;
        }

        // Final progress and delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, 800));

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
  }, [navigate, toast, location.state]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="relative flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-background rounded-full p-6 border border-border shadow-lg">
              {progress < 100 ? (
                <Loader className="w-12 h-12 text-primary animate-spin" />
              ) : (
                <Brain className="w-12 h-12 text-primary" />
              )}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground text-center">
            {progress === 100 ? "Mind Map Ready!" : "Generating Your Mind Map"}
          </h1>
          
          <p className="text-muted-foreground text-center max-w-sm">
            {progress < 35 && "Analyzing your content..."}
            {progress >= 35 && progress < 50 && "Processing structure..."}
            {progress >= 50 && progress < 75 && "Generating mind map..."}
            {progress >= 75 && progress < 100 && "Finalizing..."}
            {progress === 100 && "Redirecting you to your new mind map..."}
          </p>
          
          <div className="w-full space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {progress}% Complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}