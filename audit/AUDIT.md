# AUDIT — Forged Landscapes

_Phase 1. Evidence-based, unflattering. Severity × Effort on every finding._

## Executive summary (plain English)

The **engineering foundation is genuinely strong** — and I can prove it, not just claim it: I tested the live database as an anonymous visitor and **every table holding customer data returned nothing** (row-level security is doing its job), there are **no secret keys leaked** into the shipped website, the site is **mostly static** (so it's fast and cheap to serve), and the SEO structure is well above what most trade sites have.

The gaps are **not in the plumbing — they're in trust, measurement, and the moment a lead arrives**:

1. **A lead lands and nobody is told.** The "email me new leads" wiring exists in code but the Resend key isn't set on Vercel, so new enquiries drop into the database silently. For a home-services business where response speed is the #1 conversion lever, this is the most expensive bug on the list.
2. **You're flying blind.** No analytics is live. You can't see how many people visit, which town pages work, or how many start-vs-finish the brief. Everything else on this list should be measured — so this gets fixed first.
3. **The brand says "forged properly" but the photos are stock.** Illustrative Unsplash imagery on a premium quality brand is a trust contradiction, the gallery is empty, and the testimonials are placeholders. Real project photos + real reviews are worth more than any code change here.

Fix those three and the platform is ready to scale. The 100x plan (SCALE_PLAN.md) builds on top.

## Top 10 Quick Wins (high impact × small effort)

| # | Win | Why it matters | Effort |
|---|---|---|---|
| 1 | Set `RESEND_API_KEY` + `ADMIN_EMAIL` on Vercel | New-lead + brief emails start firing → you actually hear about leads | **S** |
| 2 | Add GA4 id (`NEXT_PUBLIC_GA_ID`) + verify Search Console | Measurement switches on; `generate_lead`/`submit_brief` events already coded | **S** |
| 3 | `npm audit fix` (postcss moderate) | Clears the only dependency vuln | **S** |
| 4 | `/work` → ISR (`revalidate`, drop `force-dynamic`) | Public page stops hitting the DB on every hit; faster + cheaper | **S** |
| 5 | Add an **instant customer acknowledgement email** on lead submit | "We've got it, we reply within X" — sets expectation, lifts trust | **S** |
| 6 | Capture **landing page + UTM** on the lead | Finally know which town/service page drives leads | **S** |
| 7 | Publish 3–6 **real before/afters** to `/work` (gallery is built + empty) | Kills the stock-photo trust gap; SEO + conversion | **S** (needs photos) |
| 8 | WhatsApp click-to-chat + tap-to-call button on mobile hero | Widens capture for people not ready for the full brief | **S** |
| 9 | Swap the **placeholder testimonials** for 3 real, named ones + `Review` schema | Real proof + rich-result stars | **S** (needs reviews) |
| 10 | Uptime monitor on `/` and `/api/geo` (cron-job.org, free) | If the site breaks on a Tuesday you find out in minutes | **S** |

## Findings

### Design & brand (D)
| ID | Sev | Eff | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| D-01 | **High** | M | Stock/illustrative imagery on a "forged properly" quality brand — trust contradiction | `lib/images.ts` uses `images.unsplash.com`; before/after captions say "illustrative" | Replace with real project photos (`docs/SHOT-LIST.md`); make before/after capture a job-completion step |
| D-02 | **High** | S | Portfolio gallery exists but is **empty** — no proof of work | `/work` renders empty-state; `showcase` table has 0 published rows | Publish real before/afters via admin **Gallery** |
| D-03 | Med | M | Token discipline breaks at the utility layer — dozens of one-off `text-[13.5px]` etc. | grep arbitrary font-size values across components | Define a fixed type scale in `@theme`; replace magic values |
| D-04 | Med | S | Testimonials are placeholders | `app/(marketing)/page.tsx` — "Placeholder testimonials — REPLACE" | Real named reviews + `Review`/`AggregateRating` schema |
| D-05 | Low | S | Premium feel is close but proof-light above the fold on service pages | Visual review | Add a real photo + named quote near each service hero |

### Front-end (F)
| ID | Sev | Eff | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| F-01 | **High** | S | **No analytics/RUM live** → cannot measure CWV or funnels in the field | `NEXT_PUBLIC_GA_ID` empty; no Speed Insights | GA4 + Vercel Speed Insights; events are already coded |
| F-02 | Med | S | Per-route JS bundle sizes never measured | Turbopack build omits size column | Add `@next/bundle-analyzer`; Lighthouse CI in CI |
| F-03 | Med | S | `/work` is SSR instead of ISR | `next build`: `/work` = ƒ Dynamic; `force-dynamic` in code | `export const revalidate = 300` and drop force-dynamic |
| F-04 | Med | M | Leaflet map + assessor widget ship to every marketing page as client JS | `components/site/area-map.tsx`, `assessor-widget.tsx` | Dynamic-import the map; lazy-mount the assessor on interaction |
| F-05 | Med | M | No formal WCAG 2.2 AA pass (contrast of `stone-400` microlabels on `forge-950`, keyboard/focus of portal + drawers) | No axe run; visual risk on low-contrast labels | Run axe; fix contrast + focus traps in slide-over drawers |
| F-06 | Low | S | `Review`/`AggregateRating` schema absent (rest of schema is strong) | `lib/jsonld.tsx` has LocalBusiness/Service/FAQ/Article/Breadcrumb, no Review | Add when real reviews exist |

### Back-end & data (B)
| ID | Sev | Eff | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| B-01 | **High** | S | **Lead/brief notification emails silently no-op** — `RESEND_API_KEY` not set on Vercel | `lib/email.ts` returns `{sent:false, skipped}` without key; leads land in DB unseen | Set the key (Resend account already proven working) |
| B-02 | Med | M | Rate limiting is **in-memory / per-serverless-instance** → weak at scale; no CAPTCHA | `lib/rate-limit.ts` in-memory fallback; Upstash unset; honeypot only | Set Upstash Redis + add Cloudflare Turnstile on public writes |
| B-03 | **High** | M | **No error observability** — a broken brief flow could fail silently for days | No Sentry/error reporting in `app`/`api` | Add Sentry (free tier) to API routes + client |
| B-04 | Low | S | `postcss <8.5.10` moderate vuln (dev dep) | `npm audit` | `npm audit fix` |
| B-05 | Low | M | No audit trail of staff **reads** (who viewed a lead's PII) | `lead_events` logs status/notes/assign/reply only | Optional `lead_events` "viewed" kind for compliance |
| B-06 | Low | S | Backups/PITR status unverified | No dashboard access | Confirm Supabase PITR; run one restore drill to a branch |
| ✅ | — | — | **RLS read-path verified secure (live anon test): all 14 PII tables return `[]`** | curl anon key vs prod REST API | none — strength |
| ✅ | — | — | **No secret keys in client bundle** | grep `.next/static` = 0 | none — strength |
| ✅ | — | — | Every `/api` route: zod validation + rate limit + (admin routes) `is_admin()` server check | route source | none — strength |

### Usability (U)
| ID | Sev | Eff | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| U-01 | **High** | S | No **instant customer acknowledgement** after submit; "we reply within one working day" is a promise with no automation | `contact-form.tsx` shows copy but sends no email; B-01 compounds it | Instant ack email/SMS + staff notify (speed-to-lead) |
| U-02 | Med | S | Leads carry `source` (form/assessor) but **not which town/service page** | `lib/validation.ts` — `source`, `referred_by`; no UTM/landing | Capture `document.referrer`/UTM into `meta` |
| U-03 | Low | — | Brief flow is a **genuine strength** — 6 steps, autosave, photo upload, sketch, magic-link resume | `brief-wizard.tsx` | keep; consider a shorter "rough estimate" entry point |
| U-04 | Med | M | No owner reporting screen (leads/week by source/town/service, quote→win) | `admin_metrics` view is week-over-week only | Build a Monday-morning dashboard view |

### Conversion & growth (C)
| ID | Sev | Eff | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| C-01 | **High** | S | Trust ladder thin: no real photos, no real reviews, no Google reviews embed | D-01/D-02/D-04 | Reviews flywheel (SCALE_PLAN Axis 1.3) |
| C-02 | **High** | S | No measurement of CTA clicks / form starts / call clicks as events | F-01 | Event tracking (already coded, needs GA id) |
| C-03 | Med | M | The 5×12 **service×town matrix** (60+ pages) doesn't exist — only 5 service + 12 town pages separately | route map | Programmatic build with a real content standard (SCALE_PLAN 1.1) |
| C-04 | Low | — | **Correction to brief:** guide prices *do* exist on service pages (`PriceTable`, 21 rows) — pricing is **not** fully opaque | `services.ts` + `service-page.tsx` | Lean into it: cost-guide content engine (SCALE_PLAN 1.2) |

## Severity tally
- **Critical: 0** (no exposed secrets, no anon PII read path — the two usual Criticals are clean).
- **High: 8** — B-01, B-03, D-01, D-02, F-01, U-01, C-01, C-02.
- **Medium: 9 · Low: 6.**

The Highs cluster into three themes: **notifications/observability off (B-01, B-03, U-01)**, **measurement off (F-01, C-02)**, and **trust proof missing (D-01, D-02, C-01)**. None are architectural — all are switch-on / populate / instrument work.

---

## Remediation log (branch `audit/scale-100x`, code-only — awaiting owner keys/assets for the rest)
| Finding | Status | What shipped |
|---|---|---|
| U-01 | ✅ code | Instant customer acknowledgement email on lead submit (`lib/email.ts`, `/api/leads`). |
| F-03 | ✅ code | `/work` SSR → ISR (revalidate 300). |
| U-02 / C-02 | ✅ code | UTM + landing + referrer captured to `leads.meta` (`lib/attribution.ts`); shown as "Came from" in the drawer. |
| B-03 | ✅ code | Error boundaries (`app/error.tsx`, `app/global-error.tsx`) + `onRequestError` instrumentation → `lib/observability.ts` (forwards to Sentry when a DSN is added). |
| B-02 | ✅ code | Cloudflare Turnstile server-verify + widget on the lead form; no-op until keys set, fails open on outage. |
| D-04 / F-06 | ✅ code | Placeholder testimonials removed; real-review infra (`lib/reviews.ts`) + `Review`/`AggregateRating` schema, data-driven & schema emitted only for real reviews. |
| F-05 | ✅ partial | Skip-to-content link added (WCAG 2.4.1); full axe pass still pending. |
| — | ✅ enterprise | CI gate (`.github/workflows/ci.yml`): build+typecheck+lint, `--max-warnings 0`. |
| — | ✅ tool | `audit/load-test.js` (k6) — preview-only, read-only endpoints. |
| **F-04** | ⬇️ **downgraded** | Correction: Leaflet is **already lazy-loaded** (dynamic `import("leaflet")` inside the map effect) — not in the initial bundle. Severity Med → Low. |

**Awaiting owner (code wired, dormant until provided):** Resend key + domain (B-01) · GA4 id (F-01) · Sentry DSN (B-03 full) · Turnstile + Upstash keys (B-02 full) · real photos + reviews (D-01/D-02/C-01) · uptime monitor. Supabase advisor output to be pasted here once you run them.
