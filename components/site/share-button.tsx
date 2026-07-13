"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

/** Share via the native share sheet (mobile) or copy the link (desktop). */
export function ShareButton({ title, path }: { title: string; path: string }) {
  const [done, setDone] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    const nav = typeof navigator !== "undefined" ? (navigator as Navigator) : null;
    if (nav && "share" in nav) {
      try {
        await nav.share({ title, url });
        return;
      } catch {
        /* cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {
      /* noop */
    }
  }

  return (
    <button
      onClick={share}
      aria-label="Share"
      className="shrink-0 flex items-center gap-1.5 text-[11.5px] text-stone-400 hover:text-brass-300 transition-colors cursor-pointer uppercase tracking-wider"
    >
      {done ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />} {done ? "Copied" : "Share"}
    </button>
  );
}
