Project summary — MindSpace KNUST

Overview
- MindSpace KNUST is a student mental-wellness and counselling web app with community posting, counsellor support, private conversations, programmes, and crisis resources.

Key features
- Authentication: user registration, email confirmation (optional), login, logout, session handling.
- Roles & access: `student`, `counsellor`, and `admin` with guarded routes and counsellor approval workflow.
- Community feed: create, view, like, and comment on posts (supports anonymous/pseudonym/identified visibility).
- Conversations & chat: start private chats with counsellors and realtime messaging (backed by Supabase).
- Counsellor tools: counsellor dashboard, create programmes, view case details, and manage clients.
- Admin tools: admin dashboard for approving counsellors and basic moderation workflows.
- Programmes & check-ins: create programmes, enrol users, and submit check-ins.
- Crisis resources: dedicated crisis page and prominent navigation.

Tech stack & infra
- Frontend: React 18 + TypeScript, Vite, Tailwind CSS.
- UI: Radix + custom components; Sonner for notifications.
- Backend: Supabase for Auth and Postgres (database + realtime). SQL schemas and seeds are in `supabase/schema.sql` and `supabase/seed.sql`.
- Supabase client: `src/app/lib/supabase.ts` creates a `supabase` client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Environment & run
- Copy `.env.example` → `.env` and set:
  - `VITE_SUPABASE_URL` (e.g. `https://<project>.supabase.co`)
  - `VITE_SUPABASE_ANON_KEY`
  - Optional: `VITE_SUPABASE_REDIRECT_URL` for email confirmations
- Install & run locally:

```
npm install
cp .env.example .env    # then edit .env
npm run dev
```



