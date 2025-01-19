import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Home, MoreVertical, UserRound, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MindMap {
  id: string;
  title: string;
  content: any;
  created_at: string;
}

export function MindMapLibrary() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const { data: mindMaps, isLoading } = useQuery({
    queryKey: ["mindmaps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mindmaps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching mind maps",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as MindMap[];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("mindmaps")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["mindmaps"] });

      toast({
        title: "Mind map deleted",
        description: "The mind map has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error deleting mind map",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading mind maps...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-transparent"
            onClick={() => navigate("/")}
          >
            <Home className="h-8 w-8 text-[#F97316]" />
          </Button>
          <h2 className="text-2xl font-bold">Your Mind Maps</h2>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarFallback>
                  <UserRound className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <Settings className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mindMaps?.map((mindMap) => (
          <Card 
            key={mindMap.id} 
            className="aspect-square relative group overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 border-none shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div 
              className="absolute inset-0 cursor-pointer p-6 flex flex-col"
              onClick={() => navigate(`/mindmap/${mindMap.id}`)}
            >
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                {mindMap.title}
              </h3>
              <p className="text-sm text-white/70">
                {new Date(mindMap.created_at).toLocaleDateString()}
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-white/10"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Mind Map</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{mindMap.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(mindMap.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        ))}
        
        <Card
          className="aspect-square border-dashed hover:border-primary cursor-pointer flex items-center justify-center bg-background/50 hover:bg-background/80 transition-colors"
          onClick={() => navigate("/new")}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Plus className="h-8 w-8" />
            <span className="text-sm">Create New Mind Map</span>
          </div>
        </Card>
      </div>
    </div>
  );
}