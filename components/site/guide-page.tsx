import Link from "next/link";
import { notFound } from "next/navigation";
import { guideBySlug } from "@/lib/guides";
import { serviceBySlug } from "@/lib/services";
import { img } from "@/lib/images";
import { SiteImg } from "@/components/site/site-image";
import { Reveal } from "@/components/site/reveal";
import { FaqList } from "@/components/site/faq";
import { buttonClass } from "@/components/ui/button";
import {
  articleJsonLd,
  faqJsonLd,
  breadcrumbJsonLd,
  JsonLd,
} from "@/lib/jsonld";

/** Shared long-form guide template — data in lib/guides.ts, layout here. */
export function GuidePage({ slug }: { slug: string }) {
  const g = guideBySlug(slug);
  if (!g) return notFound();

  const related = g.related.map(serviceBySlug).filter(Boolean);
  const updated = new Date(g.updated).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="pb-24">
      <JsonLd
        data={[
          articleJsonLd({ slug: g.slug, title: g.title, description: g.description, updated: g.updated }),
          faqJsonLd(g.faqs),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: g.title, path: `/guides/${g.slug}` },
          ]),
        ]}
      />

      {/* header */}
      <header className="mx-auto max-w-3xl px-5 md:px-10 pt-36">
        <Reveal>
          <Link href="/guides" className="microlabel microlabel-brass hover:text-brass-200 transition-colors">
            ← Guides · {g.category}
          </Link>
          <h1 className="font-display mt-5 text-4xl md:text-[3.1rem] leading-[1.08] font-medium text-bone-50">
            {g.title}
          </h1>
          <p className="mt-5 text-[16px] md:text-[17px] text-stone-300 leading-relaxed">{g.dek}</p>
          <p className="mt-5 text-[12px] text-stone-600">
            {g.readMinutes} min read · Reviewed {updated}
          </p>
        </Reveal>
      </header>

      {/* hero band */}
      <div className="mx-auto max-w-5xl px-5 md:px-10 mt-10">
        <Reveal>
          <SiteImg image={img[g.heroKey]} className="aspect-[16/7]" sizes="(min-width:1024px) 900px, 100vw" priority />
        </Reveal>
      </div>

      {/* body */}
      <div className="mx-auto max-w-3xl px-5 md:px-10 mt-14 space-y-12">
        {g.sections.map((s, i) => (
          <Reveal key={i} as="section">
            {s.heading && (
              <h2 className="font-display text-2xl md:text-[1.8rem] text-bone-50 leading-snug mb-5">
                {s.heading}
              </h2>
            )}
            {s.body.map((p, j) => (
              <p key={j} className="text-[15.5px] text-stone-300 leading-[1.75] mt-4 first:mt-0">
                {p}
              </p>
            ))}
            {s.list && (
              <div className="mt-5">
                {s.list.lead && <p className="microlabel mb-3">{s.list.lead}</p>}
                <ul className="space-y-2.5">
                  {s.list.items.map((it, k) => (
                    <li key={k} className="flex gap-3 text-[15px] text-stone-300 leading-relaxed">
                      <span className="mt-2 size-1.5 rounded-full bg-brass-400 shrink-0" aria-hidden />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {s.callout && (
              <div className="mt-6 border border-brass-600/40 bg-brass-500/5 p-6">
                <p className="microlabel microlabel-brass">{s.callout.label}</p>
                <p className="text-[14.5px] text-stone-300 leading-relaxed mt-3">{s.callout.text}</p>
              </div>
            )}
          </Reveal>
        ))}
      </div>

      {/* faqs */}
      <section className="mx-auto max-w-3xl px-5 md:px-10 mt-16">
        <p className="microlabel microlabel-brass">Asked often</p>
        <h2 className="font-display text-2xl md:text-3xl text-bone-50 mt-3 mb-8">Straight answers</h2>
        <FaqList faqs={g.faqs} />
      </section>

      {/* cta + cross-links */}
      <section className="mx-auto max-w-3xl px-5 md:px-10 mt-16">
        <div className="border rule-strong bg-forge-900 p-7 md:p-9">
          <p className="microlabel microlabel-brass">From guide to garden</p>
          <h3 className="font-display text-2xl md:text-[1.7rem] text-bone-50 mt-3 leading-snug">
            Three questions, a postcode check, and a proper plan.
          </h3>
          <p className="text-[14px] text-stone-400 leading-relaxed mt-3">
            No obligation, no pressure — just a clear next step whenever you're ready.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link href="/portal" className={buttonClass({ size: "lg" })}>Start your brief</Link>
            <Link href="/contact" className={buttonClass({ variant: "outline", size: "lg" })}>Ask a question</Link>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <p className="microlabel">Related services</p>
            <ul className="mt-4 space-y-2.5">
              {related.map((o) => (
                <li key={o!.slug}>
                  <Link href={`/${o!.slug}`} className="text-[14px] text-stone-400 hover:text-brass-300 transition-colors">
                    <span className="index-num mr-2 text-[13px]">{o!.index}</span>
                    {o!.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </article>
  );
}
