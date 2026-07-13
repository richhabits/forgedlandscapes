"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/services";
import { img } from "@/lib/images";
import { cn } from "@/lib/utils";

/**
 * Editorial services index — numbered rows, side image swaps on hover.
 * The premium studio pattern; degrades to stacked cards with images on touch.
 */
export function ServiceIndex() {
  const [active, setActive] = useState(0);

  return (
    <div className="grid lg:grid-cols-12 gap-10 items-start">
      {/* rows */}
      <div className="lg:col-span-7 border-t rule">
        {services.map((s, i) => (
          <Link
            key={s.slug}
            href={`/${s.slug}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="group flex items-baseline gap-5 md:gap-8 py-6 md:py-7 border-b rule transition-colors hover:bg-bone-100/[0.025] px-2 -mx-2"
          >
            <span className="index-num text-lg md:text-xl w-8 shrink-0">{s.index}</span>
            <span className="flex-1 min-w-0">
              <span
                className={cn(
                  "font-display block text-2xl md:text-[2rem] leading-tight transition-colors",
                  active === i ? "text-brass-300" : "text-bone-50"
                )}
              >
                {s.title}
              </span>
              <span className="block mt-1.5 text-[13px] text-stone-500 leading-snug">
                {s.strap}
              </span>
              {/* mobile inline image */}
              <span className="lg:hidden relative block mt-4 aspect-[16/9] overflow-hidden">
                <Image
                  src={img[s.heroKey].src}
                  alt={img[s.heroKey].alt}
                  fill
                  sizes="(min-width:1024px) 0px, 100vw"
                  className="object-cover img-grade"
                />
              </span>
            </span>
            <ArrowUpRight
              className={cn(
                "size-5 shrink-0 transition-all duration-300",
                active === i
                  ? "text-brass-400 translate-x-0.5 -translate-y-0.5"
                  : "text-stone-600"
              )}
              aria-hidden
            />
          </Link>
        ))}
      </div>

      {/* sticky image panel (desktop) */}
      <div className="hidden lg:block lg:col-span-5 sticky top-32">
        <div className="relative aspect-[4/5] overflow-hidden border rule">
          {services.map((s, i) => (
            <Image
              key={s.slug}
              src={img[s.heroKey].src}
              alt={img[s.heroKey].alt}
              fill
              sizes="(min-width:1024px) 40vw, 0px"
              className={cn(
                "object-cover img-grade transition-opacity duration-500",
                active === i ? "opacity-100" : "opacity-0"
              )}
            />
          ))}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-forge-950/85 to-transparent p-5 pt-14">
            <p className="microlabel microlabel-brass">
              {services[active].index} — {services[active].title}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
