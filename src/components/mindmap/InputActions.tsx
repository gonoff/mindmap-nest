import { Button } from "@/components/ui/button";
import { Mic, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InputActionsProps {
  onTextSubmit: () => Promise<void>;
  isLoading: boolean;
}

export function InputActions({ onTextSubmit, isLoading }: InputActionsProps) {
  const { toast } = useToast();

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

      // Create mind map entry
      const { error } = await supabase
        .from("mindmaps")
        .insert({
          title: file.name.replace('.pdf', ''),
          content: { 
            type: 'pdf',
            url: publicUrl
          },
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading PDF",
        description: error.message,
        variant: "destructive",
      });
    }
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
        onClick={onTextSubmit}
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