-- MindSpace KNUST base schema for Supabase

create extension if not exists pgcrypto;

create type public.user_role as enum ('student', 'counsellor', 'admin');
create type public.visibility_type as enum ('anonymous', 'pseudonym', 'identified');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role public.user_role not null default 'student',
  display_name text,
  avatar_url text,
  visibility public.visibility_type not null default 'anonymous',
  pseudonym text,
  is_verified_counsellor boolean not null default false,
  counsellor_title text,
  counsellor_bio text,
  is_frozen boolean not null default false,
  freeze_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    role,
    display_name,
    visibility,
    pseudonym,
    is_verified_counsellor,
    counsellor_title,
    counsellor_bio,
    avatar_url,
    is_frozen,
    freeze_reason
  )
  values (
    new.id,
    coalesce(new.email, 'anonymous-' || replace(new.id::text, '-', '') || '@local'),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'student'),
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    coalesce((new.raw_user_meta_data ->> 'visibility')::public.visibility_type, 'anonymous'),
    nullif(new.raw_user_meta_data ->> 'pseudonym', ''),
    false,
    nullif(new.raw_user_meta_data ->> 'counsellor_title', ''),
    nullif(new.raw_user_meta_data ->> 'counsellor_bio', ''),
    null,
    false,
    null
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_auth_user_created_profile on auth.users;
create trigger trg_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0 and char_length(content) <= 2000),
  topic_tag text not null default 'other',
  is_private boolean not null default false,
  is_crisis boolean not null default false,
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0 and char_length(content) <= 1500),
  is_flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.post_votes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.programmes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  duration_days integer not null,
  checkin_frequency text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  counsellor_id uuid not null references public.profiles(id) on delete cascade,
  ai_summary text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  last_message text,
  last_message_at timestamptz
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_ai boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.enrolments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  counsellor_id uuid not null references public.profiles(id) on delete cascade,
  programme_id uuid not null references public.programmes(id) on delete cascade,
  custom_notes text,
  status text not null default 'active',
  enrolled_at timestamptz not null default now(),
  progress integer not null default 0,
  total_days integer not null default 1
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  enrolment_id uuid not null references public.enrolments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  response_one text,
  response_two text,
  mood_score integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_posts_created_at on public.posts (created_at desc);
create index if not exists idx_posts_topic_tag on public.posts (topic_tag);
create index if not exists idx_comments_post_created_at on public.comments (post_id, created_at desc);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_votes enable row level security;
alter table public.programmes enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.enrolments enable row level security;
alter table public.checkins enable row level security;

-- Profiles
create policy "profiles are readable by authenticated users"
on public.profiles
for select
to authenticated
using (true);

create policy "users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "admins can update any profile"
on public.profiles
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Posts
create policy "authenticated can read approved public posts"
on public.posts
for select
to authenticated
using (
  is_approved = true
  and (
    is_private = false
    or author_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('counsellor', 'admin')
    )
  )
);

create policy "moderators can read all posts"
on public.posts
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('counsellor', 'admin')
  )
);

create policy "authenticated can insert posts"
on public.posts
for insert
to authenticated
with check (author_id = auth.uid());

create policy "authors can update their posts"
on public.posts
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

create policy "moderators can update posts"
on public.posts
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('counsellor', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('counsellor', 'admin')
  )
);

-- Comments
create policy "authenticated can read comments for readable posts"
on public.comments
for select
to authenticated
using (
  exists (
    select 1 from public.posts p
    where p.id = comments.post_id
      and p.is_approved = true
      and (
        p.is_private = false
        or p.author_id = auth.uid()
        or exists (
          select 1 from public.profiles pr
          where pr.id = auth.uid() and pr.role in ('counsellor', 'admin')
        )
      )
  )
);

create policy "moderators can read all comments"
on public.comments
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('counsellor', 'admin')
  )
);

create policy "authenticated can insert comments"
on public.comments
for insert
to authenticated
with check (
  author_id = auth.uid()
  and exists (
    select 1 from public.posts p
    where p.id = comments.post_id
      and p.is_approved = true
      and (
        p.is_private = false
        or p.author_id = auth.uid()
        or exists (
          select 1 from public.profiles pr
          where pr.id = auth.uid() and pr.role in ('counsellor', 'admin')
        )
      )
  )
);

create policy "moderators can update comments"
on public.comments
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('counsellor', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('counsellor', 'admin')
  )
);

create policy "admins can delete comments"
on public.comments
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Votes
create policy "authenticated can read votes"
on public.post_votes
for select
to authenticated
using (true);

create policy "authenticated can vote once per post"
on public.post_votes
for insert
to authenticated
with check (user_id = auth.uid());

create policy "users can remove own vote"
on public.post_votes
for delete
to authenticated
using (user_id = auth.uid());

-- Programmes
create policy "authenticated can read programmes"
on public.programmes
for select
to authenticated
using (true);

create policy "counsellors and admins create programmes"
on public.programmes
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('counsellor', 'admin')
      and (p.role = 'admin' or (p.is_verified_counsellor = true and p.is_frozen = false))
  )
);

create policy "counsellors and admins update programmes"
on public.programmes
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('counsellor', 'admin')
      and (p.role = 'admin' or (p.is_verified_counsellor = true and p.is_frozen = false))
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('counsellor', 'admin')
      and (p.role = 'admin' or (p.is_verified_counsellor = true and p.is_frozen = false))
  )
);

-- Conversations
create policy "participants can read conversations"
on public.conversations
for select
to authenticated
using (student_id = auth.uid() or counsellor_id = auth.uid());

create policy "students can create conversations"
on public.conversations
for insert
to authenticated
with check (student_id = auth.uid());

create policy "participants can update conversation metadata"
on public.conversations
for update
to authenticated
using (student_id = auth.uid() or counsellor_id = auth.uid())
with check (student_id = auth.uid() or counsellor_id = auth.uid());

-- Messages
create policy "participants can read messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (c.student_id = auth.uid() or c.counsellor_id = auth.uid())
  )
);

create policy "participants can insert messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (c.student_id = auth.uid() or c.counsellor_id = auth.uid())
  )
);

-- Enrolments
create policy "participants can read enrolments"
on public.enrolments
for select
to authenticated
using (student_id = auth.uid() or counsellor_id = auth.uid());

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
using (student_id = auth.uid() or counsellor_id = auth.uid())
with check (student_id = auth.uid() or counsellor_id = auth.uid());

-- Check-ins
create policy "participants can read checkins"
on public.checkins
for select
to authenticated
using (
  student_id = auth.uid()
  or exists (
    select 1
    from public.enrolments e
    where e.id = checkins.enrolment_id and e.counsellor_id = auth.uid()
  )
);

create policy "students create own checkins"
on public.checkins
for insert
to authenticated
with check (student_id = auth.uid());
