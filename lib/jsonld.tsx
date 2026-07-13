import { site } from "@/lib/site-config";
import { coveredTowns } from "@/lib/areas";
import type { Service } from "@/lib/services";

/**
 * Structured data — the machine-readable half of "local authority".
 * HomeAndConstructionBusiness is the closest schema.org type to a
 * landscaping design-and-build firm.
 */

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${site.url}/#business`,
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    priceRange: "££-£££",
    image: `${site.url}/opengraph-image`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.base.town,
      addressRegion: site.base.county,
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.base.lat,
      longitude: site.base.lng,
    },
    areaServed: [
      {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: site.base.lat,
          longitude: site.base.lng,
        },
        geoRadius: `${Math.round(site.radiusMiles * 1609.34)}`,
      },
      ...coveredTowns.map((t) => ({ "@type": "City" as const, name: t })),
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "13:00",
      },
    ],
  };
}

export function serviceJsonLd(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.title} — ${site.name}`,
    description: service.metaDescription,
    url: `${site.url}/${service.slug}`,
    provider: { "@id": `${site.url}/#business` },
    areaServed: `${site.base.town} and ${site.radiusMiles} miles`,
    serviceType: service.title,
  };
}

/** Breadcrumb trail — drives the breadcrumb rich result in Google. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${site.url}${t.path}`,
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}
