import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site-config";
import { Reveal } from "@/components/site/reveal";
import { buttonClass } from "@/components/ui/button";
import { TrackConversion } from "@/components/site/track-conversion";
import { EVENTS } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Brief received",
  robots: { index: false },
};

const steps = [
  {
    t: "We review — within 1 working day",
    d: "A real person reads the brief, studies your photos and sketch, and flags anything that changes the approach (levels, drainage, access).",
  },
  {
    t: "A 15-minute call",
    d: "We talk through direction and budget honestly, and book the survey if we're a fit. No hard sell — the radius keeps us busy enough to be straight with you.",
  },
  {
    t: "Site survey",
    d: "Measured properly, ground assessed, material samples in your hands in your own garden light.",
  },
  {
    t: "Design & itemised quote",
    d: "A scaled plan where the project calls for it, and a fixed written quote — every line priced, valid 30 days, staged payments.",
  },
];

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-10 py-16 md:py-24">
      <TrackConversion event={EVENTS.submitBrief} params={{ source: "portal" }} />
      <Reveal>
        <p className="microlabel microlabel-brass flex items-center gap-3">
          <span className="inline-block w-8 border-t border-brass-500" aria-hidden />
          Brief received
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-bone-50 mt-5 leading-[1.08]">
          Good brief. Here's exactly
          <br />
          what happens <em className="display-italic text-brass-300">next</em>.
        </h1>
      </Reveal>

      <ol className="mt-12">
        {steps.map((s, i) => (
          <Reveal key={s.t} delay={i * 90} className="flex gap-6 py-6 border-b rule">
            <span className="index-num text-xl w-9 shrink-0">0{i + 1}</span>
            <div>
              <h2 className="font-display text-xl text-bone-50">{s.t}</h2>
              <p className="text-[14px] text-stone-400 leading-relaxed mt-1.5">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal delay={380} className="mt-10 flex flex-wrap items-center gap-4">
        <Link href="/" className={buttonClass({ variant: "outline", size: "lg" })}>
          Back to the site
        </Link>
        <p className="text-[13px] text-stone-500">
          Something to add? Call {" "}
          <a href={site.phoneHref} className="text-bone-100 hover:text-brass-300 transition-colors">{site.phone}</a>
          {" "}or reply to your confirmation email.
        </p>
      </Reveal>
    </div>
  );
}
