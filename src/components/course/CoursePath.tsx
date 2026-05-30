import { useEffect, useMemo, useState } from "react";
import { Lock, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import { fetchStudentCoursePath, RESILIENCE_TOTAL_WEEKS, type CoursePathData } from "@/app/lib/resilienceCourse";
import { Progress } from "@/app/components/ui/progress";

export default function CoursePath() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState<CoursePathData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourse = async () => {
      if (!user) {
        setError("Please log in to view your course path.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchStudentCoursePath(user.id);
        setCourseData(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load your course path.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadCourse();
  }, [user?.id]);

  const weekCards = useMemo(() => {
    const enrollment = courseData?.enrollment;
    const program = courseData?.program;
    const modules = courseData?.modules ?? [];
    const totalWeeks = program?.total_weeks ?? RESILIENCE_TOTAL_WEEKS;

    return Array.from({ length: totalWeeks }, (_, index) => {
      const weekNumber = index + 1;
      const module = modules.find((item) => item.week_number === weekNumber);
      const isPreview = !enrollment && weekNumber === 1;
      const isActive = enrollment ? weekNumber === enrollment.current_week : weekNumber === 1;
      const isCompleted = Boolean(enrollment && weekNumber < enrollment.current_week);
      const isLocked = Boolean(enrollment && weekNumber > enrollment.current_week);

      return {
        weekNumber,
        module,
        isPreview,
        isActive,
        isCompleted,
        isLocked,
        title: module?.title ?? `Week ${weekNumber}`,
        totalWeeks,
      };
    });
  }, [courseData]);

  const handleWeekClick = (weekNumber: number, isLocked: boolean, isActive: boolean) => {
    if (isLocked) {
      toast.error("Complete the previous week first!");
      return;
    }

    if (isActive || weekNumber === 1) {
      navigate(`/programmes/resilience/week-${weekNumber}`);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
        <p className="mt-3 text-sm text-slate-600">Loading your course path...</p>
      </div>
    );
  }

  const enrollment = courseData?.enrollment;
  const progressValue = enrollment ? Math.max(0, Math.min(100, (enrollment.current_week / RESILIENCE_TOTAL_WEEKS) * 100)) : 0;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {courseData?.program?.title ?? "6-Week Student Resilience"}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Your learning journey unlocks one week at a time. Week 1 is available first, and the remaining 8 weeks unlock as you progress.
            </p>
          </div>
          <div className="w-full max-w-sm rounded-2xl bg-slate-50 px-4 py-3">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Progress</span>
              <span>{enrollment ? `Week ${enrollment.current_week}/${RESILIENCE_TOTAL_WEEKS}` : "Preview"}</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {error && <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>}

        {!enrollment && (
          <div className="mb-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            Preview mode is available now. Join the course with a counsellor to track your progress and unlock Week 1 completion.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {weekCards.map((card) => (
            <button
              key={card.weekNumber}
              type="button"
              onClick={() => handleWeekClick(card.weekNumber, card.isLocked, card.isActive)}
              className={`group flex h-full flex-col rounded-3xl border p-5 text-left transition ${card.isActive ? "border-emerald-500 bg-emerald-50 shadow-sm ring-2 ring-emerald-200" : card.isCompleted ? "border-emerald-200 bg-white hover:border-emerald-300" : card.isPreview ? "border-amber-200 bg-amber-50 hover:border-amber-300" : "border-slate-200 bg-slate-100 opacity-70 grayscale hover:opacity-80"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Week {card.weekNumber}</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">{card.title}</h2>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${card.isActive ? "bg-emerald-600 text-white" : card.isCompleted ? "bg-emerald-100 text-emerald-700" : card.isPreview ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-500"}`}>
                  {card.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : card.isLocked ? <Lock className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                </div>
              </div>

              <div className="mt-4 flex-1 rounded-2xl bg-white/70 p-4 text-sm text-slate-600">
                {card.isPreview && <p>Week 1 preview is available. Join a counsellor to save your progress and continue the course.</p>}
                {card.isActive && <p>This is your current active week. Open the exercise to continue.</p>}
                {card.isCompleted && <p>Completed. Review the material anytime to reinforce the habit.</p>}
                {card.isLocked && <p>Locked until you complete Week {card.weekNumber - 1}.</p>}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm font-medium">
                <span className={card.isCompleted ? "text-emerald-700" : card.isActive ? "text-emerald-800" : card.isPreview ? "text-amber-700" : "text-slate-600"}>
                  {card.isCompleted ? "Completed" : card.isPreview ? "Preview available" : card.isActive ? "Active week" : "Locked"}
                </span>
                {(card.isActive || card.isPreview) && <span className="text-emerald-700">Open exercise</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
