# SYSTEM_MAP — Forged Landscapes

_Phase 0 recon. Evidence-based; verified against the live codebase, build output, migration files, and production Supabase read-path._

## Stack
- **Next.js 16.2.10** (App Router, Turbopack) on **Vercel** (Hobby), auto-deploy from `main` (`richhabits/forgedlandscapes`).
- **React 19.2**, **Tailwind v4** (CSS-first `@theme` tokens in `app/globals.css`).
- **Supabase** project `landscapesforged` (ref `lfrxriwvqumvdkvsvlvl`) — Postgres + Auth (magic link) + private Storage. **5 migrations applied.**
- **@supabase/ssr 0.12** (admin cookie sessions) + **supabase-js 2.110** (portal localStorage).
- AI: **Vercel AI SDK 7 + @ai-sdk/groq** (assessor + quoter, scripted/deterministic fallback).
- Email: **Resend 6** (graceful no-op without key). Geo: postcodes.io + haversine. Maps: Leaflet + CARTO.
- Node 25 local; Vercel builds on its own runtime.

## Route map (rendering mode from `next build`)
| Route | Mode | Purpose |
|---|---|---|
| `/`, `/patios-paving`, `/driveways`, `/decking-pergolas`, `/lawns-planting`, `/garden-design` | **Static** ○ | Marketing |
| `/areas`, `/contact`, `/guides`, `/privacy`, `/terms`, `/service-area` | **Static** ○ | Marketing |
| `/areas/[slug]` (12), `/guides/[slug]` (3) | **SSG** ● | Local + content SEO |
| `/work` | **SSR** ƒ ⚠️ | Public gallery — *reads DB on every request (should be ISR)* |
| `/portal`, `/portal/success` | **Static** ○ (client auth) | Client portal |
| `/admin`, `/admin/{login,team,partners,rates,settings,showcase}`, `/admin/projects/[id]` | **Dynamic** ƒ | Back office (gated) |
| `/api/*` (15 routes) | **Dynamic** ƒ | Public capture (`leads`, `geo`, `chat`, `notify`) + admin (`/api/admin/*` ×11) |
| `sitemap.xml`, `robots.txt`, `opengraph-image`, `icon.svg` | Static | SEO |
| `proxy.ts` (middleware) | Edge | Refreshes admin session on `/admin/*` |

**Verdict:** rendering strategy is correct except `/work` (SSR) — one finding.

## Component & token inventory
- **Design tokens** live in one place — `app/globals.css` `@theme` (colours `forge/bone/brass/stone/moss`, Fraunces + Inter Tight, eases). Good discipline at the token layer.
- **Shared UI:** `components/ui/button.tsx` (cva), `components/site/*` (header, footer, reveal, section, price-table, faq, badges, site-image, before-after, radius-checker, suds-calculator, area-map, cookie-consent, share-button, google-analytics), `components/portal/*`, `components/assessor/*`, `app/admin/_components/*`.
- **Smell:** heavy use of arbitrary one-off values (`text-[13.5px]`, `text-[11.5px]`, `gap-[…]`) rather than a fixed type scale — token discipline breaks down at the utility layer (see AUDIT D-03).

## Supabase schema + RLS (from migrations = deployed state)
14 tables, **RLS enabled on all 14**. Policies (verified in migrations):
- **Public INSERT-only:** `leads` (check `user_id is null`), `chat_sessions`. No public SELECT.
- **Owner-scoped (portal user):** `projects`, `project_media`, `profiles`, `project_messages` (owner read + insert-as-client), storage `project-media` per-user folders.
- **Admin-gated via `is_admin()` SECURITY DEFINER:** read/update on `leads`; all on `staff`, `partners`, `team_messages`, `rates`, `app_settings`, `showcase`; read on `chat_sessions`, `projects`, `project_media`, `profiles`, `lead_events`; delete on `leads` **only where `is_sample=true`**.
- **Public read (intentional):** `showcase` where `published=true`.
- `admins` — RLS enabled, **no policy** (deny-all; read only via `is_admin()` definer). Correct.
- Helpers: `is_admin()`, `add/remove_admin_by_email()`, `set_updated_at()`, `handle_new_user()`, `admin_metrics` view (security_invoker).
- **Indexes:** created_at/status/email(leads), assigned_to, referred_by, is_sample, lead_events(lead_id), project_messages(project_id), staff/partners, showcase(published,sort), rates none-needed. FKs indexed on hot paths.

## Environment variables
| Var | Class | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL/_ANON_KEY/_PUBLISHABLE_KEY` | Public | RLS is the boundary; safe. |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Public | GA id **not set** → analytics dormant. |
| `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY` | **Secret** | Only referenced in `lib/supabase.ts` (server) + api routes. **Not leaked to client bundle (verified: 0 hits in `.next/static`).** |
| `GROQ_API_KEY`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL/_TOKEN`, `ADMIN_EMAIL`, `EMAIL_FROM` | Secret/config | **RESEND_API_KEY not set on Vercel → lead-alert email is a silent no-op** (see AUDIT B-01). |

## Build & deps
- `npm run build`: **compiles clean, TypeScript clean, 0 errors**, 4 lint warnings (benign `setState-in-effect`, pre-existing).
- `npm audit`: **2 moderate** — `postcss <8.5.10` XSS-in-stringify (GHSA-qx2v-qp2m-jg93), transitive dev dep via Tailwind. Fix: `npm audit fix`.
- Per-route first-load JS byte sizes **not emitted** by the Turbopack build table → not captured here; needs `@next/bundle-analyzer` / Lighthouse (AUDIT F-02).

## What I could NOT verify (stated, not guessed)
- Field Core Web Vitals (no RUM/analytics installed) — needs Lighthouse/Speed Insights.
- Vercel dashboard settings, cache headers, backups/PITR status — no dashboard access from here.
- Authenticated/staff **read** RLS live (would require a signed-in JWT) — verified from policy definitions instead, per the read-only rule.
- All **write-path** policies verified from migration definitions only (no writes attempted against production).
