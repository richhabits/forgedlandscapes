import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase, supabaseConfigured, supabaseUrl, supabaseAnonKey } from "@/lib/supabase";
import { sendAdminBriefAlert, sendClientBriefConfirmation } from "@/lib/email";
import { hit, clientIp } from "@/lib/rate-limit";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const bodySchema = z.object({
  projectId: z.string().max(64),
  email: z.email(),
  title: z.string().max(160),
  project_type: z.string().max(40),
  area_m2: z.number().nullable(),
  media_count: z.number().int().min(0).max(200),
  postcode: z.string().max(10).nullable(),
});

/**
 * Brief-submitted notifications. Requires a valid portal session token —
 * only signed-in clients can trigger admin email, and only about themselves.
 */
export async function POST(req: Request) {
  const limited = await hit(`notify:${clientIp(req)}`, { max: 10, windowMs: 60 * 60_000 });
  if (!limited.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  // verify the caller's session when auth is live
  if (supabaseConfigured()) {
    const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ ok: false }, { status: 401 });
    const authClient = createClient(supabaseUrl()!, supabaseAnonKey()!, {
      auth: { persistSession: false },
    });
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user || data.user.email?.toLowerCase() !== parsed.data.email.toLowerCase()) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    // touch the lead status if we can (service key path)
    const admin = getServerSupabase();
    if (admin) {
      await admin
        .from("leads")
        .update({ status: "brief_submitted" })
        .eq("email", parsed.data.email.toLowerCase())
        .in("status", ["new", "portal_invited"]);
    }
  }

  const b = parsed.data;
  const [adminRes, clientRes] = await Promise.all([
    sendAdminBriefAlert({
      email: b.email,
      title: b.title,
      project_type: b.project_type,
      area_m2: b.area_m2,
      media_count: b.media_count,
      postcode: b.postcode,
    }),
    sendClientBriefConfirmation(b.email),
  ]);

  return NextResponse.json({
    ok: true,
    adminEmail: adminRes,
    clientEmail: clientRes,
  });
}
