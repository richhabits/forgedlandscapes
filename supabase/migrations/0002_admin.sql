-- ═══════════════════════════════════════════════════════════════════
-- FORGED LANDSCAPES — Phase 2 admin console
-- Extends the zero-secret / RLS-is-the-boundary model from 0001_init.sql.
--
-- Admin reads are governed by RLS, not by a leaked service-role key: a
-- SECURITY DEFINER `is_admin()` gate is added to every table the back
-- office needs. A signed-in user who is NOT in `admins` sees nothing,
-- even with a valid JWT — the boundary is the database, not the UI.
--
-- Idempotent: safe to re-run. Apply AFTER 0001_init.sql.
-- Seed the first admin with the one-liner at the bottom of this file.
-- ═══════════════════════════════════════════════════════════════════

-- ═══ admins — membership table ═══
-- No anon/authenticated RLS policies: only the service role (Vercel env)
-- or the Supabase SQL editor manages who is an admin. is_admin() reads it
-- via SECURITY DEFINER, so no table-level read grant is needed.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- ═══ is_admin() — the one gate every admin policy calls ═══
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ═══ lead_events — append-only audit trail ═══
-- Status changes, notes and templated replies are recorded as events, so
-- the lead's history is a trail rather than an overwritten field.
create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  kind text not null check (char_length(kind) between 1 and 40),
  note text check (char_length(note) <= 2000),
  actor text check (char_length(actor) <= 254),
  created_at timestamptz not null default now()
);

create index if not exists idx_lead_events_lead on public.lead_events (lead_id, created_at desc);

alter table public.lead_events enable row level security;

drop policy if exists "lead_events: admin read" on public.lead_events;
create policy "lead_events: admin read" on public.lead_events
  for select to authenticated using (public.is_admin());

drop policy if exists "lead_events: admin insert" on public.lead_events;
create policy "lead_events: admin insert" on public.lead_events
  for insert to authenticated with check (public.is_admin());

-- ═══ admin read/update policies on existing tables ═══
-- These sit alongside the owner-only policies from 0001; RLS is permissive
-- (OR), so a user still only ever sees their own rows unless is_admin().

-- leads: admins may read all and advance status.
-- (RLS is row-level; the API layer restricts writes to status only.)
drop policy if exists "leads: admin read" on public.leads;
create policy "leads: admin read" on public.leads
  for select to authenticated using (public.is_admin());

drop policy if exists "leads: admin update" on public.leads;
create policy "leads: admin update" on public.leads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- projects: admins read all briefs and mark them reviewed/archived.
drop policy if exists "projects: admin read" on public.projects;
create policy "projects: admin read" on public.projects
  for select to authenticated using (public.is_admin());

drop policy if exists "projects: admin update" on public.projects;
create policy "projects: admin update" on public.projects
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- project_media: admins read every media row (for the brief viewer).
drop policy if exists "project_media: admin read" on public.project_media;
create policy "project_media: admin read" on public.project_media
  for select to authenticated using (public.is_admin());

-- chat_sessions: admins read assessor transcripts that didn't convert.
drop policy if exists "chat_sessions: admin read" on public.chat_sessions;
create policy "chat_sessions: admin read" on public.chat_sessions
  for select to authenticated using (public.is_admin());

-- profiles: admins read client name/phone for survey prep.
drop policy if exists "profiles: admin read" on public.profiles;
create policy "profiles: admin read" on public.profiles
  for select to authenticated using (public.is_admin());

-- storage: admins read ANY object in the private bucket, so the brief
-- viewer can mint signed URLs for a client's photos, videos and sketches.
drop policy if exists "media bucket: admin read" on storage.objects;
create policy "media bucket: admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'project-media' and public.is_admin());

-- ═══ admin_metrics — one view, this-week vs last-week ═══
-- security_invoker: the view runs with the querying user's RLS, so only an
-- admin (who can read leads/projects/lead_events) gets real numbers; anyone
-- else gets zeros/nulls, never data. Single row of scalar aggregates — no
-- charting library, just numbers the dashboard tiles read.
-- Week boundaries are UTC (Supabase server tz); close enough for a trend strip.
create or replace view public.admin_metrics
with (security_invoker = true) as
select
  (select count(*) from public.leads
     where created_at >= date_trunc('week', now())) as leads_this_week,
  (select count(*) from public.leads
     where created_at >= date_trunc('week', now()) - interval '7 days'
       and created_at <  date_trunc('week', now())) as leads_last_week,
  (select count(*) from public.projects
     where status in ('submitted','reviewed')
       and coalesce(submitted_at, created_at) >= date_trunc('week', now())) as briefs_this_week,
  (select count(*) from public.projects
     where status in ('submitted','reviewed')
       and coalesce(submitted_at, created_at) >= date_trunc('week', now()) - interval '7 days'
       and coalesce(submitted_at, created_at) <  date_trunc('week', now())) as briefs_last_week,
  (select count(*) from public.leads where in_area is false) as out_of_area_total,
  (select count(*) from public.leads
     where in_area is false and created_at >= date_trunc('week', now())) as out_of_area_this_week,
  (select count(*) from public.leads
     where source in ('assessor','assessor_ai')) as assessor_leads_total,
  (select count(*) from public.leads
     where source in ('assessor','assessor_ai')
       and status in ('brief_submitted','survey_booked','quoted','won')) as assessor_converted_total,
  (select extract(epoch from percentile_cont(0.5) within group (order by ev.gap))
     from public.leads l
     join lateral (
       select min(e.created_at) - l.created_at as gap
       from public.lead_events e where e.lead_id = l.id
     ) ev on ev.gap is not null) as median_lead_to_action_seconds;

revoke all on public.admin_metrics from anon;
grant select on public.admin_metrics to authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- SEED THE FIRST ADMIN
-- After the owner has signed in once (so their auth.users row exists),
-- run this once in the Supabase SQL editor, swapping the email:
--
--   insert into public.admins (user_id)
--   select id from auth.users where lower(email) = lower('landscapesforged@gmail.com')
--   on conflict (user_id) do nothing;
--
-- To revoke:  delete from public.admins where user_id = (
--               select id from auth.users where lower(email) = lower('someone@example.com'));
-- ═══════════════════════════════════════════════════════════════════
