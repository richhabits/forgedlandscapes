# Google Business Profile — the playbook

For a landscaping business, your **Google Business Profile (GBP)** is as important
as the website. It's what puts you in the **local pack** (the map + three
businesses that appear above the normal results when someone searches
"landscaper near me" or "driveways Watford") and on **Google Maps**. Most local
enquiries start here, not on a website.

This is the full setup and the review engine that keeps it climbing. Budget about
**an hour to set up**, then ten minutes a week.

---

## Part 1 · Set it up as a *service-area* business

You go to customers; customers don't come to you. Google calls this a
**service-area business (SAB)**, and setting it up that way matters.

1. Go to **google.com/business** → **Manage now**, signed in with the Google
   account you want to own this (use a business Gmail you'll keep, not a personal
   one you might lose access to).
2. **Business name:** exactly `Forged Landscapes` — no location or keywords
   stuffed in ("Forged Landscapes Watford Driveways" breaks Google's rules and
   can get you suspended). The name must match the website and everywhere else.
3. When asked *"Do you want to add a location customers can visit?"* → **No**.
   You'll still enter your address for verification, but you'll then **hide it**
   and show a service area instead.
4. **Service area:** add the towns you cover within the 20-mile radius. Google
   allows up to ~20; lead with the strongest:
   > Watford · Bushey · Rickmansworth · Northwood · St Albans · Hemel Hempstead ·
   > Harrow · Pinner · Radlett · Chorleywood · Borehamwood · Stanmore ·
   > Berkhamsted · Kings Langley · Abbots Langley · Croxley Green
5. **Primary category:** `Landscaper`. This single field is one of the biggest
   ranking factors — get it exactly right.
6. **Additional categories** (add only what you genuinely do):
   `Landscape designer` · `Paving contractor` · `Driveway contractor` ·
   `Deck builder` · `Lawn care service` · `Fence contractor`.
7. **Phone + website:** your real number and the live site URL. Tag the website
   link so you can see GBP traffic in analytics, e.g.
   `https://forgedlandscapes.co.uk/?utm_source=google&utm_medium=gbp`.

---

## Part 2 · Verify it

Google will ask you to prove the business is real. For service-area businesses
this is increasingly **video verification**: a short unbroken clock — you filming
your van with signage, tools/materials, and something showing the locality. Have
that ready. Sometimes it's a **postcard** to your address, occasionally phone or
email. Follow whatever Google offers; you can't edit much until verified.

> NAP rule: your **N**ame, **A**ddress and **P**hone must be **identical**
> across GBP, the website (`lib/site-config.ts`), and any directory (Yell,
> Checkatrade, Facebook). Inconsistent details are a real ranking drag. Update
> the site's `site-config.ts` first, then match everything to it.

---

## Part 3 · Fill it out completely (completeness = ranking)

A 100%-complete profile outranks a half-finished one. Work through all of it:

- **Description** (750 chars): natural, not stuffed. Cover who/where/what/proof.
  > Draft: *"Forged Landscapes is a design-and-build landscaping company based in
  > Watford, serving Hertfordshire and north-west London within a 20-mile radius.
  > We build porcelain and natural-stone patios, block-paved and resin driveways
  > with SuDS-compliant drainage, composite decking and pergolas, lawns and full
  > garden transformations — all on properly engineered bases. Fixed itemised
  > quotes after a site survey, staged payments, full public liability insurance
  > and a 5-year workmanship guarantee. From a single patio to a complete garden
  > redesign, one team takes it from survey to the last planted bed."*
- **Hours:** Mon–Fri 08:00–18:00, Sat 09:00–13:00 (match the site exactly).
- **Services:** add each service with a short description — mirror the website:
  Patios & Paving, Driveways, Decking & Pergolas, Lawns & Planting, Full Garden
  Design. You can add **guide prices** (mark them as "from").
- **Products:** optional but powerful — showcase project types with a photo and a
  "from" price; these show as cards on the profile.
- **Attributes:** tick the true ones — *Online estimates*, *Onsite services*,
  and any identity attributes that apply.
