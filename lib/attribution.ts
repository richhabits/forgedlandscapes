/**
 * Lead attribution — where did this enquiry come from? Captured client-side and
 * stored in leads.meta so the admin can see which town/service page and which
 * campaign drove each lead. No cookies; read from the URL + referrer at submit.
 */
export function collectAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string> = {};
  const p = new URLSearchParams(window.location.search);
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"]) {
    const v = p.get(k);
    if (v) out[k] = v.slice(0, 200);
  }
  if (window.location.pathname) out.landing = window.location.pathname.slice(0, 200);
  if (document.referrer) out.referrer = document.referrer.slice(0, 300);
  return out;
}
