import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Plus, Filter } from "lucide-react";
import PostCard from "../components/feed/PostCard";
import NewPostModal from "../components/feed/NewPostModal";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";
import {
  getAuthorPresentation,
  inferTopicTag,
  type DbComment,
  type DbPost,
  type DbProfile,
} from "../lib/community";
import { useAuth } from "../context/AuthContext";

const topics = ['all', 'stress', 'academic', 'relationships', 'grief', 'addiction', 'identity', 'trauma', 'other'];

interface FeedPost {
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
}

export default function Feed() {
  const { user } = useAuth();
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [onlineCounsellors, setOnlineCounsellors] = useState(0);

  const loadFeed = async () => {
    setIsLoading(true);
    setError('');

    const [{ data: rawPosts, error: postsError }, { count: counsellorCount, error: counsellorCountError }] = await Promise.all([
      supabase
        .from('posts')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('id', { head: true, count: 'exact' })
        .eq('role', 'counsellor')
        .eq('is_verified_counsellor', true),
    ]);

    if (postsError) {
      setError(postsError.message);
      setIsLoading(false);
      return;
    }

    if (counsellorCountError) {
      setError(counsellorCountError.message);
    }

    setOnlineCounsellors(counsellorCount ?? 0);

    const postRows = (rawPosts ?? []) as DbPost[];

    if (postRows.length === 0) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    const postIds = postRows.map((post) => post.id);
    const authorIds = [...new Set(postRows.map((post) => post.author_id))];

    const [{ data: postAuthors }, { data: comments }, { data: votes }] = await Promise.all([
      supabase.from('profiles').select('*').in('id', authorIds),
      supabase.from('comments').select('*').in('post_id', postIds),
      supabase.from('post_votes').select('post_id, user_id').in('post_id', postIds),
    ]);

    const commentRows = (comments ?? []) as DbComment[];
    const commentAuthorIds = [...new Set(commentRows.map((comment) => comment.author_id))];
    const profileMap = new Map<string, DbProfile>();

    ((postAuthors ?? []) as DbProfile[]).forEach((profile) => profileMap.set(profile.id, profile));

    if (commentAuthorIds.length > 0) {
      const { data: commentAuthors } = await supabase
        .from('profiles')
        .select('*')
        .in('id', commentAuthorIds);

      ((commentAuthors ?? []) as DbProfile[]).forEach((profile) => profileMap.set(profile.id, profile));
    }

    const commentCountByPost = new Map<string, number>();
    const counsellorCommentByPost = new Set<string>();

    commentRows.forEach((comment) => {
      commentCountByPost.set(comment.post_id, (commentCountByPost.get(comment.post_id) ?? 0) + 1);
      const commentAuthor = profileMap.get(comment.author_id);
      if (commentAuthor?.role === 'counsellor' && commentAuthor.is_verified_counsellor) {
        counsellorCommentByPost.add(comment.post_id);
      }
    });

    const upvotesByPost = new Map<string, number>();
    const likedByPost = new Map<string, boolean>();
    (votes ?? []).forEach((vote: { post_id: string; user_id: string }) => {
      upvotesByPost.set(vote.post_id, (upvotesByPost.get(vote.post_id) ?? 0) + 1);
      if (vote.user_id === user?.id) {
        likedByPost.set(vote.post_id, true);
      }
    });

    const mappedPosts: FeedPost[] = postRows.map((post) => {
      const author = getAuthorPresentation(profileMap.get(post.author_id));
      return {
        id: post.id,
        content: post.content,
        topicTag: post.topic_tag,
        author: {
          id: post.author_id,
          displayName: author.displayName,
          isAnonymous: author.isAnonymous,
          isCounsellor: author.isCounsellor,
          avatarUrl: author.avatarUrl,
        },
        upvotes: upvotesByPost.get(post.id) ?? 0,
        isLiked: likedByPost.get(post.id) ?? false,
        commentCount: commentCountByPost.get(post.id) ?? 0,
        hasCounsellorComment: counsellorCommentByPost.has(post.id),
        createdAt: post.created_at,
      };
    });

    setPosts(mappedPosts);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!user) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    loadFeed();
  }, [user?.id]);

  const handleNewPost = async (content: string, isPrivate: boolean) => {
    if (!user) {
      throw new Error('You must be logged in to post.');
    }

    const { error: insertError } = await supabase.from('posts').insert({
      author_id: user.id,
      content,
      topic_tag: inferTopicTag(content),
      is_private: isPrivate,
      is_crisis: false,
      is_approved: true,
    });

    if (insertError) {
      throw insertError;
    }

    await loadFeed();
  };

  const toggleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    if (isLiked) {
      const { error: deleteError } = await supabase
        .from('post_votes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('post_votes')
        .insert({ post_id: postId, user_id: user.id });

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    await loadFeed();
  };

  const filteredPosts = useMemo(
    () =>
      selectedTopic === 'all'
        ? posts
        : posts.filter((post) => post.topicTag === selectedTopic),
    [posts, selectedTopic],
  );

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Topic Filter */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE] sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-[#006B3F]" />
                <h2 className="font-bold text-[#004D2C]">Filter by Topic</h2>
              </div>
              <div className="space-y-2">
                {topics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors capitalize ${
                      selectedTopic === topic
                        ? 'bg-[#006B3F] text-white'
                        : 'hover:bg-[#E8F5EE] text-gray-700'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {/* Online Counsellors */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-[#004D2C] mb-3">Online Counsellors</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#16A34A] rounded-full"></div>
                    <span className="text-sm text-gray-600">{onlineCounsellors} verified available</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#004D2C]">Community Feed</h1>
                <p className="text-gray-600 mt-1">Share, connect, and support each other</p>
              </div>
              <div className="flex items-center gap-3">
                {user?.role === 'student' && (
                  <Link to="/counsellors" className="hidden sm:inline-flex">
                    <Button variant="outline" className="gap-2 border-[#006B3F] text-[#006B3F] hover:bg-[#E8F5EE]">
                      <span className="hidden lg:inline">Browse Counsellors</span>
                      <span className="lg:hidden">Counsellors</span>
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={() => setIsNewPostOpen(true)}
                  className="bg-[#006B3F] hover:bg-[#004D2C] text-white gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">New Post</span>
                </Button>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  {error}
                </div>
              )}
              {isLoading && (
                <div className="bg-white rounded-xl shadow-md p-10 border border-[#E8F5EE] text-center text-gray-600">
                  Loading community posts...
                </div>
              )}
              {!isLoading && filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} onToggleLike={toggleLike} />
                ))
              ) : !isLoading ? (
                <div className="bg-white rounded-xl shadow-md p-12 border border-[#E8F5EE] text-center">
                  <p className="text-gray-500 mb-4">No posts in this category yet.</p>
                  <Button
                    onClick={() => setSelectedTopic('all')}
                    variant="outline"
                  >
                    View All Posts
                  </Button>
                </div>
              ) : null}
            </div>
          </main>
        </div>
      </div>

      {/* New Post Modal */}
      <NewPostModal
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        onSubmit={handleNewPost}
      />
    </div>
  );
}
