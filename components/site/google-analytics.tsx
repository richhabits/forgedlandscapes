"use client";

import Script from "next/script";
import { useEffect } from "react";
import { GA_ID } from "@/lib/analytics";
import { getAnalyticsConsent } from "@/components/site/cookie-consent";

/**
 * GA4 with Google Consent Mode v2 — honest by default.
 *
 * Consent starts DENIED, so no analytics cookies are set until the visitor
 * clicks "Allow analytics" in the cookie banner. The banner dispatches an
 * "fl-consent-change" event; we flip consent to granted live, no reload.
 * Renders nothing when NEXT_PUBLIC_GA_ID is unset (demo / not-configured).
 */
export function GoogleAnalytics() {
  useEffect(() => {
    const apply = (granted: boolean) => {
      const g = (window as Window & { gtag?: (...a: unknown[]) => void }).gtag;
      if (typeof g === "function") {
        g("consent", "update", { analytics_storage: granted ? "granted" : "denied" });
      }
    };
    // Reflect any stored choice on load…
    apply(getAnalyticsConsent());
    // …and react when the banner records a new one.
    const onChange = (e: Event) => apply((e as CustomEvent<boolean>).detail === true);
    window.addEventListener("fl-consent-change", onChange);
    return () => window.removeEventListener("fl-consent-change", onChange);
  }, []);

  if (!GA_ID) return null;

  return (
    <>
      <Script id="ga-bootstrap" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent','default',{
            'analytics_storage':'denied','ad_storage':'denied',
            'ad_user_data':'denied','ad_personalization':'denied','wait_for_update':500
          });
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
      <Script
        id="ga-lib"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
