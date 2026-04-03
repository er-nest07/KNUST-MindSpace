MindSpace KNUST project guidelines

## Product Model

- This is a student mental wellness platform for KNUST.
- Roles are `student`, `counsellor`, and `admin`.
- Counsellors must be verified before they can access counsellor-only routes.
- Students can browse the feed, like posts, comment, browse counsellors, and start conversations.

## Actual Routes

- `/` landing page
- `/register` student or counsellor signup
- `/login` sign in
- `/feed` community feed
- `/post/:id` post detail
- `/conversations` student and counsellor conversation list
- `/counsellors` verified counsellor browser
- `/chat/:id` private message thread
- `/programmes` programmes list
- `/checkin/:id` check-in flow
- `/profile` user profile
- `/counsellor/dashboard` counsellor dashboard
- `/counsellor/case/:id` case detail
- `/admin/dashboard` admin dashboard

## Supabase Behavior

- `public.profiles` is the app profile table.
- `auth.users` is managed by Supabase Auth and may not appear in the public table list.
- Registration should create a matching profile row.
- Likes are stored in `public.post_votes`.
- Conversations are stored in `public.conversations` and messages in `public.messages`.

## Important Workflow Rules

- Do not add new auth flows that bypass profile creation.
- Do not allow unverified counsellors into counsellor-only routes.
- Keep navigation obvious for students; counsellor browsing and messaging should be reachable from the feed and conversations page.
- Prefer real Supabase-backed behavior over mock UI state.

## UI Guidance

- Keep the green/gold MindSpace palette.
- Use clear action buttons for support-oriented flows.
- Do not remove the crisis shortcut from navigation.
- Preserve the privacy-first tone and do not expose student identities by default.

## Documentation Rule

- If the app behavior changes, update README and this file together.
- Keep these docs aligned with the actual routes, roles, and Supabase schema.
