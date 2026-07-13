import type { Metadata } from "next";
import { site } from "@/lib/site-config";
import { SectionHead } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { ContactForm } from "@/components/site/contact-form";
import { BadgeBanner } from "@/components/site/badges";

export const metadata: Metadata = {
  title: "Contact & quotes",
  description: `Talk to Forged Landscapes — ${site.phone}, ${site.email}, or the enquiry form. Watford-based, ${site.radiusMiles}-mile radius, fixed itemised quotes.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="pt-36 pb-24">
      <section className="mx-auto max-w-7xl px-5 md:px-10 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead
            label="Contact"
            title={
              <>
                Talk to a <em className="display-italic text-brass-300">builder</em>,
                not a call centre.
              </>
            }
            intro="Phone answered site-hours, emails within one working day. If the project's already clear in your head, the portal brief is the fastest route to a survey."
          />
          <Reveal delay={120} className="mt-10 space-y-6">
            <div>
              <p className="microlabel microlabel-brass">Phone</p>
              <a href={site.phoneHref} className="font-display text-2xl text-bone-50 hover:text-brass-300 transition-colors">
                {site.phone}
              </a>
              <p className="text-[12.5px] text-stone-500 mt-1">{site.hours}</p>
            </div>
            <div>
              <p className="microlabel microlabel-brass">Email</p>
              <a href={`mailto:${site.email}`} className="text-[15px] text-bone-100 hover:text-brass-300 transition-colors">
                {site.email}
              </a>
            </div>
            <div>
              <p className="microlabel microlabel-brass">Base</p>
              <p className="text-[15px] text-stone-400">
                Watford, Hertfordshire — serving a strict {site.radiusMiles}-mile radius
              </p>
            </div>
            <div className="pt-4">
              <BadgeBanner compact />
            </div>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-7 lg:col-start-6" delay={80}>
          <div className="border rule-strong bg-forge-900 p-7 md:p-10 relative">
            <ContactForm />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
