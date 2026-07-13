import { Resend } from "resend";
import { site } from "@/lib/site-config";

/**
 * Resend integration — degrades gracefully to a no-op when the key is absent,
 * so the lead pipeline never depends on email being configured.
 *
 * Free-tier note: until a sending domain is verified in Resend, mail can only
 * go from onboarding@resend.dev to the account owner's own inbox — which is
 * exactly what the admin alerts need. Client confirmations start flowing once
 * the domain is verified. 100 emails/day on free.
 */

const FROM =
  process.env.EMAIL_FROM || `Forged Landscapes <onboarding@resend.dev>`;

type SendResult = { sent: boolean; skipped?: string; error?: string };

async function send(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, skipped: "RESEND_API_KEY not set" };
  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "send failed" };
  }
}

/* ——— shared shell: light background for email-client sanity, brass accents ——— */

function shell(title: string, rows: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4efe4;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="border-bottom:2px solid #b08a49;padding-bottom:14px;margin-bottom:22px;">
      <div style="font-size:22px;color:#10140f;letter-spacing:-0.01em;">Forged <em>Landscapes</em></div>
      <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8a8272;margin-top:4px;">Watford · Hertfordshire · 20-mile radius</div>
    </div>
    <h1 style="font-size:19px;font-weight:normal;color:#10140f;margin:0 0 18px;">${title}</h1>
    <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;color:#333;">${rows}</table>
    <div style="font-family:Arial,sans-serif;font-size:11px;color:#8a8272;margin-top:26px;border-top:1px solid #e0d7c2;padding-top:12px;">
      Forged Landscapes · ${site.hours} · <a href="${site.url}" style="color:#93713a;">${site.domain}</a>
    </div>
  </div></body></html>`;
}

function row(label: string, value: string) {
  return `<tr><td style="padding:7px 12px 7px 0;color:#8a8272;text-transform:uppercase;font-size:10px;letter-spacing:1px;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:7px 0;color:#10140f;">${value}</td></tr>`;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ——— templates ——— */

export async function sendAdminLeadAlert(lead: {
  email: string;
  name?: string | null;
  phone?: string | null;
  postcode: string;
  project_type: string;
  budget_band: string;
  timeline: string;
  in_area: boolean | null;
  distance_miles: number | null;
  source: string;
  message?: string | null;
}): Promise<SendResult> {
  const rows = [
    row("Name", esc(lead.name || "—")),
    row("Email", `<a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a>`),
    row("Phone", esc(lead.phone || "—")),
    row("Postcode", `${esc(lead.postcode)} ${lead.in_area === false ? "· <strong style='color:#c25b4e'>OUT OF AREA</strong>" : lead.distance_miles != null ? `· ${lead.distance_miles} mi from base` : ""}`),
    row("Project", esc(lead.project_type.replace(/_/g, " "))),
    row("Budget", esc(lead.budget_band.replace(/_/g, " "))),
    row("Timeline", esc(lead.timeline.replace(/_/g, " "))),
    row("Source", esc(lead.source)),
    lead.message ? row("Message", esc(lead.message)) : "",
  ].join("");
  return send({
    to: site.adminEmail,
    subject: `New lead — ${lead.postcode} · ${lead.project_type.replace(/_/g, " ")}`,
    html: shell("New enquiry in the pipeline", rows),
    replyTo: lead.email,
  });
}

/** Instant acknowledgement to the customer the moment they enquire (speed-to-lead). */
export async function sendClientLeadAck(
  to: string,
  opts: { name?: string | null; in_area: boolean | null }
): Promise<SendResult> {
  const greeting = opts.name ? `${esc(opts.name.split(" ")[0])} — thank` : "Thank";
  const body =
    opts.in_area === false
      ? `${greeting} you for getting in touch. Your postcode sits just outside the 20-mile radius we work to around Watford, so we've added you to our waitlist — as we take on more crews the radius grows, and we'll come back to you first if it does. If it's a larger project, do reply and we'll take a proper look.`
      : `${greeting} you for getting in touch. We've received your enquiry and a real person will come back to you <strong>within one working day</strong>.<br/><br/>Want to speed things up? Complete your project brief — a few photos, rough sizes, a quick sketch — and your survey arrives already knowing your garden.`;
  const rows = `<tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#333;line-height:1.7;">
    ${body}<br/><br/>
    <strong>Forged Landscapes</strong> · <a href="${site.phoneHref}" style="color:#93713a;">${site.phone}</a> · ${site.hours}
  </td></tr>`;
  return send({
    to,
    subject: "We've got your enquiry — Forged Landscapes",
    html: shell("Enquiry received", rows),
    replyTo: site.adminEmail,
  });
}

