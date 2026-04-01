import { Link } from "react-router";
import { Users, MessageCircle, AlertTriangle, TrendingUp, BookOpen } from "lucide-react";
import { mockPosts, mockConversations, mockEnrolments } from "../data/mockData";
import { Button } from "../components/ui/button";

export default function CounsellorDashboard() {
  const activeCases = mockConversations.filter(c => c.status === 'active').length;
  const pendingPosts = mockPosts.filter(p => !p.is_private && p.is_approved).length;
  const crisisFlags = mockPosts.filter(p => p.is_crisis).length;
  const activeEnrolments = mockEnrolments.filter(e => e.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#004D2C] mb-2">Counsellor Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your support overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#E8F5EE] flex items-center justify-center">
                <Users className="w-6 h-6 text-[#006B3F]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold text-[#004D2C]">{activeCases}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Community Posts</p>
                <p className="text-2xl font-bold text-[#004D2C]">{pendingPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Crisis Alerts</p>
                <p className="text-2xl font-bold text-[#DC2626]">{crisisFlags}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Programmes</p>
                <p className="text-2xl font-bold text-[#004D2C]">{activeEnrolments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Crisis Alerts */}
        {crisisFlags > 0 && (
          <div className="bg-[#DC2626] text-white rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold mb-2">Urgent: Crisis Situations Detected</h3>
                <p className="mb-4">
                  {crisisFlags} student(s) have posted content flagged as crisis-level. Immediate attention required.
                </p>
                <Button className="bg-white text-[#DC2626] hover:bg-gray-100">
                  View Crisis Cases
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Conversations */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
            <h2 className="font-bold text-[#004D2C] mb-4">Active Conversations</h2>
            <div className="space-y-3">
              {mockConversations.filter(c => c.status === 'active').slice(0, 5).map((conv) => (
                <Link
                  key={conv.id}
                  to={`/counsellor/case/${conv.student_id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-[#006B3F] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-[#004D2C]">Student #{conv.student_id.slice(0, 8)}</div>
                    <span className="text-xs text-gray-500">
                      {new Date(conv.last_message_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conv.ai_summary}</p>
                </Link>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Cases
            </Button>
          </div>

          {/* Community Trends */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#006B3F]" />
              <h2 className="font-bold text-[#004D2C]">This Week's Trends</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-[#004D2C]">Academic Stress</span>
                  <span className="text-xs text-gray-500">27 posts</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '68%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-[#004D2C]">Identity & Belonging</span>
                  <span className="text-xs text-gray-500">18 posts</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-[#004D2C]">Grief & Loss</span>
                  <span className="text-xs text-gray-500">12 posts</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-[#E8F5EE] rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>AI Insight:</strong> Exam period approaching - expect increased stress-related posts. Consider hosting a stress management workshop.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
          <h2 className="font-bold text-[#004D2C] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/feed">
              <Button className="w-full bg-[#006B3F] hover:bg-[#004D2C] text-white">
                <MessageCircle className="w-5 h-5 mr-2" />
                View Community Feed
              </Button>
            </Link>
            <Button variant="outline" className="w-full">
              <Users className="w-5 h-5 mr-2" />
              Browse All Cases
            </Button>
            <Button variant="outline" className="w-full">
              <BookOpen className="w-5 h-5 mr-2" />
              Create Programme
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
