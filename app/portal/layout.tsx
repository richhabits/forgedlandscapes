import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/site/wordmark";
import { site } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Client portal",
  description: "Complete your Forged Landscapes project brief — photos, dimensions, sketch and inspiration, in about five minutes.",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col">
      <header className="border-b rule bg-forge-950">
        <div className="mx-auto max-w-6xl px-5 md:px-10 h-18 py-3 flex items-center justify-between">
          <Wordmark size="sm" />
          <div className="flex items-center gap-5">
            <span className="microlabel hidden sm:inline">Client portal</span>
            <Link href="/" className="text-[12.5px] text-stone-400 hover:text-bone-100 transition-colors">
              ← Back to site
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t rule py-5">
        <p className="mx-auto max-w-6xl px-5 md:px-10 text-[11.5px] text-stone-600">
          Uploads are private to your account and the Forged team, and used only to
          assess your project — <Link href="/privacy" className="underline underline-offset-2">privacy policy</Link>.
          Need a hand? <a href={site.phoneHref} className="text-stone-400">{site.phone}</a>
        </p>
      </footer>
    </div>
  );
}
