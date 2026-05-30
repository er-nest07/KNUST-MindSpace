import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, ThumbsUp, Flag, Share2 } from "lucide-react";
import AnonymousAvatar from "../components/shared/AnonymousAvatar";
import CounsellorBadge from "../components/shared/CounsellorBadge";
import TopicTag from "../components/feed/TopicTag";
import CommentSection from "../components/feed/CommentSection";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";
import { getAuthorPresentation, type DbComment, type DbPost, type DbProfile } from "../lib/community";
import { useAuth } from "../context/AuthContext";

interface DetailPost {
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
  createdAt: string;
}

interface DetailComment {
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

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<DetailPost | null>(null);
  const [comments, setComments] = useState<DetailComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPostDetail = async () => {
    if (!id) return;

    setIsLoading(true);
    setError('');

    const { data: rawPost, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .eq('is_approved', true)
      .single<DbPost>();

    if (postError || !rawPost) {
      setError(postError?.message || 'Post not found.');
      setIsLoading(false);
      return;
    }

    const { data: postAuthor } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', rawPost.author_id)
      .single<DbProfile>();

    const [{ data: rawComments }, { data: votes }] = await Promise.all([
      supabase
        .from('comments')
        .select('*')
        .eq('post_id', rawPost.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('post_votes')
        .select('post_id, user_id')
        .eq('post_id', rawPost.id),
    ]);

    const commentRows = (rawComments ?? []) as DbComment[];
    const commentAuthorIds = [...new Set(commentRows.map((comment) => comment.author_id))];
    const profileMap = new Map<string, DbProfile>();

    if (postAuthor) {
      profileMap.set(postAuthor.id, postAuthor);
    }

    if (commentAuthorIds.length > 0) {
      const { data: commentAuthors } = await supabase
        .from('profiles')
        .select('*')
        .in('id', commentAuthorIds);

      ((commentAuthors ?? []) as DbProfile[]).forEach((profile) => {
        profileMap.set(profile.id, profile);
      });
    }

    const postAuthorPresentation = getAuthorPresentation(profileMap.get(rawPost.author_id));

    setPost({
      id: rawPost.id,
      content: rawPost.content,
      topicTag: rawPost.topic_tag,
      author: {
        id: rawPost.author_id,
        displayName: postAuthorPresentation.displayName,
        isAnonymous: postAuthorPresentation.isAnonymous,
        isCounsellor: postAuthorPresentation.isCounsellor,
        avatarUrl: postAuthorPresentation.avatarUrl,
      },
      upvotes: votes?.length ?? 0,
      isLiked: (votes ?? []).some((vote: { post_id: string; user_id: string }) => vote.user_id === user?.id),
      createdAt: rawPost.created_at,
    });

    setComments(
      commentRows.map((comment) => {
        const author = getAuthorPresentation(profileMap.get(comment.author_id));
        return {
          id: comment.id,
          content: comment.content,
          author: {
            id: comment.author_id,
            displayName: author.displayName,
            isAnonymous: author.isAnonymous,
            isCounsellor: author.isCounsellor,
            avatarUrl: author.avatarUrl,
          },
          upvotes: 0,
          createdAt: comment.created_at,
        };
      }),
    );

    setIsLoading(false);
  };

  useEffect(() => {
    loadPostDetail();
  }, [id]);

  const handleSubmitComment = async (content: string): Promise<DetailComment | null> => {
    if (!id || !user) {
      return null;
    }

    const { data: inserted, error: insertError } = await supabase
      .from('comments')
      .insert({
        post_id: id,
        author_id: user.id,
        content,
      })
      .select('*')
      .single<DbComment>();

    if (insertError || !inserted) {
      throw new Error(insertError?.message || 'Could not post comment.');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single<DbProfile>();

    const author = getAuthorPresentation(profile || undefined);

    return {
      id: inserted.id,
      content: inserted.content,
      author: {
        id: inserted.author_id,
        displayName: author.displayName,
        isAnonymous: author.isAnonymous,
        isCounsellor: author.isCounsellor,
        avatarUrl: author.avatarUrl,
      },
      upvotes: 0,
      createdAt: inserted.created_at,
    };
  };

  const toggleLike = async () => {
    if (!id || !user || !post) return;

    if (post.isLiked) {
      const { error: deleteError } = await supabase
        .from('post_votes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('post_votes')
        .insert({ post_id: id, user_id: user.id });

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    await loadPostDetail();
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
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 text-[#006B3F] hover:text-[#004D2C] mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Feed
        </Link>

        {/* Post */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#E8F5EE] mb-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {isLoading && <p className="text-gray-600">Loading post...</p>}
          {!isLoading && !post && <p className="text-gray-600">This post is unavailable.</p>}
          {post && (
            <>
          {/* Author Info */}
          <div className="flex items-start gap-3 mb-4">
            {post.author.isAnonymous ? (
              <AnonymousAvatar seed={post.author.id} size={48} />
            ) : (
              <img
                src={post.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.id}`}
                alt={post.author.displayName}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-lg text-[#1A1A1A]">
                  {post.author.displayName}
                </span>
                {post.author.isCounsellor && <CounsellorBadge />}
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <TopicTag topic={post.topicTag} />
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Post Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={toggleLike} className="gap-2">
              <ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'fill-current text-[#006B3F]' : ''}`} />
              <span>{post.upvotes}</span>
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="outline" className="gap-2 text-gray-500 hover:text-[#DC2626]">
              <Flag className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span>
            </Button>
          </div>
            </>
          )}
        </div>

        {/* Comments */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#E8F5EE]">
          <h2 className="text-2xl font-bold text-[#004D2C] mb-6">
            Comments ({comments.length})
          </h2>
          <CommentSection postId={id || '1'} comments={comments} onSubmitComment={handleSubmitComment} />
        </div>
      </div>
    </div>
  );
}
