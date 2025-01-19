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
        console.log("Checking authentication status...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
            toast({
              title: "Authentication Error",
              description: "Please try signing in again.",
              variant: "destructive",
            });
          }
          return;
        }

        if (!session) {
          console.log("No active session found");
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        console.log("Session found, verifying user...");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("User verification error:", userError);
          if (mounted) {
            setIsAuthenticated(false);
            toast({
              title: "Session Error",
              description: "Your session has expired. Please sign in again.",
              variant: "destructive",
            });
          }
        } else {
          console.log("User verified:", !!user);
          if (mounted) {
            setIsAuthenticated(!!user);
          }
        }
      } catch (error) {
        console.error("Unexpected auth error:", error);
        if (mounted) {
          setIsAuthenticated(false);
          toast({
            title: "Authentication Error",
            description: "An unexpected error occurred. Please try signing in again.",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial auth check
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, session);
      
      switch (event) {
        case 'SIGNED_IN':
          console.log("User signed in");
          setIsAuthenticated(true);
          break;
        case 'SIGNED_OUT':
          console.log("User signed out");
          setIsAuthenticated(false);
          break;
        case 'TOKEN_REFRESHED':
          console.log("Token refreshed, session:", !!session);
          setIsAuthenticated(!!session);
          break;
        case 'USER_UPDATED':
          console.log("User updated, session:", !!session);
          setIsAuthenticated(!!session);
          break;
        default:
          console.log("Unhandled auth event:", event);
      }
      setIsLoading(false);
    });

    return () => {
      console.log("Cleaning up auth subscriptions");
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

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}