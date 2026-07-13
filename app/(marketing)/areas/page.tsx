import type { Metadata } from "next";
import Link from "next/link";
import { areas, coveredTowns } from "@/lib/areas";
import { site } from "@/lib/site-config";
import { SectionHead } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { RadiusChecker } from "@/components/site/radius-checker";
import { AreaMap } from "@/components/site/area-map";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Areas we cover",
  description: `Design-and-build landscaping across a strict ${site.radiusMiles}-mile radius of Watford: St Albans, Hemel Hempstead, Harrow, Bushey, Radlett and ${coveredTowns.length}+ towns.`,
  alternates: { canonical: "/areas" },
};

export default function AreasPage() {
  return (
    <div className="pt-36 pb-24">
      <section className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionHead
          label="Service area"
          title={
            <>
              Twenty miles from Watford.
              <br />
              Not twenty-<em className="display-italic text-brass-300">one</em>.
            </>
          }
          intro="A tight radius is a service decision: crews on site by 8am, snags fixed the same week, and quotes that never carry hidden travel. Check your postcode, then read how we work in your town."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <RadiusChecker />
            </Reveal>
            <Reveal delay={100} className="mt-10">
              <p className="microlabel microlabel-brass mb-4">Featured towns</p>
              <div className="border-t rule">
                {areas.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/areas/${a.slug}`}
                    className="group flex items-baseline justify-between gap-4 py-4 border-b rule hover:bg-bone-100/[0.03] px-2 -mx-2 transition-colors"
                  >
                    <span>
                      <span className="font-display text-xl text-bone-50 group-hover:text-brass-300 transition-colors">
                        {a.name}
                      </span>
                      <span className="block text-[12px] text-stone-500 mt-0.5">
                        {a.distance} from base · {a.postcodeHint}
                      </span>
                    </span>
                    <ArrowUpRight className="size-4 text-stone-600 group-hover:text-brass-400 transition-colors shrink-0" aria-hidden />
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-7" delay={80}>
            <AreaMap className="h-[420px] lg:h-[560px] border rule-strong" />
          </Reveal>
        </div>

        <Reveal className="mt-16">
          <p className="microlabel microlabel-brass mb-5">Every town inside the circle</p>
          <p className="max-w-4xl text-[15px] leading-loose text-stone-400">
            {coveredTowns.map((t, i) => (
              <span key={t}>
                <span className="text-bone-100/85">{t}</span>
                {i < coveredTowns.length - 1 && <span className="text-stone-600"> · </span>}
              </span>
            ))}
          </p>
          <p className="mt-5 text-[13px] text-stone-500 max-w-2xl">
            Inside the circle but not listed? If the postcode checks out, we cover you —
            the radius is the rule, the list is just the highlights.
          </p>
        </Reveal>
      </section>
    </div>
  );
}
