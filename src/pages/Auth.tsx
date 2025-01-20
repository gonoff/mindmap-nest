import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log("Checking initial session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          if (mounted) {
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: "There was an error checking your session. Please try again.",
            });
          }
          return;
        }

        if (session && mounted) {
          console.log("Active session found, redirecting...");
          navigate("/library");
        }
      } catch (error) {
        console.error("Unexpected error during session check:", error);
        if (mounted) {
          toast({
            variant: "destructive",
            title: "System Error",
            description: "An unexpected error occurred. Please refresh and try again.",
          });
        }
      }
    };

    // Initial auth check
    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in successfully");
        navigate("/library");
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
      } else if (event === 'USER_UPDATED' && session) {
        console.log("User profile updated");
        navigate("/library");
      }
    });

    return () => {
      console.log("Cleaning up auth component...");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="container max-w-md mx-auto mt-12 p-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Welcome Back</h1>
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
          style: {
            button: {
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              padding: '8px 12px',
            },
            input: {
              borderRadius: '6px',
              fontSize: '14px',
              padding: '8px 12px',
            },
            anchor: {
              color: '#F97316',
            },
          },
        }}
        providers={[]}
        redirectTo={`${window.location.origin}/library`}
      />
    </div>
  );
}