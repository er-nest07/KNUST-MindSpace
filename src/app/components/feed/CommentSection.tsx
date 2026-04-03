import { useEffect, useState } from "react";
import { Send, Flag, ThumbsUp } from "lucide-react";
import AnonymousAvatar from "../shared/AnonymousAvatar";
import CounsellorBadge from "../shared/CounsellorBadge";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    displayName: string;
    isAnonymous: boolean;
    isCounsellor: boolean;
    avatarUrl?: string;
  };
  upvotes: number;
  createdAt: string;
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onSubmitComment?: (content: string) => Promise<Comment | null>;
}

export default function CommentSection({ postId, comments: initialComments, onSubmitComment }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    try {
      if (onSubmitComment) {
        const persistedComment = await onSubmitComment(newComment);
        if (persistedComment) {
          setComments([...comments, persistedComment]);
        }
      } else {
        const comment: Comment = {
          id: `comment-${Date.now()}`,
          content: newComment,
          author: {
            id: `local-${postId}`,
            displayName: 'Anonymous Student',
            isAnonymous: true,
            isCounsellor: false
          },
          upvotes: 0,
          createdAt: new Date().toISOString()
        };
        setComments([...comments, comment]);
      }

      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-[#E8F5EE] rounded-lg p-4">
        <Textarea
          placeholder="Share your thoughts or support..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          className="mb-3 bg-white"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="bg-[#006B3F] hover:bg-[#004D2C] text-white gap-2"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Posting...' : 'Comment'}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map(comment => (
            <div
              key={comment.id}
              className={`bg-white rounded-lg p-4 ${
                comment.author.isCounsellor ? 'border-l-4 border-[#FDB913]' : ''
              }`}
            >
              {/* Comment Header */}
              <div className="flex items-start gap-3 mb-3">
                {comment.author.isAnonymous ? (
                  <AnonymousAvatar seed={comment.author.id} size={36} />
                ) : (
                  <img
                    src={comment.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.id}`}
                    alt={comment.author.displayName}
                    className="w-9 h-9 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#1A1A1A]">
                      {comment.author.displayName}
                    </span>
                    {comment.author.isCounsellor && <CounsellorBadge />}
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-gray-700 mb-3 ml-12">{comment.content}</p>

              {/* Comment Actions */}
              <div className="flex items-center gap-4 ml-12">
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#006B3F] transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{comment.upvotes}</span>
                </button>
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#DC2626] transition-colors">
                  <Flag className="w-4 h-4" />
                  <span>Report</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
