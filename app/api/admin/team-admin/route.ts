import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiAdmin } from "@/lib/admin-auth";
import { hit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  email: z.email(),
  action: z.enum(["add", "remove"]),
});

/** Grant or revoke admin (back-office login) for a staff member's email.
 *  The person must have signed in at /admin at least once so their account exists. */
export async function POST(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const limited = await hit(`admin:${clientIp(req)}`, { max: 60, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const { email, action } = parsed.data;

  const fn = action === "add" ? "add_admin_by_email" : "remove_admin_by_email";
  const { data, error } = await admin.supabase.rpc(fn, { p_email: email });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  // false = no account with that email yet (they must sign in once first)
  return NextResponse.json({ ok: true, found: data === true });
}
