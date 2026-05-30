-- ================================================================
-- KNUST MindSpace – upstream sync migration
-- Paste this entire file into the Supabase SQL Editor and run it.
-- Safe: uses ALTER TABLE, DROP/CREATE POLICY, CREATE IF NOT EXISTS,
-- and INSERT … ON CONFLICT.  Never drops a table.
-- ================================================================


-- ----------------------------------------------------------------
-- 1.  profiles.is_frozen / freeze_reason
--
--     Verdict: your live database already has these columns.
--     They appear in the very first commit of schema.sql
--     (4297fbcc), so they were present before any upstream work.
--     Nothing to do here.
-- ----------------------------------------------------------------


-- ----------------------------------------------------------------
-- 2.  enrolments RLS – the critical change
--
--     Old schema (what your live DB has):
--       "counsellors create enrolments"  → only counsellor_id = auth.uid()
--       "counsellors update enrolments"  → only counsellor_id = auth.uid()
--
--     Upstream schema (what the code now expects):
--       "students create their enrolments" → student creates, verified counsellor checked
--       "participants update enrolments"   → both student and counsellor can update
-- ----------------------------------------------------------------

drop policy if exists "counsellors create enrolments" on public.enrolments;
drop policy if exists "counsellors update enrolments" on public.enrolments;

create policy "students create their enrolments"
on public.enrolments
for insert
to authenticated
with check (
  student_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = counsellor_id
      and p.role = 'counsellor'
      and p.is_verified_counsellor = true
      and p.is_frozen = false
  )
);

create policy "participants update enrolments"
on public.enrolments
for update
to authenticated
using  (student_id = auth.uid() or counsellor_id = auth.uid())
with check (student_id = auth.uid() or counsellor_id = auth.uid());


