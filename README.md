# Forged Landscapes — forgedlandscapes.co.uk

Premium design-and-build landscaping site + client portal for Watford, Hertfordshire
(strict 20-mile radius). Aggressive-but-polite lead capture: AI needs-assessor,
radius-gated enquiries, and a portal brief (photos → dimensions → sketch → inspiration)
that pre-qualifies every site survey.

**Zero-overhead stack** — every service on a free tier:

| Layer | Service | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) on Vercel | static-first, 26 routes |
| Styling | Tailwind CSS v4, custom design system | Fraunces + Inter Tight, self-hosted |
| DB / Auth / Storage | Supabase | RLS everywhere, private media bucket |
| AI assessor | Vercel AI SDK + Groq (`llama-3.3-70b-versatile`) | scripted fallback, zero-AI floor |
| Radius check | postcodes.io + haversine | keyless, CORS-friendly |
| Maps | Leaflet + CARTO dark tiles | free with attribution |
| Email | Resend | admin alerts + client confirmations |

## Run it

```bash
npm install
npm run dev        # full site + portal run in DEMO MODE with zero keys
```

Demo mode = every flow works (assessor, radius check, portal wizard, sketch,
uploads) with nothing persisted. Add keys per `.env.example` to go live.

## The important files

- `schema.sql` / `supabase/migrations/0001_init.sql` — full Postgres schema **with RLS policies** (run in Supabase SQL editor or via migration)
- `lib/assessor.ts` — the AI system prompt + the scripted flow (one source of truth)
- `lib/geo.ts` — postcodes.io lookup + 20-mile haversine gate (server & client)
- `lib/site-config.ts` — brand, phone, trust facts; all `TODO`s marked
- `lib/images.ts` — photography manifest (verified comps → swap for project photos)
- `docs/SHOT-LIST.md` — what to photograph to replace the comps
- `docs/SETUP.md` — go-live checklist (Supabase, Groq, Resend, domain)

## Architecture notes

- **Security model:** the Supabase anon key is public by design; Row Level Security
  is the boundary. Public tables are INSERT-only with hard checks (no reads);
  portal users only touch rows where `user_id = auth.uid()`; storage paths are
  per-user folders. Service-role key is optional and server-only.
- **Resilience:** if `GROQ_API_KEY` is absent or the model errors mid-chat, the
  assessor degrades to a deterministic 3-question flow — capture never stops.
  If Resend is absent, leads still land in the DB. If Supabase is absent, the
  site runs in demo mode instead of erroring.
- **Anti-spam:** honeypot field + per-IP rate limits + zod validation + server-side
  postcode re-verification on every public write.
- **Local SEO:** per-town landing pages (`/areas/*`), `LocalBusiness` +
  `Service` + `FAQPage` JSON-LD, sitemap/robots, GB locale metadata.
- **Consumer law:** Consumer Contracts Regulations 2013 (14-day cooling-off) and
  Consumer Rights Act 2015 cited correctly; SuDS 5m² checker on the driveways
  page; CDM 2015 + waste-carrier + insurance in the footer. Placeholders for
  real registration numbers are marked `TODO` in `lib/site-config.ts`.
