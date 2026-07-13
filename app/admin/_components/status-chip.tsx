import { cn } from "@/lib/utils";
import { LEAD_STATUS_LABELS, leadStatusTone } from "@/lib/labels";

const TONE: Record<string, string> = {
  action: "border-brass-600/50 bg-brass-500/12 text-brass-300",
  progress: "border-bone-100/15 bg-bone-100/[0.05] text-bone-100/80",
  won: "border-moss-600/60 bg-moss-600/15 text-moss-400",
  closed: "border-bone-100/10 bg-forge-800 text-stone-500",
};

export function StatusChip({ status, className }: { status: string; className?: string }) {
  const tone = leadStatusTone(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[2px] border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap",
        TONE[tone],
        className
      )}
    >
      {LEAD_STATUS_LABELS[status] ?? status}
    </span>
  );
}
