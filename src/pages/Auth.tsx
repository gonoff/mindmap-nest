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
    // Single auth state listener instead of separate session check
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      if (session) {
        console.log("Session found, redirecting to library");
        navigate("/library");
      }
    });

    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth subscriptions");
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