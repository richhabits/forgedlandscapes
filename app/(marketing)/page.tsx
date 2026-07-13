import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site-config";
import { img } from "@/lib/images";
import { areas } from "@/lib/areas";
import { SiteImg } from "@/components/site/site-image";
import { Reveal } from "@/components/site/reveal";
import { SectionHead } from "@/components/site/section";
import { ServiceIndex } from "@/components/site/service-index";
import { BeforeAfter } from "@/components/site/before-after";
import { RadiusChecker } from "@/components/site/radius-checker";
import { AreaMap } from "@/components/site/area-map";
import { BadgeBanner } from "@/components/site/badges";
import { buttonClass } from "@/components/ui/button";
import { FaqList } from "@/components/site/faq";
import { faqJsonLd, JsonLd } from "@/lib/jsonld";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  description: site.description,
  alternates: { canonical: "/" },
};

/* Placeholder testimonials — REPLACE with real, attributable reviews
   (Google review screenshots → text) before launch. */
const testimonials = [
  {
    quote:
      "The brief-before-survey process sounded like homework — it took five minutes and meant the first site visit was about decisions, not measuring. Patio's flawless two winters on.",
    who: "K. Patel",
    where: "Bushey",
    job: "Porcelain patio & lighting",
  },
  {
    quote:
      "Three quotes: two day-rates and a shrug, one itemised document with drainage drawn properly. Easiest decision we made on the whole house.",
    who: "S. Whitmore",
    where: "St Albans",
    job: "Resin driveway & front garden",
  },
  {
    quote:
      "They told us our first idea would fight the levels and cost more to maintain — then designed something better for the same money. That's who you want on your garden.",
    who: "D. Okafor",
    where: "Radlett",
    job: "Full garden redesign",
  },
];

