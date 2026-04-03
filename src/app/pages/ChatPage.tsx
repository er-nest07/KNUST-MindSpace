import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../context/AuthContext";
import CounsellorBadge from "../components/shared/CounsellorBadge";
import { supabase } from "../lib/supabase";
import { type DbConversation, type DbMessage, type DbProfile } from "../lib/community";

export default function ChatPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [conversation, setConversation] = useState<DbConversation | null>(null);
  const [counsellor, setCounsellor] = useState<DbProfile | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadConversation = async () => {
      if (!id) return;

      setIsLoading(true);
      setError('');

      const [{ data: conversationData, error: conversationError }, { data: messageData, error: messageError }] = await Promise.all([
        supabase.from('conversations').select('*').eq('id', id).single<DbConversation>(),
        supabase.from('messages').select('*').eq('conversation_id', id).order('created_at', { ascending: true }),
      ]);

      if (conversationError) {
        setError(conversationError.message);
        setIsLoading(false);
        return;
      }

      if (messageError) {
        setError(messageError.message);
      }

      setConversation(conversationData);
      setMessages((messageData ?? []) as DbMessage[]);

      if (conversationData?.counsellor_id) {
        const { data: counsellorData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', conversationData.counsellor_id)
          .single<DbProfile>();
        setCounsellor(counsellorData ?? null);
      }

      setIsLoading(false);
    };

    loadConversation();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`messages-${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
        (payload) => {
          const incoming = payload.new as DbMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) {
              return prev;
            }
            return [...prev, incoming];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !id) return;

    const content = newMessage;
    setNewMessage("");

    const { error: insertError } = await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: user.id,
      content,
      is_ai: false,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', id);
  };

  return (
    <div className="min-h-screen bg-[#E8F5EE]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-16">
          <div className="flex items-center gap-4">
            <Link to="/conversations" className="text-[#006B3F] hover:text-[#004D2C]">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-[#004D2C]">{counsellor?.display_name}</h1>
                {counsellor && <CounsellorBadge />}
              </div>
              <p className="text-sm text-gray-600">{counsellor?.counsellor_title}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-4 pb-24">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {isLoading && <p className="text-gray-600">Loading chat...</p>}
          {messages.map((message) => {
            const isUser = message.sender_id === user?.id;
            const isAI = message.is_ai;

            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
                  {!isUser && !isAI && (
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-[#004D2C]">{counsellor?.display_name}</p>
                      <CounsellorBadge />
                    </div>
                  )}
                  {isAI && (
                    <p className="text-sm text-gray-600 mb-1">MindSpace AI</p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      isUser
                        ? 'bg-[#006B3F] text-white'
                        : isAI
                        ? 'bg-[#E8F5EE] border-2 border-[#006B3F] text-gray-800'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-2">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 min-h-[44px] max-h-32 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-[#006B3F] hover:bg-[#004D2C] text-white px-6"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
