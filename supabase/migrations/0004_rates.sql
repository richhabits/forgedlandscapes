-- ═══════════════════════════════════════════════════════════════════
-- FORGED LANDSCAPES — Phase 2c: rates (for the AI quoter)
--
-- An admin-editable rate sheet the estimator prices jobs against. Keep it
-- current and every draft estimate stays accurate. Admin-only, RLS-enforced.
-- Seeded with the site's existing guide prices. Idempotent.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.rates (
  id uuid primary key default gen_random_uuid(),
  key text unique not null check (char_length(key) between 1 and 60),
  label text not null check (char_length(label) <= 120),
  category text not null default 'rate_per_m2'
    check (category in ('rate_per_m2', 'labour', 'travel', 'markup', 'other')),
  unit text check (char_length(unit) <= 20),
  amount numeric(10,2) not null default 0 check (amount >= 0),
  sort int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.rates enable row level security;

drop trigger if exists trg_rates_updated on public.rates;
create trigger trg_rates_updated before update on public.rates
  for each row execute function public.set_updated_at();

drop policy if exists "rates: admin all" on public.rates;
create policy "rates: admin all" on public.rates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Seed defaults (guide prices from lib/services.ts). do nothing on conflict so
-- re-running never overwrites rates the owner has since edited.
insert into public.rates (key, label, category, unit, amount, sort) values
  ('patio_paving',      'Patio & paving',        'rate_per_m2', '£/m²',   170, 10),
  ('driveway',          'Driveway',              'rate_per_m2', '£/m²',   130, 20),
  ('decking_woodwork',  'Decking & woodwork',    'rate_per_m2', '£/m²',   170, 30),
  ('lawn_softscape',    'Lawn & planting',       'rate_per_m2', '£/m²',    60, 40),
  ('full_redesign',     'Full garden redesign',  'rate_per_m2', '£/m²',   250, 50),
  ('other',             'Other landscaping',     'rate_per_m2', '£/m²',   150, 60),
  ('travel_per_mile',   'Travel (per mile, round trip)', 'travel', '£/mile', 0.60, 70),
  ('contingency',       'Estimate range (±)',    'markup',      '%',       15, 80)
on conflict (key) do nothing;
