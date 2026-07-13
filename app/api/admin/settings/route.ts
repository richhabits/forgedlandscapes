import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiAdmin } from "@/lib/admin-auth";
import { hit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  key: z.string().min(1).max(80).regex(/^[A-Za-z0-9_.-]+$/, "Letters, numbers, _ . - only"),
  value: z.string().max(4000).optional().or(z.literal("")),
  label: z.string().max(160).optional(),
  is_secret: z.boolean().optional(),
});

/** Upsert an admin setting / integration key. Admin only, admin-RLS storage. */
export async function POST(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const limited = await hit(`admin:${clientIp(req)}`, { max: 120, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  const d = parsed.data;

  const row: Record<string, unknown> = { key: d.key, value: d.value || null };
  if (d.label !== undefined) row.label = d.label;
  if (d.is_secret !== undefined) row.is_secret = d.is_secret;

  const { error } = await admin.supabase.from("app_settings").upsert(row, { onConflict: "key" });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const key = new URL(req.url).searchParams.get("key");
  if (!key) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await admin.supabase.from("app_settings").delete().eq("key", key);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
