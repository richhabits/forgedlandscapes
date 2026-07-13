import { cn } from "@/lib/utils";
import { weekDelta, humanDuration } from "@/lib/labels";
import type { AdminMetrics } from "@/lib/admin-data";

/**
 * Dashboard strip — this week vs last, in the editorial style. No charting
 * library: just numbers that a busy owner reads at a glance between jobs.
 */
export function StatTiles({ m }: { m: AdminMetrics }) {
  const conv =
    m.assessor_leads_total > 0
      ? Math.round((m.assessor_converted_total / m.assessor_leads_total) * 100)
      : null;

  const leadTrend = weekDelta(m.leads_this_week, m.leads_last_week);
  const briefTrend = weekDelta(m.briefs_this_week, m.briefs_last_week);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-bone-100/10 border rule rounded-[2px] overflow-hidden">
      <Tile
        label="New leads"
        value={String(m.leads_this_week)}
        sub={leadTrend.text}
        dir={leadTrend.dir}
      />
      <Tile
        label="Briefs submitted"
        value={String(m.briefs_this_week)}
        sub={briefTrend.text}
        dir={briefTrend.dir}
      />
      <Tile
        label="Assessor → brief"
        value={conv == null ? "—" : `${conv}%`}
        sub={`${m.assessor_converted_total}/${m.assessor_leads_total} assessor leads`}
      />
      <Tile
        label="Out of area"
        value={String(m.out_of_area_this_week)}
        sub={`${m.out_of_area_total} all-time · expansion signal`}
        accent={m.out_of_area_this_week > 0}
      />
      <Tile
        label="Median 1st response"
        value={humanDuration(m.median_lead_to_action_seconds)}
        sub="lead → first action"
      />
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  dir,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  dir?: "up" | "down" | "flat";
  accent?: boolean;
}) {
  return (
    <div className="bg-forge-900 px-4 py-5">
      <p className="microlabel">{label}</p>
      <p
        className={cn(
          "font-display mt-2 text-3xl leading-none",
          accent ? "text-brass-300" : "text-bone-50"
        )}
      >
        {value}
      </p>
      {sub && (
        <p
          className={cn(
            "mt-2 text-[11px] leading-snug",
            dir === "up" ? "text-moss-400" : dir === "down" ? "text-danger" : "text-stone-500"
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
