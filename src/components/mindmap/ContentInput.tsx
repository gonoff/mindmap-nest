import { Textarea } from "@/components/ui/textarea";

interface ContentInputProps {
  content: string;
  setContent: (content: string) => void;
  isLoading: boolean;
}

export function ContentInput({ content, setContent, isLoading }: ContentInputProps) {
  return (
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
        disabled={isLoading}
      />
    </div>
  );
}