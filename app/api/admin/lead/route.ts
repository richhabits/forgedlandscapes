import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiAdmin } from "@/lib/admin-auth";
import { getLeadDetail } from "@/lib/admin-data";
import { sendLeadReplyTemplate, type ReplyTemplate } from "@/lib/email";
import { hit, clientIp } from "@/lib/rate-limit";
import { supabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

const LEAD_STATUSES = [
  "new", "qualified", "portal_invited", "brief_submitted", "survey_booked",
  "quoted", "won", "lost", "out_of_area",
] as const;

const postSchema = z.object({
  leadId: z.string().max(64),
  status: z.enum(LEAD_STATUSES).optional(),
  note: z.string().max(2000).optional(),
  reply: z.enum(["book_call", "survey_slots", "out_of_area"]).optional(),
});

/** GET ?id=… — full lead detail for the drawer (admin only, RLS-backed).
 *  In demo mode (no Supabase) it serves demo fixtures, matching the pages. */
export async function GET(req: Request) {
  if (supabaseConfigured()) {
    const admin = await getApiAdmin();
    if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const lead = await getLeadDetail(id);
  if (!lead) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, lead });
}

/** POST — advance status, add a note, or send a templated reply. */
export async function POST(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });

  const limited = await hit(`admin:${clientIp(req)}`, { max: 120, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const { leadId, status, note, reply } = parsed.data;
  const { supabase, email: actor } = admin;

  // Status advance → update + audit event.
  if (status) {
    const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    await supabase.from("lead_events").insert({
      lead_id: leadId,
      kind: "status",
      note: `Status → ${status.replace(/_/g, " ")}`,
      actor,
    });
  }

  // Free-text note → audit event only.
  if (note) {
    const { error } = await supabase.from("lead_events").insert({
      lead_id: leadId, kind: "note", note, actor,
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Templated reply → send email (where key present) + audit event.
  if (reply) {
    const { data: lead } = await supabase
      .from("leads")
      .select("email,name")
      .eq("id", leadId)
      .maybeSingle();
    if (lead?.email) {
      const res = await sendLeadReplyTemplate(reply as ReplyTemplate, { email: lead.email, name: lead.name });
      await supabase.from("lead_events").insert({
        lead_id: leadId,
        kind: "reply",
        note: res.sent ? `Sent "${reply}" email` : `Reply "${reply}" queued (${res.skipped || res.error || "no email key"})`,
        actor,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
