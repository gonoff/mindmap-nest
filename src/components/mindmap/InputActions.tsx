import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";

interface InputActionsProps {
  onTextSubmit: () => Promise<void>;
  isLoading: boolean;
  content: string;
}

export function InputActions({ onTextSubmit, isLoading, content }: InputActionsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleCreateMindMap = () => {
    navigate("/processing", {
      state: {
        content,
        title: content.split('\n')[0].slice(0, 50) || "New Mind Map"
      }
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onload = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          try {
            toast({
              title: "Processing audio",
              description: "Converting speech to text...",
            });

            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio }
            });

            if (error) throw error;

            if (data?.text) {
              navigate("/processing", {
                state: {
                  content: data.text,
                  title: "Voice Recording"
                }
              });
            }
          } catch (error) {
            console.error('Error processing audio:', error);
            toast({
              title: "Error processing audio",
              description: "Failed to convert speech to text. Please try again.",
              variant: "destructive",
            });
          }
        };

        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone...",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice recording.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button
        onClick={handleCreateMindMap}
        disabled={isLoading || !content.trim()}
        className="flex-1"
      >
        Create Mind Map
      </Button>

      <Button
        variant="outline"
        className="flex-1"
        disabled={isLoading}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? (
          <>
            <MicOff className="mr-2" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="mr-2" />
            Record Audio
          </>
        )}
      </Button>
    </div>
  );
}