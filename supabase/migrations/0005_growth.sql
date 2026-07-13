-- ═══════════════════════════════════════════════════════════════════
-- FORGED LANDSCAPES — Phase 2d: growth (referrals, staff logins,
-- before/after gallery, admin settings). Idempotent. Admin-gated except
-- the public gallery read.
-- ═══════════════════════════════════════════════════════════════════

-- ——— referrals: who sent us this lead ———
alter table public.leads add column if not exists referred_by text
  check (referred_by is null or char_length(referred_by) <= 254);
create index if not exists idx_leads_referred on public.leads (referred_by);

-- ——— sample-data flag: practice data staff can use, cleanly deletable ———
-- Real data always has is_sample = false; the admin "Sample data" toggle only
-- ever inserts/deletes rows where is_sample = true, so real records are safe.
alter table public.leads    add column if not exists is_sample boolean not null default false;
alter table public.staff    add column if not exists is_sample boolean not null default false;
alter table public.partners add column if not exists is_sample boolean not null default false;
create index if not exists idx_leads_sample on public.leads (is_sample);

-- Admins may DELETE sample leads only — real enquiries are never deletable
-- (mark them Lost instead), so the "Clear sample data" button can't touch them.
drop policy if exists "leads: admin delete sample" on public.leads;
create policy "leads: admin delete sample" on public.leads
  for delete to authenticated using (public.is_admin() and is_sample = true);

-- ——— staff logins: promote/demote an admin by email ———
create or replace function public.add_admin_by_email(p_email text)
returns boolean language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  if not public.is_admin() then raise exception 'not authorised'; end if;
  select id into uid from auth.users where lower(email) = lower(p_email) limit 1;
  if uid is null then return false; end if;
  insert into public.admins (user_id) values (uid) on conflict (user_id) do nothing;
  return true;
end $$;

create or replace function public.remove_admin_by_email(p_email text)
returns boolean language plpgsql security definer set search_path = public as $$
declare uid uuid; admin_count int;
begin
  if not public.is_admin() then raise exception 'not authorised'; end if;
  select count(*) into admin_count from public.admins;
  if admin_count <= 1 then raise exception 'cannot remove the last admin'; end if;
  select id into uid from auth.users where lower(email) = lower(p_email) limit 1;
  if uid is null then return false; end if;
  delete from public.admins where user_id = uid;
  return true;
end $$;

revoke all on function public.add_admin_by_email(text) from public, anon;
revoke all on function public.remove_admin_by_email(text) from public, anon;
grant execute on function public.add_admin_by_email(text) to authenticated;
grant execute on function public.remove_admin_by_email(text) to authenticated;

-- ——— showcase: before/after gallery ———
create table if not exists public.showcase (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null check (char_length(title) <= 160),
  location text check (char_length(location) <= 120),
  before_url text check (char_length(before_url) <= 1024),
  after_url text check (char_length(after_url) <= 1024),
  caption text check (char_length(caption) <= 600),
  published boolean not null default false,
  sort int not null default 0
);
create index if not exists idx_showcase_pub on public.showcase (published, sort);
alter table public.showcase enable row level security;

drop trigger if exists trg_showcase_updated on public.showcase;
create trigger trg_showcase_updated before update on public.showcase
  for each row execute function public.set_updated_at();

drop policy if exists "showcase: public read" on public.showcase;
create policy "showcase: public read" on public.showcase
  for select to anon, authenticated using (published = true);

drop policy if exists "showcase: admin all" on public.showcase;
create policy "showcase: admin all" on public.showcase
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ——— app_settings: admin-editable key/value (integrations, keys) ———
create table if not exists public.app_settings (
  key text primary key check (char_length(key) between 1 and 80),
  value text check (char_length(value) <= 4000),
  label text check (char_length(label) <= 160),
  is_secret boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;

drop trigger if exists trg_settings_updated on public.app_settings;
create trigger trg_settings_updated before update on public.app_settings
  for each row execute function public.set_updated_at();

-- Admin-only: secret values never leave the DB except to an authenticated admin.
drop policy if exists "app_settings: admin all" on public.app_settings;
create policy "app_settings: admin all" on public.app_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
