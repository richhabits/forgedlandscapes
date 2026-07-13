import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiAdmin } from "@/lib/admin-auth";
import { hit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  id: z.string().max(64).optional(),
  title: z.string().min(1).max(160),
  location: z.string().max(120).optional().or(z.literal("")),
  before_url: z.string().max(1024).optional().or(z.literal("")),
  after_url: z.string().max(1024).optional().or(z.literal("")),
  caption: z.string().max(600).optional().or(z.literal("")),
  published: z.boolean().optional(),
  sort: z.number().int().optional(),
});

const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

export async function POST(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const limited = await hit(`admin:${clientIp(req)}`, { max: 120, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const d = parsed.data;

  const row = {
    title: d.title.trim(),
    location: clean(d.location),
    before_url: clean(d.before_url),
    after_url: clean(d.after_url),
    caption: clean(d.caption),
    published: d.published ?? false,
    sort: d.sort ?? 0,
  };

  if (d.id) {
    const { error } = await admin.supabase.from("showcase").update(row).eq("id", d.id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } else {
    const { error } = await admin.supabase.from("showcase").insert(row);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await admin.supabase.from("showcase").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
