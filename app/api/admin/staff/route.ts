import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiAdmin } from "@/lib/admin-auth";
import { hit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  id: z.string().max(64).optional(), // present → update; absent → create
  name: z.string().max(120).optional(),
  role: z.string().max(40).optional(),
  email: z.string().max(254).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  active: z.boolean().optional(),
  status: z.enum(["available", "en_route", "on_site", "off"]).optional(),
  status_note: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

/** Create/update a staff member, or just flip their live status (id + status). */
export async function POST(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const limited = await hit(`admin:${clientIp(req)}`, { max: 120, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const d = parsed.data;
  const { supabase } = admin;

  if (d.id) {
    // Partial update — only the fields provided.
    const patch: Record<string, unknown> = {};
    if (d.name !== undefined) patch.name = d.name;
    if (d.role !== undefined) patch.role = d.role;
    if (d.email !== undefined) patch.email = clean(d.email);
    if (d.phone !== undefined) patch.phone = clean(d.phone);
    if (d.active !== undefined) patch.active = d.active;
    if (d.notes !== undefined) patch.notes = clean(d.notes);
    if (d.status !== undefined) {
      patch.status = d.status;
      patch.status_at = new Date().toISOString();
    }
    if (d.status_note !== undefined) patch.status_note = clean(d.status_note);
    const { error } = await supabase.from("staff").update(patch).eq("id", d.id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (!d.name || !d.name.trim()) {
    return NextResponse.json({ ok: false, error: "Name required" }, { status: 400 });
  }
  const { error } = await supabase.from("staff").insert({
    name: d.name.trim(),
    role: d.role || "staff",
    email: clean(d.email),
    phone: clean(d.phone),
    active: d.active ?? true,
    status: d.status ?? "off",
    status_note: clean(d.status_note),
    notes: clean(d.notes),
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await admin.supabase.from("staff").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
