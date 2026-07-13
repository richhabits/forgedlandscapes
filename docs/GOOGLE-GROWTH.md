# The Google growth stack

How Forged Landscapes gets found on Google, and how to measure it. Everything
here is **free** unless flagged 💷. There's no secret "algorithm" — you get found
by ranking well organically (SEO, done), showing up in the map/local pack
(Business Profile + reviews), and then *measuring* what works (the tools below).

---

## Already built into the site (just add your IDs)

Three Google integrations ship in the code, **dormant until you paste an ID** into
Vercel's environment variables. Add them in **Vercel → project → Settings →
Environment Variables**, then redeploy.

| What | Env variable | Where to get it |
|---|---|---|
| **Google Analytics 4** | `NEXT_PUBLIC_GA_ID` | analytics.google.com → create a GA4 property → **Admin → Data streams → Web** → copy the **Measurement ID** (`G-XXXXXXX`) |
| **Search Console verify** | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | search.google.com/search-console → add a **URL-prefix** property `https://www.forgedlandscapes.co.uk` → choose the **HTML tag** method → copy the `content="..."` token |

**Privacy-honest by design:** GA4 loads with Google **Consent Mode** and tracks
**nothing** until a visitor clicks **"Allow analytics"** in the cookie banner. This
matches the site's honest cookie policy — no dark patterns, no tracking-by-default.

**Conversion tracking is wired** for the two moments that matter:
- `generate_lead` — fires when an enquiry is captured (contact form, assessor, or radius widget).
- `submit_brief` — fires when a client completes the full portal brief.

In GA4, mark both as **Key events** (Admin → Events) so you can see how many leads
each channel produces.

---

## 1 · Google Business Profile (the biggest local lever) — free

This is what puts you in the **map pack** for "landscaper near me" / "driveways
Watford". Follow **`docs/GBP-PLAYBOOK.md`** — service-area setup, categories,
photos, and the review engine. For a local trade, this out-performs almost
everything else. Do it first.

---

## 2 · Google Search Console — free, and this is your "who's searching for us" tool

Once verified (env var above), Search Console shows you the **actual search terms**
people typed to find you, your ranking position for each, clicks, and any indexing
problems. This is the closest thing to "tapping the algorithm" — it tells you what
Google already associates you with, so you can lean into it.

Set-up:
1. Add the property + verify (HTML tag method — the env var does this).
2. **Sitemaps** → submit `sitemap.xml` (already generated at
   `https://www.forgedlandscapes.co.uk/sitemap.xml`).
3. Wait a few days for data, then check **Performance** weekly:
   - See which queries you appear for → write a guide or town page targeting the strong ones.
   - Spot pages ranking on page 2 → small improvements push them to page 1.
4. Use **URL Inspection → Request indexing** to get new pages crawled fast.

---

## 3 · Google Analytics 4 — free, measures what converts

After adding `NEXT_PUBLIC_GA_ID`, watch:
- **Traffic acquisition** — where visitors come from (Organic Search, Direct, Google Business, referrals).
- **Key events** (`generate_lead`, `submit_brief`) — how many leads, and which sources drive them.
- **Pages and screens** — which service/town/guide pages pull the most traffic.

This turns "we get some enquiries" into "the driveways page + St Albans page drive
half our leads" — so you invest effort where it pays.

---

## 4 · Google Ads / Local Services Ads — 💷 paid, instant visibility

Organic (above) is free but takes weeks to build. Paid puts you at the top today:
- **Local Services Ads (the "Google Guaranteed" badge)** — the best paid option for
  a trade: you appear above regular results and pay per lead, not per click.
  **Requirement:** LSA vetting needs **public-liability insurance** and business/
  licence verification — so sort insurance first (see the trust items in `SETUP.md`).
- **Google Search Ads** — bid on "landscaper Watford", "resin driveway Hertfordshire",
  etc. Start with a small daily budget and a tight radius. The `generate_lead` event
  already in the site can be imported into Ads as a conversion, so you measure cost-per-lead.

Both need a budget and a Google Ads account with a payment method — a business
decision, not a code change. When you're ready, the site's conversion tracking is
already there to feed them.

---

## 5 · Google Workspace — 💷 optional, ~£5/user/mo

Upgrades `landscapesforged@gmail.com` to a professional `you@forgedlandscapes.co.uk`
mailbox with the Google tools you already know. Not required — the Gmail works fine —
but a domain email reads more credibly on quotes and invoices. Set it up at
workspace.google.com; it also lets you send client emails from your own domain via Resend.

---

## The honest priority order

1. **Google Business Profile + reviews** — free, biggest local impact. (GBP playbook.)
2. **Search Console** — free, tells you what you already rank for. (env var → submit sitemap.)
3. **Analytics** — free, tells you what converts. (env var → mark key events.)
4. **Insurance, then Local Services Ads** — 💷 paid, instant leads once you can be vetted.
5. **Workspace email** — 💷 optional polish.

Steps 1–3 are free and compound over weeks. The site is already built to feed all of them.
