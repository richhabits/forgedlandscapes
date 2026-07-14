"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { site, nav } from "@/lib/site-config";
import { Wordmark } from "@/components/site/wordmark";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile sheet on navigation — state adjusted during render (compiler-safe)
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* top hairline bar */}
      <div className="hidden md:flex items-center justify-between px-6 lg:px-10 h-9 text-[11px] tracking-[0.08em] text-stone-400 border-b rule bg-forge-950/90 backdrop-blur">
        <p>
          Watford, Hertfordshire — design &amp; build within a {site.radiusMiles}-mile radius
        </p>
        <div className="flex items-center gap-6">
          <span>{site.hours}</span>
          <a
            href={site.phoneHref}
            className="flex items-center gap-1.5 text-bone-100 hover:text-brass-300 transition-colors"
          >
            <Phone className="size-3" aria-hidden />
            {site.phone}
          </a>
        </div>
      </div>

      {/* main bar */}
      <div
        className={cn(
          "flex items-center justify-between px-5 md:px-6 lg:px-10 transition-all duration-300 border-b",
          scrolled
            ? "h-16 bg-forge-950/95 backdrop-blur rule"
            : "h-20 bg-gradient-to-b from-forge-950/85 to-forge-950/0 border-transparent"
        )}
      >
        <Wordmark size="md" />

        <nav className="hidden lg:flex items-center gap-x-5 xl:gap-x-7" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[12.5px] font-medium tracking-[0.04em] transition-colors",
                pathname === item.href
                  ? "text-brass-300"
                  : "text-bone-100/85 hover:text-bone-50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className={cn(buttonClass({ variant: "outline", size: "sm" }), "hidden md:inline-flex")}
          >
            Get a quote
          </Link>
          <Link href="/portal" className={cn(buttonClass({ size: "sm" }), "hidden sm:inline-flex")}>
            Client portal
          </Link>
          <button
            className="lg:hidden p-2 text-bone-100"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* mobile sheet */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 top-16 bg-forge-950/98 backdrop-blur transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <nav className="flex flex-col px-6 py-8 gap-1" aria-label="Mobile">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-display text-2xl py-3 border-b rule text-bone-100 hover:text-brass-300 transition-colors"
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-3 mt-8">
            <Link href="/contact" className={buttonClass({ variant: "outline", className: "flex-1" })}>
              Get a quote
            </Link>
            <Link href="/portal" className={buttonClass({ className: "flex-1" })}>
              Client portal
            </Link>
          </div>
          <a href={site.phoneHref} className="mt-8 flex items-center gap-2 text-stone-400">
            <Phone className="size-4" aria-hidden /> {site.phone}
          </a>
        </nav>
      </div>
    </header>
  );
}
