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

export const RESILIENCE_PROGRAM_TITLE = "9-Week Mental Health Journey";
export const LEGACY_RESILIENCE_PROGRAM_TITLE = "6-Week Student Resilience";
export const RESILIENCE_TOTAL_WEEKS = 9;

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
    title: "Emotional Awareness & Regulation",
    content_markdown: `# Week 2: Emotional Awareness & Regulation

## Focus
Learn to name emotions clearly, notice what triggers them, and respond before stress takes over.

## What you will learn
- How to distinguish feelings from reactions
- How to spot emotional flooding early
- How to use quick grounding skills when emotions rise

## Weekly practice
Keep a short emotion diary each day:
- What happened?
- What did I feel?
- How did I respond?
- What would I do differently next time?

## Reflection
Ask yourself which emotions show up most often on campus and what support helps you settle again.`,
  },
  {
    id: "week-3",
    program_id: "resilience-course",
    week_number: 3,
    title: "Stress Management & Relaxation",
    content_markdown: `# Week 3: Stress Management & Relaxation

## Focus
Build a personal stress-reset routine for academic pressure, deadlines, and daily overload.

## What you will learn
- How chronic stress affects the body and mind
- How to use breathwork, grounding, and muscle relaxation
- How to build a simple stress first-aid kit

## Weekly practice
Try one calming tool each day and record which one works best for you: box breathing, body scan, stretching, or a short walk.`,
  },
  {
    id: "week-4",
    program_id: "resilience-course",
    week_number: 4,
    title: "Thought Patterns & Cognitive Reframing",
    content_markdown: `# Week 4: Thought Patterns & Cognitive Reframing

## Focus
Notice the thoughts that intensify stress and practice replacing them with more balanced ones.

## What you will learn
- Automatic negative thoughts and common distortions
- How thoughts affect feelings and behaviour
- How to challenge unhelpful beliefs with evidence

## Weekly practice
Use a quick thought record:
- Situation
- Thought
- Feeling
- More helpful alternative thought`,
  },
  {
    id: "week-5",
    program_id: "resilience-course",
    week_number: 5,
    title: "Healthy Relationships & Communication",
    content_markdown: `# Week 5: Healthy Relationships & Communication

## Focus
Strengthen your support system and practise communicating needs clearly.

## What you will learn
- Boundaries and assertiveness
- Healthy vs. unhealthy relationship patterns
- How to ask for help without shame

## Weekly practice
Have one direct conversation this week where you state a need, boundary, or request respectfully.
`,
  },
  {
    id: "week-6",
    program_id: "resilience-course",
    week_number: 6,
    title: "Self-Compassion & The Inner Critic",
    content_markdown: `# Week 6: Self-Compassion & The Inner Critic

## Focus
Replace harsh self-talk with a more supportive inner voice.

## What you will learn
- Why self-criticism can increase shame and stress
- How self-compassion supports resilience
- How to coach yourself through setbacks

## Weekly practice
Write one compassionate note to yourself about a recent struggle, as if you were encouraging a friend.
`,
  },
  {
    id: "week-7",
    program_id: "resilience-course",
    week_number: 7,
    title: "Purpose, Meaning & Academic Goals",
    content_markdown: `# Week 7: Purpose, Meaning & Academic Goals

## Focus
Reconnect your daily effort to personal values and realistic academic direction.

## What you will learn
- Purpose-driven versus pressure-driven studying
- Goal setting without perfectionism
- How to reframe setbacks as information

## Weekly practice
List your top three values and write one small action for each that you can complete this week.
`,
  },
  {
    id: "week-8",
    program_id: "resilience-course",
    week_number: 8,
    title: "Resilience & Coping with Setbacks",
    content_markdown: `# Week 8: Resilience & Coping with Setbacks

## Focus
Strengthen your ability to recover after a difficult event or disappointing result.

## What you will learn
- What resilience actually is
- How to build a coping repertoire
- When self-help is not enough and professional support is needed

## Weekly practice
Write about a past setback and identify the strengths that helped you get through it.
`,
  },
  {
    id: "week-9",
    program_id: "resilience-course",
    week_number: 9,
    title: "Integration & Life Beyond the Programme",
    content_markdown: `# Week 9: Integration & Life Beyond the Programme

## Focus
Review your growth and create a sustainable mental health maintenance plan.

## What you will learn
- How to review the last 8 weeks of progress
- How to maintain healthy habits after the programme ends
- What warning signs mean you should reach out again

## Weekly practice
Create a simple maintenance plan for daily, weekly, and monthly habits that protect your wellbeing.
`,
  },
];

export const RESILIENCE_PROGRAM: Program = {
  id: "resilience-course",
  title: RESILIENCE_PROGRAM_TITLE,
  description: "A guided resilience course that builds stress awareness, emotional regulation, and healthy coping habits.",
  total_weeks: RESILIENCE_TOTAL_WEEKS,
};

export interface CoursePathData {
  enrollment: Enrollment | null;
  program: Program | null;
  modules: Module[];
}

export async function fetchStudentCoursePath(studentId: string): Promise<CoursePathData> {
  const { data: programRow, error: programError } = await supabase
    .from("programmes")
    .select("*")
    .in("name", [RESILIENCE_PROGRAM_TITLE, LEGACY_RESILIENCE_PROGRAM_TITLE])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (programError) {
    throw new Error(programError.message);
  }

  const mappedProgram: Program | null = programRow
    ? {
        id: programRow.id,
        title: RESILIENCE_PROGRAM.title,
        description: programRow.description ?? RESILIENCE_PROGRAM.description,
        total_weeks: RESILIENCE_TOTAL_WEEKS,
      }
    : RESILIENCE_PROGRAM;

  const { data: enrollmentRow, error: enrollmentError } = await supabase
    .from("enrolments")
    .select("*")
    .eq("student_id", studentId)
    .eq("programme_id", mappedProgram.id)
    .eq("status", "active")
    .order("enrolled_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

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

export async function joinResilienceCourse(studentId: string, counsellorId: string, notes?: string) {
  const { data: programmeRow, error: programmeError } = await supabase
    .from("programmes")
    .select("id, name, description, duration_days, checkin_frequency")
    .in("name", [RESILIENCE_PROGRAM_TITLE, LEGACY_RESILIENCE_PROGRAM_TITLE])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (programmeError) {
    throw new Error(programmeError.message);
  }

  if (!programmeRow?.id) {
    throw new Error("The resilience course is not available yet. Ask an administrator to seed the 9-week programme first.");
  }

  const programmeId = programmeRow.id;

  const { data: existingEnrollment, error: existingError } = await supabase
    .from("enrolments")
    .select("id, student_id, counsellor_id, programme_id, custom_notes, status, enrolled_at, progress, total_days")
    .eq("student_id", studentId)
    .eq("programme_id", programmeId)
    .maybeSingle();

  if (existingError && existingError.code !== "PGRST116") {
    throw new Error(existingError.message);
  }

  if (existingEnrollment) {
    return existingEnrollment;
  }

  const { data, error } = await supabase
    .from("enrolments")
    .insert({
      student_id: studentId,
      counsellor_id: counsellorId,
      programme_id: programmeId,
      custom_notes: notes?.trim() || null,
      status: "active",
      progress: 1,
      total_days: RESILIENCE_TOTAL_WEEKS,
    })
    .select("id, student_id, counsellor_id, programme_id, custom_notes, status, enrolled_at, progress, total_days")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
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
