import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { BookOpen, Calendar, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CounsellorBadge from "../components/shared/CounsellorBadge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { supabase } from "../lib/supabase";
import { type DbEnrolment, type DbProgramme, type DbProfile } from "../lib/community";

export default function MyProgrammes() {
  const { user } = useAuth();
  const [enrolments, setEnrolments] = useState<DbEnrolment[]>([]);
  const [programmes, setProgrammes] = useState<DbProgramme[]>([]);
  const [counsellors, setCounsellors] = useState<Map<string, DbProfile>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgrammes = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const [{ data: enrolmentRows }, { data: programmeRows }] = await Promise.all([
        supabase.from('enrolments').select('*').eq('student_id', user.id),
        supabase.from('programmes').select('*').order('name', { ascending: true }),
      ]);

      const loadedEnrolments = (enrolmentRows ?? []) as DbEnrolment[];
      setEnrolments(loadedEnrolments);
      setProgrammes((programmeRows ?? []) as DbProgramme[]);

      const counsellorIds = [...new Set(loadedEnrolments.map((enrolment) => enrolment.counsellor_id))];
      if (counsellorIds.length > 0) {
        const { data: counsellorRows } = await supabase.from('profiles').select('*').in('id', counsellorIds);
        const map = new Map<string, DbProfile>();
        ((counsellorRows ?? []) as DbProfile[]).forEach((row) => map.set(row.id, row));
        setCounsellors(map);
      } else {
        setCounsellors(new Map());
      }

      setIsLoading(false);
    };

    loadProgrammes();
  }, [user?.id]);

  const activeEnrolments = useMemo(
    () => enrolments.filter((enrolment) => enrolment.status === 'active'),
    [enrolments],
  );

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#004D2C] mb-2">My Programmes</h1>
          <p className="text-gray-600">
            Structured support programmes tailored to your wellness journey
          </p>
        </div>

        {/* Active Programmes */}
        {activeEnrolments.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-[#004D2C] mb-4">Active Programmes</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeEnrolments.map((enrolment) => {
                const programme = programmes.find(p => p.id === enrolment.programme_id);
                const counsellor = counsellors.get(enrolment.counsellor_id);
                const progressPercent = (enrolment.progress / enrolment.total_days) * 100;

                return (
                  <div key={enrolment.id} className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-[#004D2C] mb-1">{programme?.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>with {counsellor?.display_name}</span>
                          <CounsellorBadge />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-[#006B3F]">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-semibold">Day {enrolment.progress}/{enrolment.total_days}</span>
                      </div>
                    </div>

                    <Progress value={progressPercent} className="h-2 mb-4" />

                    <p className="text-sm text-gray-600 mb-4">{programme?.description}</p>

                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{programme?.duration_days} days</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{programme?.checkin_frequency}</span>
                      </div>
                    </div>

                    {enrolment.status === 'active' && (
                      <Link to={`/checkin/${enrolment.id}`}>
                        <Button className="w-full bg-[#FDB913] hover:bg-[#e5a710] text-[#004D2C]">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Check In Now
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Programmes */}
        <div>
          <h2 className="text-xl font-bold text-[#004D2C] mb-4">
            {activeEnrolments.length > 0 ? 'More Programmes' : 'Available Programmes'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programmes.map((programme) => {
              const isEnrolled = enrolments.some(e => e.programme_id === programme.id);

              return (
                <div
                  key={programme.id}
                  className={`bg-white rounded-xl shadow-md p-6 border ${
                    isEnrolled ? 'border-gray-200 opacity-60' : 'border-[#E8F5EE]'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-[#E8F5EE] flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-[#006B3F]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#004D2C] mb-1">{programme.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{programme.duration_days} days</span>
                        <span>•</span>
                        <span>{programme.checkin_frequency}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{programme.description}</p>

                  {isEnrolled ? (
                    <div className="text-sm text-[#006B3F] font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Already Enrolled
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-[#006B3F] text-[#006B3F] hover:bg-[#E8F5EE]"
                    >
                      Learn More
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {isLoading && (
          <div className="mt-8 rounded-xl border border-[#E8F5EE] bg-white p-8 text-center text-gray-600">
            Loading programmes...
          </div>
        )}

        {!isLoading && activeEnrolments.length === 0 && (
          <div className="mt-8 bg-white rounded-xl p-8 border-l-4 border-[#FDB913]">
            <h3 className="font-bold text-[#004D2C] mb-2">Get Started with a Programme</h3>
            <p className="text-sm text-gray-600 mb-4">
              Programmes are structured support paths designed by counsellors. You'll check in regularly,
              track your progress, and receive personalized guidance along the way.
            </p>
            <p className="text-sm text-gray-600">
              To enroll, start a conversation with a counsellor who will recommend the best programme for your needs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
