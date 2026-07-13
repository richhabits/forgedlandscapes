"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import type { QuoteResult } from "@/lib/quoter";
import { Button } from "@/components/ui/button";

const gbp = (n: number) => "£" + n.toLocaleString("en-GB");

const DEMO: QuoteResult = {
  ok: true,
  area: 54,
  ratePerM2: 170,
  lineItems: [
    { label: "Decking & woodwork — 54 m² × £170/m² (supply & lay)", amount: 9180 },
    { label: "Travel — ~10 mi round trips", amount: 12 },
  ],
  low: 7813,
  high: 10571,
  spec: [
    "C24 treated subframe at 400mm centres on adjustable pedestals",
    "Capped composite boards, hidden clip fixings, stainless throughout",
    "Louvred aluminium pergola over the seating end",
    "Low-voltage LED lighting wired into the steps",
    "Lawn beyond re-levelled to falls",
  ],
  assumptions: [
    "Reasonable access, no major level changes or buried obstructions.",
    "Groundworks, sub-base, drainage and waste removal included in the rate.",
    "Mid-range material spec — final choice moves the figure.",
  ],
  aiUsed: false,
  disclaimer:
    "Rough ballpark from current rates — not a quote. Final pricing follows a site survey.",
};

export function QuoteDrafter({ projectId, isDemo }: { projectId: string; isDemo: boolean }) {
  const [estimate, setEstimate] = useState<QuoteResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function draft() {
    setBusy(true);
    setError(null);
    if (isDemo) {
      await new Promise((r) => setTimeout(r, 400));
      setEstimate(DEMO);
      setBusy(false);
      return;
    }
    const res = await fetch("/api/admin/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    const j = await res.json().catch(() => null);
    setBusy(false);
    if (j?.ok) setEstimate(j.estimate as QuoteResult);
    else setError("Couldn't draft an estimate — try again.");
  }

  if (!estimate) {
    return (
      <div>
        <Button size="sm" disabled={busy} onClick={draft}>
          <Sparkles className="size-3.5 mr-1.5" /> {busy ? "Drafting…" : "Draft a rough estimate"}
        </Button>
        <p className="mt-2 text-[11.5px] text-stone-600">
          Prices the brief against your current rates. Rough only — for your review, never sent automatically.
        </p>
        {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
      </div>
    );
  }

  if (!estimate.ok) {
    return (
      <div className="border border-brass-600/40 bg-brass-500/5 p-5">
        <p className="text-[13.5px] text-stone-300">{estimate.reason}</p>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => setEstimate(null)}>Back</Button>
      </div>
    );
  }

  return (
    <div className="border rule-strong bg-forge-900 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="microlabel microlabel-brass flex items-center gap-2">
            <Sparkles className="size-3.5" /> Rough estimate {estimate.aiUsed && <span className="text-stone-500 normal-case tracking-normal">· AI-drafted scope</span>}
          </p>
          <p className="font-display text-3xl text-bone-50 mt-2">
            {gbp(estimate.low!)} <span className="text-stone-500 text-2xl">–</span> {gbp(estimate.high!)}
          </p>
          <p className="text-[12px] text-stone-500 mt-1">
            {estimate.area} m² × £{estimate.ratePerM2}/m² · your current rates
          </p>
        </div>
        <button onClick={draft} disabled={busy} className="flex items-center gap-1.5 text-[12px] text-stone-400 hover:text-bone-100 transition-colors cursor-pointer">
          <RefreshCw className="size-3.5" /> Redraft
        </button>
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-6">
        <div>
          <p className="microlabel mb-2.5">Scope of works</p>
          <ul className="space-y-1.5">
            {estimate.spec.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] text-stone-300 leading-relaxed">
                <span className="mt-2 size-1 rounded-full bg-brass-400 shrink-0" aria-hidden />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="microlabel mb-2.5">How it's priced</p>
          <ul className="divide-y divide-bone-100/8 border-y rule">
            {estimate.lineItems.map((li, i) => (
              <li key={i} className="py-2 flex items-baseline justify-between gap-4 text-[13px]">
                <span className="text-stone-400">{li.label}</span>
                <span className="text-bone-100 font-medium shrink-0">{gbp(li.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="microlabel mt-4 mb-2">Assumptions</p>
          <ul className="space-y-1 text-[12px] text-stone-500 leading-relaxed">
            {estimate.assumptions.map((a, i) => <li key={i}>· {a}</li>)}
          </ul>
        </div>
      </div>

      <p className="mt-5 pt-4 border-t rule text-[12px] text-stone-500 leading-relaxed">{estimate.disclaimer}</p>
    </div>
  );
}
