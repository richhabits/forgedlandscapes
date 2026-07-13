import Link from "next/link";
import { cn } from "@/lib/utils";

/** Typographic lockup — Fraunces italic "Forged" + tracked caps. */
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
    sm: { main: "text-lg", sub: "text-[8px] tracking-[0.34em]" },
    md: { main: "text-[22px]", sub: "text-[9px] tracking-[0.4em]" },
    lg: { main: "text-3xl", sub: "text-[10px] tracking-[0.44em]" },
  }[size];

  const inner = (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className={cn("font-display text-bone-50", scale.main)}>
        Forged<span className="display-italic text-brass-400">.</span>
      </span>
      <span className={cn("microlabel mt-1", scale.sub)}>Landscapes</span>
    </span>
  );

  if (!asLink) return inner;
  return (
    <Link href="/" aria-label="Forged Landscapes — home" className="shrink-0">
      {inner}
    </Link>
  );
}
