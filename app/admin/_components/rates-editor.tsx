"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import type { Rate } from "@/lib/rates";
import { Button } from "@/components/ui/button";

export function RatesEditor({ rates, isDemo }: { rates: Rate[]; isDemo: boolean }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(rates.map((r) => [r.key, String(r.amount)]))
  );
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  async function save(r: Rate) {
    const amount = parseFloat(values[r.key]);
    if (!isFinite(amount) || amount < 0) return;
    if (isDemo) {
      setSavedKey(r.key);
      setTimeout(() => setSavedKey(null), 1500);
      return;
    }
    setSavingKey(r.key);
    const res = await fetch("/api/admin/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: r.key, amount }),
    });
    setSavingKey(null);
    if (res.ok) {
      setSavedKey(r.key);
      setTimeout(() => setSavedKey(null), 1500);
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-[14px] text-stone-400 leading-relaxed mb-6">
        These are the rates the estimator prices jobs against. Keep them current — every
        draft estimate uses the latest figures. Rough guides, not fixed prices.
      </p>
      <ul className="divide-y divide-bone-100/8 border-y rule">
        {rates.map((r) => {
          const dirty = values[r.key] !== String(r.amount);
          return (
            <li key={r.key} className="py-3.5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-bone-50">{r.label}</p>
                <p className="microlabel mt-0.5">{r.unit}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 text-[13px]">
                    {r.unit?.startsWith("£") ? "£" : ""}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    min="0"
                    className="field !w-28 !pl-6 text-right"
                    value={values[r.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [r.key]: e.target.value }))}
                  />
                </div>
                {savedKey === r.key ? (
                  <span className="text-moss-400 flex items-center gap-1 text-[12px] w-16"><Check className="size-3.5" /> Saved</span>
                ) : (
                  <Button size="sm" variant={dirty ? "primary" : "outline"} disabled={!dirty || savingKey === r.key} onClick={() => save(r)} className="w-16">
                    {savingKey === r.key ? "…" : "Save"}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
