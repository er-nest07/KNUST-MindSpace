import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { BookOpen, Calendar, CheckCircle, CheckCircle2, Clock, Loader2, Lock, MessageCircleMore, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import CounsellorBadge from "../components/shared/CounsellorBadge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { supabase } from "../lib/supabase";
import { type DbEnrolment, type DbProgramme, type DbProfile } from "../lib/community";
import { LEGACY_RESILIENCE_PROGRAM_TITLE, RESILIENCE_MODULES, RESILIENCE_PROGRAM_TITLE, RESILIENCE_TOTAL_WEEKS, joinResilienceCourse } from "../lib/resilienceCourse";

export default function MyProgrammes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolments, setEnrolments] = useState<DbEnrolment[]>([]);
  const [programmes, setProgrammes] = useState<DbProgramme[]>([]);
  const [counsellors, setCounsellors] = useState<Map<string, DbProfile>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState("");
  const [joinNotes, setJoinNotes] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    const loadProgrammes = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const [{ data: enrolmentRows }, { data: programmeRows }, { data: counsellorRows }] = await Promise.all([
        supabase.from('enrolments').select('*').eq('student_id', user.id),
        supabase.from('programmes').select('*').order('name', { ascending: true }),
        supabase.from('profiles').select('*').eq('role', 'counsellor').eq('is_verified_counsellor', true).eq('is_frozen', false).order('display_name', { ascending: true }),
      ]);

      const loadedEnrolments = (enrolmentRows ?? []) as DbEnrolment[];
      setEnrolments(loadedEnrolments);
      setProgrammes((programmeRows ?? []) as DbProgramme[]);

      const map = new Map<string, DbProfile>();
      ((counsellorRows ?? []) as DbProfile[]).forEach((row) => map.set(row.id, row));
      loadedEnrolments.forEach((enrolment) => {
        if (!map.has(enrolment.counsellor_id)) {
          map.set(enrolment.counsellor_id, {
            id: enrolment.counsellor_id,
            email: "",
            role: "counsellor",
            display_name: null,
            avatar_url: null,
            visibility: "identified",
            pseudonym: null,
            is_verified_counsellor: true,
            counsellor_title: null,
            counsellor_bio: null,
            is_frozen: false,
            freeze_reason: null,
            created_at: "",
            updated_at: "",
          });
        }
      });
      setCounsellors(map);

      setIsLoading(false);
    };

    loadProgrammes();
  }, [user?.id]);

  const activeEnrolments = useMemo(
    () => enrolments.filter((enrolment) => enrolment.status === 'active'),
    [enrolments],
  );

  const resilienceProgramme = useMemo(
    () => programmes.find((programme) => [RESILIENCE_PROGRAM_TITLE, LEGACY_RESILIENCE_PROGRAM_TITLE].includes(programme.name)) ?? null,
    [programmes],
  );

  const resilienceEnrolment = useMemo(
    () => activeEnrolments.find((enrolment) => enrolment.programme_id === resilienceProgramme?.id) ?? null,
    [activeEnrolments, resilienceProgramme?.id],
  );

  const regularProgrammes = useMemo(
    () => programmes.filter((programme) => programme.name !== RESILIENCE_PROGRAM_TITLE),
    [programmes],
  );

  const counsellorOptions = useMemo(
    () => [...counsellors.values()].filter((profile) => profile.role === 'counsellor' && profile.is_verified_counsellor && !profile.is_frozen),
    [counsellors],
  );

  const resilienceProgressPercent = resilienceEnrolment
    ? Math.min(100, (resilienceEnrolment.progress / RESILIENCE_TOTAL_WEEKS) * 100)
    : 0;

  const openJoinDialog = () => {
    setJoinError("");
    setSelectedCounsellorId(counsellorOptions[0]?.id ?? "");
    setJoinNotes("");
    setIsJoinDialogOpen(true);
  };

  const handleJoinCourse = async () => {
    if (!user) {
      toast.error("Please log in first.");
      return;
    }

    if (!selectedCounsellorId) {
      setJoinError("Select a counsellor to mentor you through the course.");
      return;
    }

    if (!resilienceProgramme) {
      setJoinError("The resilience programme is not available right now.");
      return;
    }

    setIsJoining(true);
    setJoinError("");

    try {
      await joinResilienceCourse(user.id, selectedCounsellorId, joinNotes);
      toast.success("You are now enrolled in the resilience course.");
      setIsJoinDialogOpen(false);
      navigate("/programmes/resilience/week-1");
    } catch (joinCourseError) {
      const message = joinCourseError instanceof Error ? joinCourseError.message : "Could not join the course.";
      setJoinError(message);
      toast.error(message);
    } finally {
      setIsJoining(false);
    }
  };

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

        {/* Resilience Course */}
        <div>
          <h2 className="text-xl font-bold text-[#004D2C] mb-4">6-Week Student Resilience</h2>
          <div className="mb-6 rounded-2xl border border-[#E8F5EE] bg-white p-6 shadow-md">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-[#006B3F]" />
                  <h3 className="font-bold text-[#004D2C]">{RESILIENCE_PROGRAM_TITLE}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  A guided six-week resilience course. Week 1 opens first, and the remaining weeks unlock as you complete each step with a counsellor mentor.
                </p>

                <div className="mb-3 flex items-center justify-between text-xs font-medium text-gray-500">
                  <span>{resilienceEnrolment ? `Week ${resilienceEnrolment.progress} of ${RESILIENCE_TOTAL_WEEKS}` : 'Preview available'}</span>
                  <span>{resilienceEnrolment ? 'In progress' : 'Join to begin'}</span>
                </div>
                <Progress value={resilienceProgressPercent} className="h-2 mb-4" />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {RESILIENCE_MODULES.map((module) => {
                    const weekNumber = module.week_number;
                    const isUnlocked = Boolean(resilienceEnrolment ? weekNumber <= resilienceEnrolment.progress : weekNumber === 1);
                    const isCurrent = Boolean(resilienceEnrolment && weekNumber === resilienceEnrolment.progress);

                    return (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() => {
                          if (isUnlocked) {
                            navigate(`/programmes/resilience/week-${weekNumber}`);
                            return;
                          }

                          toast.error("Complete the previous week first.");
                        }}
                        className={`rounded-2xl border p-3 text-left transition ${isCurrent ? 'border-[#006B3F] bg-[#E8F5EE]' : isUnlocked ? 'border-[#E8F5EE] bg-white hover:border-[#bfdccf]' : 'border-slate-200 bg-slate-50 opacity-70'}`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <span>Week {weekNumber}</span>
                          {isUnlocked ? <CheckCircle2 className="h-4 w-4 text-[#006B3F]" /> : <Lock className="h-4 w-4 text-slate-400" />}
                        </div>
                        <p className="text-sm font-semibold text-[#004D2C]">{module.title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="w-full max-w-sm rounded-2xl border border-[#E8F5EE] bg-[#F8FCF9] p-5">
                <p className="text-sm font-semibold text-[#004D2C]">Mentor support</p>
                <p className="mt-2 text-sm text-gray-600">
                  Join the course with a verified counsellor who will mentor you through the six-week journey.
                </p>

                {resilienceEnrolment ? (
                  <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-600">
                    <p className="font-medium text-[#004D2C]">Current mentor</p>
                    <p className="mt-1">{counsellors.get(resilienceEnrolment.counsellor_id)?.display_name ?? 'Assigned counsellor'}</p>
                    <Link to="/programmes/resilience" className="mt-4 inline-flex w-full">
                      <Button className="w-full bg-[#006B3F] hover:bg-[#004D2C] text-white">Open Course Path</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <Button onClick={openJoinDialog} className="w-full bg-[#006B3F] hover:bg-[#004D2C] text-white">
                      Join with a Counsellor
                    </Button>
                    <Link to="/programmes/resilience" className="inline-flex w-full">
                      <Button variant="outline" className="w-full border-[#006B3F] text-[#006B3F] hover:bg-[#E8F5EE]">
                        Preview Course Path
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#004D2C] mb-4">
            {activeEnrolments.length > 0 ? 'More Programmes' : 'Available Programmes'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularProgrammes.map((programme) => {
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

        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Join the Resilience Course</DialogTitle>
              <DialogDescription>
                Select a verified counsellor to mentor you through the six-week course.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid max-h-72 gap-3 overflow-auto pr-1">
                {counsellorOptions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                    No verified counsellors are available right now.
                  </div>
                ) : (
                  counsellorOptions.map((counsellor) => {
                    const active = selectedCounsellorId === counsellor.id;
                    return (
                      <button
                        key={counsellor.id}
                        type="button"
                        onClick={() => setSelectedCounsellorId(counsellor.id)}
                        className={`rounded-2xl border p-4 text-left transition ${active ? 'border-[#006B3F] bg-[#E8F5EE]' : 'border-slate-200 bg-white hover:border-[#bfdccf]'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-[#004D2C]">{counsellor.display_name || counsellor.email}</p>
                              <CounsellorBadge />
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{counsellor.counsellor_title || 'Verified counsellor'}</p>
                          </div>
                          {active ? <CheckCircle className="h-5 w-5 text-[#006B3F]" /> : <MessageCircleMore className="h-5 w-5 text-gray-400" />}
                        </div>
                        <p className="mt-3 text-sm text-gray-700">{counsellor.counsellor_bio || 'Available to mentor your course journey.'}</p>
                      </button>
                    );
                  })
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#004D2C]">Optional notes for your mentor</label>
                <Textarea
                  value={joinNotes}
                  onChange={(event) => setJoinNotes(event.target.value)}
                  placeholder="Share anything the counsellor should know before Week 1."
                  className="min-h-28"
                />
              </div>

              {joinError && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{joinError}</div>}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)} disabled={isJoining}>
                Cancel
              </Button>
              <Button onClick={() => void handleJoinCourse()} className="bg-[#006B3F] hover:bg-[#004D2C] text-white" disabled={isJoining || counsellorOptions.length === 0}>
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Confirm Join"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
