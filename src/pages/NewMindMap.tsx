import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ContentInput } from "@/components/mindmap/ContentInput";
import { InputActions } from "@/components/mindmap/InputActions";

export default function NewMindMap() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/library")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Mind Map</h1>
      </div>
      
      <div className="space-y-6">
        <ContentInput 
          content={content}
          setContent={setContent}
          isLoading={isLoading}
        />
        <InputActions 
          onTextSubmit={async () => {}}
          isLoading={isLoading}
          content={content}
        />
      </div>
    </div>
  );
}