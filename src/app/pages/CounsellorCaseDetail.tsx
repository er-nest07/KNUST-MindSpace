import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, MessageCircle, BookOpen, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";
import { type DbConversation, type DbEnrolment, type DbMessage, type DbProgramme } from "../lib/community";

export default function CounsellorCaseDetail() {
  const { id } = useParams();
  const [conversation, setConversation] = useState<DbConversation | null>(null);
  const [enrolments, setEnrolments] = useState<DbEnrolment[]>([]);
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [programmeMap, setProgrammeMap] = useState<Map<string, DbProgramme>>(new Map());

  useEffect(() => {
    const loadCaseDetail = async () => {
      if (!id) return;

      const [{ data: conversationRows }, { data: enrolmentRows }] = await Promise.all([
        supabase
          .from('conversations')
          .select('*')
          .eq('student_id', id)
          .order('last_message_at', { ascending: false })
          .limit(1),
        supabase.from('enrolments').select('*').eq('student_id', id),
      ]);

      const primaryConversation = ((conversationRows ?? []) as DbConversation[])[0] || null;
      const loadedEnrolments = (enrolmentRows ?? []) as DbEnrolment[];

      setConversation(primaryConversation);
      setEnrolments(loadedEnrolments);

      if (primaryConversation) {
        const { data: messageRows } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', primaryConversation.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setMessages(((messageRows ?? []) as DbMessage[]).reverse());
      } else {
        setMessages([]);
      }

      const programmeIds = [...new Set(loadedEnrolments.map((enrolment) => enrolment.programme_id))];
      if (programmeIds.length > 0) {
        const { data: programmes } = await supabase.from('programmes').select('*').in('id', programmeIds);
        const map = new Map<string, DbProgramme>();
        ((programmes ?? []) as DbProgramme[]).forEach((programme) => map.set(programme.id, programme));
        setProgrammeMap(map);
      } else {
        setProgrammeMap(new Map());
      }
    };

    loadCaseDetail();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Link to="/counsellor/dashboard" className="inline-flex items-center gap-2 text-[#006B3F] hover:text-[#004D2C] mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#004D2C] mb-2">Student #{id?.slice(0, 8)}</h1>
          <p className="text-gray-600">Case overview and support history</p>
        </div>

        {/* AI Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#FDB913] mb-8">
          <div className="flex items-start gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-[#FDB913] flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-[#004D2C] mb-2">AI-Generated Summary</h2>
              <p className="text-gray-700">{conversation?.ai_summary}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
              Urgency: Medium
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              Academic Stress
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Conversation History */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#004D2C]">Conversation History</h2>
                <Link to={`/chat/${conversation?.id}`}>
                  <Button size="sm" className="bg-[#006B3F] hover:bg-[#004D2C] text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Open Chat
                  </Button>
                </Link>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.slice(0, 5).map((message) => (
                  <div key={message.id} className="p-4 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-[#004D2C]">
                        {message.sender_id === conversation?.counsellor_id ? 'You' : 'Student'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{message.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Programme Enrolments */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
              <h2 className="font-bold text-[#004D2C] mb-4">Active Programmes</h2>
              {enrolments.length > 0 ? (
                <div className="space-y-4">
                  {enrolments.map((enrolment) => {
                    const programme = programmeMap.get(enrolment.programme_id);
                    const progressPercent = (enrolment.progress / enrolment.total_days) * 100;

                    return (
                      <div key={enrolment.id} className="p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-[#004D2C]">{programme?.name}</h3>
                          <span className="text-sm text-gray-600">Day {enrolment.progress}/{enrolment.total_days}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-[#006B3F]" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <p className="text-sm text-gray-600">{enrolment.custom_notes}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No active programmes</p>
                  <Button variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Enrol in Programme
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Info */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
              <h3 className="font-bold text-[#004D2C] mb-4">Student Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Student ID</p>
                  <p className="font-semibold text-[#004D2C]">#{id?.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Visibility</p>
                  <p className="font-semibold text-[#004D2C]">Anonymous</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">First Contact</p>
                  <p className="font-semibold text-[#004D2C]">
                    {conversation && new Date(conversation.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Status</p>
                  <span className="inline-block px-3 py-1 bg-[#E8F5EE] text-[#006B3F] rounded-full text-xs font-semibold">
                    {conversation?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
              <h3 className="font-bold text-[#004D2C] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Enrol in Programme
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Flag for Review
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
              <h3 className="font-bold text-[#004D2C] mb-4">Counsellor Notes</h3>
              <textarea
                className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg text-sm"
                placeholder="Add private notes about this case..."
              ></textarea>
              <Button size="sm" className="w-full mt-2 bg-[#006B3F] hover:bg-[#004D2C] text-white">
                Save Notes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
