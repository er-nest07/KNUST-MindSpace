import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, MessageSquareText, RefreshCcw } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/app/lib/supabase";
import { type DbEnrolment, type DbProfile, type DbProgramme } from "@/app/lib/community";
import { LEGACY_RESILIENCE_PROGRAM_TITLE, RESILIENCE_PROGRAM_TITLE, RESILIENCE_TOTAL_WEEKS } from "@/app/lib/resilienceCourse";

type ActiveEnrolment = DbEnrolment & {
  current_week?: number | null;
};

type CheckInRow = {
  id: string;
  enrolment_id: string;
  student_id: string;
  response_one: string | null;
  response_two: string | null;
  mood_score: number | null;
  created_at: string;
};

type TrackerRow = {
  enrolment: ActiveEnrolment;
  student: DbProfile | undefined;
  programme: DbProgramme | undefined;
  programmeName: string | undefined;
  currentWeek: number;
  totalWeeks: number;
  progressPercent: number;
};

function getDisplayName(profile: DbProfile | undefined) {
  if (!profile) return "Unknown Student";
  if (profile.display_name) return profile.display_name;
  if (profile.visibility === "pseudonym" && profile.pseudonym) return profile.pseudonym;
  return profile.email;
}

function toWeeks(days: number) {
  return Math.max(1, Math.ceil(days / 7));
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export default function CounsellorProgressTracker() {
  const { user } = useAuth();
  const [enrolments, setEnrolments] = useState<ActiveEnrolment[]>([]);
  const [programmes, setProgrammes] = useState<DbProgramme[]>([]);
  const [students, setStudents] = useState<DbProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [isLoadingCheckIn, setIsLoadingCheckIn] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TrackerRow | null>(null);
  const [latestCheckIn, setLatestCheckIn] = useState<CheckInRow | null>(null);

  const loadTracker = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    const [{ data: enrolmentRows, error: enrolmentError }, { data: programmeRows, error: programmeError }] =
      await Promise.all([
        supabase
          .from("enrolments")
          .select("*")
          .eq("counsellor_id", user.id)
          .eq("status", "active")
          .order("enrolled_at", { ascending: false }),
        supabase.from("programmes").select("*").order("name", { ascending: true }),
      ]);

    if (enrolmentError) {
      setError(enrolmentError.message);
      setIsLoading(false);
      return;
    }

    if (programmeError) {
      setError(programmeError.message);
      setIsLoading(false);
      return;
    }

    const loadedEnrolments = (enrolmentRows ?? []) as ActiveEnrolment[];
    const programmeList = (programmeRows ?? []) as DbProgramme[];
    const studentIds = [...new Set(loadedEnrolments.map((enrolment) => enrolment.student_id))];

    let studentList: DbProfile[] = [];
    if (studentIds.length > 0) {
      const { data: studentRows, error: studentError } = await supabase.from("profiles").select("*").in("id", studentIds);

      if (studentError) {
        setError(studentError.message);
        setIsLoading(false);
        return;
      }

      studentList = (studentRows ?? []) as DbProfile[];
    }

    setEnrolments(loadedEnrolments);
    setProgrammes(programmeList);
    setStudents(studentList);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void loadTracker();

    if (!user) return;

    const channel = supabase
      .channel(`counsellor-progress-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enrolments", filter: `counsellor_id=eq.${user.id}` },
        () => {
          void loadTracker();
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "checkins" },
        () => {
          void loadTracker();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadTracker, user]);

  const rows = useMemo<TrackerRow[]>(() => {
    return enrolments.map((enrolment) => {
      const programme = programmes.find((item) => item.id === enrolment.programme_id);
      const student = students.find((item) => item.id === enrolment.student_id);
      const isResilienceCourse = Boolean(programme && [RESILIENCE_PROGRAM_TITLE, LEGACY_RESILIENCE_PROGRAM_TITLE].includes(programme.name));
      const currentWeek = enrolment.current_week ?? Math.max(1, Math.ceil(Math.max(enrolment.progress, 1) / 7));
      const totalWeeks = isResilienceCourse ? RESILIENCE_TOTAL_WEEKS : programme ? toWeeks(programme.duration_days) : toWeeks(Math.max(enrolment.total_days, 1));
      const progressPercent = clampPercent((currentWeek / totalWeeks) * 100);
      const programmeName = isResilienceCourse ? RESILIENCE_PROGRAM_TITLE : programme?.name;

      return {
        enrolment,
        student,
        programme,
        programmeName,
        currentWeek,
        totalWeeks,
        progressPercent,
      };
    });
  }, [enrolments, programmes, students]);

  const closeFlyout = () => {
    setIsFlyoutOpen(false);
    setSelectedRow(null);
    setLatestCheckIn(null);
  };

  const reviewLatestCheckIn = async (row: TrackerRow) => {
    setSelectedRow(row);
    setLatestCheckIn(null);
    setIsFlyoutOpen(true);
    setIsLoadingCheckIn(true);

    const { data, error: checkInError } = await supabase
      .from("checkins")
      .select("id, enrolment_id, student_id, response_one, response_two, mood_score, created_at")
      .eq("enrolment_id", row.enrolment.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<CheckInRow>();

    if (checkInError) {
      setError(checkInError.message);
      setIsLoadingCheckIn(false);
      return;
    }

    setLatestCheckIn(data ?? null);
    setIsLoadingCheckIn(false);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-emerald-600" />
        <p className="mt-3">Loading progress tracker...</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-slate-400" />
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No active enrolments yet</h3>
        <p className="mt-2 text-sm text-slate-600">
          Once a client is assigned to a programme, their live week-by-week progress will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Live progress tracker</h3>
          <p className="text-sm text-slate-600">Track active students enrolled in your programmes.</p>
        </div>

        <button
          type="button"
          onClick={() => void loadTracker()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Student Name</th>
                <th className="px-5 py-4">Enrolled Course</th>
                <th className="px-5 py-4">Progress</th>
                <th className="px-5 py-4">Latest Check-in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row) => (
                <tr key={row.enrolment.id} className="align-top">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">{getDisplayName(row.student)}</div>
                    <div className="text-sm text-slate-500">{row.student?.email}</div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">{row.programmeName ?? "Programme unavailable"}</div>
                    <div className="text-sm text-slate-500">{row.programme?.checkin_frequency ?? "Schedule unavailable"}</div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>
                        Week {row.currentWeek} of {row.totalWeeks}
                      </span>
                      <span>{Math.round(row.progressPercent)}%</span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-slate-100">
                      <div className="h-2.5 rounded-full bg-emerald-600 transition-all" style={{ width: `${row.progressPercent}%` }} />
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => void reviewLatestCheckIn(row)}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <MessageSquareText className="h-4 w-4" />
                      Review Latest Check-in
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFlyoutOpen && selectedRow && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close check-in panel"
            className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-sm"
            onClick={closeFlyout}
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Latest check-in</p>
                <h4 className="mt-1 text-xl font-semibold text-slate-900">{getDisplayName(selectedRow.student)}</h4>
                <p className="mt-1 text-sm text-slate-600">{selectedRow.programme?.name ?? "Programme details unavailable"}</p>
              </div>
              <button
                type="button"
                onClick={closeFlyout}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <ChevronDown className="h-5 w-5 rotate-90" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {isLoadingCheckIn ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  <p className="mt-3">Fetching the latest check-in...</p>
                </div>
              ) : latestCheckIn ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mood score</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">{latestCheckIn.mood_score ?? "—"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Created</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{new Date(latestCheckIn.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Response one</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {latestCheckIn.response_one || "No response recorded."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Response two</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {latestCheckIn.response_two || "No response recorded."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                  No check-in has been recorded for this enrolment yet.
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}