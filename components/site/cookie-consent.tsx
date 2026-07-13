"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * GDPR/PECR-honest consent banner.
 * This site sets only strictly-necessary cookies (portal session), which
 * need no consent — so the banner informs, and records a preference for
 * any future analytics (default OFF). No dark patterns.
 */

const KEY = "fl-consent-v1";

export function getAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}").analytics === true;
  } catch {
    return false;
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      /* private mode */
    }
  }, []);

  function save(analytics: boolean) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ analytics, at: Date.now() }));
    } catch {
      /* noop */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-sm z-[70] border rule-strong bg-forge-900/98 backdrop-blur p-5 shadow-2xl shadow-black/50"
    >
      <p className="microlabel microlabel-brass">Cookies</p>
      <p className="text-[13px] text-stone-400 mt-2 leading-relaxed">
        We set only the cookies this site needs to run — a session cookie if
        you sign in to the client portal. No tracking unless you opt in to
        anonymous analytics. Details in the{" "}
        <Link href="/privacy" className="text-brass-300 underline underline-offset-2">
          privacy policy
        </Link>
        .
      </p>
      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={() => save(false)}>
          Essential only
        </Button>
        <Button size="sm" variant="outline" onClick={() => save(true)}>
          Allow analytics
        </Button>
      </div>
    </div>
  );
}
