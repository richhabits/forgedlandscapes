import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CookieConsent } from "@/components/site/cookie-consent";
import { AssessorMount } from "@/components/assessor/assessor-mount";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* WCAG 2.4.1 — keyboard users bypass the nav straight to content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-brass-500 focus:text-forge-950 focus:px-4 focus:py-2 focus:rounded-[2px] focus:text-[13px] focus:font-semibold focus:tracking-wide"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <AssessorMount />
      <CookieConsent />
    </>
  );
}
