import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & consumer rights",
  description: "Forged Landscapes' terms of business: quotes, staged payments, the 14-day cooling-off period, guarantees and CDM 2015 site management.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="pt-36 pb-24 mx-auto max-w-7xl px-5 md:px-10">
      <p className="microlabel microlabel-brass">Legal</p>
      <h1 className="font-display text-4xl md:text-5xl text-bone-50 mt-4">Terms &amp; your consumer rights</h1>
      <p className="text-stone-500 text-[13px] mt-3">Last updated: July 2026 · Plain-English summary — the signed contract governs each project</p>

      <div className="prose-forged mt-10">
        <h2>Quotes</h2>
        <p>
          Quotations are itemised, written, and fixed against the agreed specification for
          <strong> 30 days</strong>. Changes you request after acceptance are priced and agreed in
          writing as variations before the extra work happens. Guide prices on this website are
          indicative only until a survey has been carried out.
        </p>

        <h2>Payments</h2>
        <p>
          Payments are staged against progress — typically a deposit on booking, staged payments at
          agreed milestones, and a final balance at snag-free completion. We never ask for full
          payment up front. {/* TODO: confirm exact stage percentages */}
        </p>

        <h2>Your 14-day cooling-off period</h2>
        <p>
          Where a contract is agreed away from our premises (at your home, by phone or online) —
          which is almost always — the <strong>Consumer Contracts (Information, Cancellation and
          Additional Charges) Regulations 2013</strong> give you the right to cancel within 14 days
          of signing, without giving a reason. We provide the model cancellation form with every
          contract. If you ask us in writing to start within the 14 days, you may be charged
          reasonably for work already done; bespoke materials ordered at your request may be exempt
          from cancellation once cut or mixed.
        </p>

        <h2>Our statutory obligations to you</h2>
        <p>
          Under the <strong>Consumer Rights Act 2015</strong>, our services must be performed with
          reasonable care and skill, within a reasonable time, and materials must be of satisfactory
          quality, fit for purpose and as described. If something isn't right, your first remedy is
          repeat performance at our cost, then an appropriate price reduction. These rights are in
          addition to our guarantee, not replaced by it.
        </p>

        <h2>Guarantee</h2>
        <p>
          Hard landscaping workmanship carries a <strong>5-year guarantee</strong> from completion,
          covering defects arising from installation. Manufacturer warranties (e.g. 25-year composite
          board, 10-year turf UV) pass to you at handover. The guarantee doesn't cover misuse, ground
          movement outside our control, or plant establishment where aftercare instructions aren't followed.
        </p>

        <h2>Site safety — CDM 2015</h2>
        <p>
          Construction-phase health and safety on every project is managed in accordance with the
          <strong> Construction (Design and Management) Regulations 2015</strong>. For domestic
          projects, client duties under CDM transfer to us as contractor by default — method
          statements, risk assessments and a named site lead are standard paperwork, not extras.
        </p>

        <h2>Waste & materials</h2>
        <p>
          We clear waste from site and dispose of it responsibly. Materials remain our property
          until paid for in full.
        </p>

        <h2>Disputes</h2>
        <p>
          If a dispute can't be resolved directly, we'll engage with an appropriate alternative
          dispute resolution scheme before anything escalates. Nothing in these terms reduces your
          statutory rights.
        </p>
      </div>
    </div>
  );
}
