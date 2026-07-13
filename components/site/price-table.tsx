import type { PriceRow } from "@/lib/services";

export function PriceTable({ rows }: { rows: PriceRow[] }) {
  return (
    <div className="border rule">
      <div className="px-5 py-3.5 border-b rule flex items-baseline justify-between">
        <p className="microlabel microlabel-brass">Guide prices — 2026</p>
        <p className="text-[11px] text-stone-500">fixed quote after survey</p>
      </div>
      <dl className="divide-y divide-bone-100/8">
        {rows.map((r) => (
          <div key={r.item} className="px-5 py-4 flex items-baseline justify-between gap-6">
            <dt className="text-sm text-stone-400">
              {r.item}
              {r.note && <span className="block text-[11px] text-stone-600 mt-0.5">{r.note}</span>}
            </dt>
            <dd className="font-display text-lg text-bone-50 whitespace-nowrap">{r.guide}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
