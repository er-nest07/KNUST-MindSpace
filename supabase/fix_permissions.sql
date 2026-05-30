-- Run this SQL in the Supabase SQL editor to fix counsellor programme creation
-- and add comment delete permissions for authors and counsellors.

-- ─── Programmes: ensure counsellors can INSERT ────────────────────────────────
drop policy if exists "counsellors and admins create programmes" on public.programmes;
create policy "counsellors and admins create programmes"
on public.programmes
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('counsellor', 'admin')
  )
);

-- ─── Comments: allow authors to delete their own comments ─────────────────────
drop policy if exists "authors can delete own comments" on public.comments;
create policy "authors can delete own comments"
on public.comments
for delete
to authenticated
using (author_id = auth.uid());

-- ─── Comments: allow counsellors and admins to delete any comment ─────────────
drop policy if exists "counsellors can delete comments" on public.comments;
create policy "counsellors can delete comments"
on public.comments
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('counsellor', 'admin')
  )
);
