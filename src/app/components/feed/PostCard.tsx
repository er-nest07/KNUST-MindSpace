import { useState } from "react";
import { Link } from "react-router";
import { Star } from "lucide-react";
import TopicTag from "./TopicTag";
import AnonymousAvatar from "../shared/AnonymousAvatar";
import CounsellorBadge from "../shared/CounsellorBadge";
import PostActions from "./PostActions";
import CommentSection from "./CommentSection";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    topicTag: string;
    author: {
      id: string;
      displayName: string;
      isAnonymous: boolean;
      isCounsellor: boolean;
      avatarUrl?: string;
    };
    upvotes: number;
    isLiked: boolean;
    commentCount: number;
    hasCounsellorComment: boolean;
    createdAt: string;
  };
  onToggleLike?: (postId: string, isLiked: boolean) => void;
}

export default function PostCard({ post, onToggleLike }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE] hover:shadow-lg transition-shadow">

      {/* Clickable area → post detail page */}
      <Link to={`/post/${post.id}`} className="block">

        {/* Author Info */}
        <div className="flex items-start gap-3 mb-4">
          {post.author.isAnonymous ? (
            <AnonymousAvatar seed={post.author.id} size={40} />
          ) : (
            <img
              src={
                post.author.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.id}`
              }
              alt={post.author.displayName}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#1A1A1A]">
                {post.author.displayName}
              </span>
              {post.author.isCounsellor && <CounsellorBadge />}
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>
            <div className="mt-1">
              <TopicTag topic={post.topicTag} />
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

        {/* Counsellor responded badge */}
        {post.hasCounsellorComment && (
          <div className="flex items-center gap-1 text-[#FDB913] text-sm mb-2">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold">Counsellor responded</span>
          </div>
        )}
      </Link>

      {/* Interactive Actions — outside <Link> so clicks don't navigate */}
      <PostActions
        postId={post.id}
        initialLikes={post.upvotes}
        initialComments={post.commentCount}
        initialLiked={post.isLiked}
        onLike={onToggleLike}
        onCommentToggle={() => setShowComments((s) => !s)}
      />

      {/* Comment section — slides open when comment button is clicked */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <CommentSection postId={post.id} />
        </div>
      )}

    </div>
  );
}