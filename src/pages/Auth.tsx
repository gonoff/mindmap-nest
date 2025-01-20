import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check error:", sessionError);
          if (mounted) {
            setError("Failed to check authentication status");
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: "Please try again later.",
            });
          }
          return;
        }

        if (session) {
          console.log("Active session found, redirecting to library");
          const from = location.state?.from?.pathname || "/library";
          navigate(from, { replace: true });
          return;
        }
      } catch (err) {
        console.error("Auth check error:", err);
        if (mounted) {
          setError("An unexpected error occurred");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial session check
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, session);

      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in, redirecting to library");
        const from = location.state?.from?.pathname || "/library";
        navigate(from, { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto mt-12 p-4">
      <div className="flex flex-col items-center mb-8">
        <img 
          src="/lovable-uploads/dce45824-fdaf-4052-8802-3bd59f857e57.png" 
          alt="Instant Map Logo" 
          className="h-12 w-12 mb-4"
        />
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-orange-500 to-orange-300 text-transparent bg-clip-text">
          Welcome to Instant Map
        </h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-card border rounded-lg shadow-sm p-6">
        <SupabaseAuth 
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#F97316',
                  brandAccent: '#EA580C',
                  inputBackground: 'transparent',
                  inputText: 'inherit',
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
              container: {
                gap: '16px',
              },
            },
          }}
          providers={[]}
          redirectTo={`${window.location.origin}/library`}
        />
      </div>
    </div>
  );
}