export async function sendAdminBriefAlert(brief: {
  email: string;
  title: string;
  project_type: string;
  area_m2: number | null;
  media_count: number;
  postcode: string | null;
}): Promise<SendResult> {
  const rows = [
    row("Client", `<a href="mailto:${esc(brief.email)}">${esc(brief.email)}</a>`),
    row("Project", esc(brief.title || brief.project_type.replace(/_/g, " "))),
    row("Postcode", esc(brief.postcode || "—")),
    row("Approx. area", brief.area_m2 ? `${brief.area_m2} m²` : "—"),
    row("Files uploaded", String(brief.media_count)),
  ].join("");
  return send({
    to: site.adminEmail,
    subject: `Brief submitted — ${brief.postcode || brief.email}`,
    html: shell("A client has completed their project brief", rows),
    replyTo: brief.email,
  });
}

/* ——— admin-triggered templated replies ——— */

export type ReplyTemplate = "book_call" | "survey_slots" | "out_of_area";

const REPLY_COPY: Record<ReplyTemplate, { subject: string; heading: string; body: string }> = {
  book_call: {
    subject: "Let's book your 15-minute call — Forged Landscapes",
    heading: "A quick call to talk it through",
    body: "Thanks for getting in touch. The next step is a short 15-minute call so we can understand the space, answer your questions and — if it's a fit — line up a site survey.<br/><br/>Reply with a couple of times that suit you this week, or call us on the number below and we'll sort it on the spot.",
  },
  survey_slots: {
    subject: "Your site survey — a few slots — Forged Landscapes",
    heading: "Let's get the survey in the diary",
    body: "Ready to measure up properly. A survey takes about 45 minutes: we take levels and measurements, look at access and drainage, and bring material samples so you can see the real thing.<br/><br/>Reply with which of these suits and we'll confirm: mornings or afternoons, and your best day this week or next. Nothing is owed at survey stage.",
  },
  out_of_area: {
    subject: "You're just outside our patch — but noted — Forged Landscapes",
    heading: "Slightly beyond our 20-mile radius",
    body: "Thank you for thinking of us. Your postcode sits just outside the 20-mile radius we work to around Watford, so we can't commit to the build right now.<br/><br/>We've added you to our waitlist — as we take on more crews we do extend the radius, and we'll come back to you first if that changes. If it's a larger project, do reply and we'll take a proper look.",
  },
};

export async function sendLeadReplyTemplate(
  template: ReplyTemplate,
  lead: { email: string; name?: string | null }
): Promise<SendResult> {
  const copy = REPLY_COPY[template];
  const greeting = lead.name ? `${esc(lead.name.split(" ")[0])} — ` : "";
  const rows = `<tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#333;line-height:1.7;">
    ${greeting}${copy.body}
  </td></tr>`;
  return send({
    to: lead.email,
    subject: copy.subject,
    html: shell(copy.heading, rows),
  });
}

export async function sendClientBriefReviewed(to: string, firstName?: string | null): Promise<SendResult> {
  const rows = `<tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#333;line-height:1.7;">
    ${firstName ? `${esc(firstName)} — good` : "Good"} news: we've been through your brief — the photos, dimensions and sketch — and it's exactly what we need to move forward.<br/><br/>
    The next step is a quick call to confirm the details and book your site survey. Reply with a couple of times that work, or call us on the number below.<br/><br/>
    Nothing is booked or owed yet. When you do go ahead, any agreement comes with the statutory 14-day cancellation period under the Consumer Contracts Regulations 2013.
  </td></tr>`;
  return send({
    to,
    subject: "We've reviewed your brief — Forged Landscapes",
    html: shell("Your brief has been reviewed", rows),
  });
}

export async function sendClientBriefConfirmation(to: string, firstName?: string | null): Promise<SendResult> {
  const rows = `<tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#333;line-height:1.7;">
    ${firstName ? `${esc(firstName)} — thank` : "Thank"} you for completing your project brief. Here's what happens next:<br/><br/>
    <strong>1. Review (1 working day)</strong> — we go through your photos, dimensions and sketch.<br/>
    <strong>2. A 15-minute call</strong> — to talk through options and confirm the survey.<br/>
    <strong>3. Site survey</strong> — measured properly, materials samples in hand.<br/>
    <strong>4. Itemised written quote</strong> — fixed pricing, no day-rate guesswork.<br/><br/>
    Nothing is booked or owed at this stage. As an off-premises consumer contract, any agreement you later sign comes with the statutory 14-day cancellation period under the Consumer Contracts Regulations 2013.
  </td></tr>`;
  return send({
    to,
    subject: "Your project brief has reached us — Forged Landscapes",
    html: shell("Brief received", rows),
  });
}
