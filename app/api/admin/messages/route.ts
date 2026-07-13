import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiAdmin } from "@/lib/admin-auth";
import { hit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  kind: z.enum(["team", "project", "read"]),
  body: z.string().min(1).max(4000).optional(),
  lead_id: z.string().max(64).optional(), // team message: optional lead context
  project_id: z.string().max(64).optional(), // project message / read: required
});

/** Post a message (team feed / project reply) or mark a client thread read.
 *  Admin only; the client side posts via RLS directly. */
export async function POST(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const limited = await hit(`admin:${clientIp(req)}`, { max: 240, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const { kind, body, lead_id, project_id } = parsed.data;
  const { supabase, email } = admin;

  // Mark a client thread as read by the team.
  if (kind === "read") {
    if (!project_id) return NextResponse.json({ ok: false }, { status: 400 });
    await supabase
      .from("project_messages")
      .update({ read_by_team: true })
      .eq("project_id", project_id)
      .eq("sender_role", "client");
    return NextResponse.json({ ok: true });
  }

  if (!body) return NextResponse.json({ ok: false, error: "body required" }, { status: 400 });

  if (kind === "team") {
    const { error } = await supabase.from("team_messages").insert({
      author: email || "team",
      body,
      lead_id: lead_id || null,
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // project reply from the team
  if (!project_id) return NextResponse.json({ ok: false, error: "project_id required" }, { status: 400 });
  const { error } = await supabase.from("project_messages").insert({
    project_id,
    sender_role: "team",
    author_name: "Forged Landscapes",
    body,
    read_by_team: true,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