-- ----------------------------------------------------------------
-- 3.  resilience-course.sql supplementary tables
--
--     These tables (programs / program_modules / enrollments) are
--     defined in resilience-course.sql.  No TypeScript code in the
--     current codebase queries them directly (the app uses the base
--     schema's "programmes" and "enrolments" tables), but they
--     should exist to match the upstream schema file.
--
--     All CREATE statements use IF NOT EXISTS, so this block is
--     safe whether or not you ran the original resilience-course.sql.
-- ----------------------------------------------------------------

create table if not exists public.programs (
  id           uuid    primary key default gen_random_uuid(),
  title        text    not null,
  description  text    not null,
  total_weeks  integer not null check (total_weeks > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.program_modules (
  id               uuid    primary key default gen_random_uuid(),
  program_id       uuid    not null references public.programs(id) on delete cascade,
  week_number      integer not null check (week_number > 0),
  title            text    not null,
  content_markdown text    not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (program_id, week_number)
);

create table if not exists public.enrollments (
  id          uuid    primary key default gen_random_uuid(),
  student_id  uuid    not null references public.profiles(id) on delete cascade,
  program_id  uuid    not null references public.programs(id)  on delete cascade,
  current_week integer not null default 1 check (current_week > 0),
  status      text    not null default 'active' check (status in ('active', 'completed', 'paused')),
  enrolled_at timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (student_id, program_id)
);

create index if not exists idx_program_modules_program_week
  on public.program_modules (program_id, week_number);
create index if not exists idx_enrollments_student_program
  on public.enrollments (student_id, program_id);
create index if not exists idx_enrollments_status
  on public.enrollments (status);

create or replace function public.handle_updated_at_programs()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_programs_updated_at on public.programs;
create trigger trg_programs_updated_at
  before update on public.programs
  for each row execute function public.handle_updated_at_programs();

drop trigger if exists trg_program_modules_updated_at on public.program_modules;
create trigger trg_program_modules_updated_at
  before update on public.program_modules
  for each row execute function public.handle_updated_at_programs();

drop trigger if exists trg_enrollments_updated_at on public.enrollments;
create trigger trg_enrollments_updated_at
  before update on public.enrollments
  for each row execute function public.handle_updated_at_programs();

alter table public.programs      enable row level security;
alter table public.program_modules enable row level security;
alter table public.enrollments   enable row level security;

-- Policies are identical between old and new resilience-course.sql,
-- but we drop-and-recreate to handle both "never ran the file" and
-- "already ran the old file" cases.

drop policy if exists "authenticated can read programs"       on public.programs;
drop policy if exists "authenticated can read program modules" on public.program_modules;
drop policy if exists "students can read own enrollments"     on public.enrollments;
drop policy if exists "students can update own enrollments"   on public.enrollments;
drop policy if exists "authenticated can create own enrollment" on public.enrollments;

create policy "authenticated can read programs"
  on public.programs for select to authenticated using (true);

create policy "authenticated can read program modules"
  on public.program_modules for select to authenticated using (true);

create policy "students can read own enrollments"
  on public.enrollments for select to authenticated
  using (student_id = auth.uid());

create policy "students can update own enrollments"
  on public.enrollments for update to authenticated
  using  (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy "authenticated can create own enrollment"
  on public.enrollments for insert to authenticated
  with check (student_id = auth.uid());


-- ----------------------------------------------------------------
-- 4.  Seed data: upgrade fixed-UUID program from 6 weeks → 9 weeks
--
--     If the program row already exists (from running the old
--     resilience-course.sql), ON CONFLICT DO UPDATE bumps the title
--     and total_weeks.  If it doesn't exist yet, it is inserted.
--     Module rows for weeks 1–6 use ON CONFLICT DO NOTHING so
--     existing content is preserved.  Weeks 7–9 are new inserts.
-- ----------------------------------------------------------------

insert into public.programs (id, title, description, total_weeks)
values (
  '60000000-0000-0000-0000-000000000001',
  '9-Week Mental Health Journey',
  'A guided course that helps students understand stress, regulate emotions, strengthen coping habits, and build sustainable resilience week by week.',
  9
)
on conflict (id) do update
  set title       = excluded.title,
      description = excluded.description,
      total_weeks = excluded.total_weeks,
      updated_at  = now();

-- Weeks 1–6: insert only if not present (preserve any edited content)
insert into public.program_modules (program_id, week_number, title, content_markdown)
values
  (
    '60000000-0000-0000-0000-000000000001', 1,
    'Mind-Body Connection',
    $$
# Week 1: Mind-Body Connection

## Welcome to Week 1
This first week helps you notice how stress shows up in your body and how your thoughts can intensify or reduce that stress. Resilience starts with awareness. When you can name what your body is doing, you can respond with more care and less panic.

## What you will learn
- How stress activates the body's alarm system
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
You do not need to be perfect this week. The goal is to become more aware, not to eliminate every uncomfortable feeling. Small awareness is a strong first step toward resilience.
    $$
  ),
  (
    '60000000-0000-0000-0000-000000000001', 2,
    'Placeholder Week 2: Thought Patterns',
    'Emotion naming, regulation, and short grounding techniques.'
  ),
  (
    '60000000-0000-0000-0000-000000000001', 3,
    'Stress Management & Relaxation',
    'Breathwork, body scans, and stress first-aid planning.'
  ),
  (
    '60000000-0000-0000-0000-000000000001', 4,
    'Thought Patterns & Cognitive Reframing',
    'Identifying distorted thoughts and replacing them with balanced alternatives.'
  ),
  (
    '60000000-0000-0000-0000-000000000001', 5,
    'Healthy Relationships & Communication',
    'Boundary setting, assertiveness, and asking for support.'
  ),
  (
    '60000000-0000-0000-0000-000000000001', 6,
    'Self-Compassion & The Inner Critic',
    'Using self-compassion to respond to setbacks more kindly.'
  )
on conflict (program_id, week_number) do nothing;

-- Weeks 7–9: new rows that don't exist in the old 6-week seed
insert into public.program_modules (program_id, week_number, title, content_markdown)
values
  (
    '60000000-0000-0000-0000-000000000001', 7,
    'Purpose, Meaning & Academic Goals',
    'Connecting daily effort to personal values and realistic goals.'
  ),
  (
    '60000000-0000-0000-0000-000000000001', 8,
    'Resilience & Coping with Setbacks',
    'Building a wider coping repertoire and knowing when to seek support.'
  ),
  (
    '60000000-0000-0000-0000-000000000001', 9,
    'Integration & Life Beyond the Programme',
    'Reviewing progress and creating a maintenance plan for the future.'
  )
on conflict (program_id, week_number) do nothing;
