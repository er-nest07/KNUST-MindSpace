import { Link } from "react-router";
import { MessageCircle, ThumbsUp, Star } from "lucide-react";
import TopicTag from "./TopicTag";
import AnonymousAvatar from "../shared/AnonymousAvatar";
import CounsellorBadge from "../shared/CounsellorBadge";

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
    commentCount: number;
    hasCounsellorComment: boolean;
    createdAt: string;
  };
}

export default function PostCard({ post }: PostCardProps) {
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
    <Link to={`/post/${post.id}`}>
      <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE] hover:shadow-lg transition-shadow cursor-pointer">
        {/* Author Info */}
        <div className="flex items-start gap-3 mb-4">
          {post.author.isAnonymous ? (
            <AnonymousAvatar seed={post.author.id} size={40} />
          ) : (
            <img
              src={post.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.id}`}
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
              <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
            </div>
            <div className="mt-1">
              <TopicTag topic={post.topicTag} />
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

        {/* Post Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            <span>{post.upvotes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
          </div>
          {post.hasCounsellorComment && (
            <div className="flex items-center gap-1 text-[#FDB913]">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-semibold">Counsellor responded</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
