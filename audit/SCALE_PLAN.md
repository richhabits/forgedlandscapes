# SCALE_PLAN — Forged Landscapes 100x

_Phase 2. Three axes. Specific to a Watford premium landscaper on a strict 20-mile radius. Now = this week · Next = this month · Later = this quarter._

> Guiding constraint: **the 20-mile radius caps geography, so 100x comes from depth, not sprawl** — dominate the local SERPs, convert far harder, and never drop a lead. Programmatic pages must be genuinely local or they'll be penalised as doorway pages.

## Axis 1 — 100x leads (demand)

### Now
- **Speed-to-lead (biggest single lever in home services):** set `RESEND_API_KEY` → instant customer acknowledgement ("we've got it, we reply within 2 working hours") **and** instant staff notification with town/service/budget. Add an SLA timer on the lead (visible "time since arrival"). [B-01, U-01]
- **Switch on measurement** so every lead lever can be judged: GA4 + Search Console + Speed Insights. [F-01, C-02]
- **Capture width:** tap-to-call + WhatsApp click-to-chat in the mobile hero, and a low-friction "rough ballpark in 60 seconds" entry (reuse the AI quoter, client-facing, clearly "rough"). [U-01]

### Next
- **Programmatic local SEO — the 5×12 matrix (60+ pages), done to a standard:** each `/[service]/[town]` page needs unique local substance — a real local project reference, the town's soil/drainage/planning quirk (already researched for the 12 town pages), town-specific FAQs, and ≥1 real photo. Build the template + `services × areas` data join, gate publish behind "has real content". [C-03]
- **Cost-guide content engine:** target high-intent money queries ("porcelain patio cost 2026", "resin driveway cost per m²", "block paving cost Watford") → guides that publish honest ranges **pulled from the `rates` table**. Pricing transparency is a moat here because competitors won't publish numbers. [C-04]
- **Reviews flywheel:** on job completion (Axis 3 pipeline) auto-request a Google review + capture before/after photos as a required step → feeds `/work`, `Review` schema, and GBP. Permanently kills the stock-photo problem. [C-01, D-01/02]

### Later
- Google **Local Services Ads** (pay-per-lead, "Google Guaranteed") — *requires public-liability insurance + waste-carrier registration first*. Feed the existing `generate_lead` conversion into Google Ads.
- Retargeting pixel on the cost guides; seasonal campaigns (drives before winter, patios before spring).

## Axis 2 — 100x traffic resilience (site under load)

### Now
- `/work` → ISR; confirm every public page is Static/ISR (all are except `/work`). [F-03]
- Uptime monitor (`/`, `/api/geo`) with phone/email alert (cron-job.org, free). "How long until anyone notices a break?" → minutes. [B-06]

### Next
- **Abuse at the edge before it's abuse:** Upstash Redis (shared rate limit across serverless instances) + Cloudflare Turnstile on `/api/leads` and the brief flow. 100x traffic = 100x bots; protect `leads` PII table from a spam flood. [B-02]
- **Observability:** Sentry on API routes + client; Supabase log retention. [B-03]
- **Load test** the lead + brief endpoints (k6) to find the breaking point before real traffic does; add indexes surfaced by the test. Supabase REST (PostgREST) already pools connections — verify Supavisor transaction mode for the direct-PG paths (none currently).

### Later
- Bundle budget in CI (`@next/bundle-analyzer`, fail PRs over a per-route JS ceiling). [F-02]
- Restore drill: perform an actual PITR restore to a Supabase branch and document the runbook. [B-06]

## Axis 3 — 100x ops capacity (fulfilment)

### Now
- **Pipeline as data (single highest-leverage ops change):** the `lead_status` enum already runs `new → qualified → … → won`; extend the *project* lifecycle to `surveyed → quoted → scheduled → in_progress → complete → aftercare` with a **timestamp on every transition** (append to `lead_events`). This one change unlocks funnel metrics, SLA tracking, and the reviews flywheel.

### Next
- **Owner Monday-morning report:** one screen — leads/week by source·town·service, quote→win rate, average job value, open pipeline value. Extend the `admin_metrics` view. [U-04]
- **Automations:** new-lead + new-message notifications (Resend), quote draft from `rates` (the AI quoter already does this), scheduled follow-up nudge for unanswered quotes.
- **Staff roles + audit log:** roles beyond admin/not-admin (RLS-backed); `lead_events` "viewed" entries for PII-access trail. [B-05]

### Later
- Integrations in leverage order: **Cal.com** survey scheduling → **Stripe** deposits/staged payments → e-sign contracts → **Xero** accounting.

## The 100x thesis in one line
The radius caps *reach*, so scale = **be found for every service in every town (programmatic + guides), convert twice as hard (proof + speed-to-lead), and never lose a lead or a job (pipeline + observability)** — all on the £0 free-tier stack already in place.
