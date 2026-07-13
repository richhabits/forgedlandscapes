-- ═══════════════════════════════════════════════════════════════════
-- FORGED LANDSCAPES — Phase 2b: CRM + comms
--
-- Adds, on top of 0001_init.sql + 0002_admin.sql (uses is_admin() and
-- set_updated_at()):
--   • staff        — team directory + live "on the way / on site" status
--   • partners     — subcontractors, suppliers, referrers
--   • leads.assigned_to — who owns each lead
--   • team_messages    — internal team feed (admin-only)
--   • project_messages — client ↔ team thread, shown in the client portal
--
-- Admin-only except project_messages, where a client can read/write on their
-- OWN project. RLS-enforced. Idempotent.
-- ═══════════════════════════════════════════════════════════════════

-- ═══ staff — team directory + live status ═══
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  role text not null default 'staff' check (char_length(role) <= 40),
  email text check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 30),
  active boolean not null default true,
  -- live status board: where is everyone right now
  status text not null default 'off'
    check (status in ('available','en_route','on_site','off')),
  status_note text check (char_length(status_note) <= 200),
  status_at timestamptz not null default now(),
  -- future: link a staff record to a real login
  user_id uuid references auth.users(id) on delete set null,
  notes text check (char_length(notes) <= 2000)
);

create index if not exists idx_staff_active on public.staff (active, name);
alter table public.staff enable row level security;

drop trigger if exists trg_staff_updated on public.staff;
create trigger trg_staff_updated before update on public.staff
  for each row execute function public.set_updated_at();

drop policy if exists "staff: admin all" on public.staff;
create policy "staff: admin all" on public.staff
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ═══ partners — subcontractors, suppliers, referrers ═══
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  company text check (char_length(company) <= 160),
  kind text not null default 'subcontractor'
    check (kind in ('subcontractor','supplier','referrer','other')),
  trade text check (char_length(trade) <= 120),
  email text check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 30),
  active boolean not null default true,
  notes text check (char_length(notes) <= 2000)
);

create index if not exists idx_partners_kind on public.partners (kind, active);
alter table public.partners enable row level security;

drop trigger if exists trg_partners_updated on public.partners;
create trigger trg_partners_updated before update on public.partners
  for each row execute function public.set_updated_at();

drop policy if exists "partners: admin all" on public.partners;
create policy "partners: admin all" on public.partners
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ═══ lead assignment ═══
alter table public.leads
  add column if not exists assigned_to uuid references public.staff(id) on delete set null;
create index if not exists idx_leads_assigned on public.leads (assigned_to);

-- ═══ team_messages — internal team feed (admin-only) ═══
create table if not exists public.team_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  author text not null check (char_length(author) between 1 and 254),
  body text not null check (char_length(body) between 1 and 4000),
  lead_id uuid references public.leads(id) on delete set null
);

create index if not exists idx_team_messages_created on public.team_messages (created_at desc);
alter table public.team_messages enable row level security;

drop policy if exists "team_messages: admin all" on public.team_messages;
create policy "team_messages: admin all" on public.team_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ═══ project_messages — client ↔ team thread (shown in the portal) ═══
create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sender_role text not null check (sender_role in ('client','team')),
  author_name text check (char_length(author_name) <= 120),
  -- who the client is addressing (their handler), or who on the team replied.
  -- null = the whole team / office.
  to_staff_id uuid references public.staff(id) on delete set null,
  body text not null check (char_length(body) between 1 and 4000),
  read_by_team boolean not null default false,
  read_by_client boolean not null default false
);
-- safety for re-runs where the table already existed without the column
alter table public.project_messages
  add column if not exists to_staff_id uuid references public.staff(id) on delete set null;

create index if not exists idx_project_messages_project on public.project_messages (project_id, created_at);
alter table public.project_messages enable row level security;

-- Client (project owner): read their thread, and post as 'client' only.
drop policy if exists "project_messages: owner read" on public.project_messages;
create policy "project_messages: owner read" on public.project_messages
  for select to authenticated using (
    exists (select 1 from public.projects p
            where p.id = project_id and p.user_id = (select auth.uid()))
  );

drop policy if exists "project_messages: owner insert" on public.project_messages;
create policy "project_messages: owner insert" on public.project_messages
  for insert to authenticated with check (
    sender_role = 'client'
    and exists (select 1 from public.projects p
                where p.id = project_id and p.user_id = (select auth.uid()))
  );

-- Admin: full access (reads all threads, posts as 'team').
drop policy if exists "project_messages: admin all" on public.project_messages;
create policy "project_messages: admin all" on public.project_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
