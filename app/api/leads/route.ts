import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validation";
import { checkServiceArea } from "@/lib/geo";
import { getServerSupabase } from "@/lib/supabase";
import { sendAdminLeadAlert, sendClientLeadAck } from "@/lib/email";
import { hit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Public lead capture — scripted assessor, contact form, radius widget.
 * Defence in depth: honeypot → rate limit → zod → server-side radius
 * re-verification → RLS-guarded insert. Never 500s the user experience:
 * if storage is unconfigured (preview mode) the lead is acknowledged and
 * logged so the front-end flow can be tested end-to-end.
 */
export async function POST(req: Request) {
  const limited = await hit(`leads:${clientIp(req)}`, { max: 8, windowMs: 60 * 60_000 });
  if (!limited.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests — try again shortly." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    // Honeypot trips land here too — identical response, no tell.
    return NextResponse.json(
      { ok: false, error: "Please check the highlighted fields." },
      { status: 400 }
    );
  }

  const lead = parsed.data;

  // Authoritative radius check — never trust the client's verdict
  const radius = await checkServiceArea(lead.postcode);
  const in_area = radius.status === "in" ? true : radius.status === "out" ? false : null;
  const distance_miles = "distanceMiles" in radius ? radius.distanceMiles : null;
  const postcode =
    "postcode" in radius && radius.postcode ? radius.postcode : lead.postcode.toUpperCase();

  const record = {
    email: lead.email.toLowerCase().trim(),
    name: lead.name || null,
    phone: lead.phone || null,
    postcode,
    in_area,
    distance_miles,
    project_type: lead.project_type,
    budget_band: lead.budget_band,
    timeline: lead.timeline,
    message: lead.message || null,
    source: lead.source,
    status: in_area === false ? "out_of_area" : "new",
    transcript: lead.transcript ?? null,
    referred_by: lead.referred_by ? lead.referred_by.toLowerCase().trim() : null,
    meta: lead.attribution && Object.keys(lead.attribution).length ? lead.attribution : {},
  };

  let stored = false;
  const supabase = getServerSupabase();
  if (supabase) {
    let { error } = await supabase.from("leads").insert(record);
    if (error) {
      // referred_by column may not exist yet (migration 0005) — retry without it.
      const { referred_by: _rb, ...base } = record;
      void _rb;
      ({ error } = await supabase.from("leads").insert(base));
    }
    if (error) {
      console.error("[leads] insert failed:", error.message);
    } else {
      stored = true;
    }
  } else {
    console.log("[leads] preview mode — lead not persisted:", record.email);
  }

  // Notify staff (speed-to-lead) AND acknowledge the customer instantly.
  sendAdminLeadAlert(record).catch(() => {});
  sendClientLeadAck(record.email, { name: record.name, in_area }).catch(() => {});

  return NextResponse.json({
    ok: true,
    stored,
    in_area,
    portalUrl:
      in_area === false
        ? null
        : `/portal?email=${encodeURIComponent(record.email)}`,
  });
}
