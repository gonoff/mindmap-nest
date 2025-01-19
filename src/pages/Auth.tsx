import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError } from "@supabase/supabase-js";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session check error:", sessionError);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "There was an error checking your session. Please try again.",
        });
        return;
      }

      if (session) {
        navigate("/library");
      }
    };
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);
      
      if (event === 'SIGNED_IN' && session) {
        navigate("/library");
      } else if (event === 'USER_UPDATED' && session) {
        navigate("/library");
      } else if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });

    return () => {
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