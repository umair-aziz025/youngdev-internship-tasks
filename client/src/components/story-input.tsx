import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, Plus } from "lucide-react";
import type { User } from "@shared/schema";

interface StoryInputProps {
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
  user: User;
  placeholder?: string;
}

export default function StoryInput({ 
  onSubmit, 
  isSubmitting, 
  user, 
  placeholder = "Continue the story... 'Someone somewhere is dancing in the rain because...'" 
}: StoryInputProps) {
  const [content, setContent] = useState("");
  
  const handleSubmit = () => {
    if (!content.trim() || isSubmitting) return;
    
    onSubmit(content);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="bg-white shadow-story">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-warm-teal rounded-full flex items-center justify-center text-white flex-shrink-0">
            <Cookie className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <Textarea 
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-4 border border-light-beige rounded-xl resize-none focus:ring-2 focus:ring-warm-teal focus:border-transparent"
              rows={3}
              maxLength={280}
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {280 - content.length} characters left
              </span>
              <Button 
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="bg-warm-teal text-white hover:bg-warm-teal/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    Add to Story
                    <Plus className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Tip: Press Ctrl+Enter (or Cmd+Enter) to submit quickly
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
