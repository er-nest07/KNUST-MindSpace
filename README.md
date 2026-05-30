
# MindSpace KNUST

MindSpace KNUST is a student mental wellness and counselling platform backed by Supabase. It supports anonymous community posting, verified counsellor support, private conversations, programmes, and crisis resources.

## What Works Today

- Student registration and login
- Counsellor registration with approval workflow
- Admin dashboard for approving counsellors
- Community feed with posts, comments, and likes
- Post detail view with comment submission and like toggling
- Browse Counsellors page for starting private chats
- My Conversations and realtime chat messages
- Counsellor dashboard and case detail views
- Programmes, enrolments, and check-ins
- Crisis page and persistent navigation

## Roles and Access

- Students can browse the feed, like posts, comment, browse counsellors, and start conversations.
- Counsellors must have `is_verified_counsellor = true` before they can access counsellor-only routes.
- Admins can open `/admin/dashboard` to review and verify counsellor accounts.

## Setup

1. Install dependencies with `npm i`.
2. Copy `.env.example` to `.env`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. If you use email confirmation, also set `VITE_SUPABASE_REDIRECT_URL` to your deployed URL.
5. Run `supabase/schema.sql` in the Supabase SQL editor.
6. Optionally run `supabase/seed.sql` to load starter users, posts, comments, and conversations.

## Development Notes

- Registration creates a matching `public.profiles` row for the new auth user.
- Counsellor accounts are blocked from login until approved.
- The app uses the `auth.users` table internally in Supabase; it will not appear in the normal public table list.
- Likes are stored in `public.post_votes`.
- Conversations are stored in `public.conversations` and messages in `public.messages`.

## Supabase Auth Notes

- If a profile row is deleted but the auth user still exists, restore the profile row from `auth.users`.
- If you want to fully recreate an account, delete the auth user so the profile trigger can create a new row on signup.
- The app now includes a Browse Counsellors page and visible counsellor navigation from the feed.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS 4
- Radix UI, Material UI, and Emotion
- React Router
- Supabase
- Sonner for notifications

## Run

Use `npm run dev` to start the app.
  