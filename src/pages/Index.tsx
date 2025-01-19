import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user;
    };

    checkAuth();
  }, []);

  const handleTryItOut = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      navigate("/library"); // Go directly to library if authenticated
    } else {
      navigate("/auth"); // Go to auth page if not authenticated
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-8 max-w-2xl px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Create Beautiful Mind Maps
        </h1>
        <p className="text-xl text-muted-foreground">
          Organize your thoughts, brainstorm ideas, and visualize connections with our intuitive mind mapping tool.
        </p>
        <Button
          onClick={handleTryItOut}
          size="lg"
          className="bg-[#F97316] hover:bg-[#F97316]/90 text-white font-semibold px-8 py-6 text-lg shadow-[0_0_15px_rgba(249,115,22,0.5)] hover:shadow-[0_0_20px_rgba(249,115,22,0.7)] transition-all duration-300"
        >
          Try it out!
        </Button>
      </div>
    </div>
  );
}