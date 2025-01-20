import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/library");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/library");
      }
      
      if (event === 'USER_UPDATED') {
        checkAuth();
      }
    });

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Handle auth errors through the auth state change listener
  useEffect(() => {
    const handleAuthError = (error: Error) => {
      const errorMessage = error.message;
      if (errorMessage.includes('user_already_exists')) {
        toast({
          title: "Account Already Exists",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session, error) => {
      if (error) {
        handleAuthError(error);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="w-full flex justify-start mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
        
        <div className="bg-card p-8 rounded-lg border shadow-sm">
          <div className="flex flex-col items-center gap-6 mb-8">
            <img 
              src="/lovable-uploads/dce45824-fdaf-4052-8802-3bd59f857e57.png" 
              alt="Instant Map Logo" 
              className="h-12 w-12"
            />
            <h2 className="text-2xl font-bold text-center">
              Welcome to Instant Map
            </h2>
          </div>
          
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#F97316',
                    brandAccent: '#EA580C',
                  },
                },
              },
            }}
            providers={["google"]}
          />
        </div>
      </div>
    </div>
  );
}