import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Send, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { type DbConversation, type DbMessage, type DbProfile } from "../lib/community";
import { filterProfanity } from "../lib/profanityFilter";

export default function ChatPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages]       = useState<DbMessage[]>([]);
  const [conversation, setConversation] = useState<DbConversation | null>(null);
  const [counsellor, setCounsellor]   = useState<DbProfile | null>(null);
  const [newMessage, setNewMessage]   = useState("");
  const [isLoading, setIsLoading]     = useState(true);
  const [isSending, setIsSending]     = useState(false);
  const [error, setError]             = useState("");
  const messagesEndRef                = useRef<HTMLDivElement>(null);
  const textareaRef                   = useRef<HTMLTextAreaElement>(null);
  // Track IDs we've already added optimistically so realtime doesn't duplicate
  const sentOptimisticIds             = useRef<Set<string>>(new Set());

  // ── Load conversation + messages ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      setError("");
      const [{ data: convData, error: convErr }, { data: msgData, error: msgErr }] =
        await Promise.all([
          supabase.from("conversations").select("*").eq("id", id).single<DbConversation>(),
          supabase.from("messages").select("*").eq("conversation_id", id).order("created_at", { ascending: true }),
        ]);
      if (convErr) { setError(convErr.message); setIsLoading(false); return; }
      if (msgErr)  setError(msgErr.message);
      setConversation(convData);
      setMessages((msgData ?? []) as DbMessage[]);
      if (convData?.counsellor_id) {
        const { data: cData } = await supabase
          .from("profiles").select("*").eq("id", convData.counsellor_id).single<DbProfile>();
        setCounsellor(cData ?? null);
      }
      setIsLoading(false);
    };
    load();
  }, [id]);

  // ── Realtime — only add messages from the OTHER person ───────────────────
  // Our own messages are already shown via optimistic update, so we skip them
  // here to avoid the 300-500ms delay of waiting for the broadcast.
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`messages-${id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          const incoming = payload.new as DbMessage;
          // Skip if we sent this ourselves (already shown optimistically)
          if (incoming.sender_id === user?.id) {
            // Just replace the optimistic placeholder with the real DB record
            setMessages((prev) =>
              prev.map((m) =>
                m.id.toString().startsWith("optimistic-") && m.content === incoming.content
                  ? incoming
                  : m
              )
            );
            return;
          }
          // Add messages from counsellor/other users immediately
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          );
        }
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [id, user?.id]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send with instant optimistic update ──────────────────────────────────
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = newMessage.trim();
    if (!content || !user || !id || isSending) return;

    setNewMessage("");
    setIsSending(true);
    textareaRef.current?.focus();

    // Show immediately — no waiting for Supabase
    const tempId = `optimistic-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversation_id: id,
      sender_id: user.id,
      content,
      is_ai: false,
      created_at: new Date().toISOString(),
    } as DbMessage;
    setMessages((prev) => [...prev, optimisticMsg]);

    const { error: insertErr } = await supabase.from("messages").insert({
      conversation_id: id,
      sender_id: user.id,
      content,
      is_ai: false,
    });

    if (insertErr) {
      // Rollback
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(insertErr.message);
      setNewMessage(content);
    } else {
      // Update conversation last_message in background — don't await
      supabase.from("conversations")
        .update({ last_message: content, last_message_at: new Date().toISOString() })
        .eq("id", id);
    }

    setIsSending(false);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const initials = (name?: string | null) =>
    name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <div className="flex flex-col h-screen bg-[#F0F9F4]">

      {/* Header */}
      <div className="bg-[#006B3F] text-white px-4 py-3 flex items-center gap-3 shadow-md"
           style={{ paddingTop: "calc(64px + 12px)" }}>
        <Link to="/conversations" className="text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40
                        flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
          {initials(counsellor?.display_name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-white text-base truncate">
              {counsellor?.display_name ?? "Loading..."}
            </h1>
            {counsellor && (
              <span className="flex items-center gap-1 bg-[#FDB913] text-[#004D2C] text-xs
                               font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                <ShieldCheck className="w-3 h-3" />
                KNUST Counsellor
              </span>
            )}
          </div>
          {counsellor?.counsellor_title && (
            <p className="text-xs text-white/70 truncate">{counsellor.counsellor_title}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#006B3F] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#006B3F]/10 flex items-center justify-center mb-3">
              <ShieldCheck className="w-8 h-8 text-[#006B3F]" />
            </div>
            <p className="font-semibold text-[#004D2C]">Start the conversation</p>
            <p className="text-sm text-gray-500 mt-1">{counsellor?.display_name} is here to help.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender_id === user?.id;
          const isAI   = msg.is_ai;
          const isOptimistic = msg.id?.toString().startsWith("optimistic-");

          return (
            <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && !isAI && (
                <div className="w-7 h-7 rounded-full bg-[#006B3F] flex items-center justify-center
                                text-white text-xs font-bold mr-2 flex-shrink-0 self-end mb-5">
                  {initials(counsellor?.display_name)}
                </div>
              )}
              <div className="max-w-[72%]">
                {!isUser && !isAI && (
                  <p className="text-xs font-semibold text-[#006B3F] mb-1 ml-1">
                    {counsellor?.display_name}
                  </p>
                )}
                {isAI && <p className="text-xs text-gray-500 mb-1 ml-1">MindSpace AI</p>}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${isUser
                    ? `bg-[#006B3F] text-white rounded-br-sm ${isOptimistic ? "opacity-75" : ""}`
                    : isAI
                    ? "bg-white border-2 border-[#006B3F]/30 text-gray-800 rounded-bl-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                  }`}>
                  <p className="whitespace-pre-wrap">{filterProfanity(msg.content)}</p>
                </div>
                <p className={`text-xs text-gray-400 mt-1 ${isUser ? "text-right pr-1" : "pl-1"}`}>
                  {isOptimistic ? "Sending..." : formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50
                       px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-[#006B3F]/30 focus:border-[#006B3F]
                       max-h-32 transition-colors"
            style={{ minHeight: 44 }}
          />
          <button type="submit" disabled={!newMessage.trim() || isSending}
            className="w-11 h-11 rounded-full bg-[#006B3F] text-white flex items-center justify-center
                       hover:bg-[#005a34] active:scale-95 transition-all duration-150
                       disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Send message">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}