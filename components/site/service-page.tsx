import Link from "next/link";
import { notFound } from "next/navigation";
import { serviceBySlug, services } from "@/lib/services";
import { img } from "@/lib/images";
import { SiteImg } from "@/components/site/site-image";
import { Reveal } from "@/components/site/reveal";
import { SectionHead } from "@/components/site/section";
import { PriceTable } from "@/components/site/price-table";
import { FaqList } from "@/components/site/faq";
import { SudsCalculator } from "@/components/site/suds-calculator";
import { BeforeAfter } from "@/components/site/before-after";
import { buttonClass } from "@/components/ui/button";
import { serviceJsonLd, faqJsonLd, JsonLd } from "@/lib/jsonld";
import { site } from "@/lib/site-config";

/** Shared scenario-page template — layout consistent, content per service. */
export function ServicePage({ slug }: { slug: string }) {
  const s = serviceBySlug(slug);
  if (!s) return notFound();

  const others = services.filter((o) => o.slug !== slug).slice(0, 4);

  return (
    <>
      <JsonLd data={[serviceJsonLd(s), faqJsonLd(s.faqs)]} />

      {/* hero */}
      <section className="relative min-h-[62svh] flex items-end overflow-hidden">
        <SiteImg image={img[s.heroKey]} className="absolute inset-0" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-forge-950 via-forge-950/45 to-forge-950/25" aria-hidden />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 md:px-10 pb-14 pt-44">
          <Reveal>
            <p className="microlabel microlabel-brass flex items-center gap-3">
              <span className="inline-block w-8 border-t border-brass-500" aria-hidden />
              Service {s.index} — Watford &amp; {site.radiusMiles} miles
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display mt-4 text-4xl md:text-6xl font-medium text-bone-50 max-w-3xl leading-[1.05]">
              {s.title}
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-4 max-w-xl text-[15px] text-bone-100/80 leading-relaxed">{s.strap}.</p>
          </Reveal>
        </div>
      </section>

      {/* intro + materials */}
      <section className="mx-auto max-w-7xl px-5 md:px-10 py-20 md:py-24 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="microlabel microlabel-brass">How we build it</p>
            {s.intro.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "font-display text-2xl md:text-[1.7rem] leading-snug text-bone-50 mt-5"
                    : "text-[15px] text-stone-400 leading-relaxed mt-5"
                }
              >
                {p}
              </p>
            ))}
          </Reveal>
          <Reveal delay={120} className="mt-10">
            <PriceTable rows={s.prices} />
          </Reveal>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <Reveal delay={60}>
            <p className="microlabel microlabel-brass">Materials &amp; spec</p>
            <dl className="mt-5 divide-y divide-bone-100/8 border-y rule">
              {s.materials.map((m) => (
                <div key={m.name} className="py-4">
                  <dt className="font-display text-lg text-bone-50">{m.name}</dt>
                  <dd className="text-[13.5px] text-stone-400 leading-relaxed mt-1">{m.detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          {s.planningNote && (
            <Reveal delay={140} className="mt-8 border border-brass-600/40 bg-brass-500/5 p-6">
              <p className="microlabel microlabel-brass">Planning — {s.planningNote.title}</p>
              <p className="text-[13.5px] text-stone-400 leading-relaxed mt-3">
                {s.planningNote.body}
              </p>
            </Reveal>
          )}
        </div>
      </section>

      {/* SuDS interactive — driveways only */}
      {s.slug === "driveways" && (
        <section className="mx-auto max-w-4xl px-5 md:px-10 pb-20">
          <Reveal>
            <SudsCalculator />
          </Reveal>
        </section>
      )}

      {/* before/after — garden design only */}
      {s.slug === "garden-design" && (
        <section className="mx-auto max-w-5xl px-5 md:px-10 pb-20">
          <SectionHead
            label="The point of the whole exercise"
            title={
              <>
                Drag the line. That's the <em className="display-italic text-brass-300">job</em>.
              </>
            }
          />
          <Reveal className="mt-10">
            <BeforeAfter
              before={img.wildBefore}
              after={img.redesignAfter}
              caption="Illustrative comparison — replaced with matched pairs from completed Forged projects as the portfolio grows."
            />
          </Reveal>
        </section>
      )}

      {/* gallery strip */}
      <section className="mx-auto max-w-7xl px-5 md:px-10 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {s.galleryKeys.slice(0, 3).map((k, i) => (
            <Reveal key={k} delay={i * 70}>
              <SiteImg
                image={img[k]}
                className={i === 0 ? "aspect-[4/5]" : "aspect-[4/5]"}
                sizes="(min-width:768px) 33vw, 100vw"
              />
            </Reveal>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-stone-600">
          Photography: curated comps standing in for Forged project imagery — see the shot list in the project docs.
        </p>
      </section>

      {/* faqs + cross-sell */}
      <section className="mx-auto max-w-7xl px-5 md:px-10 pb-24 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionHead label="Asked often" title={`${s.title}, answered.`} />
          <div className="mt-8">
            <FaqList faqs={s.faqs} />
          </div>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <Reveal>
            <div className="border rule-strong bg-forge-900 p-7">
              <p className="microlabel microlabel-brass">Start here</p>
              <h3 className="font-display text-2xl text-bone-50 mt-3 leading-snug">
                Three questions. A postcode check. A proper plan.
              </h3>
              <Link href="/portal" className={buttonClass({ size: "lg", className: "w-full mt-6" })}>
                Plan your {s.title.toLowerCase().replace("full ", "")}
              </Link>
              <Link href="/contact" className={buttonClass({ variant: "outline", size: "lg", className: "w-full mt-2.5" })}>
                Ask a question first
              </Link>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-8">
            <p className="microlabel">Also from Forged</p>
            <ul className="mt-4 space-y-2.5">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/${o.slug}`}
                    className="text-[14px] text-stone-400 hover:text-brass-300 transition-colors"
                  >
                    <span className="index-num mr-2 text-[13px]">{o.index}</span>
                    {o.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
