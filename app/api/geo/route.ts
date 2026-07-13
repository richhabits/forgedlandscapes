import { NextResponse } from "next/server";
import { checkServiceArea } from "@/lib/geo";
import { hit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Same-origin radius check. The browser never talks to postcodes.io
 * directly — adblockers, corporate proxies and CSP can't break the funnel,
 * and results are edge-cacheable per postcode.
 */
export async function GET(req: Request) {
  const limited = await hit(`geo:${clientIp(req)}`, { max: 60, windowMs: 10 * 60_000 });
  if (!limited.allowed) {
    return NextResponse.json(
      { status: "error", reason: "Too many checks — one moment." },
      { status: 429 }
    );
  }

  const postcode = new URL(req.url).searchParams.get("postcode") || "";
  const result = await checkServiceArea(postcode);

  return NextResponse.json(result, {
    headers:
      result.status === "in" || result.status === "out"
        ? { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" }
        : { "Cache-Control": "no-store" },
  });
}
