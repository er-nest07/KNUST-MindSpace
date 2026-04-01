import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../context/AuthContext";
import { mockMessages, mockConversations, mockCounsellors } from "../data/mockData";
import CounsellorBadge from "../components/shared/CounsellorBadge";

export default function ChatPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState(mockMessages.filter(m => m.conversation_id === id));
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = mockConversations.find(c => c.id === id);
  const counsellor = mockCounsellors.find(c => c.id === conversation?.counsellor_id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message = {
      id: crypto.randomUUID(),
      conversation_id: id!,
      sender_id: user.id,
      content: newMessage,
      is_ai: false,
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate counsellor response after 2 seconds
    setTimeout(() => {
      const response = {
        id: crypto.randomUUID(),
        conversation_id: id!,
        sender_id: counsellor?.id || 'counsellor-1',
        content: "Thank you for sharing that. I hear what you're saying. Let's work through this together. How are you feeling right now in this moment?",
        is_ai: false,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 2000);
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

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

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