- **Photos** (the biggest visual lever — profiles with photos get far more clicks):
  - Logo and a strong cover image.
  - **Real project photos** — before/afters, finished patios, driveways, decks.
    Work through `docs/SHOT-LIST.md`; add new ones every couple of weeks.
  - Avoid stock imagery; Google and customers both prefer genuine work.
- **Opening/Q&A:** seed a few real questions and answer them (e.g. "Do you cover
  St Albans?", "Do you handle dropped kerbs?"). You can post questions yourself
  and answer them — do it.

---

## Part 4 · The review engine (the part that compounds)

Reviews are the strongest lever you control for both **ranking** and **winning the
job**. Quantity, recency and your **responses** all count. The goal is a steady
drip of genuine reviews, not a one-off burst.

### Get your review link
1. In your Business Profile, find **Ask for reviews** / **Get more reviews**.
2. Copy the short link — it looks like `https://g.page/r/XXXXXXXX/review`.
3. Paste it into the site config so the app can use it:
   ```ts
   // lib/site-config.ts
   reviewUrl: "https://g.page/r/XXXXXXXX/review",
   ```
   Commit + redeploy. (It's the `reviewUrl` field, already stubbed with a TODO.)

### The flow — ask every happy client, at the right moment
- **When:** the day the job finishes and it looks its best — not before. A review
  request lands best while the client is standing on their new patio.
- **How:** send the link by text and/or email. Keep it human:
  > *"Thanks again — it was a pleasure building your garden. If you've a minute,
  > a quick Google review genuinely helps a small local team like ours:
  > [your review link]. Either way, enjoy it!"*
- **In writing:** once `reviewUrl` is set, drop it into your completion/sign-off
  message (and, in a later phase, an automated "job complete" email). A **QR code**
  of the review link on the final invoice works well too.

### The rules (don't get the profile suspended)
- **Never** offer discounts, entries or any incentive for a review — it's against
  Google's policy and can wipe your reviews or suspend the profile.
- **Don't** review-gate (asking happy clients publicly but unhappy ones privately)
  — also against policy.
- **Don't** post fake reviews or ask staff/family. Google detects patterns.

### Respond to every review
- **Positive:** a short, specific, warm reply ("Thanks Sarah — that Kandla grey
  terrace came up beautifully; enjoy the summer on it."). It signals an active
  business and reads well to the next prospect.
- **Negative:** reply calmly, professionally, factually, and move it offline
  ("Sorry to hear this — I'd like to put it right; please call me on…"). How you
  handle a bad review persuades more people than the review itself.

---

## Part 5 · Keep it alive (10 minutes a week)

Freshness is a ranking signal. A dormant profile slides; an active one climbs.

- **Google Posts:** post weekly — a finished project photo, a seasonal tip
  ("book patios now for spring"), or an offer. Each post is a small freshness
  and keyword signal, and shows on your profile.
- **Photos:** add a few genuine project shots every couple of weeks.
- **Q&A:** check and answer new questions promptly.
- **Reviews:** respond within a day or two.
- **Info:** update hours for holidays; keep services current.

---

## Quick-start checklist

- [ ] Create profile at google.com/business, name exactly `Forged Landscapes`
- [ ] Set as service-area business; hide address; add the covered towns
- [ ] Primary category `Landscaper` + accurate secondaries
- [ ] Verify (video/postcard) — nothing ranks until verified
- [ ] Real phone + tagged website link; **NAP matches `site-config.ts`**
- [ ] Description, hours, services (with guide prices), attributes
- [ ] Upload logo, cover, and real project photos
- [ ] Copy the review link → set `reviewUrl` in `lib/site-config.ts` → redeploy
- [ ] Start asking every happy client for a review, and reply to each one
- [ ] Weekly: one Google Post, fresh photos, answer Q&A + reviews

---

### How this connects to the site
- **NAP** lives in `lib/site-config.ts` — keep GBP identical to it.
- **`reviewUrl`** in that same file is the hook for the "review us" link in
  client emails once you're live.
- The **12 town pages** (`/areas/…`) and **guides** (`/guides/…`) reinforce the
  same local relevance signals GBP rewards — the website and the profile pull in
  the same direction.
