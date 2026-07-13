import type { LeadRow } from "@/lib/admin-data";
import {
  LEAD_STATUS_ORDER,
  LEAD_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  PROJECT_TYPE_LABELS,
} from "@/lib/labels";

/**
 * Owner "Monday-morning" report — computed from the leads list (no extra query,
 * no charting library). Funnel + breakdowns + conversion.
 */
export type Bucket = { key: string; label: string; count: number };

export type Report = {
  total: number;
  thisWeek: number;
  byStatus: Bucket[];
  byService: Bucket[];
  bySource: Bucket[];
  area: { in: number; out: number };
  quotedToWon: { quoted: number; won: number; lost: number; rate: number | null };
};

const WEEK_MS = 7 * 24 * 3600_000;

function tally(rows: LeadRow[], pick: (l: LeadRow) => string, labels: Record<string, string>, order?: readonly string[]): Bucket[] {
  const m = new Map<string, number>();
  for (const l of rows) {
    const k = pick(l) || "other";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  const keys = order ? order.filter((k) => m.has(k)) : [...m.keys()];
  return keys
    .map((k) => ({ key: k, label: labels[k] ?? k.replace(/_/g, " "), count: m.get(k) ?? 0 }))
    .sort((a, b) => (order ? 0 : b.count - a.count));
}

export function computeReport(leads: LeadRow[], now: number = Date.now()): Report {
  const real = leads.filter((l) => !l.is_sample);
  const won = real.filter((l) => l.status === "won").length;
  const lost = real.filter((l) => l.status === "lost").length;
  const quoted = real.filter((l) =>
    ["quoted", "won", "lost"].includes(l.status)
  ).length;
  const decided = won + lost;

  return {
    total: real.length,
    thisWeek: real.filter((l) => now - new Date(l.created_at).getTime() < WEEK_MS).length,
    byStatus: tally(real, (l) => l.status, LEAD_STATUS_LABELS, LEAD_STATUS_ORDER),
    byService: tally(real, (l) => l.project_type, PROJECT_TYPE_LABELS),
    bySource: tally(real, (l) => l.source, LEAD_SOURCE_LABELS),
    area: {
      in: real.filter((l) => l.in_area === true).length,
      out: real.filter((l) => l.in_area === false).length,
    },
    quotedToWon: {
      quoted,
      won,
      lost,
      rate: decided > 0 ? Math.round((won / decided) * 100) : null,
    },
  };
}
