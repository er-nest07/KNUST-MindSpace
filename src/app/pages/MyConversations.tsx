import { Link } from "react-router";
import { MessageCircle, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { mockConversations, mockCounsellors } from "../data/mockData";
import CounsellorBadge from "../components/shared/CounsellorBadge";
import { Button } from "../components/ui/button";

export default function MyConversations() {
  const { user } = useAuth();

  const conversations = mockConversations.filter(c => c.student_id === user?.id || c.student_id === 'current-student');

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#004D2C] mb-2">My Conversations</h1>
          <p className="text-gray-600">
            Private conversations with KNUST verified counsellors
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-xl p-6 border-l-4 border-[#006B3F] mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#006B3F] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-[#004D2C] mb-1">Your conversations are private and secure</p>
              <p>
                Only you and your assigned counsellor can see these messages. 
                If a counsellor is offline, our AI support is available 24/7 to listen until a professional can connect with you.
              </p>
            </div>
          </div>
        </div>

        {/* Start New Conversation */}
        <div className="mb-6">
          <Button className="w-full sm:w-auto bg-[#FDB913] hover:bg-[#e5a710] text-[#004D2C]">
            <MessageCircle className="w-5 h-5 mr-2" />
            Start New Conversation
          </Button>
        </div>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-[#004D2C] mb-2">No conversations yet</h3>
            <p className="text-gray-600 mb-6">
              Start a conversation with a counsellor to get personalized support
            </p>
            <Button className="bg-[#006B3F] hover:bg-[#004D2C] text-white">
              Browse Counsellors
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => {
              const counsellor = mockCounsellors.find(c => c.id === conversation.counsellor_id);
              
              return (
                <Link
                  key={conversation.id}
                  to={`/chat/${conversation.id}`}
                  className="block bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE] hover:border-[#006B3F] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">👤</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[#004D2C]">{counsellor?.display_name}</h3>
                        <CounsellorBadge />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{counsellor?.counsellor_title}</p>
                      <p className="text-sm text-gray-700 truncate">{conversation.last_message}</p>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeAgo(conversation.last_message_at)}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        conversation.status === 'active' 
                          ? 'bg-[#E8F5EE] text-[#006B3F]' 
                          : conversation.status === 'ai_holding'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {conversation.status === 'active' ? 'Active' : conversation.status === 'ai_holding' ? 'AI Support' : 'Closed'}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
