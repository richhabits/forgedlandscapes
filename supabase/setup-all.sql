-- ═══════════════════════════════════════════════════════════════════
-- FORGED LANDSCAPES — Supabase schema
-- Zero-secret architecture: the public anon key + Row Level Security is
-- the entire authorisation model. Every table has RLS enabled; public
-- (anon) access is INSERT-only on lead-capture tables with hard checks;
-- portal users can only ever touch rows they own.
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════════

-- ——— enums ———
do $$ begin
  create type public.project_type as enum
    ('patio_paving','driveway','decking_woodwork','lawn_softscape','full_redesign','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.budget_band as enum
    ('under_5k','5k_15k','15k_40k','over_40k','unsure');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.timeline_band as enum
    ('asap','1_3_months','3_6_months','exploring');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_status as enum
    ('new','qualified','portal_invited','brief_submitted','survey_booked',
     'quoted','won','lost','out_of_area');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_source as enum
    ('assessor','assessor_ai','form','radius_widget');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.project_status as enum ('draft','submitted','reviewed','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.media_kind as enum
    ('garden_photo','garden_video','sketch_canvas','sketch_upload','inspiration');
exception when duplicate_object then null; end $$;

-- ——— updated_at helper ———
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ═══ profiles ═══
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  phone text check (char_length(phone) <= 30),
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

drop policy if exists "profiles: own read" on public.profiles;
create policy "profiles: own read" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists "profiles: own update" on public.profiles;
create policy "profiles: own update" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ═══ leads — the capture table ═══
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text not null check (
    email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' and char_length(email) <= 254
  ),
  name text check (char_length(name) <= 120),
  phone text check (char_length(phone) <= 30),
  postcode text not null check (char_length(postcode) between 2 and 10),
  in_area boolean,
  distance_miles numeric(5,1) check (distance_miles >= 0 and distance_miles < 1000),
  project_type public.project_type not null default 'other',
  budget_band public.budget_band not null default 'unsure',
  timeline public.timeline_band not null default 'exploring',
  message text check (char_length(message) <= 2000),
  transcript jsonb check (pg_column_size(transcript) <= 65536),
  source public.lead_source not null default 'form',
  status public.lead_status not null default 'new',
  user_id uuid references auth.users(id) on delete set null,
  meta jsonb not null default '{}'::jsonb check (pg_column_size(meta) <= 8192)
);

create index if not exists idx_leads_created on public.leads (created_at desc);
create index if not exists idx_leads_email on public.leads (lower(email));
create index if not exists idx_leads_status on public.leads (status);

alter table public.leads enable row level security;

drop trigger if exists trg_leads_updated on public.leads;
create trigger trg_leads_updated before update on public.leads
  for each row execute function public.set_updated_at();

-- Public may CREATE a lead (that's the product) — never read, change or
-- delete one. user_id must be null on public inserts (no impersonation).
drop policy if exists "leads: public insert" on public.leads;
create policy "leads: public insert" on public.leads
  for insert to anon, authenticated
  with check (user_id is null);

-- No select/update/delete policies for anon/authenticated ⇒ denied.
-- The service role (server env / dashboard) bypasses RLS for admin reads.

-- ═══ projects — portal briefs ═══
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  title text check (char_length(title) <= 160),
  project_type public.project_type not null default 'other',
  description text check (char_length(description) <= 4000),
  postcode text check (char_length(postcode) <= 10),
  length_m numeric(6,2) check (length_m > 0 and length_m <= 500),
  width_m numeric(6,2) check (width_m > 0 and width_m <= 500),
  area_m2 numeric(9,1) generated always as (round(length_m * width_m, 1)) stored,
  budget_band public.budget_band not null default 'unsure',
  timeline public.timeline_band not null default 'exploring',
  details jsonb not null default '{}'::jsonb check (pg_column_size(details) <= 16384),
  status public.project_status not null default 'draft',
  consent_given boolean not null default false,
  submitted_at timestamptz
);

create index if not exists idx_projects_user on public.projects (user_id, created_at desc);

alter table public.projects enable row level security;

drop trigger if exists trg_projects_updated on public.projects;
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

drop policy if exists "projects: own all" on public.projects;
create policy "projects: own all" on public.projects
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ═══ project_media — uploads & inspiration ═══
create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind public.media_kind not null,
  storage_path text check (char_length(storage_path) <= 512),
  external_url text check (char_length(external_url) <= 1024),
  caption text check (char_length(caption) <= 300),
  constraint media_has_source check (storage_path is not null or external_url is not null)
);

create index if not exists idx_media_project on public.project_media (project_id);

alter table public.project_media enable row level security;

drop policy if exists "media: own all" on public.project_media;
create policy "media: own all" on public.project_media
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = (select auth.uid())
    )
  );

-- ═══ chat_sessions — assessor transcripts that didn't convert ═══
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  transcript jsonb not null check (pg_column_size(transcript) <= 65536),
  outcome text check (outcome in ('lead','abandoned','out_of_area')),
  meta jsonb not null default '{}'::jsonb check (pg_column_size(meta) <= 4096)
);

alter table public.chat_sessions enable row level security;

drop policy if exists "chat: public insert" on public.chat_sessions;
create policy "chat: public insert" on public.chat_sessions
  for insert to anon, authenticated with check (true);
-- insert-only: no read-back for the public.

-- ═══ new-user hook: profile + lead linking ═══
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;

  -- connect any pre-existing enquiries to the fresh portal account
  update public.leads
     set user_id = new.id,
         status = case when status = 'new' then 'portal_invited' else status end
   where lower(email) = lower(new.email) and user_id is null;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══ storage: private bucket, per-user folders ═══
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-media', 'project-media', false, 52428800,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif',
        'video/mp4','video/quicktime','video/webm']
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types,
      public = false;

-- Path convention: {user_id}/{project_id}/{file}
drop policy if exists "media bucket: own insert" on storage.objects;
create policy "media bucket: own insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'project-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "media bucket: own read" on storage.objects;
create policy "media bucket: own read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'project-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "media bucket: own delete" on storage.objects;
create policy "media bucket: own delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'project-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );


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
