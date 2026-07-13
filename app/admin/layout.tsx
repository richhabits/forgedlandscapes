import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin — Forged Landscapes", template: "%s — Forged Admin" },
  robots: { index: false, follow: false, nocache: true },
};

// Root /admin layout: enforces noindex on the whole back office. Access
// gating lives in the (console) group so the /admin/login route stays
// reachable without a redirect loop.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh">{children}</div>;
}
