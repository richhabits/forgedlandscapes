"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Fires a single GA4 conversion event on mount — for server-rendered success
 * pages (e.g. the brief thank-you page) that can't call gtag directly.
 * No-ops without consent/gtag.
 */
export function TrackConversion({
  event,
  params,
}: {
  event: string;
  params?: Record<string, unknown>;
}) {
  useEffect(() => {
    trackEvent(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}
