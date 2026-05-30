import { supabase } from "@/app/lib/supabase";

export interface Program {
  id: string;
  title: string;
  description: string;
  total_weeks: number;
  created_at?: string;
  updated_at?: string;
}

export interface Module {
  id: string;
  program_id: string;
  week_number: number;
  title: string;
  content_markdown: string;
  created_at?: string;
  updated_at?: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  program_id: string;
  current_week: number;
  status: "active" | "completed" | "paused";
  enrolled_at?: string;
  updated_at?: string;
}

export const RESILIENCE_PROGRAM_TITLE = "6-Week Student Resilience";

export const RESILIENCE_MODULES: Module[] = [
  {
    id: "week-1",
    program_id: "resilience-course",
    week_number: 1,
    title: "Mind-Body Connection",
    content_markdown: `# Week 1: Mind-Body Connection

## Welcome to Week 1
This first week helps you notice how stress shows up in your body and how your thoughts can intensify or reduce that stress. Resilience starts with awareness. When you can name what your body is doing, you can respond with more care and less panic.

## What you will learn
- How stress activates the body’s alarm system
- How breathing and posture affect your nervous system
- How to identify your personal stress signals early
- How to use simple grounding skills when your body feels overwhelmed

## Exercise 1: Body Scan
Take 2 minutes and slowly check in with each part of your body:
- Head and forehead
- Jaw and neck
- Chest and shoulders
- Hands and stomach
- Legs and feet

Write down what you notice. You are not trying to fix anything yet. You are only observing.

## Exercise 2: Breath Reset
Try this rhythm for 5 rounds:
- Inhale through your nose for 4 counts
- Hold for 4 counts
- Exhale slowly for 6 counts

Notice whether your chest, shoulders, or jaw soften even a little.

## Exercise 3: Stress Signal List
Complete these prompts:
- When I am stressed, my body usually feels like...
- The first sign I notice is...
- A helpful response I can try is...

## Reflection
Ask yourself:
- What part of my body carries stress most often?
- What does my body need when I feel overwhelmed?
- Which calming strategy felt easiest today?

## Weekly goal
Practice one body check-in each day and use the breath reset at least once whenever you feel stress building.

## Encouragement
You do not need to be perfect this week. The goal is to become more aware, not to eliminate every uncomfortable feeling. Small awareness is a strong first step toward resilience.`,
  },
  {
    id: "week-2",
    program_id: "resilience-course",
    week_number: 2,
    title: "Placeholder Week 2: Thought Patterns",
    content_markdown: "Week 2 content will be released after Week 1 is completed.",
  },
  {
    id: "week-3",
    program_id: "resilience-course",
    week_number: 3,
    title: "Placeholder Week 3: Self-Compassion",
    content_markdown: "Week 3 content will be released after Week 2 is completed.",
  },
  {
    id: "week-4",
    program_id: "resilience-course",
    week_number: 4,
    title: "Placeholder Week 4: Healthy Routines",
    content_markdown: "Week 4 content will be released after Week 3 is completed.",
  },
  {
    id: "week-5",
    program_id: "resilience-course",
    week_number: 5,
    title: "Placeholder Week 5: Support Systems",
    content_markdown: "Week 5 content will be released after Week 4 is completed.",
  },
  {
    id: "week-6",
    program_id: "resilience-course",
    week_number: 6,
    title: "Placeholder Week 6: Resilience Review",
    content_markdown: "Week 6 content will be released after Week 5 is completed.",
  },
];

export const RESILIENCE_PROGRAM: Program = {
  id: "resilience-course",
  title: RESILIENCE_PROGRAM_TITLE,
  description: "A guided resilience course that builds stress awareness, emotional regulation, and healthy coping habits.",
  total_weeks: 6,
};

export interface CoursePathData {
  enrollment: Enrollment | null;
  program: Program | null;
  modules: Module[];
}

export async function fetchStudentCoursePath(studentId: string): Promise<CoursePathData> {
  const [{ data: programRow, error: programError }, { data: enrollmentRow, error: enrollmentError }] = await Promise.all([
    supabase.from("programmes").select("*").eq("name", RESILIENCE_PROGRAM_TITLE).maybeSingle(),
    supabase
      .from("enrolments")
      .select("*")
      .eq("student_id", studentId)
      .eq("status", "active")
      .order("enrolled_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (programError) {
    throw new Error(programError.message);
  }

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  const mappedProgram: Program | null = programRow
    ? {
        id: programRow.id,
        title: programRow.name ?? RESILIENCE_PROGRAM.title,
        description: programRow.description ?? RESILIENCE_PROGRAM.description,
        total_weeks: 6,
      }
    : RESILIENCE_PROGRAM;

  const mappedEnrollment: Enrollment | null = enrollmentRow
    ? {
        id: enrollmentRow.id,
        student_id: enrollmentRow.student_id,
        program_id: enrollmentRow.programme_id,
        current_week: Math.max(1, enrollmentRow.progress || 1),
        status: enrollmentRow.status,
      }
    : null;

  return {
    enrollment: mappedEnrollment,
    program: mappedProgram,
    modules: RESILIENCE_MODULES,
  };
}

export async function completeWeekOne(enrollmentId: string) {
  const { error } = await supabase
    .from("enrolments")
    .update({ progress: 2 })
    .eq("id", enrollmentId)
    .eq("progress", 1);

  if (error) {
    throw new Error(error.message);
  }
}
