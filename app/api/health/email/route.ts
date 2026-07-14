import { NextResponse } from "next/server";
import { sendAdminLeadAlert } from "@/lib/email";
import { hit, clientIp } from "@/lib/rate-limit";
import { site } from "@/lib/site-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Email configuration health check — used to diagnose deliverability without
 * spamming the leads table. Reveals only booleans and the (non-secret) from/to
 * addresses; never the key itself. `?send=1` fires ONE diagnostic email to the
 * admin's own inbox (rate-limited) and returns the real Resend result, so a
 * silent "skipped: key not set" or a Resend error becomes visible.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const doSend = url.searchParams.get("send") === "1";

  const config = {
    resendKeyPresent: Boolean(process.env.RESEND_API_KEY),
    emailFromCustom: Boolean(process.env.EMAIL_FROM),
    emailFrom: process.env.EMAIL_FROM || "Forged Landscapes <onboarding@resend.dev>",
    adminEmail: site.adminEmail,
    adminEmailFromEnv: Boolean(process.env.ADMIN_EMAIL),
  };

  if (!doSend) {
    return NextResponse.json({ ok: true, config });
  }

  // Sending path is rate-limited and only ever mails the admin's own inbox.
  const limited = await hit(`health-email:${clientIp(req)}`, { max: 4, windowMs: 60 * 60_000 });
  if (!limited.allowed) {
    return NextResponse.json({ ok: false, error: "rate limited — try later" }, { status: 429 });
  }

  const result = await sendAdminLeadAlert({
    email: site.adminEmail,
    name: "HEALTH CHECK — email deliverability probe",
    phone: null,
    postcode: "WD17",
    project_type: "other",
    budget_band: "unsure",
    timeline: "exploring",
    in_area: true,
    distance_miles: 0,
    source: "health_check",
    message: "Automated email health probe — safe to ignore. Confirms Resend is wired.",
  });

  return NextResponse.json({ ok: result.sent, config, result });
}
