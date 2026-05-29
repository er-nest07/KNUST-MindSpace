import { useState, useEffect } from "react";
import { Send, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import AnonymousAvatar from "../shared/AnonymousAvatar";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles?: {
    display_name: string;
    is_anonymous: boolean;
    avatar_url?: string;
  };
}

export default function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("comments")
        .select("*, profiles(display_name, is_anonymous, avatar_url)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      setComments((data ?? []) as Comment[]);
      setIsLoading(false);
    };
    load();
  }, [postId]);

  useEffect(() => {
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `post_id=eq.${postId}` },
        async (payload) => {
          const { data } = await supabase
            .from("comments")
            .select("*, profiles(display_name, is_anonymous, avatar_url)")
            .eq("id", payload.new.id)
            .single();
          if (data) {
            const incoming = data as Comment;
            setComments((prev) => {
              // Replace matching optimistic placeholder to avoid duplicates
              const withoutOptimistic = prev.filter(
                (c) =>
                  !(
                    c.id.startsWith("opt-") &&
                    c.content === incoming.content &&
                    c.author_id === incoming.author_id
                  )
              );
              // Deduplicate in case event fires more than once
              if (withoutOptimistic.some((c) => c.id === incoming.id)) return withoutOptimistic;
              return [...withoutOptimistic, incoming];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "comments", filter: `post_id=eq.${postId}` },
        (payload) => {
          setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [postId]);

  const handleSubmit = async () => {
    const content = text.trim();
    if (!content || !user || isSending) return;
    setIsSending(true);
    setText("");

    const optimistic: Comment = {
      id: `opt-${Date.now()}`,
      content,
      created_at: new Date().toISOString(),
      author_id: user.id,
      profiles: { display_name: "You", is_anonymous: false },
    };
    setComments((prev) => [...prev, optimistic]);

    const { error } = await supabase
      .from("comments")
      .insert({ post_id: postId, author_id: user.id, content });

    if (error) {
      // Remove optimistic and restore text on failure
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setText(content);
    }
    setIsSending(false);
  };

  const handleDelete = async (commentId: string) => {
    // Optimistic removal
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
      // Re-fetch to restore if delete failed (e.g. insufficient permissions)
      const { data } = await supabase
        .from("comments")
        .select("*, profiles(display_name, is_anonymous, avatar_url)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      setComments((data ?? []) as Comment[]);
    }
  };

  const canDelete = (comment: Comment): boolean => {
    if (!user || comment.id.startsWith("opt-")) return false;
    return (
      user.id === comment.author_id ||
      user.role === "admin" ||
      user.role === "counsellor"
    );
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-3">
      {isLoading && (
        <p className="text-xs text-gray-400 text-center py-2">Loading comments...</p>
      )}

      {!isLoading && comments.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">
          No comments yet. Be the first to reply.
        </p>
      )}

      {comments.map((c) => {
        const isAnon = c.profiles?.is_anonymous ?? true;
        const name   = c.profiles?.display_name ?? "Anonymous";
        const isOptimistic = c.id.startsWith("opt-");

        return (
          <div key={c.id} className={`flex gap-2 group ${isOptimistic ? "opacity-60" : ""}`}>
            {isAnon ? (
              <AnonymousAvatar seed={c.author_id} size={28} />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#E8F5EE] border border-[#006B3F]/20
                              flex items-center justify-center text-xs font-bold text-[#006B3F] flex-shrink-0">
                {name[0]?.toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-xs font-semibold text-[#004D2C] truncate">{name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {isOptimistic ? "Sending…" : formatTime(c.created_at)}
                  </span>
                </div>
                {canDelete(c) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity
                               text-gray-400 hover:text-red-500 flex-shrink-0 p-0.5 rounded"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 mt-0.5 leading-relaxed break-words">{c.content}</p>
            </div>
          </div>
        );
      })}

      {user && (
        <div className="flex gap-2 items-end pt-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
            }}
            placeholder="Write a comment…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50
                       px-3 py-2 text-sm text-gray-800 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F]
                       max-h-24 transition-colors"
            style={{ minHeight: 36 }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || isSending}
            className="w-9 h-9 rounded-full bg-[#006B3F] text-white flex items-center justify-center
                       hover:bg-[#005a34] active:scale-95 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Post comment"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
