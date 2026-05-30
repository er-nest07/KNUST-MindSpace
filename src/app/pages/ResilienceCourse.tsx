import { useParams } from "react-router";
import { BookOpen } from "lucide-react";
import CoursePath from "@/components/course/CoursePath";
import WeekOneExercise from "@/components/course/WeekOneExercise";
import { useAuth } from "@/app/context/AuthContext";
import { fetchStudentCoursePath } from "@/app/lib/resilienceCourse";
import { useEffect, useState } from "react";
import type { CoursePathData } from "@/app/lib/resilienceCourse";

export default function ResilienceCourse() {
  const { week } = useParams();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState<CoursePathData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const data = await fetchStudentCoursePath(user.id);
        setCourseData(data);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [user?.id]);

  if (week === "week-1") {
    return (
      <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            <CoursePath />
            <WeekOneExercise />
          </div>
        </div>
      </div>
    );
  }

  if (week && week.startsWith("week-")) {
    const weekNumber = Number(week.replace("week-", ""));
    const module = courseData?.modules.find((item) => item.week_number === weekNumber);

    return (
      <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <CoursePath />

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {module?.title || `Week ${weekNumber}`}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {isLoading
                    ? "Loading your module..."
                    : weekNumber === 1
                      ? "Open Week 1 to begin the interactive exercise."
                      : "This week is visible in your course path. It is ready once the previous week has been completed."}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              <div className="whitespace-pre-wrap">{module?.content_markdown || "Module content will appear here."}</div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <CoursePath />
      </div>
    </div>
  );
}
