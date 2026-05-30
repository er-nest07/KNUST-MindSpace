import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import { completeWeekOne, fetchStudentCoursePath, type CoursePathData } from "@/app/lib/resilienceCourse";

const bodyMapItems = ["Headache", "Tight Chest", "Racing Heart", "Muscle Tension"] as const;

export default function WeekOneExercise() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState<CoursePathData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [moodScore, setMoodScore] = useState(5);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourse = async () => {
      if (!user) {
        setError("Please log in to access your course.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchStudentCoursePath(user.id);
        setCourseData(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load your course.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadCourse();
  }, [user?.id]);

  const weekOneModule = useMemo(
    () => courseData?.modules.find((module) => module.week_number === 1) ?? null,
    [courseData],
  );

  const hasActiveEnrollment = Boolean(courseData?.enrollment);

  const toggleArea = (area: string) => {
    setSelectedAreas((current) =>
      current.includes(area) ? current.filter((item) => item !== area) : [...current, area],
    );
  };

  const handleComplete = async () => {
    if (!courseData?.enrollment) {
      toast.error("Join the course with a counsellor before completing Week 1.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await completeWeekOne(courseData.enrollment.id);
      toast.success("Week 1 completed. Week 2 is now unlocked.");
      navigate("/programmes/resilience");
    } catch (completeError) {
      const message = completeError instanceof Error ? completeError.message : "Could not complete Week 1.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
        <p className="mt-3 text-sm text-slate-600">Loading Week 1 exercise...</p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <Zap className="h-3.5 w-3.5" />
          Week 1 Interactive Exercise
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
          {weekOneModule?.title ?? "Mind-Body Connection"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Notice how stress appears in your body, then practice a small reset using breath, awareness, and reflection.
        </p>
      </div>

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.3fr_0.7fr]">
        {error && (
          <div className="lg:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Week content</h2>
            <article className="prose prose-slate mt-4 max-w-none prose-headings:font-semibold prose-p:leading-7 prose-li:leading-7">
              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {weekOneModule?.content_markdown || "Week 1 content is not available yet."}
              </div>
            </article>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900">Body Mapping Checklist</h2>
            <p className="mt-1 text-sm text-slate-600">Select every stress signal you noticed this week.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {bodyMapItems.map((item) => {
                const checked = selectedAreas.includes(item);
                return (
                  <label
                    key={item}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${checked ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleArea(item)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="space-y-6 rounded-2xl bg-slate-50 p-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Mood Slider</h2>
            <p className="mt-1 text-sm text-slate-600">Rate how you feel today from 1 to 10.</p>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>1</span>
              <span className="text-3xl font-semibold text-emerald-700">{moodScore}</span>
              <span>10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={moodScore}
              onChange={(event) => setMoodScore(Number(event.target.value))}
              className="mt-3 w-full accent-emerald-600"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Your check-in</p>
            <p className="mt-2">Selected body signals: {selectedAreas.length > 0 ? selectedAreas.join(", ") : "none yet"}.</p>
            <p className="mt-1">Mood score: {moodScore}/10.</p>
          </div>

          {!hasActiveEnrollment && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Week 1 content is open as a preview. Join the course from the Programmes page to save progress and unlock completion.
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleComplete()}
            disabled={!hasActiveEnrollment || isSaving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {isSaving ? "Completing Week 1..." : hasActiveEnrollment ? "Complete Week 1" : "Join to Complete Week 1"}
          </button>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
            Completing Week 1 updates your enrollment so Week 2 becomes available on your course path.
          </div>
        </aside>
      </div>
    </section>
  );
}
