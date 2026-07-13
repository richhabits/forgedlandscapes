import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiAdmin } from "@/lib/admin-auth";
import { hit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  key: z.string().min(1).max(60),
  amount: z.number().min(0).max(100000),
  label: z.string().max(120).optional(),
  unit: z.string().max(20).optional(),
  category: z.enum(["rate_per_m2", "labour", "travel", "markup", "other"]).optional(),
});

/** Upsert a rate (edit an amount, or add a new line). Admin only. */
export async function POST(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const limited = await hit(`admin:${clientIp(req)}`, { max: 120, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const d = parsed.data;

  const row: Record<string, unknown> = { key: d.key, amount: d.amount };
  if (d.label !== undefined) row.label = d.label;
  if (d.unit !== undefined) row.unit = d.unit;
  if (d.category !== undefined) row.category = d.category;

  // Update if it exists; insert if it's a brand-new line.
  const existing = await admin.supabase.from("rates").select("id").eq("key", d.key).maybeSingle();
  if (existing.data) {
    const { error } = await admin.supabase.from("rates").update({ amount: d.amount, ...(d.label ? { label: d.label } : {}), ...(d.unit ? { unit: d.unit } : {}) }).eq("key", d.key);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } else {
    if (!d.label) return NextResponse.json({ ok: false, error: "New rate needs a label" }, { status: 400 });
    const { error } = await admin.supabase.from("rates").insert({
      key: d.key, label: d.label, amount: d.amount, unit: d.unit ?? null, category: d.category ?? "other",
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
