import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        if (mounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          toast({
            title: "Authentication Error",
            description: "Please try signing in again.",
            variant: "destructive",
          });
        }
      }
    };

    // Initial auth check
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event);
      
      switch (event) {
        case 'SIGNED_IN':
          setIsAuthenticated(true);
          break;
        case 'SIGNED_OUT':
          setIsAuthenticated(false);
          break;
        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
          setIsAuthenticated(!!session);
          break;
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Only redirect if we're certain about the authentication state
  if (isAuthenticated === false) {
    // Prevent infinite loops by checking if we're already on the auth page
    if (location.pathname !== '/auth') {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
}