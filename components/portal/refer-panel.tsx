"use client";

import { useState } from "react";
import { Gift, Copy, Check } from "lucide-react";

/**
 * Refer & earn — the "club" touch. The client shares a link that tags any new
 * enquiry with their email (referred_by), so the team can thank/reward them.
 * Rewards are handled by the team off-app (kept deliberately simple).
 */
export function ReferPanel({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/contact?ref=${encodeURIComponent(email)}`
      : `/contact?ref=${encodeURIComponent(email)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — link is still selectable below */
    }
  }

  return (
    <section className="mb-10 max-w-2xl">
      <div className="border border-brass-600/40 bg-brass-500/[0.06] rounded-[2px] p-6">
        <p className="microlabel microlabel-brass flex items-center gap-2">
          <Gift className="size-3.5" /> Refer &amp; earn
        </p>
        <h2 className="font-display text-2xl text-bone-50 mt-2">Know someone with a tired garden?</h2>
        <p className="text-[14px] text-stone-400 mt-2 leading-relaxed">
          Share your link. If a friend books through it, there's a thank-you in it for you both —
          just for spreading the word. You're part of the family now.
        </p>
        <div className="mt-4 flex gap-2">
          <input readOnly value={link} className="field flex-1 !text-[12.5px]" onFocus={(e) => e.currentTarget.select()} />
          <button
            onClick={copy}
            className="flex items-center gap-2 h-11 px-4 rounded-[2px] bg-brass-500 hover:bg-brass-400 text-forge-950 text-[11.5px] font-semibold uppercase tracking-[0.12em] transition-colors cursor-pointer shrink-0"
          >
            {copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy link</>}
          </button>
        </div>
      </div>
    </section>
  );
}
