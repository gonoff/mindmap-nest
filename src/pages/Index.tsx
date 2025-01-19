import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Zap, Share2, FileText, Sparkles, Code, Users } from "lucide-react";

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
      {/* Island Header with glow effect and floating animation */}
      <div className="w-full p-4">
        <header className="mx-auto max-w-7xl animate-floating backdrop-blur-md bg-background/60 rounded-[2rem] border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-shadow">
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
              className="border-orange-500/20 hover:bg-orange-500/10 backdrop-blur-sm"
            >
              Login
            </Button>
          </div>
        </header>
      </div>

      <main className="flex-grow">
        {/* Hero Section with Radial Gradient */}
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15)_0%,transparent_70%)]" />
          <div className="text-center space-y-8 max-w-4xl px-4 mx-auto py-16 relative">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-orange-300 text-transparent bg-clip-text">
                Instant Map
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground">
                Transform Text into Beautiful Mind Maps Instantly
              </p>
            </div>

            {/* Feature Cards Grid */}
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

            {/* CTA Button */}
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
        </div>

        {/* How It Works Section */}
        <section className="py-20 bg-orange-500/5 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-orange-500 to-orange-300 text-transparent bg-clip-text animate-fade-in">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4 animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
                <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center animate-floating">
                  <Code className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold">1. Input Your Text</h3>
                <p className="text-muted-foreground">
                  Simply paste your text content - articles, notes, or documents into Instant Map.
                </p>
              </div>
              <div className="text-center space-y-4 animate-fade-in [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
                <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center animate-floating [animation-delay:200ms]">
                  <Sparkles className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold">2. AI Processing</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes your content and automatically structures it into a coherent mind map.
                </p>
              </div>
              <div className="text-center space-y-4 animate-fade-in [animation-delay:600ms] opacity-0 [animation-fill-mode:forwards]">
                <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center animate-floating [animation-delay:400ms]">
                  <Share2 className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold">3. Export & Share</h3>
                <p className="text-muted-foreground">
                  Download your mind map or share it directly with others in various formats.
                </p>
              </div>
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl animate-pulse [animation-delay:1000ms]" />
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-orange-500 to-orange-300 text-transparent bg-clip-text">
              Why Choose Instant Map
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-xl border border-orange-500/20 bg-orange-500/5">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-orange-500" />
                  Enhanced Learning
                </h3>
                <p className="text-muted-foreground">
                  Visual learning through mind maps helps improve understanding and retention of complex information.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-orange-500/20 bg-orange-500/5">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-orange-500" />
                  Time Efficiency
                </h3>
                <p className="text-muted-foreground">
                  Save hours of manual mind mapping with our instant AI-powered conversion.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 bg-orange-500/5">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-orange-500 to-orange-300 text-transparent bg-clip-text">
              Perfect For
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <Users className="w-12 h-12 text-orange-500 mx-auto" />
                <h3 className="text-xl font-semibold">Students</h3>
                <p className="text-muted-foreground">
                  Organize study materials and improve comprehension
                </p>
              </div>
              <div className="text-center space-y-4">
                <Brain className="w-12 h-12 text-orange-500 mx-auto" />
                <h3 className="text-xl font-semibold">Professionals</h3>
                <p className="text-muted-foreground">
                  Structure project plans and business strategies
                </p>
              </div>
              <div className="text-center space-y-4">
                <FileText className="w-12 h-12 text-orange-500 mx-auto" />
                <h3 className="text-xl font-semibold">Researchers</h3>
                <p className="text-muted-foreground">
                  Analyze and visualize complex research data
                </p>
              </div>
            </div>
          </div>
        </section>
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

