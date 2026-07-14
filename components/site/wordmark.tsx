import Link from "next/link";
import { cn } from "@/lib/utils";

/** Forged anvil mark — engraved, reads down to favicon size. */
function AnvilMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden focusable="false">
      {/* single forge spark */}
      <path d="M20 3 l1.4 3.6 3.6 1.4 -3.6 1.4 -1.4 3.6 -1.4 -3.6 -3.6 -1.4 3.6 -1.4 Z" fill="#b08a49" />
      <g fill="currentColor">
        <path d="M8 15 h24 v6 h-6 l-4 4 h-8 l-4 -4 h-2 Z" />
        <path d="M8 16 l-5 2.5 5 2.5 Z" />
        <path d="M17 25 h6 l-2 8 h-2 Z" />
        <path d="M12 33 h16 l3 5 h-22 Z" />
      </g>
    </svg>
  );
}

/** Typographic lockup — display "Forged" + tracked caps, led by the anvil mark. */
export function Wordmark({
  className,
  size = "md",
  asLink = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  asLink?: boolean;
}) {
  const scale = {
    sm: { main: "text-lg", sub: "text-[8px] tracking-[0.34em]", mark: "w-5 h-5", gap: "gap-2" },
    md: { main: "text-[22px]", sub: "text-[9px] tracking-[0.4em]", mark: "w-7 h-7", gap: "gap-2.5" },
    lg: { main: "text-3xl", sub: "text-[10px] tracking-[0.44em]", mark: "w-9 h-9", gap: "gap-3" },
  }[size];

  const inner = (
    <span className={cn("inline-flex items-center", scale.gap, className)}>
      <AnvilMark className={cn("shrink-0 text-bone-50", scale.mark)} />
      <span className="inline-flex flex-col leading-none">
        <span className={cn("font-display text-bone-50", scale.main)}>
          Forged<span className="display-italic text-brass-400">.</span>
        </span>
        <span className={cn("microlabel mt-1", scale.sub)}>Landscapes</span>
      </span>
    </span>
  );

  if (!asLink) return inner;
  return (
    <Link href="/" aria-label="Forged Landscapes — home" className="shrink-0">
      {inner}
    </Link>
  );
}
