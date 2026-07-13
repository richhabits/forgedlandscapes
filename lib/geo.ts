/**
 * UK postcode → 20-mile Watford radius verification.
 * Free, keyless: postcodes.io (Open Government Licence data).
 *
 * Works with full postcodes ("WD17 1AB") and outward codes ("AL1"),
 * falling back to the outcode centroid when only a partial is given.
 * Safe on both server (chat tool, /api/leads) and client (radius widget) —
 * postcodes.io sends permissive CORS headers.
 */

import { site } from "@/lib/site-config";

const EARTH_RADIUS_MILES = 3958.7613;

export type RadiusCheck =
  | {
      status: "in" | "out";
      distanceMiles: number;
      place: string;
      postcode: string;
    }
  | { status: "invalid"; reason: string }
  | { status: "error"; reason: string };

/** Great-circle distance in miles between two lat/lng points. */
export function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(s)));
}

const FULL_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const OUTCODE = /^[A-Z]{1,2}\d[A-Z\d]?$/i;

export function normalisePostcode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

type LookupResult = { lat: number; lng: number; place: string } | null;

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!res.ok && res.status !== 404) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function lookupPostcode(pc: string): Promise<LookupResult | "not_found" | "error"> {
  const data = await fetchJson(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(pc)}`
  );
  if (!data) return "error";
  if (data.status === 200 && data.result) {
    const r = data.result as {
      latitude: number;
      longitude: number;
      admin_district?: string;
      parish?: string;
    };
    return {
      lat: r.latitude,
      lng: r.longitude,
      place: r.admin_district || r.parish || "your area",
    };
  }
  return "not_found";
}

async function lookupOutcode(oc: string): Promise<LookupResult | "not_found" | "error"> {
  const data = await fetchJson(
    `https://api.postcodes.io/outcodes/${encodeURIComponent(oc)}`
  );
  if (!data) return "error";
  if (data.status === 200 && data.result) {
    const r = data.result as {
      latitude: number;
      longitude: number;
      admin_district?: string[];
    };
    return {
      lat: r.latitude,
      lng: r.longitude,
      place: r.admin_district?.[0] || "your area",
    };
  }
  return "not_found";
}

/**
 * The service-area gate. Verifies a postcode sits within `site.radiusMiles`
 * (default 20) straight-line miles of the Watford base.
 */
export async function checkServiceArea(rawPostcode: string): Promise<RadiusCheck> {
  const pc = normalisePostcode(rawPostcode);

  if (!pc) return { status: "invalid", reason: "No postcode given." };
  if (!FULL_POSTCODE.test(pc) && !OUTCODE.test(pc)) {
    return {
      status: "invalid",
      reason: "That doesn't look like a UK postcode — try e.g. WD17 1AB or just AL1.",
    };
  }

  let hit: LookupResult | "not_found" | "error";
  if (FULL_POSTCODE.test(pc)) {
    hit = await lookupPostcode(pc);
    // Terminated/unknown full postcodes still resolve via their outcode
    if (hit === "not_found") hit = await lookupOutcode(pc.slice(0, -3));
  } else {
    hit = await lookupOutcode(pc);
  }

  if (hit === "error")
    return { status: "error", reason: "Postcode lookup is unavailable right now." };
  if (hit === "not_found" || !hit)
    return { status: "invalid", reason: "We couldn't find that postcode." };

  const distance = haversineMiles(site.base, { lat: hit.lat, lng: hit.lng });
  const distanceMiles = Math.round(distance * 10) / 10;

  return {
    status: distance <= site.radiusMiles ? "in" : "out",
    distanceMiles,
    place: hit.place,
    postcode: pc,
  };
}
