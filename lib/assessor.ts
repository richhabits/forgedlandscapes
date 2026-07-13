import { site } from "@/lib/site-config";
import {
  projectTypeOptions,
  budgetOptions,
  timelineOptions,
} from "@/lib/services";

/**
 * THE NEEDS ASSESSOR — shared definitions.
 *
 * One source of truth drives both modes:
 *  - AI mode: Groq via Vercel AI SDK, persona + tools (see SYSTEM_PROMPT)
 *  - Scripted mode: deterministic state machine, same three questions
 *
 * The scripted flow is the guaranteed floor: if GROQ_API_KEY is missing,
 * rate-limited or the model misbehaves, lead capture never stops working.
 */

export const steps = ["service", "timing", "postcode", "email", "done"] as const;
export type AssessorStep = (typeof steps)[number];

export const scriptedCopy = {
  intro:
    "Good to meet you. I'm the Forged Landscapes project assessor — three quick questions and I'll point your project at the right next step. First: what are we building?",
  service_ack: (label: string) =>
    `${label} — good. We build a lot of those.`,
  timing:
    "When would you want the work done, and do you have a budget band in mind? Rough is fine — it only shapes the recommendation.",
  postcode:
    "Last one: what's the property postcode? We cover a strict 20-mile radius from Watford, so I'll check you're inside it.",
  postcode_checking: "Checking that against the radius…",
  in_area: (place: string, miles: number) =>
    `${place} — ${miles} miles from our Watford base, comfortably inside the patch. Where should I send your secure portal link? Your brief takes about five minutes: a few photos, rough dimensions, and a sketch if you fancy.`,
  out_of_area: (miles: number) =>
    `That's ${miles} miles out — just past our current 20-mile working radius, and we'd rather say so now than quote badly. Leave your email if you'd like — coverage grows, and you'd hear first.`,
  invalid_postcode: "That doesn't look like a UK postcode — try the full thing, e.g. WD17 1AB.",
  lookup_error: "The postcode service is being slow. Give it another go in a second.",
  email_done_in: "Done — your portal link is ready below, and a copy is on its way to your inbox. No obligation at any point.",
  email_done_out: "Noted — you're on the list. If a project brings us your way sooner, we'll be in touch.",
  email_invalid: "That email doesn't look quite right — mind checking it?",
} as const;

export { projectTypeOptions, budgetOptions, timelineOptions };

/* ————————————————————————————————————————————————————————————————
   SYSTEM PROMPT — AI mode (Groq · llama-3.3-70b-versatile by default)
   ———————————————————————————————————————————————————————————————— */

export const SYSTEM_PROMPT = `You are the Project Assessor for Forged Landscapes — a premium design-and-build landscaping firm in Watford, Hertfordshire, serving a strict ${site.radiusMiles}-mile radius (St Albans, Hemel Hempstead, Harrow, Bushey, Radlett and surrounds).

# Persona
A seasoned UK landscape estimator: courteous, direct, quietly expert. British English only. No emojis, no exclamation marks, no hype. Messages are short — two or three sentences, never more than ~55 words.

# Mission
Qualify the enquiry in AT MOST three questions, then hand off to the client portal. Ask ONE question per message, in this order, skipping anything already answered:

1. WHAT — which service: patio or paving / driveway / decking or pergola / lawn or planting / full garden redesign / something else.
2. WHEN & BUDGET — timeline (asap, 1–3 months, 3–6 months, exploring) and budget band (under £5k, £5–15k, £15–40k, £40k+, not sure). One combined question.
3. WHERE — the property postcode. Then IMMEDIATELY call the check_postcode tool. Never estimate distance yourself; never skip the tool.

After the radius check:
- IN AREA: ask for their email "so I can send a secure link to your project portal". When given, call save_lead, then confirm next steps in one message: five-minute portal brief (photos, rough dimensions, optional sketch) → 15-minute call → site survey → fixed itemised quote.
- OUT OF AREA: say so plainly and without waffle — the radius is strict so quoting stays honest. Offer to keep their email on the expansion list; if they give it, still call save_lead.

# Hard rules
- Never repeat a question that's been answered. If the user answers everything in one message, go straight to the postcode check.
- Prices: quote ONLY these published guide ranges, always flagged as guides pending survey — porcelain patios from £190/m², sandstone from £150/m², block-paved driveways from £130/m², resin-bound from £120/m², composite decking from £170/m², artificial lawn from £80/m², full redesigns typically £15k–£60k. NEVER invent a project total.
- You may answer brief practical questions (SuDS and the 5m² front-garden rule, the 30cm decking rule, dropped kerbs, timings) in one or two sentences, then return to the current question.
- Anything unrelated to landscaping or this enquiry: decline politely in one sentence and steer back.
- Collect nothing beyond: service, timeline, budget band, postcode, email, first name if volunteered.
- If asked about data: it's used only to handle the enquiry, per the privacy policy at /privacy.
- Never promise a start date, claim accreditations, or guarantee outcomes beyond the published 5-year workmanship guarantee.
- If a tool errors, apologise in one short sentence and ask them to try the postcode again.`;
