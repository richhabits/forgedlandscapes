"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageSquareText, X, ArrowUpRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkServiceAreaClient } from "@/lib/geo-client";
import {
  scriptedCopy,
  projectTypeOptions,
  budgetOptions,
  timelineOptions,
  type AssessorStep,
} from "@/lib/assessor";
import { buttonClass } from "@/components/ui/button";

type Msg = { role: "user" | "assistant"; content: string };
type Mode = "ai" | "scripted" | "unknown";

type LeadData = {
  project_type?: string;
  budget_band?: string;
  timeline?: string;
  postcode?: string;
  in_area?: boolean;
  distance_miles?: number;
  email?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function AssessorWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("unknown");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [step, setStep] = useState<AssessorStep>("service");
  const [data, setData] = useState<LeadData>({});
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const append = useCallback((m: Msg) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  // boot conversation on first open
  useEffect(() => {
    if (!open || messages.length > 0) return;
    let cancelled = false;
    (async () => {
      let detected: Mode = "scripted";
      try {
        const res = await fetch("/api/chat", { method: "GET" });
        const j = await res.json();
        detected = j.mode === "ai" ? "ai" : "scripted";
      } catch {
        detected = "scripted";
      }
      if (cancelled) return;
      setMode(detected);
      append({ role: "assistant", content: scriptedCopy.intro });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages, busy]);

  /* ————— scripted engine ————— */

  const say = useCallback(
    (content: string, delay = 420) =>
      new Promise<void>((resolve) => {
        setBusy(true);
        setTimeout(() => {
          append({ role: "assistant", content });
          setBusy(false);
          resolve();
        }, delay);
      }),
    [append]
  );

  async function submitLead(email: string, transcript: Msg[]) {
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          postcode: data.postcode || "",
          project_type: data.project_type || "other",
          budget_band: data.budget_band || "unsure",
          timeline: data.timeline || "exploring",
          source: mode === "ai" ? "assessor_ai" : "assessor",
          consent: true,
          transcript: transcript.slice(-40),
          company: "",
        }),
      });
      const j = await res.json().catch(() => ({}));
      return { ok: res.ok, portalUrl: j.portalUrl as string | undefined };
    } catch {
      return { ok: false, portalUrl: undefined };
    }
  }

  async function scriptedHandle(userText: string) {
    const t = [...messages, { role: "user" as const, content: userText }];

    if (step === "postcode") {
      await say(scriptedCopy.postcode_checking, 250);
      const r = await checkServiceAreaClient(userText);
      if (r.status === "invalid") return say(scriptedCopy.invalid_postcode);
      if (r.status === "error") return say(scriptedCopy.lookup_error);
      setData((d) => ({
        ...d,
        postcode: r.postcode,
        in_area: r.status === "in",
        distance_miles: r.distanceMiles,
      }));
      setStep("email");
      return say(
        r.status === "in"
          ? scriptedCopy.in_area(r.place, r.distanceMiles)
          : scriptedCopy.out_of_area(r.distanceMiles)
      );
    }

    if (step === "email") {
      if (!EMAIL_RE.test(userText.trim()))
        return say(scriptedCopy.email_invalid);
      const email = userText.trim();
      setData((d) => ({ ...d, email }));
      setBusy(true);
      const { portalUrl: url } = await submitLead(email, t);
      setBusy(false);
      setStep("done");
      if (data.in_area) {
        setPortalUrl(url || "/portal");
        return say(scriptedCopy.email_done_in, 300);
      }
      return say(scriptedCopy.email_done_out, 300);
    }

    // free text during chip steps — nudge politely
    return say(
      step === "service"
        ? "Pick the closest match below — it keeps things quick."
        : "The options below cover it — rough is fine."
    );
  }

  /* ————— AI engine ————— */

  async function aiHandle(userText: string) {
    const outbound = [...messages, { role: "user" as const, content: userText }];
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: outbound.slice(-24), company: "" }),
      });
      if (!res.ok) throw new Error("chat failed");
      const j = (await res.json()) as {
        message: string;
        portalUrl?: string;
        leadSaved?: boolean;
      };
      append({ role: "assistant", content: j.message });
      if (j.portalUrl) {
        setPortalUrl(j.portalUrl);
        setStep("done");
      }
    } catch {
      // AI failed mid-conversation → degrade to scripted, lose nothing
      setMode("scripted");
      append({
        role: "assistant",
        content:
          "My clever half dropped the connection — no matter, the old-fashioned way works. " +
          (step === "service" ? "What are we building?" : "Where were we…"),
      });
    } finally {
      setBusy(false);
    }
  }

  /* ————— shared send ————— */

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    append({ role: "user", content: clean });
    setInput("");
    if (mode === "ai") return aiHandle(clean);
    return scriptedHandle(clean);
  }

  async function chipPick(kind: "service" | "budget" | "timeline", value: string, label: string) {
    if (busy) return;
    append({ role: "user", content: label });

    if (mode === "ai") {
      // chips are just fast text in AI mode
      return aiHandle(label);
    }

    if (kind === "service") {
      setData((d) => ({ ...d, project_type: value }));
      setStep("timing");
      await say(scriptedCopy.service_ack(label), 350);
      return say(scriptedCopy.timing, 500);
    }
    if (kind === "budget") {
      setData((d) => ({ ...d, budget_band: value }));
      if (data.timeline) {
        setStep("postcode");
        return say(scriptedCopy.postcode, 450);
      }
      return;
    }
    if (kind === "timeline") {
      setData((d) => ({ ...d, timeline: value }));
      if (data.budget_band) {
        setStep("postcode");
        return say(scriptedCopy.postcode, 450);
      }
    }
  }

  const showServiceChips = step === "service" && !busy;
  const showTimingChips = step === "timing" && !busy;
  const showTextInput = mode === "ai" || step === "postcode" || step === "email";

  /* ————— render ————— */

  return (
    <>
      {/* trigger */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-5 right-5 z-[60] flex items-center gap-2.5 rounded-full bg-brass-500 hover:bg-brass-400 text-forge-950 pl-4 pr-5 h-12 shadow-xl shadow-black/40 transition-all cursor-pointer",
          open && "scale-0 opacity-0 pointer-events-none"
        )}
        aria-label="Open the project assessor"
      >
        <MessageSquareText className="size-4.5" aria-hidden />
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em]">
          Plan your project
        </span>
      </button>

      {/* panel */}
      <div
        role="dialog"
        aria-label="Forged Landscapes project assessor"
        className={cn(
          "fixed z-[65] transition-all duration-300 ease-out",
          "inset-0 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[392px] sm:h-[600px] sm:max-h-[calc(100vh-40px)]",
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6 pointer-events-none"
        )}
      >
        <div className="flex flex-col h-full bg-forge-900 border rule-strong sm:shadow-2xl sm:shadow-black/60 overflow-hidden">
          {/* head */}
          <div className="flex items-center justify-between px-5 h-16 border-b rule bg-forge-950 shrink-0">
            <div>
              <p className="font-display text-lg text-bone-50 leading-none">
                Project assessor
              </p>
              <p className="microlabel mt-1 !text-[9px]">
                Forged Landscapes · Watford
                {mode === "scripted" && messages.length > 0 ? " · guided" : ""}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 text-stone-400 hover:text-bone-100 transition-colors"
              aria-label="Close assessor"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto thin-scroll px-4 py-5 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] px-3.5 py-2.5 text-[13.5px] leading-relaxed rounded-[2px]",
                  m.role === "assistant"
                    ? "bg-forge-800 text-bone-100 border-l-2 border-brass-500"
                    : "ml-auto bg-brass-500/12 text-bone-200 border border-brass-500/25"
                )}
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="bg-forge-800 border-l-2 border-brass-500 px-3.5 py-3 w-16 rounded-[2px]" aria-label="Assessor is typing">
                <span className="inline-flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="size-1.5 rounded-full bg-stone-400 animate-pulse"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </span>
              </div>
            )}

            {portalUrl && step === "done" && (
              <Link
                href={portalUrl}
                className={cn(buttonClass({ size: "lg" }), "w-full mt-2")}
              >
                Open your project portal
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            )}
          </div>

          {/* chips */}
          {(showServiceChips || showTimingChips) && (
            <div className="px-4 pb-3 flex flex-wrap gap-2 shrink-0">
              {showServiceChips &&
                projectTypeOptions.map((o) => (
                  <Chip key={o.value} onClick={() => chipPick("service", o.value, o.label)}>
                    {o.label}
                  </Chip>
                ))}
              {showTimingChips && (
                <>
                  {!data.timeline &&
                    timelineOptions.map((o) => (
                      <Chip key={o.value} onClick={() => chipPick("timeline", o.value, o.label)}>
                        {o.label}
                      </Chip>
                    ))}
                  {!data.budget_band &&
                    budgetOptions.map((o) => (
                      <Chip key={o.value} muted onClick={() => chipPick("budget", o.value, o.label)}>
                        {o.label}
                      </Chip>
                    ))}
                </>
              )}
            </div>
          )}

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 p-4 pt-2 border-t rule bg-forge-950/60 shrink-0"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!showTextInput || step === "done"}
              placeholder={
                step === "done"
                  ? "All done — no obligation"
                  : step === "postcode"
                    ? "e.g. WD17 1AB"
                    : step === "email"
                      ? "you@email.co.uk"
                      : mode === "ai"
                        ? "Type a message…"
                        : "Use the options above"
              }
              aria-label="Message the assessor"
              className="field flex-1 !py-2.5"
              type={step === "email" && mode !== "ai" ? "email" : "text"}
              autoComplete={step === "email" ? "email" : step === "postcode" ? "postal-code" : "off"}
            />
            <button
              type="submit"
              disabled={!showTextInput || busy || step === "done"}
              className={cn(buttonClass({ size: "md" }), "!px-3.5")}
              aria-label="Send"
            >
              <Send className="size-4" aria-hidden />
            </button>
          </form>
          <p className="px-4 pb-3 text-[10px] text-stone-600 bg-forge-950/60 shrink-0">
            No obligation. Your details are used only to handle this enquiry —{" "}
            <Link href="/privacy" className="underline underline-offset-2">privacy</Link>.
          </p>
        </div>
      </div>
    </>
  );
}

function Chip({
  children,
  onClick,
  muted = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  muted?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-[12px] border rounded-full transition-colors cursor-pointer",
        muted
          ? "border-bone-100/15 text-stone-400 hover:border-brass-400 hover:text-brass-300"
          : "border-brass-500/40 text-bone-100 hover:bg-brass-500/10 hover:border-brass-400"
      )}
    >
      {children}
    </button>
  );
}
