import { useEffect, useMemo, useState } from "react";
import { Lock, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import { fetchStudentCoursePath, type CoursePathData } from "@/app/lib/resilienceCourse";

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

    return Array.from({ length: 6 }, (_, index) => {
      const weekNumber = index + 1;
      const module = modules.find((item) => item.week_number === weekNumber);
      const isActive = enrollment ? weekNumber === enrollment.current_week : weekNumber === 1;
      const isCompleted = Boolean(enrollment && weekNumber < enrollment.current_week);
      const isLocked = Boolean(enrollment && weekNumber > enrollment.current_week);

      return {
        weekNumber,
        module,
        isActive,
        isCompleted,
        isLocked,
        title: module?.title ?? `Week ${weekNumber}`,
        totalWeeks: program?.total_weeks ?? 6,
      };
    });
  }, [courseData]);

  const handleWeekClick = (weekNumber: number, isLocked: boolean, isActive: boolean) => {
    if (isLocked) {
      toast.error("Complete the previous week first!");
      return;
    }

    if (isActive) {
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

  if (error && !courseData?.enrollment) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {courseData?.program?.title ?? "6-Week Student Resilience"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Your learning journey unlocks one week at a time. Finish the active week to reveal the next.
        </p>
      </div>

      <div className="px-6 py-6">
        {!courseData?.enrollment ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-600">
            You are not enrolled in the resilience course yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {weekCards.map((card) => (
              <button
                key={card.weekNumber}
                type="button"
                onClick={() => handleWeekClick(card.weekNumber, card.isLocked, card.isActive)}
                className={`group flex h-full flex-col rounded-3xl border p-5 text-left transition ${card.isActive ? "border-emerald-500 bg-emerald-50 shadow-sm ring-2 ring-emerald-200" : card.isCompleted ? "border-emerald-200 bg-white hover:border-emerald-300" : "border-slate-200 bg-slate-100 opacity-70 grayscale hover:opacity-80"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Week {card.weekNumber}</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">{card.title}</h2>
                  </div>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${card.isActive ? "bg-emerald-600 text-white" : card.isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                    {card.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : card.isLocked ? <Lock className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                  </div>
                </div>

                <div className="mt-4 flex-1 rounded-2xl bg-white/70 p-4 text-sm text-slate-600">
                  {card.isActive && <p>This is your current active week. Open the exercise to continue.</p>}
                  {card.isCompleted && <p>Completed. Review the material anytime to reinforce the habit.</p>}
                  {card.isLocked && <p>Locked until you complete Week {card.weekNumber - 1}.</p>}
                </div>

                <div className="mt-4 flex items-center justify-between text-sm font-medium">
                  <span className={card.isCompleted ? "text-emerald-700" : card.isActive ? "text-emerald-800" : "text-slate-600"}>
                    {card.isCompleted ? "Completed" : card.isActive ? "Active week" : "Locked"}
                  </span>
                  {card.isActive && <span className="text-emerald-700">Open exercise</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
