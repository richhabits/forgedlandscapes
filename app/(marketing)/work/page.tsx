import type { Metadata } from "next";
import Link from "next/link";
import { loadPublishedShowcase } from "@/lib/showcase";
import { Reveal } from "@/components/site/reveal";
import { ShareButton } from "@/components/site/share-button";
import { buttonClass } from "@/components/ui/button";
import { breadcrumbJsonLd, JsonLd } from "@/lib/jsonld";

// ISR: rebuild at most every 5 min instead of SSR on every request.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Our work — before & after",
  description:
    "Real Forged Landscapes transformations across Watford & Hertfordshire — before-and-after patios, driveways, decking and full garden redesigns.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const items = await loadPublishedShowcase();

  return (
    <div className="pt-36 pb-24">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Our work", path: "/work" }])} />
      <section className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <p className="microlabel microlabel-brass flex items-center gap-3">
            <span className="inline-block w-8 border-t border-brass-500" aria-hidden /> Our work
          </p>
          <h1 className="font-display mt-5 text-4xl md:text-[3.4rem] leading-[1.07] font-medium text-bone-50 max-w-3xl">
            Before, and <em className="display-italic text-brass-300">after</em>.
          </h1>
          <p className="mt-6 max-w-2xl text-[15.5px] text-stone-400 leading-relaxed">
            Real gardens across Watford and Hertfordshire — the honest before, and what they became.
          </p>
        </Reveal>

        {items.length === 0 ? (
          <div className="mt-14 border rule rounded-[2px] py-20 text-center">
            <p className="text-stone-400 text-[15px]">Our gallery is being photographed — check back soon.</p>
            <Link href="/portal" className={buttonClass({ size: "lg", className: "mt-6" })}>Start your project</Link>
          </div>
        ) : (
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            {items.map((it, i) => (
              <Reveal key={it.id} delay={i * 60}>
                <figure className="border rule rounded-[2px] overflow-hidden bg-forge-900">
                  <div className="grid grid-cols-2">
                    {[["Before", it.before_url], ["After", it.after_url]].map(([label, url]) => (
                      <div key={label} className="relative aspect-4/3 bg-forge-950">
                        {url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt={`${it.title} — ${label}`} className="size-full object-cover img-grade" loading="lazy" />
                        ) : (
                          <div className="size-full grid place-items-center text-stone-600 text-xs">{label}</div>
                        )}
                        <span className="absolute top-2 left-2 microlabel !text-[9px] bg-forge-950/70 px-1.5 py-0.5">{label}</span>
                      </div>
                    ))}
                  </div>
                  <figcaption className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display text-xl text-bone-50">{it.title}</h2>
                        {it.location && <p className="microlabel mt-1">{it.location}</p>}
                      </div>
                      <ShareButton title={`${it.title} — Forged Landscapes`} path="/work" />
                    </div>
                    {it.caption && <p className="text-[13.5px] text-stone-400 leading-relaxed mt-3">{it.caption}</p>}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
