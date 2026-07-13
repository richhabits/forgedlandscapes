import { cn } from "@/lib/utils";
import { Reveal } from "@/components/site/reveal";

/** Editorial section header: brass micro-label + serif display heading. */
export function SectionHead({
  label,
  title,
  intro,
  align = "left",
  dark = true,
  className,
}: {
  label: string;
  title: React.ReactNode;
  intro?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <p className="microlabel microlabel-brass flex items-center gap-3">
        {align === "left" && <span className="inline-block w-8 border-t border-brass-500" aria-hidden />}
        {label}
      </p>
      <h2
        className={cn(
          "font-display mt-4 text-3xl md:text-[2.6rem] leading-[1.12] font-medium",
          dark ? "text-bone-50" : "text-forge-950"
        )}
      >
        {title}
      </h2>
      {intro && (
        <p className={cn("mt-5 text-[15px] leading-relaxed", dark ? "text-stone-400" : "text-forge-700/80")}>
          {intro}
        </p>
      )}
    </Reveal>
  );
}
