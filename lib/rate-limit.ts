/**
 * Rate limiter with two backends behind one interface:
 *
 *  - Upstash Redis (free tier) when UPSTASH_REDIS_REST_URL + _TOKEN are set —
 *    shared across all serverless instances, a real limit.
 *  - In-memory sliding window otherwise — best-effort per-instance, the
 *    zero-config fallback so the app still runs (and rate-limits locally)
 *    with no secrets at all.
 *
 * hit() is async; on any Upstash error it fails OPEN to in-memory so lead
 * capture is never blocked by a Redis hiccup.
 */

export type RateResult = { allowed: boolean; retryAfterSeconds: number };
type Opts = { max: number; windowMs: number };

/* ——— in-memory sliding window ——— */

type Window = { stamps: number[] };
const buckets = new Map<string, Window>();

function hitMemory(key: string, { max, windowMs }: Opts): RateResult {
  const now = Date.now();
  const w = buckets.get(key) ?? { stamps: [] };
  w.stamps = w.stamps.filter((t) => now - t < windowMs);

  if (w.stamps.length >= max) {
    const oldest = w.stamps[0];
    buckets.set(key, w);
    return { allowed: false, retryAfterSeconds: Math.ceil((windowMs - (now - oldest)) / 1000) };
  }

  w.stamps.push(now);
  buckets.set(key, w);

  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.stamps.every((t) => now - t > windowMs)) buckets.delete(k);
    }
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/* ——— Upstash Redis (fixed window via INCR + PEXPIRE NX) ——— */

function upstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function hitUpstash(
  cfg: { url: string; token: string },
  key: string,
  { max, windowMs }: Opts
): Promise<RateResult> {
  const bucket = `rl:${key}`;
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", bucket],
      ["PEXPIRE", bucket, String(windowMs), "NX"],
    ]),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  const data = (await res.json()) as Array<{ result: number }>;
  const count = data?.[0]?.result ?? 0;
  if (count > max) {
    return { allowed: false, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/* ——— public interface (unchanged shape, now async) ——— */

export async function hit(key: string, opts: Opts): Promise<RateResult> {
  const cfg = upstashConfig();
  if (cfg) {
    try {
      return await hitUpstash(cfg, key, opts);
    } catch {
      // Redis unreachable — never block capture on it.
      return hitMemory(key, opts);
    }
  }
  return hitMemory(key, opts);
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : null) || req.headers.get("x-real-ip") || "unknown";
}
