import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Zap, Share2, FileText } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user;
    };

    checkAuth();
  }, []);

  const handleTryItOut = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      navigate("/library");
    } else {
      navigate("/auth");
    }
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="w-full border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/dce45824-fdaf-4052-8802-3bd59f857e57.png" 
              alt="Instant Map Logo" 
              className="h-8 w-8"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-300 text-transparent bg-clip-text">
              Instant Map
            </span>
          </div>
          <Button 
            onClick={handleLogin}
            variant="outline" 
            className="border-orange-500/20 hover:bg-orange-500/10"
          >
            Login
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="text-center space-y-8 max-w-4xl px-4 mx-auto py-16">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-orange-300 text-transparent bg-clip-text">
              Instant Map
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground">
              Transform Text into Beautiful Mind Maps Instantly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 py-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-orange-500" />}
              title="Instant Conversion"
              description="Convert any text into a structured mind map in seconds using AI technology"
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8 text-orange-500" />}
              title="AI-Powered"
              description="Advanced AI ensures your mind maps capture all key concepts and relationships"
            />
            <FeatureCard
              icon={<Share2 className="w-8 h-8 text-orange-500" />}
              title="Easy Sharing"
              description="Share your mind maps with others or export them for presentations"
            />
            <FeatureCard
              icon={<FileText className="w-8 h-8 text-orange-500" />}
              title="Any Text Source"
              description="Works with articles, documents, notes, or any text content you need to visualize"
            />
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleTryItOut}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-6 text-lg shadow-[0_0_15px_rgba(249,115,22,0.5)] hover:shadow-[0_0_20px_rgba(249,115,22,0.7)] transition-all duration-300"
            >
              Start Creating Mind Maps
            </Button>
            <p className="text-sm text-muted-foreground">
              No complex setup required. Start converting your text instantly.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Instant Map</h3>
              <p className="text-sm text-muted-foreground">
                Transform your ideas into visual mind maps with the power of AI.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Use Cases</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About Us</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Instant Map. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-colors duration-300">
      <div className="space-y-4">
        <div className="rounded-full w-12 h-12 flex items-center justify-center bg-orange-500/10">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}