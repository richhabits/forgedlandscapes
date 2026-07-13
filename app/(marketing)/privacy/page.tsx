import type { Metadata } from "next";
import { site } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy & cookies",
  description: "How Forged Landscapes collects, uses and protects your data under UK GDPR — and the honest truth about our cookies.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="pt-36 pb-24 mx-auto max-w-7xl px-5 md:px-10">
      <p className="microlabel microlabel-brass">Legal</p>
      <h1 className="font-display text-4xl md:text-5xl text-bone-50 mt-4">Privacy &amp; cookies</h1>
      <p className="text-stone-500 text-[13px] mt-3">Last updated: July 2026 · Applies to {site.domain}</p>

      <div className="prose-forged mt-10">
        <h2>Who we are</h2>
        <p>
          Forged Landscapes ("we") is the data controller for personal data collected through this
          website. Contact: <strong>{site.email}</strong>. {/* TODO: registered company name, number and address before launch */}
        </p>

        <h2>What we collect, and why</h2>
        <p>
          <strong>Enquiry data</strong> — name, email, phone, postcode, project details, budget band,
          and chat transcripts from the project assessor. Lawful basis: legitimate interests
          (responding to an enquiry you initiated), then contract where a project proceeds.
        </p>
        <p>
          <strong>Project brief data</strong> — photos and videos of your garden, dimensions, sketches
          and inspiration links you upload to the client portal, plus your portal account email.
          Lawful basis: steps taken at your request prior to entering a contract.
        </p>
        <p>
          <strong>Postcode checks</strong> — postcodes entered into the radius checker are sent to
          postcodes.io (Open Government Licence data) to calculate distance. We don't store checker
          lookups unless you submit an enquiry.
        </p>

        <h2>What we never do</h2>
        <p>
          We do not sell personal data, share it with marketing brokers, or use it to train anything.
          Garden photos are used solely to assess and deliver your project.
        </p>

        <h2>Where it lives</h2>
        <p>
          Enquiries and briefs are stored in our database and file storage (Supabase, hosted in the
          UK/EEA region), protected by row-level security so portal users can only ever access their
          own project data. Email notifications are delivered via Resend. Hosting is provided by Vercel.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Enquiries that don't proceed: deleted or anonymised within 24 months. Project records for
          completed work: retained for 6 years to honour guarantees and meet legal obligations.
          Portal accounts: deleted on request at any time.
        </p>

        <h2>Your rights</h2>
        <p>
          Under UK GDPR you can request access, correction, deletion, restriction, or a portable copy
          of your data, and object to processing based on legitimate interests. Email{" "}
          <strong>{site.email}</strong> — we respond within one month. If we get it wrong, you can
          complain to the ICO at ico.org.uk.
        </p>

        <h2>Cookies — the honest version</h2>
        <p>
          This site sets <strong>no marketing or tracking cookies</strong>. The only cookies/storage used:
        </p>
        <ul>
          <li><strong>Portal session</strong> — keeps you signed in to the client portal (strictly necessary).</li>
          <li><strong>Consent preference</strong> — remembers your choice on the cookie banner (strictly necessary).</li>
          <li><strong>Anonymous analytics</strong> — only if you opt in via the banner; off by default. We currently run none even when enabled.</li>
        </ul>
        <p>
          Because strictly-necessary cookies are exempt from consent under PECR, the banner exists to
          be straight with you and to record your analytics preference — not to nag.
        </p>

        <h2>Third-party services</h2>
        <ul>
          <li>postcodes.io — postcode geocoding (no account data sent)</li>
          <li>Supabase — database, authentication and encrypted file storage</li>
          <li>Resend — transactional email delivery</li>
          <li>Vercel — website hosting</li>
          <li>Groq — powers the project assessor's language model when enabled; transcripts are processed to generate replies and are not used for training under our configuration</li>
          <li>OpenStreetMap / CARTO — map tiles on the service-area pages (your browser requests tiles directly)</li>
          <li>Unsplash — temporary photographic comps are served from Unsplash's CDN</li>
        </ul>
      </div>
    </div>
  );
}
