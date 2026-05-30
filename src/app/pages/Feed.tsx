import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import {
  Plus, LayoutGrid, Zap, BookOpen, Heart,
  Cloud, AlertTriangle, User, Shield, MoreHorizontal, Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

const TOPIC_META: Record<string, { Icon: LucideIcon; label: string }> = {
  all:           { Icon: LayoutGrid,    label: "All Topics" },
  stress:        { Icon: Zap,           label: "Stress" },
  academic:      { Icon: BookOpen,      label: "Academic" },
  relationships: { Icon: Heart,         label: "Relationships" },
  grief:         { Icon: Cloud,         label: "Grief & Loss" },
  addiction:     { Icon: AlertTriangle, label: "Addiction" },
  identity:      { Icon: User,          label: "Identity" },
  trauma:        { Icon: Shield,        label: "Trauma" },
  other:         { Icon: MoreHorizontal, label: "Other" },
};

const topics = Object.keys(TOPIC_META);

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
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [onlineCounsellors, setOnlineCounsellors] = useState(0);

  // Sidebar retraction on scroll
  const lastScrollY = useRef(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 80) {
        setSidebarCollapsed(false);
      } else if (y > lastScrollY.current + 6) {
        setSidebarCollapsed(true);   // scrolling down
      } else if (y < lastScrollY.current - 6) {
        setSidebarCollapsed(false);  // scrolling up
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loadFeed = async () => {
    setIsLoading(true);
    setError("");

    const [
      { data: rawPosts, error: postsError },
      { count: counsellorCount, error: counsellorCountError },
    ] = await Promise.all([
      supabase.from("posts").select("*").eq("is_approved", true).order("created_at", { ascending: false }),
      supabase.from("profiles").select("id", { head: true, count: "exact" }).eq("role", "counsellor").eq("is_verified_counsellor", true),
    ]);

    if (postsError) { setError(postsError.message); setIsLoading(false); return; }
    if (counsellorCountError) setError(counsellorCountError.message);

    setOnlineCounsellors(counsellorCount ?? 0);

    const postRows = (rawPosts ?? []) as DbPost[];
    if (postRows.length === 0) { setPosts([]); setIsLoading(false); return; }

    const postIds = postRows.map((p) => p.id);
    const authorIds = [...new Set(postRows.map((p) => p.author_id))];

    const [{ data: postAuthors }, { data: comments }, { data: votes }] = await Promise.all([
      supabase.from("profiles").select("*").in("id", authorIds),
      supabase.from("comments").select("*").in("post_id", postIds),
      supabase.from("post_votes").select("post_id, user_id").in("post_id", postIds),
    ]);

    const commentRows = (comments ?? []) as DbComment[];
    const commentAuthorIds = [...new Set(commentRows.map((c) => c.author_id))];
    const profileMap = new Map<string, DbProfile>();
    ((postAuthors ?? []) as DbProfile[]).forEach((p) => profileMap.set(p.id, p));

    if (commentAuthorIds.length > 0) {
      const { data: commentAuthors } = await supabase.from("profiles").select("*").in("id", commentAuthorIds);
      ((commentAuthors ?? []) as DbProfile[]).forEach((p) => profileMap.set(p.id, p));
    }

    const commentCountByPost = new Map<string, number>();
    const counsellorCommentByPost = new Set<string>();
    commentRows.forEach((c) => {
      commentCountByPost.set(c.post_id, (commentCountByPost.get(c.post_id) ?? 0) + 1);
      const a = profileMap.get(c.author_id);
      if (a?.role === "counsellor" && a.is_verified_counsellor) counsellorCommentByPost.add(c.post_id);
    });

    const upvotesByPost = new Map<string, number>();
    const likedByPost = new Map<string, boolean>();
    (votes ?? []).forEach((v: { post_id: string; user_id: string }) => {
      upvotesByPost.set(v.post_id, (upvotesByPost.get(v.post_id) ?? 0) + 1);
      if (v.user_id === user?.id) likedByPost.set(v.post_id, true);
    });

    setPosts(
      postRows.map((p) => {
        const author = getAuthorPresentation(profileMap.get(p.author_id));
        return {
          id: p.id,
          content: p.content,
          topicTag: p.topic_tag,
          author: {
            id: p.author_id,
            displayName: author.displayName,
            isAnonymous: author.isAnonymous,
            isCounsellor: author.isCounsellor,
            avatarUrl: author.avatarUrl,
          },
          upvotes: upvotesByPost.get(p.id) ?? 0,
          isLiked: likedByPost.get(p.id) ?? false,
          commentCount: commentCountByPost.get(p.id) ?? 0,
          hasCounsellorComment: counsellorCommentByPost.has(p.id),
          createdAt: p.created_at,
        };
      })
    );
    setIsLoading(false);
  };

  useEffect(() => {
    if (!user) { setPosts([]); setIsLoading(false); return; }
    loadFeed();
  }, [user?.id]);

  const handleNewPost = async (content: string, isPrivate: boolean) => {
    if (!user) throw new Error("You must be logged in to post.");
    const { error: insertError } = await supabase.from("posts").insert({
      author_id: user.id,
      content,
      topic_tag: inferTopicTag(content),
      is_private: isPrivate,
      is_crisis: false,
      is_approved: true,
    });
    if (insertError) throw insertError;
    await loadFeed();
  };

  // No loadFeed() here — PostActions manages the like UI optimistically
  const toggleLike = async (postId: string, nowLiked: boolean) => {
    if (!user) return;
    if (nowLiked) {
      await supabase.from("post_votes").insert({ post_id: postId, user_id: user.id });
    } else {
      await supabase.from("post_votes").delete().eq("post_id", postId).eq("user_id", user.id);
    }
  };

  const filteredPosts = useMemo(
    () => selectedTopic === "all" ? posts : posts.filter((p) => p.topicTag === selectedTopic),
    [posts, selectedTopic]
  );

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Liquid-glass sidebar ─────────────────────────────── */}
          <aside
            style={{ width: sidebarCollapsed ? "3.5rem" : "14rem" }}
            className="hidden lg:block flex-shrink-0 transition-[width] duration-500 ease-in-out"
          >
            <div className="sticky top-24 overflow-hidden rounded-2xl
              bg-gradient-to-b from-white/60 to-white/25
              backdrop-blur-2xl border border-white/40 shadow-2xl
              transition-all duration-500">

              {/* Header row */}
              <div className={`flex items-center gap-2 border-b border-white/30
                transition-all duration-500
                ${sidebarCollapsed ? "px-2 py-3 justify-center" : "px-4 py-3"}`}>
                {sidebarCollapsed ? (
                  <LayoutGrid className="w-4 h-4 text-[#006B3F]" />
                ) : (
                  <>
                    <LayoutGrid className="w-4 h-4 text-[#006B3F] flex-shrink-0" />
                    <span className="font-bold text-[#004D2C] text-sm whitespace-nowrap">Filter by Topic</span>
                  </>
                )}
              </div>

              {/* Topic buttons */}
              <div className={`transition-all duration-500 ${sidebarCollapsed ? "p-1.5 space-y-1" : "p-3 space-y-0.5"}`}>
                {topics.map((topic) => {
                  const { Icon, label } = TOPIC_META[topic];
                  const active = selectedTopic === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setSelectedTopic(topic)}
                      title={sidebarCollapsed ? label : undefined}
                      className={`flex items-center rounded-xl font-medium transition-all duration-200
                        ${sidebarCollapsed
                          ? "w-10 h-10 justify-center mx-auto"
                          : "w-full px-3 py-2 gap-3 text-sm"
                        }
                        ${active
                          ? "bg-[#006B3F] text-white shadow-sm"
                          : "text-gray-600 hover:bg-white/70 hover:text-[#006B3F]"
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{label}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Online counsellors indicator */}
              <div className={`border-t border-white/30 transition-all duration-500
                ${sidebarCollapsed ? "py-3 flex justify-center" : "px-4 py-3"}`}>
                {sidebarCollapsed ? (
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                    title={`${onlineCounsellors} counsellors online`}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#006B3F]" />
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {onlineCounsellors} counsellors online
                    </span>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-auto" />
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ── Main feed ────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#004D2C]">Community Feed</h1>
                <p className="text-gray-600 mt-1">Share, connect, and support each other</p>
              </div>
              <div className="flex items-center gap-3">
                {user?.role === "student" && (
                  <Link to="/counsellors" className="hidden sm:inline-flex">
                    <Button variant="outline" className="gap-2 border-[#006B3F] text-[#006B3F] hover:bg-[#E8F5EE]">
                      <span className="hidden lg:inline">Browse Counsellors</span>
                      <span className="lg:hidden">Counsellors</span>
                    </Button>
                  </Link>
                )}
                <Button onClick={() => setIsNewPostOpen(true)} className="bg-[#006B3F] hover:bg-[#004D2C] text-white gap-2">
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">New Post</span>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
              )}
              {isLoading && (
                <div className="bg-white rounded-xl shadow-md p-10 border border-[#E8F5EE] text-center text-gray-600">
                  Loading community posts…
                </div>
              )}
              {!isLoading && filteredPosts.length > 0
                ? filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} onToggleLike={toggleLike} />
                  ))
                : !isLoading && (
                    <div className="bg-white rounded-xl shadow-md p-12 border border-[#E8F5EE] text-center">
                      <p className="text-gray-500 mb-4">No posts in this category yet.</p>
                      <Button onClick={() => setSelectedTopic("all")} variant="outline">
                        View All Posts
                      </Button>
                    </div>
                  )}
            </div>
          </main>
        </div>
      </div>

      <NewPostModal
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        onSubmit={handleNewPost}
      />
    </div>
  );
}
