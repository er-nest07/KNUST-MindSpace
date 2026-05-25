-- MindSpace KNUST: 6-Week Resilience Course
-- Run this in Supabase after your base auth/schema setup.

create extension if not exists pgcrypto;

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  total_weeks integer not null check (total_weeks > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.program_modules (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  week_number integer not null check (week_number > 0),
  title text not null,
  content_markdown text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_id, week_number)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  current_week integer not null default 1 check (current_week > 0),
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  enrolled_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, program_id)
);

create index if not exists idx_program_modules_program_week on public.program_modules (program_id, week_number);
create index if not exists idx_enrollments_student_program on public.enrollments (student_id, program_id);
create index if not exists idx_enrollments_status on public.enrollments (status);

create or replace function public.handle_updated_at_programs()
returns trigger
language plpgsql
as $$
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

alter table public.programs enable row level security;
alter table public.program_modules enable row level security;
alter table public.enrollments enable row level security;

create policy "authenticated can read programs"
on public.programs
for select
to authenticated
using (true);

create policy "authenticated can read program modules"
on public.program_modules
for select
to authenticated
using (true);

create policy "students can read own enrollments"
on public.enrollments
for select
to authenticated
using (student_id = auth.uid());

create policy "students can update own enrollments"
on public.enrollments
for update
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

create policy "authenticated can create own enrollment"
on public.enrollments
for insert
to authenticated
with check (student_id = auth.uid());

insert into public.programs (id, title, description, total_weeks)
values (
  '60000000-0000-0000-0000-000000000001',
  '6-Week Student Resilience',
  'A guided course that helps students understand stress, regulate emotions, and build sustainable resilience habits week by week.',
  6
)
on conflict (id) do nothing;

insert into public.program_modules (program_id, week_number, title, content_markdown)
values
  (
    '60000000-0000-0000-0000-000000000001',
    1,
    'Mind-Body Connection',
    $$
# Week 1: Mind-Body Connection

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
You do not need to be perfect this week. The goal is to become more aware, not to eliminate every uncomfortable feeling. Small awareness is a strong first step toward resilience.
    $$
  ),
  (
    '60000000-0000-0000-0000-000000000001',
    2,
    'Placeholder Week 2: Thought Patterns',
    'Week 2 content will be released after Week 1 is completed.'
  ),
  (
    '60000000-0000-0000-0000-000000000001',
    3,
    'Placeholder Week 3: Self-Compassion',
    'Week 3 content will be released after Week 2 is completed.'
  ),
  (
    '60000000-0000-0000-0000-000000000001',
    4,
    'Placeholder Week 4: Healthy Routines',
    'Week 4 content will be released after Week 3 is completed.'
  ),
  (
    '60000000-0000-0000-0000-000000000001',
    5,
    'Placeholder Week 5: Support Systems',
    'Week 5 content will be released after Week 4 is completed.'
  ),
  (
    '60000000-0000-0000-0000-000000000001',
    6,
    'Placeholder Week 6: Resilience Review',
    'Week 6 content will be released after Week 5 is completed.'
  )
on conflict (program_id, week_number) do nothing;
