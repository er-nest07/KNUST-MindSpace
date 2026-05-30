import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BookOpen, CheckCircle2, ChevronDown, GraduationCap, Loader2, PlusCircle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/app/lib/supabase";
import { type DbConversation, type DbProfile, type DbProgramme } from "@/app/lib/community";
import { LEGACY_RESILIENCE_PROGRAM_TITLE, RESILIENCE_PROGRAM, RESILIENCE_PROGRAM_TITLE } from "@/app/lib/resilienceCourse";
import CounsellorProgressTracker from "./CounsellorProgressTracker";

type TabKey = "courses" | "progress";

type CourseTemplate = DbProgramme;
type ClientProfile = Pick<DbProfile, "id" | "display_name" | "email" | "visibility" | "pseudonym" | "avatar_url">;

type AssignmentPayload = {
  programme_id: string;
  student_id: string;
  counsellor_id: string;
  status: "active";
  progress: number;
  total_days: number;
  custom_notes: string | null;
};

function getClientLabel(client: ClientProfile) {
  if (client.display_name) return client.display_name;
  if (client.visibility === "pseudonym" && client.pseudonym) return client.pseudonym;
  return client.email;
}

export default function CounsellorCourseManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("courses");
  const [programmes, setProgrammes] = useState<CourseTemplate[]>([]);
  const [activeClients, setActiveClients] = useState<ClientProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgramme, setSelectedProgramme] = useState<CourseTemplate | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const resilienceFallbackProgramme = useMemo(
    () => ({
      id: "resilience-course-fallback",
      name: RESILIENCE_PROGRAM.title,
      description: RESILIENCE_PROGRAM.description,
      duration_days: 63,
      checkin_frequency: "weekly",
    }),
    [],
  );

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      const [{ data: programmeRows, error: programmeError }, { data: conversationRows, error: conversationError }] =
        await Promise.all([
          supabase.from("programmes").select("*").order("name", { ascending: true }),
          supabase.from("conversations").select("student_id").eq("counsellor_id", user.id).eq("status", "active"),
        ]);

      if (programmeError) {
        setError(programmeError.message);
        setIsLoading(false);
        return;
      }

      if (conversationError) {
        setError(conversationError.message);
        setIsLoading(false);
        return;
      }

      const currentProgrammes = (programmeRows ?? []) as CourseTemplate[];
      setProgrammes(currentProgrammes);

      const studentIds = [...new Set((conversationRows ?? []).map((conversation: DbConversation) => conversation.student_id))];

      let studentRows: ClientProfile[] = [];
      if (studentIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from("profiles")
          .select("id, display_name, email, visibility, pseudonym, avatar_url")
          .in("id", studentIds)
          .order("display_name", { ascending: true });

        if (profileError) {
          setError(profileError.message);
          setIsLoading(false);
          return;
        }

        studentRows = (profileRows ?? []) as ClientProfile[];
      }

      setActiveClients(studentRows);
      setIsLoading(false);
    };

    void loadDashboardData();
  }, [user?.id]);

  const activeClientOptions = useMemo(
    () =>
      activeClients.map((client) => ({
        id: client.id,
        label: getClientLabel(client),
      })),
    [activeClients],
  );

  const hasAnyResilienceProgramme = programmes.some((programme) => [RESILIENCE_PROGRAM_TITLE, LEGACY_RESILIENCE_PROGRAM_TITLE].includes(programme.name));
  const displayProgrammes = hasAnyResilienceProgramme ? programmes : [resilienceFallbackProgramme, ...programmes];

  const openAssignmentModal = (programme: CourseTemplate) => {
    setSelectedProgramme(programme);
    setSelectedStudentId("");
    setIsModalOpen(true);
  };

  const closeAssignmentModal = () => {
    setIsModalOpen(false);
    setSelectedProgramme(null);
    setSelectedStudentId("");
  };

  const canAssign = Boolean(user && selectedProgramme && selectedStudentId);

  const handleAssign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !selectedProgramme || !selectedStudentId) return;

    setIsAssigning(true);
    setError("");

    const payload: AssignmentPayload = {
      programme_id: selectedProgramme.id,
      student_id: selectedStudentId,
      counsellor_id: user.id,
      status: "active",
      progress: 1,
      total_days: selectedProgramme.duration_days,
      custom_notes: null,
    };

    const { error: insertError } = await supabase.from("enrolments").insert(payload);

    if (insertError) {
      setError(insertError.message);
      setIsAssigning(false);
      return;
    }

    setIsAssigning(false);
    closeAssignmentModal();
    setActiveTab("progress");
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <GraduationCap className="h-3.5 w-3.5" />
              Counsellor Course Management
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Manage courses and student assignments</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Assign programmes to active clients, then track live progress from the same panel.
            </p>
          </div>

          <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm font-medium text-slate-600">
            {(["courses", "progress"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-4 py-2 transition ${activeTab === tab ? "bg-white text-emerald-700 shadow-sm" : "hover:text-slate-900"}`}
              >
                {tab === "courses" ? "Course Overview" : "Progress Tracker"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        {activeTab === "courses" ? (
          <div className="space-y-6">
            {!hasAnyResilienceProgramme && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                The 9-Week Mental Health Journey course is not yet seeded in the database, so this dashboard shows a local preview card.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Global courses</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{programmes.length}</p>
                <p className="mt-1 text-sm text-slate-600">Available programme templates</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active clients</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{activeClients.length}</p>
                <p className="mt-1 text-sm text-slate-600">Students available for assignment</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live dashboard</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">Ready</p>
                <p className="mt-1 text-sm text-slate-600">Use the progress tab for live updates</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="h-4 w-1/2 rounded bg-slate-200" />
                    <div className="mt-4 h-3 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-5/6 rounded bg-slate-200" />
                    <div className="mt-6 h-10 w-32 rounded-xl bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : programmes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No course templates yet</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Add rows to the <code className="rounded bg-white px-1.5 py-0.5 text-xs">programmes</code> table to start assigning counsellor-led courses.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {displayProgrammes.map((programme) => {
                  const isFallbackResilience = programme.id === resilienceFallbackProgramme.id;
                  const displayName = [RESILIENCE_PROGRAM_TITLE, LEGACY_RESILIENCE_PROGRAM_TITLE].includes(programme.name)
                    ? RESILIENCE_PROGRAM.title
                    : programme.name;

                  return (
                  <article key={programme.id} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-slate-900">{displayName}</h3>
                        <p className="mt-1 text-sm text-slate-600">{programme.description}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</p>
                        <p className="mt-1 font-medium text-slate-900">{programme.duration_days} days</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Check-ins</p>
                        <p className="mt-1 font-medium text-slate-900">{programme.checkin_frequency}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        {isFallbackResilience ? "Preview only" : "Ready to assign"}
                      </div>

                      <button
                        type="button"
                        onClick={() => openAssignmentModal(programme)}
                        disabled={isFallbackResilience}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <PlusCircle className="h-4 w-4" />
                        {isFallbackResilience ? "Seed Required" : "Assign to Student"}
                      </button>
                    </div>
                  </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <CounsellorProgressTracker />
        )}
      </div>

      {isModalOpen && selectedProgramme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Assign course</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedProgramme.name}</h3>
                <p className="mt-1 text-sm text-slate-600">Pick one active client to start this programme.</p>
              </div>
              <button
                type="button"
                onClick={closeAssignmentModal}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close assignment modal"
              >
                <ChevronDown className="h-5 w-5 rotate-90" />
              </button>
            </div>

            <form onSubmit={handleAssign} className="mt-6 space-y-5">
              <div>
                <label htmlFor="student" className="text-sm font-medium text-slate-700">
                  Select active client
                </label>
                <div className="relative mt-2">
                  <select
                    id="student"
                    value={selectedStudentId}
                    onChange={(event) => setSelectedStudentId(event.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="">Choose a student</option>
                    {activeClientOptions.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>

                {activeClientOptions.length === 0 && (
                  <p className="mt-2 text-sm text-amber-700">
                    No active clients were found. Start an active conversation before assigning a course.
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-900">Assignment details</p>
                <ul className="mt-2 space-y-1">
                  <li>Course: {selectedProgramme.name}</li>
                  <li>Initial progress: 1</li>
                  <li>Status: active</li>
                </ul>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAssignmentModal}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canAssign || isAssigning}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                  {isAssigning ? "Assigning..." : "Assign Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}