import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mic, Upload, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function NewMindMap() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTextSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some text or use another input method",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a mind map",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("mindmaps")
        .insert({
          title: content.split('\n')[0].slice(0, 50) || "New Mind Map",
          content: { text: content },
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Mind map created successfully",
      });

      // Redirect to the mind map viewer (we'll implement this route later)
      navigate(`/mindmap/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Error creating mind map",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload a PDF",
          variant: "destructive",
        });
        return;
      }

      // Upload to storage bucket
      const fileName = `${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('exports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('exports')
        .getPublicUrl(fileName);

      // Create mind map entry
      const { data, error } = await supabase
        .from("mindmaps")
        .insert({
          title: file.name.replace('.pdf', ''),
          content: { 
            type: 'pdf',
            url: publicUrl
          },
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "PDF uploaded and mind map created successfully",
      });

      navigate(`/mindmap/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Error uploading PDF",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioTranscription = async () => {
    // We'll implement audio transcription in a future update
    toast({
      title: "Coming Soon",
      description: "Audio transcription will be available in a future update",
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Mind Map</h1>
      </div>
      
      <div className="space-y-6">
        <div>
          <label 
            htmlFor="content" 
            className="block text-sm font-medium mb-2"
          >
            Paste or type your text here
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your text here..."
            className="min-h-[200px]"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleTextSubmit}
            disabled={isLoading}
            className="flex-1"
          >
            Create Mind Map
          </Button>

          <div className="flex gap-2 flex-1">
            <Button
              variant="outline"
              className="flex-1"
              disabled={isLoading}
              onClick={() => document.getElementById('pdf-upload')?.click()}
            >
              <Upload className="mr-2" />
              Upload PDF
            </Button>
            <input
              type="file"
              id="pdf-upload"
              accept=".pdf"
              onChange={handlePDFUpload}
              className="hidden"
            />

            <Button
              variant="outline"
              className="flex-1"
              disabled={isLoading}
              onClick={handleAudioTranscription}
            >
              <Mic className="mr-2" />
              Record Audio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}