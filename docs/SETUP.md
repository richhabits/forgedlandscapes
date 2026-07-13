# Go-live checklist — Forged Landscapes

The site ships working in demo mode. Each block below turns on one real system.
Total hands-on time: ~15 minutes. Total monthly cost: £0.

## 1 · Database, auth & storage — Supabase via Vercel (~4 min)

1. Vercel dashboard → the `forged-landscapes` project → **Storage** tab →
   **Create Database** → **Supabase** → pick the **Free** plan → region **London**.
2. That's it for keys — the integration injects `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (+ service role) into the project automatically.
3. Apply the schema: open the Supabase dashboard (button inside the integration) →
   **SQL Editor** → paste the whole of `schema.sql` → **Run**, then paste and **Run**
   `supabase/migrations/0002_admin.sql` (the admin console). Both are idempotent —
   safe to re-run.
4. Auth → **URL Configuration** → set **Site URL** to your live URL
   (e.g. `https://forgedlandscapes.co.uk`) and add it to **Redirect URLs**.
   This makes portal magic-links land on the right domain.
5. Redeploy the Vercel project so the new env vars build in.

> Free-tier note: Supabase pauses projects after ~1 week of zero traffic.
> Any visit wakes it; a weekly uptime ping (e.g. cron-job.org, free) prevents it entirely.

## 2 · AI assessor — Groq (~2 min, optional)

1. console.groq.com → create account → **API Keys** → create key.
2. Vercel project → Settings → Environment Variables → `GROQ_API_KEY` = the key.
3. Redeploy. Without it the assessor runs its scripted mode — same questions,
   same lead capture, so this can wait as long as you like.

## 3 · Email alerts — Resend (~3 min)

1. resend.com → create account → **API Keys** → create key.
2. Vercel env: `RESEND_API_KEY` = key, `ADMIN_EMAIL` = where lead alerts go.
3. Until you verify a domain, Resend free only delivers to your own inbox —
   which is exactly what admin alerts need. To send client-facing confirmations,
   add your domain in Resend → Domains, set the two DNS records, then set
   `EMAIL_FROM="Forged Landscapes <hello@forgedlandscapes.co.uk>"`.
4. Optional polish: Supabase → Auth → SMTP → point at Resend so magic-link
   emails come from your domain too (also lifts the strict built-in send limits).

## 4 · Admin console — seed the first admin (~1 min)

The back office lives at `/admin`. Access is gated two ways: the router
redirects non-admins, and Row Level Security independently returns them no data.

1. Sign in once at `https://your-site/admin` with the owner's email so the
   `auth.users` row exists (the magic link lands you on the "not an admin" screen —
   that's expected until the next step).
2. Supabase → **SQL Editor** → run, swapping the email:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where lower(email) = lower('landscapesforged@gmail.com')
   on conflict (user_id) do nothing;
   ```
3. Reload `/admin` — you're in. See `docs/ADMIN-GUIDE.md` for day-to-day use.

To add another admin later, repeat step 2 with their email. To revoke:
`delete from public.admins where user_id = (select id from auth.users where lower(email)=lower('…'));`

## 5 · Hardening (optional, all free)

- **Shared rate limiting** — Upstash Redis free tier: create a database at
  upstash.com, copy the REST URL + token into `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN`. Without them an in-memory limiter is used.
- **Security headers** — already shipped in `next.config.ts` (CSP, HSTS,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy). After go-live,
  check the grade at securityheaders.com.
- **Keep-alive** — cron-job.org (free): hit `/api/geo?postcode=WD17` weekly so
  Supabase never pauses.
- **Analytics** — enable Vercel Web Analytics (cookieless) in the project dashboard.

## 6 · Before real traffic

- `lib/site-config.ts`: phone + email are set. Add back `trust.insurance` and
  `trust.wasteCarrier` (with a real CBDU number) **only once actually held** — a
  commented template marks where. Registering as an EA waste carrier and holding
  public liability insurance are both worth sorting before trading.
- Badges: `site-config.ts` `badges` is empty (none held). Add an entry **only for
  a body you've actually joined**, with its licensed logo in `/public/badges`.
- Testimonials in `app/(marketing)/page.tsx`: swap placeholders for real reviews.
- Photography: work through `docs/SHOT-LIST.md` and update `lib/images.ts`.
- Legal: drop the registered company name/number into `/privacy` and `/terms`
  (marked `TODO`), confirm staged-payment percentages in terms.
- Point `forgedlandscapes.co.uk` at Vercel (project → Domains) and set
  `NEXT_PUBLIC_SITE_URL` to the live URL.

## Where leads land

Once you've seeded an admin (section 4), everything is at **`/admin`** — no need
to touch the Supabase dashboard: every enquiry (source-tagged, radius-verified,
with chat transcripts), every portal brief with its photos, videos and sketches,
and a this-week dashboard. See `docs/ADMIN-GUIDE.md`.

Under the hood it's still Supabase → `leads`, `projects`, `project_media` (private
`project-media` bucket) and the `lead_events` audit trail.
