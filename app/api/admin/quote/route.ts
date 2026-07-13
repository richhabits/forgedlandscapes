import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiAdmin } from "@/lib/admin-auth";
import { getProjectDetail } from "@/lib/admin-data";
import { loadRates } from "@/lib/rates";
import { draftEstimate } from "@/lib/quoter";
import { hit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({ projectId: z.string().max(64) });

/** Draft a rough estimate for a project's brief against the current rate sheet. */
export async function POST(req: Request) {
  const admin = await getApiAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 403 });
  const limited = await hit(`admin:${clientIp(req)}`, { max: 60, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const project = await getProjectDetail(parsed.data.projectId);
  if (!project) return NextResponse.json({ ok: false }, { status: 404 });

  const rates = await loadRates();
  const result = await draftEstimate(
    {
      project_type: project.project_type,
      area_m2: project.area_m2,
      length_m: project.length_m,
      width_m: project.width_m,
      description: project.description,
      title: project.title,
    },
    rates
  );

  return NextResponse.json({ ok: true, estimate: result });
}
