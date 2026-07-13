# BACKLOG — Forged Landscapes (prioritised)

_Phase 3 prep. All AUDIT findings + SCALE_PLAN items merged into one execution-ordered list. Implement only after owner approval, on branch `audit/scale-100x`, in small verified commits. Ask before each merge to `main` (auto-deploys)._

Legend: **Sev** C/H/M/L · **Eff** S/M/L · items marked ⚙️ are config/dashboard (owner or env), 🧑‍💻 are code, 📸 need real assets/reviews.

## Stage 1 — Critical security & data
_None Critical. Data-integrity items only:_
1. B-04 · L·S · 🧑‍💻 `npm audit fix` (postcss moderate vuln).
2. B-02 · M·M · ⚙️🧑‍💻 Upstash Redis env + Cloudflare Turnstile on `/api/leads` + brief (bot/spam resilience).
3. B-06 · L·S · ⚙️ Confirm Supabase PITR; schedule a restore drill (Stage 8).

## Stage 2 — Measurement (do before anything you want to judge)
4. F-01 / C-02 · H·S · ⚙️ Set `NEXT_PUBLIC_GA_ID` + `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`; add Vercel Speed Insights. (events `generate_lead`/`submit_brief` already coded.)
5. U-02 · M·S · 🧑‍💻 Capture landing page + UTM into `leads.meta` for source attribution.

## Stage 3 — Top 10 quick wins (see AUDIT)
6. B-01 · H·S · ⚙️ Set `RESEND_API_KEY` + `ADMIN_EMAIL` on Vercel → notifications fire.
7. F-03 · M·S · 🧑‍💻 `/work` → ISR (`revalidate`, drop `force-dynamic`).
8. U-01 · H·S · 🧑‍💻 Instant customer acknowledgement email on lead submit + staff notify.
9. C-01/D-04 · H·S · 📸 Replace placeholder testimonials with 3 real named ones + `Review` schema.
10. D-02 · H·S · 📸 Publish 3–6 real before/afters to `/work` (admin Gallery built).
11. U-01b · M·S · 🧑‍💻 WhatsApp click-to-chat + prominent tap-to-call in mobile hero.
12. B-06b · L·S · ⚙️ Uptime monitor (`/`, `/api/geo`) with alerts.

## Stage 4 — Conversion (trust, CTA, speed-to-lead)
13. D-01 · H·M · 📸 Real project photography across the site (`docs/SHOT-LIST.md` → `lib/images.ts`).
14. C-01b · M·S · 🧑‍💻 Google reviews embed + review-request link in completion email.
15. D-05 · L·S · 🧑‍💻📸 Real photo + named quote near each service hero.
16. U-01c · M·S · 🧑‍💻 Client-facing "rough ballpark in 60s" entry (reuse AI quoter, clearly "rough").

## Stage 5 — Performance & SEO technical
17. F-04 · M·M · 🧑‍💻 Dynamic-import Leaflet map; lazy-mount assessor.
18. F-02 · M·S · 🧑‍💻 `@next/bundle-analyzer` + Lighthouse CI + per-route JS budget.
19. F-05 · M·M · 🧑‍💻 WCAG 2.2 AA pass (axe): contrast of microlabels, focus traps in drawers.
20. F-06 · L·S · 🧑‍💻 `Review`/`AggregateRating` schema once reviews exist.
21. D-03 · M·M · 🧑‍💻 Fix type scale in `@theme`; remove one-off `text-[…]` magic values.

## Stage 6 — Programmatic SEO build-out
22. C-03 · M·L · 🧑‍💻📸 `/[service]/[town]` matrix (60+ pages) on a content standard — unique local substance + real photo per page; publish-gated.
23. C-04 · M·M · 🧑‍💻 Cost-guide content engine (guides pull ranges from `rates`).

## Stage 7 — Ops pipeline + observability
24. Axis3.1 · H·M · 🧑‍💻 Project lifecycle statuses + timestamped transitions in `lead_events`.
25. B-03 · H·M · ⚙️🧑‍💻 Sentry on API routes + client.
26. U-04 · M·M · 🧑‍💻 Owner Monday report view (leads/week by source·town·service, quote→win, pipeline value).
27. Axis3.2 · M·M · 🧑‍💻 Follow-up automations (unanswered quote nudge); review-request on completion.
28. B-05 · L·M · 🧑‍💻 Staff roles + PII-read audit trail.

## Stage 8 — Hardening
29. Axis2 · M·M · 🧑‍💻 k6 load test on lead/brief endpoints; add indexes found.
30. B-06c · L·M · ⚙️ PITR restore drill to a Supabase branch + runbook.

## Fastest ROI if you only do five things
**#6 (email on), #4 (analytics on), #8 (instant ack), #10 (real photos), #24 (pipeline statuses)** — turns a silent, unmeasured funnel into a measured, responsive one, and makes the brand honest. Everything else compounds on those.
