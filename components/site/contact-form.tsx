"use client";

import { useState } from "react";
import Link from "next/link";
import { projectTypeOptions, budgetOptions, timelineOptions } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackEvent, EVENTS } from "@/lib/analytics";

type Status = "idle" | "sending" | "done" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [inArea, setInArea] = useState<boolean | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      postcode: String(fd.get("postcode") || ""),
      project_type: String(fd.get("project_type") || "other"),
      budget_band: String(fd.get("budget_band") || "unsure"),
      timeline: String(fd.get("timeline") || "exploring"),
      message: String(fd.get("message") || ""),
      consent: fd.get("consent") === "on",
      source: "form",
      referred_by:
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("ref") || ""
          : "",
      company: String(fd.get("company") || ""), // honeypot
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) {
        setError(j.error || "Something went sideways — try again or just phone us.");
        setStatus("error");
        return;
      }
      setInArea(j.in_area);
      setStatus("done");
      trackEvent(EVENTS.generateLead, { source: "form", in_area: j.in_area });
    } catch {
      setError("Network hiccup — try again or phone us.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="border border-moss-600/60 bg-moss-600/10 p-8" role="status">
        <p className="font-display text-2xl text-bone-50">Received — properly.</p>
        <p className="text-[14.5px] text-stone-400 mt-3 leading-relaxed">
          {inArea === false
            ? "Your postcode sits outside our current 20-mile radius, so we've filed you on the expansion list — you'll hear from us the moment coverage grows rather than getting a quote we can't honour."
            : "We'll come back within one working day. Want to skip a step? Complete your project brief now — photos, rough sizes, a sketch — and the survey arrives already knowing your garden."}
        </p>
        {inArea !== false && (
          <Link
            href="/portal"
            className="inline-flex mt-5 items-center h-11 px-6 bg-brass-500 hover:bg-brass-400 text-forge-950 text-[11.5px] font-semibold uppercase tracking-[0.14em] rounded-[2px] transition-colors"
          >
            Complete your brief
          </Link>
        )}
      </div>
    );
  }

  const label = "microlabel block mb-2";

  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
      {/* honeypot — invisible to humans */}
      <div className="absolute -left-[9999px] top-auto" aria-hidden>
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="cf-name" className={label}>Name</label>
        <input id="cf-name" name="name" className="field" autoComplete="name" maxLength={120} />
      </div>
      <div>
        <label htmlFor="cf-email" className={label}>Email *</label>
        <input id="cf-email" name="email" type="email" required className="field" autoComplete="email" maxLength={254} />
      </div>
      <div>
        <label htmlFor="cf-phone" className={label}>Phone</label>
        <input id="cf-phone" name="phone" type="tel" className="field" autoComplete="tel" maxLength={30} />
      </div>
      <div>
        <label htmlFor="cf-postcode" className={label}>Postcode *</label>
        <input id="cf-postcode" name="postcode" required className="field" autoComplete="postal-code" placeholder="WD17 1AB" maxLength={10} />
      </div>
      <div>
        <label htmlFor="cf-type" className={label}>Project</label>
        <select id="cf-type" name="project_type" className="field">
          {projectTypeOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label htmlFor="cf-budget" className={label}>Budget</label>
          <select id="cf-budget" name="budget_band" className="field">
            {budgetOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cf-when" className={label}>Timeline</label>
          <select id="cf-when" name="timeline" className="field">
            {timelineOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="cf-msg" className={label}>Tell us about the space</label>
        <textarea id="cf-msg" name="message" rows={5} className="field resize-y" maxLength={2000} placeholder="Rough size, what's there now, what you want it to become…" />
      </div>

      <label className="sm:col-span-2 flex items-start gap-3 text-[13px] text-stone-400 leading-relaxed cursor-pointer">
        <input type="checkbox" name="consent" required className="mt-1 accent-[#b08a49]" />
        <span>
          I'm happy for Forged Landscapes to contact me about this enquiry. Data is
          handled per the{" "}
          <Link href="/privacy" className="text-brass-300 underline underline-offset-2">privacy policy</Link>{" "}
          and never sold. *
        </span>
      </label>

      {error && (
        <p className={cn("sm:col-span-2 text-[13px] text-danger")} role="alert">{error}</p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={status === "sending"} className="w-full sm:w-auto">
          {status === "sending" ? "Sending…" : "Send enquiry"}
        </Button>
      </div>
    </form>
  );
}
