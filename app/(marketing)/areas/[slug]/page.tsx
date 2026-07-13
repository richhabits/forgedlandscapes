import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { areas, areaBySlug } from "@/lib/areas";
import { services } from "@/lib/services";
import { site } from "@/lib/site-config";
import { img } from "@/lib/images";
import { SiteImg } from "@/components/site/site-image";
import { Reveal } from "@/components/site/reveal";
import { RadiusChecker } from "@/components/site/radius-checker";
import { buttonClass } from "@/components/ui/button";
import { JsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

export function generateStaticParams() {
  return areas.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = areaBySlug(slug);
  if (!a) return {};
  return {
    title: `Landscaping in ${a.name}`,
    description: `Design-and-build landscaping in ${a.name} (${a.postcodeHint}) — patios, driveways, decking, lawns and full garden redesigns, ${a.distance} from our Watford base.`,
    alternates: { canonical: `/areas/${a.slug}` },
  };
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = areaBySlug(slug);
  if (!a) return notFound();

  return (
    <div className="pt-36 pb-24">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: `Landscaping in ${a.name}`,
            description: `Design-and-build landscaping in ${a.name} (${a.postcodeHint}) — patios, driveways, decking, lawns and full garden redesigns.`,
            url: `${site.url}/areas/${a.slug}`,
            provider: { "@id": `${site.url}/#business` },
            areaServed: { "@type": "City", name: a.name },
            serviceType: "Landscaping design and build",
          },
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Areas", path: "/areas" },
            { name: a.name, path: `/areas/${a.slug}` },
          ]),
        ]}
      />
      <section className="mx-auto max-w-7xl px-5 md:px-10 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="microlabel microlabel-brass flex items-center gap-3">
              <span className="inline-block w-8 border-t border-brass-500" aria-hidden />
              {a.postcodeHint} · {a.distance} from our Watford base
            </p>
            <h1 className="font-display mt-5 text-4xl md:text-[3.4rem] leading-[1.07] font-medium text-bone-50">
              Landscaping in{" "}
              <em className="display-italic text-brass-300">{a.name}</em>.
            </h1>
          </Reveal>
          {a.intro.map((p, i) => (
            <Reveal key={i} delay={80 + i * 60}>
              <p
                className={
                  i === 0
                    ? "font-display text-xl md:text-2xl leading-snug text-bone-100 mt-8"
                    : "text-[15px] text-stone-400 leading-relaxed mt-5"
                }
              >
                {p}
              </p>
            </Reveal>
          ))}

          <Reveal delay={200} className="mt-8 border border-brass-600/40 bg-brass-500/5 p-6">
            <p className="microlabel microlabel-brass">Local knowledge</p>
            <p className="text-[14px] text-stone-400 leading-relaxed mt-3">{a.localNote}</p>
          </Reveal>

          <Reveal delay={260} className="mt-10">
            <p className="microlabel microlabel-brass mb-4">Most requested in {a.name}</p>
            <div className="flex flex-wrap gap-2">
              {a.popular.map((p) => (
                <span
                  key={p}
                  className="px-3.5 py-2 border rule text-[13px] text-bone-100/85"
                >
                  {p}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={300} className="mt-12">
            <p className="microlabel microlabel-brass mb-4">All services in {a.name}</p>
            <div className="border-t rule">
              {services.map((s) => (
                <Link
                  key={s.slug}
                  href={`/${s.slug}`}
                  className="group flex items-baseline gap-5 py-4 border-b rule hover:bg-bone-100/[0.03] px-2 -mx-2 transition-colors"
                >
                  <span className="index-num text-sm w-7 shrink-0">{s.index}</span>
                  <span className="font-display text-lg text-bone-50 group-hover:text-brass-300 transition-colors">
                    {s.title}
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <Reveal delay={100}>
            <SiteImg image={img.patioCourtyard} className="aspect-[4/5]" sizes="(min-width:1024px) 33vw, 100vw" />
          </Reveal>
          <Reveal delay={160} className="mt-8 border rule-strong bg-forge-900 p-7">
            <p className="microlabel microlabel-brass">Confirm you're covered</p>
            <div className="mt-4">
              <RadiusChecker />
            </div>
            <Link href="/portal" className={buttonClass({ size: "lg", className: "w-full mt-5" })}>
              Start your {a.name} project
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
