import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiAdmin } from "@/lib/admin-auth";
import { sendClientBriefReviewed } from "@/lib/email";
import { hit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const postSchema = z.object({
  projectId: z.string().max(64),
  action: z.enum(["review", "archive"]),
});

/** POST — mark a brief reviewed (and email the client) or archive it. */
export async function POST(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });

  const limited = await hit(`admin:${clientIp(req)}`, { max: 120, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const { projectId, action } = parsed.data;
  const { supabase } = admin;

  const nextStatus = action === "review" ? "reviewed" : "archived";
  const { data: proj, error } = await supabase
    .from("projects")
    .update({ status: nextStatus })
    .eq("id", projectId)
    .select("id,lead_id,user_id")
    .maybeSingle();
  if (error || !proj) {
    return NextResponse.json({ ok: false, error: error?.message }, { status: 500 });
  }

  let clientEmail: string | null = null;
  if (action === "review") {
    // Resolve the client's email from the linked lead, else the owning user's lead.
    if (proj.lead_id) {
      const { data: l } = await supabase.from("leads").select("email").eq("id", proj.lead_id).maybeSingle();
      clientEmail = l?.email ?? null;
    }
    if (!clientEmail && proj.user_id) {
      const { data: l } = await supabase
        .from("leads")
        .select("email")
        .eq("user_id", proj.user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      clientEmail = l?.email ?? null;
    }
    if (clientEmail) {
      // Fire-and-forget: the status change is the source of truth, not the email.
      sendClientBriefReviewed(clientEmail).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true, status: nextStatus, notified: Boolean(clientEmail) });
}
