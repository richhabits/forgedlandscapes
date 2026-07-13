import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiAdmin } from "@/lib/admin-auth";
import { hit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({ action: z.enum(["seed", "clear"]) });

const SAMPLE_STAFF = [
  { name: "Sample — Rob (owner)", role: "owner", phone: "07700 900001", status: "available", is_sample: true },
  { name: "Sample — Danny (crew)", role: "crew", phone: "07700 900002", status: "en_route", status_note: "Heading to WD17 patio", is_sample: true },
  { name: "Sample — Aisha (office)", role: "office", phone: "07700 900004", status: "available", is_sample: true },
];
const SAMPLE_PARTNERS = [
  { name: "Sample — Beck Groundworks", company: "Beck Groundworks Ltd", kind: "subcontractor", trade: "Groundworks & drainage", phone: "07700 900101", is_sample: true },
  { name: "Sample — Herts Stone Co.", company: "Herts Stone", kind: "supplier", trade: "Porcelain & natural stone", phone: "01923 900200", is_sample: true },
];
const SAMPLE_LEADS = [
  { email: "sample.harriet@example.com", name: "Sample — Harriet Doyle", postcode: "WD17 3AB", in_area: true, distance_miles: 1.2, project_type: "full_redesign", budget_band: "15k_40k", timeline: "1_3_months", message: "Sample lead for practice — safe to delete.", source: "assessor_ai", status: "new", is_sample: true },
  { email: "sample.raj@example.com", name: "Sample — Raj Patel", postcode: "HP2 4NW", in_area: true, distance_miles: 8.6, project_type: "driveway", budget_band: "5k_15k", timeline: "asap", message: "Sample lead for practice — safe to delete.", source: "form", status: "new", is_sample: true },
];

/** Load or clear clearly-labelled practice data. Only ever touches is_sample rows. */
export async function POST(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const limited = await hit(`admin:${clientIp(req)}`, { max: 20, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const { supabase } = admin;

  // Always clear existing samples first (idempotent seed, and the clear action).
  await supabase.from("leads").delete().eq("is_sample", true);
  await supabase.from("staff").delete().eq("is_sample", true);
  await supabase.from("partners").delete().eq("is_sample", true);

  if (parsed.data.action === "clear") {
    return NextResponse.json({ ok: true, cleared: true });
  }

  const errors: string[] = [];
  const s = await supabase.from("staff").insert(SAMPLE_STAFF);
  if (s.error) errors.push(`staff: ${s.error.message}`);
  const p = await supabase.from("partners").insert(SAMPLE_PARTNERS);
  if (p.error) errors.push(`partners: ${p.error.message}`);
  const l = await supabase.from("leads").insert(SAMPLE_LEADS);
  if (l.error) errors.push(`leads: ${l.error.message}`);
  if (errors.length) return NextResponse.json({ ok: false, error: errors.join("; ") }, { status: 500 });
  return NextResponse.json({ ok: true, seeded: true });
}
