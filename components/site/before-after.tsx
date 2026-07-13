"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import type { SiteImage } from "@/lib/images";

/**
 * Hand-rolled before/after comparison — pointer + keyboard accessible,
 * no dependency. Top layer clipped with clip-path driven by a divider.
 */
export function BeforeAfter({
  before,
  after,
  caption,
}: {
  before: SiteImage;
  after: SiteImage;
  caption?: string;
}) {
  const [pos, setPos] = useState(56);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pct = ((clientX - r.left) / r.width) * 100;
    setPos(Math.min(97, Math.max(3, pct)));
  }, []);

  return (
    <figure>
      <div
        ref={ref}
        className="relative aspect-[16/10] overflow-hidden select-none border rule touch-none cursor-ew-resize"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* after (base) */}
        <Image src={after.src} alt={after.alt} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover img-grade" />
        {/* before (clipped) */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src={before.src} alt={before.alt} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover img-grade" />
        </div>

        {/* labels */}
        <span className="absolute top-3 left-3 z-10 bg-forge-950/80 backdrop-blur px-2.5 py-1 microlabel">Before</span>
        <span className="absolute top-3 right-3 z-10 bg-forge-950/80 backdrop-blur px-2.5 py-1 microlabel microlabel-brass">After</span>

        {/* divider + handle (the accessible slider) */}
        <div className="absolute inset-y-0 z-10" style={{ left: `${pos}%` }} aria-hidden>
          <div className="absolute inset-y-0 -translate-x-1/2 w-[2px] bg-bone-50/90" />
        </div>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Compare before and after"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPos((p) => Math.max(3, p - 4));
            if (e.key === "ArrowRight") setPos((p) => Math.min(97, p + 4));
          }}
          className="absolute top-1/2 z-20 -translate-y-1/2 -translate-x-1/2 size-11 rounded-full border border-bone-50/90 bg-forge-950/70 backdrop-blur flex items-center justify-center focus-visible:outline-2"
          style={{ left: `${pos}%` }}
        >
          <span className="text-bone-50 text-[13px] tracking-tighter" aria-hidden>◂▸</span>
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3 text-[12px] text-stone-500">{caption}</figcaption>
      )}
    </figure>
  );
}