const homeFaqs = [
  {
    q: "Do you really only work within 20 miles of Watford?",
    a: "Yes — strictly. Tight radius means our teams are on site by 8am not stuck on the M25, snags get fixed the same week, and quotes stay sharp because travel isn't priced in. Check your postcode with the tool on this page.",
  },
  {
    q: "What does the online brief involve?",
    a: "About five minutes in the client portal: a few photos of the space, rough length and width, an optional sketch of what goes where, and any inspiration links. It means the site survey is a working session rather than a fact-finding trip.",
  },
  {
    q: "Are your prices fixed?",
    a: "Quotes are itemised and fixed against a written specification after survey. Guide prices on each service page show where projects typically land. Payments are staged — never full payment up front.",
  },
  {
    q: "Who actually does the work?",
    a: "Our own teams, run by a project lead you can phone. Construction-phase health and safety is managed under CDM 2015 on every job, waste leaves site under our Environment Agency carrier registration, and workmanship carries a 5-year guarantee.",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqJsonLd(homeFaqs)} />

      {/* ————— HERO ————— */}
      <section className="relative min-h-[92svh] flex flex-col justify-end overflow-hidden">
        <SiteImg
          image={img.heroHome}
          className="absolute inset-0"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forge-950 via-forge-950/55 to-forge-950/30" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-forge-950/60 via-transparent to-transparent" aria-hidden />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 md:px-10 pb-16 md:pb-20 pt-40">
          <Reveal>
            <p className="microlabel microlabel-brass flex items-center gap-3">
              <span className="inline-block w-8 border-t border-brass-500" aria-hidden />
              Design &amp; build landscaping — Watford, Hertfordshire
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display mt-5 text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-[4.6rem] font-medium text-bone-50 max-w-3xl">
              Outdoor spaces,
              <br />
              <em className="display-italic text-brass-300">forged</em> properly.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-bone-100/80">
              Porcelain patios, resin and block driveways, bespoke decking and
              full garden transformations — built on groundworks we'd stake the
              company name on, within {site.radiusMiles} miles of Watford.
            </p>
          </Reveal>
          <Reveal delay={240} className="mt-8 flex flex-wrap gap-3">
            <Link href="/portal" className={buttonClass({ size: "lg" })}>
              Plan your project
            </Link>
            <Link
              href="/garden-design"
              className={buttonClass({ variant: "outline", size: "lg" })}
            >
              Explore the work
            </Link>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-12 pt-6 border-t rule flex flex-wrap gap-x-8 gap-y-2 text-[12px] text-stone-400">
              <span>{site.trust.insurance}</span>
              <span>{site.trust.guarantee}</span>
              <span>{site.trust.payments}</span>
              <span>EA-registered waste carrier</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ————— INTRO EDITORIAL ————— */}
      <section className="relative grain bg-forge-950">
        <div className="relative z-[2] mx-auto max-w-7xl px-5 md:px-10 py-24 md:py-32 grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="microlabel microlabel-brass flex items-center gap-3">
              <span className="inline-block w-8 border-t border-brass-500" aria-hidden />
              The premise
            </p>
            <h2 className="font-display mt-5 text-3xl md:text-[2.8rem] leading-[1.15] text-bone-50 font-medium">
              A garden fails at the base, never at the surface — so we build
              the part you'll <em className="display-italic text-brass-300">never see</em> like
              it's the part you'll show off.
            </h2>
          </Reveal>
          <div className="lg:col-span-4 lg:col-start-9 flex flex-col justify-end gap-8">
            <Reveal delay={100}>
              <p className="text-[15px] text-stone-400 leading-relaxed">
                Sub-bases over-specified. Drainage calculated, not assumed.
                Materials from named quarries and mills, laid by our own teams —
                then handed over with a 5-year workmanship guarantee that means
                something because we're twenty minutes away.
              </p>
            </Reveal>
            <Reveal delay={180} className="grid grid-cols-3 gap-6 border-t rule pt-6">
              {[
                { n: "20", d: "mile radius, strictly kept" },
                { n: "5yr", d: "workmanship guarantee" },
                { n: "£5m", d: "public liability cover" },
              ].map((s) => (
                <div key={s.d}>
                  <p className="font-display text-3xl text-brass-300">{s.n}</p>
                  <p className="mt-1 text-[11.5px] text-stone-500 leading-snug">{s.d}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ————— SERVICES INDEX ————— */}
      <section className="mx-auto max-w-7xl px-5 md:px-10 py-24 md:py-28">
        <SectionHead
          label="Services — 01 to 05"
          title={
            <>
              Five disciplines. <em className="display-italic text-brass-300">One</em> standard.
            </>
          }
          intro="Every discipline is delivered design-first: measured, drawn and priced as a fixed itemised quote before a spade goes in."
        />
        <div className="mt-14">
          <ServiceIndex />
        </div>
      </section>

      {/* ————— STANDARDS BAND (bone inversion) ————— */}
      <section className="bg-bone-50 text-forge-950">
        <div className="mx-auto max-w-7xl px-5 md:px-10 py-24 md:py-28">
          <SectionHead
            dark={false}
            label="Built to UK standards"
            title={
              <>
                Compliance isn't a footer link here.
                <br />
                It's the <em className="display-italic">method</em>.
              </>
            }
          />
          <div className="mt-14 grid gap-px bg-forge-950/10 border border-forge-950/10 md:grid-cols-3">
            {[
              {
                h: "SuDS-compliant drainage",
                p: "Front-garden surfaces over 5m² must be permeable or drain to a soakaway to avoid planning permission. Every driveway we design meets the rule from the first sketch — try the checker on the driveways page.",
              },
              {
                h: "Consumer law, done properly",
                p: "Off-premises contracts carry the statutory 14-day cooling-off period under the Consumer Contracts Regulations 2013, and every service is delivered with the reasonable care and skill the Consumer Rights Act 2015 demands. It's written into our paperwork, not implied.",
              },
              {
                h: "CDM 2015 site management",
                p: "Construction-phase health and safety is formally managed on every project — method statements, risk assessments, a named project lead. Waste leaves site under our Environment Agency carrier registration.",
              },
            ].map((c, i) => (
              <Reveal key={c.h} delay={i * 80} className="bg-bone-50 p-8">
                <p className="index-num !text-forge-950/30 text-sm">0{i + 1}</p>
                <h3 className="font-display text-xl mt-3">{c.h}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-forge-700/80">{c.p}</p>
              </Reveal>
            ))}
          </div>
          <BadgeBanner />{/* renders once real accreditations are added to site-config */}
        </div>
      </section>

      {/* ————— TRANSFORMATION + PROCESS ————— */}
      <section className="mx-auto max-w-7xl px-5 md:px-10 py-24 md:py-28 grid gap-14 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7">
          <SectionHead
            label="Full transformations"
            title={
              <>
                From <em className="display-italic text-brass-300">jungle</em> to
                July evenings.
              </>
            }
          />
          <Reveal className="mt-10">
            <BeforeAfter
              before={img.wildBefore}
              after={img.redesignAfter}
              caption="Illustrative comparison — replaced with matched before/after pairs from completed Forged projects."
            />
          </Reveal>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="microlabel microlabel-brass">How a project runs</p>
          <ol className="mt-6 space-y-0">
            {[
              ["Brief", "Five minutes in the client portal — photos, rough dimensions, a sketch if you like."],
              ["Survey", "A measured visit with material samples in hand, booked around you."],
              ["Design & quote", "Scaled plan plus a fixed, itemised cost. No day-rate roulette."],
              ["Build", "Our own team, a named lead, tidy site discipline, staged payments."],
              ["Aftercare", "Snag-free handover, care guide, and a 5-year guarantee we're close enough to honour."],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 60} className="flex gap-5 py-5 border-b rule">
                <span className="index-num text-lg shrink-0 w-8">{`0${i + 1}`}</span>
                <span>
                  <span className="font-display text-lg text-bone-50 block">{t}</span>
                  <span className="text-[13.5px] text-stone-400 leading-relaxed block mt-1">{d}</span>
                </span>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={320} className="mt-8">
            <Link href="/portal" className={buttonClass({ size: "lg", className: "w-full" })}>
              Start your brief
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ————— SERVICE AREA ————— */}
      <section className="relative grain bg-forge-900 border-y rule">
        <div className="relative z-[2] mx-auto max-w-7xl px-5 md:px-10 py-24 md:py-28 grid gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5">
            <SectionHead
              label="Service area"
              title={
                <>
                  Watford, plus <em className="display-italic text-brass-300">twenty</em> honest miles.
                </>
              }
              intro="St Albans, Hemel Hempstead, Harrow, Bushey, Radlett and every postcode between. If you're inside the circle, you get the same response times as the house next door to the yard."
            />
            <Reveal delay={150} className="mt-8">
              <RadiusChecker />
            </Reveal>
            <Reveal delay={220} className="mt-6 flex flex-wrap gap-x-5 gap-y-1.5">
              {areas.map((a) => (
                <Link
                  key={a.slug}
                  href={`/areas/${a.slug}`}
                  className="text-[13px] text-stone-400 hover:text-brass-300 underline-offset-4 hover:underline transition-colors"
                >
                  {a.name}
                </Link>
              ))}
              <Link href="/areas" className="text-[13px] text-brass-400 hover:text-brass-300">
                all areas →
              </Link>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-7" delay={100}>
            <AreaMap className="h-[420px] md:h-[500px] border rule-strong relative z-[2]" />
          </Reveal>
        </div>
      </section>

      {/* ————— TESTIMONIALS ————— */}
      <section className="mx-auto max-w-7xl px-5 md:px-10 py-24 md:py-28">
        <SectionHead
          label="Word of mouth"
          title={
            <>
              The radius is small. The <em className="display-italic text-brass-300">reputation</em> can't hide.
            </>
          }
        />
        <div className="mt-12 grid gap-px bg-bone-100/10 border rule md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.who} delay={i * 80} className="bg-forge-950 p-8 flex flex-col">
              <p className="font-display text-brass-400 text-3xl leading-none" aria-hidden>
                &ldquo;
              </p>
              <blockquote className="mt-2 text-[14.5px] leading-relaxed text-bone-100/90 flex-1">
                {t.quote}
              </blockquote>
              <footer className="mt-6 pt-4 border-t rule">
                <p className="text-[13px] text-bone-100 font-medium">
                  {t.who} — {t.where}
                </p>
                <p className="microlabel mt-1 !text-[9.5px]">{t.job}</p>
              </footer>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ————— FAQ + CTA ————— */}
      <section className="mx-auto max-w-7xl px-5 md:px-10 pb-24 md:pb-28 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionHead label="Straight answers" title="Asked often." />
          <div className="mt-10">
            <FaqList faqs={homeFaqs} />
          </div>
        </div>
        <Reveal className="lg:col-span-4 lg:col-start-9" delay={120}>
          <div className="relative overflow-hidden border rule-strong bg-forge-900 grain">
            <div className="relative z-[2] p-8">
              <p className="microlabel microlabel-brass">Ready when you are</p>
              <h3 className="font-display text-3xl text-bone-50 mt-4 leading-tight">
                Five minutes now saves a fortnight of quote-chasing.
              </h3>
              <p className="text-[14px] text-stone-400 mt-4 leading-relaxed">
                Answer three questions, drop in a few photos, and get a survey
                that arrives already understanding your garden.
              </p>
              <div className={cn("flex flex-col gap-2.5 mt-7")}>
                <Link href="/portal" className={buttonClass({ size: "lg" })}>
                  Start your brief
                </Link>
                <Link href="/contact" className={buttonClass({ variant: "outline", size: "lg" })}>
                  Or just say hello
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
