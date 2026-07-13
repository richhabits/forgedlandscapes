import { site } from "@/lib/site-config";

/**
 * Affiliation banner — restrained monochrome wordmark placeholders.
 * ⚠️ These are typographic PLACEHOLDERS. Swap for licensed logo files in
 * /public/badges once each membership/accreditation is actually held —
 * displaying a body's real logo without membership is an ASA problem.
 */
const marks: Record<string, { top: string; bottom: string }> = {
  bali: { top: "BALI", bottom: "Registered Member" },
  apl: { top: "APL", bottom: "Professional Landscapers" },
  trustmark: { top: "TrustMark", bottom: "Government Endorsed" },
  marshalls: { top: "Marshalls", bottom: "Accredited Installer" },
};

export function BadgeBanner({ compact = false }: { compact?: boolean }) {
  if (site.badges.length === 0) return null;
  return (
    <div
      aria-label="Industry affiliations"
      className={
        compact
          ? "flex flex-wrap items-center gap-x-8 gap-y-4"
          : "grid grid-cols-2 md:grid-cols-4 gap-px bg-bone-100/10 border rule"
      }
    >
      {site.badges.map((b) => {
        const m = marks[b.key];
        return (
          <div
            key={b.key}
            title={b.label}
            className={
              compact
                ? "opacity-60 hover:opacity-100 transition-opacity"
                : "bg-forge-950 px-6 py-7 text-center opacity-80 hover:opacity-100 transition-opacity"
            }
          >
            <p className="font-display text-lg text-bone-200 leading-none">{m.top}</p>
            <p className="microlabel mt-1.5 !text-[9px]">{m.bottom}</p>
          </div>
        );
      })}
    </div>
  );
}
