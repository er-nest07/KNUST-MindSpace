import { useState, useEffect } from "react";
import { Send } from "lucide-react";
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

  // Load comments
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

  // Realtime — new comments appear instantly
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
          if (data) setComments((prev) => [...prev, data as Comment]);
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

    // Optimistic
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
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setText(content);
    }
    setIsSending(false);
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
          <div key={c.id} className={`flex gap-2 ${isOptimistic ? "opacity-60" : ""}`}>
            {isAnon ? (
              <AnonymousAvatar seed={c.author_id} size={28} />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#E8F5EE] border border-[#006B3F]/20
                              flex items-center justify-center text-xs font-bold text-[#006B3F] flex-shrink-0">
                {name[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-[#004D2C]">{name}</span>
                <span className="text-xs text-gray-400">
                  {isOptimistic ? "Sending..." : formatTime(c.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{c.content}</p>
            </div>
          </div>
        );
      })}

      {/* Input row */}
      {user && (
        <div className="flex gap-2 items-end pt-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
            }}
            placeholder="Write a comment..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50
                       px-3 py-2 text-sm text-gray-800 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F]
                       max-h-24 transition-colors"
            style={{ minHeight: 36 }}
          />
          <button
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