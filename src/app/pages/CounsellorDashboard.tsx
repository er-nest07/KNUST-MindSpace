import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Users, MessageCircle, AlertTriangle, TrendingUp, BookOpen } from "lucide-react";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { type DbConversation } from "../lib/community";
import CounsellorCourseManager from "@/components/dashboard/CounsellorCourseManager";

export default function CounsellorDashboard() {
  const { user } = useAuth();
  const [activeCases, setActiveCases] = useState(0);
  const [pendingPosts, setPendingPosts] = useState(0);
  const [crisisFlags, setCrisisFlags] = useState(0);
  const [activeEnrolments, setActiveEnrolments] = useState(0);
  const [activeConversations, setActiveConversations] = useState<DbConversation[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return;

      const [
        { count: casesCount },
        { count: postsCount },
        { count: crisisCount },
        { count: enrolmentCount },
        { data: conversations },
      ] = await Promise.all([
        supabase
          .from("conversations")
          .select("id", { head: true, count: "exact" })
          .eq("counsellor_id", user.id)
          .eq("status", "active"),

        supabase
          .from("posts")
          .select("id", { head: true, count: "exact" })
          .eq("is_private", false)
          .eq("is_approved", true),

        supabase
          .from("posts")
          .select("id", { head: true, count: "exact" })
          .eq("is_crisis", true),

        supabase
          .from("enrolments")
          .select("id", { head: true, count: "exact" })
          .eq("counsellor_id", user.id)
          .eq("status", "active"),

        supabase
          .from("conversations")
          .select("*")
          .eq("counsellor_id", user.id)
          .eq("status", "active")
          .order("last_message_at", { ascending: false })
          .limit(5),
      ]);

      setActiveCases(casesCount ?? 0);
      setPendingPosts(postsCount ?? 0);
      setCrisisFlags(crisisCount ?? 0);
      setActiveEnrolments(enrolmentCount ?? 0);
      setActiveConversations((conversations ?? []) as DbConversation[]);
    };

    loadDashboard();
  }, [user?.id]);

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
              {activeConversations.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/counsellor/case/${conv.student_id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-[#006B3F] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-[#004D2C]">Student #{conv.student_id.slice(0, 8)}</div>
                    <span className="text-xs text-gray-500">
                      {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : 'new'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conv.ai_summary || 'No summary yet'}</p>
                </Link>
              ))}
            </div>
            <Link to="/conversations">
              <Button variant="outline" className="w-full mt-4">
                View All Cases
              </Button>
            </Link>
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

        {/* Quick Navigation */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
          <h2 className="font-bold text-[#004D2C] mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="#course-management" className="block">
              <Button className="w-full bg-[#006B3F] hover:bg-[#004D2C] text-white">
                <BookOpen className="w-5 h-5 mr-2" />
                Jump to Course Management
              </Button>
            </a>
            <Link to="/counsellor/programmes/new">
              <Button variant="outline" className="w-full">
                <BookOpen className="w-5 h-5 mr-2" />
                Create Programme
              </Button>
            </Link>
          </div>
        </div>

        {/* Course Management */}
        <div className="mt-8" id="course-management">
          <CounsellorCourseManager />
        </div>
      </div>
    </div>
  );
}
