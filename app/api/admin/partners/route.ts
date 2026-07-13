import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiAdmin } from "@/lib/admin-auth";
import { hit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  id: z.string().max(64).optional(),
  name: z.string().max(120).optional(),
  company: z.string().max(160).optional().or(z.literal("")),
  kind: z.enum(["subcontractor", "supplier", "referrer", "other"]).optional(),
  trade: z.string().max(120).optional().or(z.literal("")),
  email: z.string().max(254).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  active: z.boolean().optional(),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

/** Create or update a partner (subcontractor / supplier / referrer). */
export async function POST(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const limited = await hit(`admin:${clientIp(req)}`, { max: 120, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const d = parsed.data;
  const { supabase } = admin;

  const fields = {
    name: d.name?.trim(),
    company: clean(d.company),
    kind: d.kind ?? "subcontractor",
    trade: clean(d.trade),
    email: clean(d.email),
    phone: clean(d.phone),
    active: d.active ?? true,
    notes: clean(d.notes),
  };

  if (d.id) {
    const { error } = await supabase.from("partners").update(fields).eq("id", d.id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (!fields.name) return NextResponse.json({ ok: false, error: "Name required" }, { status: 400 });
  const { error } = await supabase.from("partners").insert(fields);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await admin.supabase.from("partners").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
