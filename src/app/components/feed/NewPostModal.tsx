import { useState } from "react";
import { X, Lock, Globe, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, isPrivate: boolean) => Promise<void>;
}

export default function NewPostModal({ isOpen, onClose, onSubmit }: NewPostModalProps) {
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(content, isPrivate);
      setContent('');
      setIsPrivate(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#004D2C]">Share Your Thoughts</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Content */}
          <div>
            <Label htmlFor="content" className="sr-only">What's on your mind?</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind? This is a safe space..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="resize-none"
              disabled={isSubmitting}
            />
            <div className="mt-2 text-sm text-gray-500">
              {content.length} / 2000 characters
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="bg-[#E8F5EE] rounded-lg p-4">
            <Label className="text-base font-semibold text-[#004D2C] mb-3 block">
              Who can see this?
            </Label>
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                !isPrivate ? 'border-[#006B3F] bg-white' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="privacy"
                  checked={!isPrivate}
                  onChange={() => setIsPrivate(false)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#006B3F]" />
                    Public
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Visible to all students and counsellors. Great for general support.
                  </p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isPrivate ? 'border-[#006B3F] bg-white' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="privacy"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(true)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#006B3F]" />
                    Counsellors Only
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Only visible to verified counsellors. For sensitive or private concerns.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* AI Moderation Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> All posts are reviewed by AI for safety. This helps us identify 
              crisis situations and ensure community guidelines are followed. Posts are typically 
              approved within seconds.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="bg-[#006B3F] hover:bg-[#004D2C] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reviewing...
                </>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
