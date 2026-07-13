"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Faq } from "@/lib/services";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-bone-100/10 border-y rule">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              className="w-full flex items-center justify-between gap-6 py-5 text-left group cursor-pointer"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="font-display text-lg text-bone-100 group-hover:text-brass-300 transition-colors">
                {f.q}
              </span>
              <Plus
                className={cn(
                  "size-4 shrink-0 text-brass-400 transition-transform duration-300",
                  isOpen && "rotate-45"
                )}
                aria-hidden
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <p className="overflow-hidden text-sm text-stone-400 leading-relaxed max-w-2xl">
                {f.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
