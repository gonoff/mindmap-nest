import { Button } from "@/components/ui/button";
import { Mic, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface InputActionsProps {
  onTextSubmit: () => Promise<void>;
  isLoading: boolean;
  content: string;
}

export function InputActions({ onTextSubmit, isLoading, content }: InputActionsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

      navigate("/processing", {
        state: {
          content: `PDF URL: ${publicUrl}`,
          title: file.name.replace('.pdf', '')
        }
      });
    } catch (error: any) {
      toast({
        title: "Error uploading PDF",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateMindMap = () => {
    navigate("/processing", {
      state: {
        content,
        title: content.split('\n')[0].slice(0, 50) || "New Mind Map"
      }
    });
  };

  const handleAudioTranscription = () => {
    toast({
      title: "Coming Soon",
      description: "Audio transcription will be available in a future update",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button
        onClick={handleCreateMindMap}
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
  );
}