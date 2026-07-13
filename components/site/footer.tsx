import Link from "next/link";
import { site, nav } from "@/lib/site-config";
import { areas, coveredTowns } from "@/lib/areas";
import { Wordmark } from "@/components/site/wordmark";

export function Footer() {
  return (
    <footer className="relative bg-forge-900 border-t rule grain">
      <div className="relative z-[2] mx-auto max-w-7xl px-5 md:px-10 pt-16 pb-8">
        <div className="grid gap-12 md:grid-cols-12">
          {/* brand col */}
          <div className="md:col-span-4">
            <Wordmark size="lg" />
            <p className="mt-5 text-sm text-stone-400 max-w-xs leading-relaxed">
              Design-and-build landscaping from Watford, Hertfordshire —
              patios, driveways, decking, lawns and full garden
              transformations within a strict {site.radiusMiles}-mile radius.
            </p>
            <div className="mt-6 space-y-1.5 text-sm">
              <p>
                <a href={site.phoneHref} className="text-bone-100 hover:text-brass-300 transition-colors">
                  {site.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${site.email}`} className="text-stone-400 hover:text-brass-300 transition-colors">
                  {site.email}
                </a>
              </p>
              <p className="text-stone-500 text-[13px]">{site.hours}</p>
            </div>
          </div>

          {/* services */}
          <div className="md:col-span-2">
            <p className="microlabel microlabel-brass mb-4">Services</p>
            <ul className="space-y-2.5 text-sm">
              {nav.slice(0, 5).map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-stone-400 hover:text-bone-100 transition-colors">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* areas */}
          <div className="md:col-span-3">
            <p className="microlabel microlabel-brass mb-4">Areas</p>
            <ul className="space-y-2.5 text-sm">
              {areas.map((a) => (
                <li key={a.slug}>
                  <Link href={`/areas/${a.slug}`} className="text-stone-400 hover:text-bone-100 transition-colors">
                    Landscaping in {a.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/areas" className="text-brass-400 hover:text-brass-300 transition-colors">
                  All {coveredTowns.length} towns covered →
                </Link>
              </li>
            </ul>
          </div>

          {/* standards */}
          <div className="md:col-span-3">
            <p className="microlabel microlabel-brass mb-4">Standards</p>
            <ul className="space-y-2.5 text-[13px] text-stone-400">
              <li>{site.trust.insurance}</li>
              <li>{site.trust.wasteCarrier}</li>
              <li>{site.trust.guarantee}</li>
              <li>{site.trust.payments}</li>
              <li>14-day cancellation on off-premises contracts — Consumer Contracts Regulations 2013</li>
              <li>Services delivered with reasonable care &amp; skill — Consumer Rights Act 2015</li>
            </ul>
          </div>
        </div>

        {/* legal strip */}
        <div className="mt-14 pt-6 border-t rule flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <p className="text-[12px] text-stone-500 max-w-2xl leading-relaxed">
            © {new Date().getFullYear()} {site.name}. Construction-phase health &amp;
            safety managed in line with CDM&nbsp;2015 on every project. Guide prices
            are indicative; fixed quotations follow a site survey.
          </p>
          <div className="flex gap-5 text-[12px] text-stone-400 shrink-0">
            <Link href="/guides" className="hover:text-bone-100 transition-colors">Guides</Link>
            <Link href="/privacy" className="hover:text-bone-100 transition-colors">Privacy &amp; cookies</Link>
            <Link href="/terms" className="hover:text-bone-100 transition-colors">Terms</Link>
            <Link href="/service-area" className="hover:text-bone-100 transition-colors">Service area</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
