import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides";
import { Reveal } from "@/components/site/reveal";
import { breadcrumbJsonLd, JsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Plain-English guides to landscaping in Hertfordshire — driveway planning permission, porcelain vs sandstone, and how to read a patio quote. Written straight, no sales spin.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndex() {
  return (
    <div className="pt-36 pb-24">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }])} />

      <section className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <p className="microlabel microlabel-brass flex items-center gap-3">
            <span className="inline-block w-8 border-t border-brass-500" aria-hidden />
            Guides
          </p>
          <h1 className="font-display mt-5 text-4xl md:text-[3.4rem] leading-[1.07] font-medium text-bone-50 max-w-3xl">
            The <em className="display-italic text-brass-300">plain-English</em> version.
          </h1>
          <p className="mt-6 max-w-2xl text-[15.5px] text-stone-400 leading-relaxed">
            The questions clients actually ask, answered straight — what needs planning permission,
            which materials suit our clay, and how to tell a fair quote from a vague one. No jargon,
            no sales spin.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-px bg-bone-100/10 border rule rounded-[2px] overflow-hidden md:grid-cols-2 lg:grid-cols-3">
          {guides.map((g, i) => (
            <Reveal key={g.slug} delay={i * 60} className="contents">
              <Link
                href={`/guides/${g.slug}`}
                className="group bg-forge-900 p-7 flex flex-col hover:bg-forge-850 transition-colors"
              >
                <p className="microlabel microlabel-brass">{g.category}</p>
                <h2 className="font-display text-[1.6rem] leading-tight text-bone-50 mt-4 group-hover:text-brass-200 transition-colors">
                  {g.title}
                </h2>
                <p className="text-[14px] text-stone-400 leading-relaxed mt-3 flex-1">{g.dek}</p>
                <p className="microlabel mt-6">{g.readMinutes} min read →</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
