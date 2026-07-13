import { rateMap, type Rate } from "@/lib/rates";
import { PROJECT_TYPE_LABELS } from "@/lib/labels";

/**
 * AI quoter. Produces a ROUGH ballpark from the rate sheet — never a binding
 * quote. Core maths is deterministic (works with zero AI keys); when a Groq
 * key is present it adds a tailored scope narrative grounded in the same
 * numbers. Fails safe to the deterministic spec if the AI call errors.
 */

export type QuoteInput = {
  project_type: string;
  area_m2: number | null;
  length_m?: number | null;
  width_m?: number | null;
  distance_miles?: number | null;
  description?: string | null;
  title?: string | null;
};

export type QuoteResult = {
  ok: boolean;
  reason?: string;
  area: number | null;
  ratePerM2: number | null;
  lineItems: { label: string; amount: number }[];
  low: number | null;
  high: number | null;
  spec: string[];
  assumptions: string[];
  aiUsed: boolean;
  disclaimer: string;
};

const DISCLAIMER =
  "Rough ballpark from current rates — not a quote. Final pricing follows a site survey (levels, access, drainage and ground conditions all move the figure).";

const round = (n: number) => Math.round(n);

export async function draftEstimate(input: QuoteInput, rates: Rate[]): Promise<QuoteResult> {
  const m = rateMap(rates);
  const ratePerM2 = m[input.project_type] ?? m["other"] ?? null;
  const area =
    input.area_m2 ??
    (input.length_m && input.width_m ? Math.round(input.length_m * input.width_m * 10) / 10 : null);
  const contingency = m["contingency"] ?? 15;
  const travelPerMile = m["travel_per_mile"] ?? 0;

  if (!area || !ratePerM2) {
    return {
      ok: false,
      reason: !area ? "Add rough dimensions to the brief to draft an estimate." : "No rate set for this project type.",
      area,
      ratePerM2,
      lineItems: [],
      low: null,
      high: null,
      spec: [],
      assumptions: [],
      aiUsed: false,
      disclaimer: DISCLAIMER,
    };
  }

  const build = round(area * ratePerM2);
  const travel = input.distance_miles ? round(input.distance_miles * 2 * travelPerMile) : 0;
  const subtotal = build + travel;
  const low = round(subtotal * (1 - contingency / 100));
  const high = round(subtotal * (1 + contingency / 100));

  const lineItems: { label: string; amount: number }[] = [
    {
      label: `${PROJECT_TYPE_LABELS[input.project_type] ?? "Works"} — ${area} m² × £${ratePerM2}/m² (supply & lay)`,
      amount: build,
    },
  ];
  if (travel) lineItems.push({ label: `Travel — ~${input.distance_miles} mi round trips`, amount: travel });

  const assumptions = [
    "Reasonable access, no major level changes or buried obstructions.",
    "Groundworks, sub-base, drainage and waste removal included in the rate.",
    "Mid-range material spec — final choice moves the figure.",
  ];

  // Optional AI scope narrative, grounded in the same brief.
  let spec = defaultSpec(input.project_type);
  let aiUsed = false;
  try {
    const ai = await aiScope(input, area);
    if (ai && ai.length) {
      spec = ai;
      aiUsed = true;
    }
  } catch {
    /* keep deterministic spec */
  }

  return { ok: true, area, ratePerM2, lineItems, low, high, spec, assumptions, aiUsed, disclaimer: DISCLAIMER };
}

function defaultSpec(type: string): string[] {
  const specs: Record<string, string[]> = {
    patio_paving: [
      "Excavate to depth and remove spoil",
      "100–150mm compacted MOT Type 1 sub-base",
      "Full wet mortar bed, slabs primed and laid to falls",
      "Cutting, jointing and pointing",
      "Site cleared on completion",
    ],
    driveway: [
      "Excavate to load-bearing depth, remove spoil",
      "150–250mm compacted sub-base with concrete-haunched edge restraints",
      "Permeable / SuDS-compliant surface laid to falls",
      "Drainage to soakaway or channel where needed",
      "Dropped kerb (if required) handled as a separate application",
    ],
    decking_woodwork: [
      "C24 treated subframe at 400mm centres on pads/pedestals",
      "Capped composite or hardwood boards, hidden fixings, stainless throughout",
      "Ventilation and falls designed in",
      "Optional pergola and integrated low-voltage lighting",
    ],
    lawn_softscape: [
      "Ground preparation and levelling",
      "Screeded topsoil (real turf) or Type 1 + shock pad (artificial)",
      "Turf laid / artificial fixed with edge restraint",
      "Bed preparation and planting as specified",
    ],
    full_redesign: [
      "Measured survey and scaled concept plan",
      "Levels, drainage and retaining resolved first",
      "Hard landscaping: terraces, paths, steps, walls",
      "Soft landscaping: lawn, beds, planting, lighting",
    ],
    other: [
      "Scope confirmed at survey",
      "Groundworks and base built to spec",
      "Materials supplied and installed",
      "Site cleared on completion",
    ],
  };
  return specs[type] ?? specs.other;
}

async function aiScope(input: QuoteInput, area: number): Promise<string[] | null> {
  if (!process.env.GROQ_API_KEY) return null;
  const { generateText } = await import("ai");
  const { groq } = await import("@ai-sdk/groq");
  const prompt = `You are a UK landscaping estimator writing an internal scope of works (British English).
Project type: ${PROJECT_TYPE_LABELS[input.project_type] ?? input.project_type}
Approx working area: ${area} m²
Client's own words: "${(input.description ?? "").slice(0, 800)}"

Write a concise scope of works as 4–6 short bullet points covering groundworks, build method and finish. No prices, no marketing fluff, no preamble. Output one bullet per line, each starting with "- ".`;
  const { text } = await generateText({
    model: groq(process.env.GROQ_MODEL || "llama-3.3-70b-versatile"),
    prompt,
    maxOutputTokens: 320,
    temperature: 0.4,
  });
  const bullets = text
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter((l) => l.length > 3)
    .slice(0, 6);
  return bullets.length ? bullets : null;
}
