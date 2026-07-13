import type { RadiusCheck } from "@/lib/geo";

/**
 * Browser-side radius check — same-origin first (robust against adblockers
 * and strict networks), direct postcodes.io as a fallback so the widget
 * still works if the app is ever statically exported.
 */
export async function checkServiceAreaClient(postcode: string): Promise<RadiusCheck> {
  try {
    const res = await fetch(`/api/geo?postcode=${encodeURIComponent(postcode)}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok || res.status === 429) {
      return (await res.json()) as RadiusCheck;
    }
  } catch {
    /* fall through to direct */
  }
  const { checkServiceArea } = await import("@/lib/geo");
  return checkServiceArea(postcode);
}
