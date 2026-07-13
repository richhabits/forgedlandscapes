/**
 * Analytics helper. GA4 loads only when NEXT_PUBLIC_GA_ID is set AND the
 * visitor has opted into analytics (Google Consent Mode, see
 * components/site/google-analytics.tsx). trackEvent no-ops safely when gtag
 * isn't present — so it never throws in demo/no-key mode.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** Canonical conversion events — keep names stable so GA reporting is consistent. */
export const EVENTS = {
  generateLead: "generate_lead", // an enquiry was captured (form / assessor / widget)
  submitBrief: "submit_brief", // a full portal brief was submitted
} as const;

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const g = (window as GtagWindow).gtag;
  if (typeof g === "function") g("event", name, params ?? {});
}
