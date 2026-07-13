"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getBrowserSupabase, supabaseConfigured } from "@/lib/supabase";
import { BriefWizard } from "@/components/portal/brief-wizard";
import { Button } from "@/components/ui/button";

type Stage =
  | { name: "booting" }
  | { name: "preview-gate" }
  | { name: "preview-run" }
  | { name: "signin"; sending?: boolean; sent?: boolean; error?: string }
  | { name: "authed"; client: SupabaseClient; session: Session };

export function PortalClient() {
  const params = useSearchParams();
  const [stage, setStage] = useState<Stage>({ name: "booting" });
  const [email, setEmail] = useState("");

  useEffect(() => {
    const prefill = params.get("email");
    if (prefill) setEmail(prefill);

    if (!supabaseConfigured()) {
      setStage({ name: "preview-gate" });
      return;
    }
    const client = getBrowserSupabase()!;
    client.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStage({ name: "authed", client, session: data.session });
      } else {
        setStage({ name: "signin" });
      }
    });
    const { data: sub } = client.auth.onAuthStateChange((_evt, session) => {
      if (session) setStage({ name: "authed", client, session });
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const client = getBrowserSupabase();
    if (!client || !email.trim()) return;
    setStage({ name: "signin", sending: true });
    const { error } = await client.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/portal` },
    });
    if (error) {
      setStage({
        name: "signin",
        error:
          error.message.includes("rate") || error.status === 429
            ? "Email limit reached for the moment — try again in an hour, or just phone us."
            : "Couldn't send the link — check the address and try again.",
      });
      return;
    }
    setStage({ name: "signin", sent: true });
  }

  /* ————— render per stage ————— */

  if (stage.name === "booting") {
    return (
      <Shell>
        <p className="text-stone-500 text-sm animate-pulse">Opening the portal…</p>
      </Shell>
    );
  }

  if (stage.name === "preview-gate") {
    return (
      <Shell>
        <div className="max-w-lg">
          <p className="microlabel microlabel-brass">Preview build</p>
          <h1 className="font-display text-4xl text-bone-50 mt-4">The client portal</h1>
          <p className="text-[14.5px] text-stone-400 mt-4 leading-relaxed">
            The database isn't connected in this preview, so the full brief runs in
            demo mode — every step works exactly as clients will see it, nothing is
            stored, and sign-in is skipped. Once Supabase is attached, this same page
            becomes magic-link sign-in with autosaving briefs.
          </p>
          <Button size="lg" className="mt-7" onClick={() => setStage({ name: "preview-run" })}>
            Try the brief in demo mode
          </Button>
        </div>
      </Shell>
    );
  }

  if (stage.name === "preview-run") {
    return (
      <div className="mx-auto max-w-6xl px-5 md:px-10 py-10">
        <div className="mb-8 border border-brass-600/40 bg-brass-500/5 px-4 py-3 text-[12.5px] text-brass-300">
          Demo mode — fully interactive, nothing is saved or sent.
        </div>
        <BriefWizard backend={{ mode: "preview" }} />
      </div>
    );
  }

  if (stage.name === "signin") {
    return (
      <Shell>
        <div className="max-w-md w-full">
          <p className="microlabel microlabel-brass">Client portal</p>
          <h1 className="font-display text-4xl text-bone-50 mt-4">
            Your brief, your <em className="display-italic text-brass-300">terms</em>.
          </h1>
          <p className="text-[14px] text-stone-400 mt-4 leading-relaxed">
            No passwords. Enter your email and we'll send a secure one-time link —
            your brief autosaves against it, so you can start now and finish on
            another sofa.
          </p>

          {stage.sent ? (
            <div className="mt-7 border border-moss-600/60 bg-moss-600/10 p-6" role="status">
              <p className="text-moss-400 font-semibold text-[15px]">Link sent — check your inbox.</p>
              <p className="text-stone-400 text-[13px] mt-2 leading-relaxed">
                It's from Forged Landscapes and lands within a minute or two.
                Open it on this device to continue where you are.
              </p>
            </div>
          ) : (
            <form onSubmit={sendLink} className="mt-7">
              <label htmlFor="portal-email" className="microlabel block mb-2">Email</label>
              <div className="flex gap-2">
                <input
                  id="portal-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="field flex-1"
                  placeholder="you@email.co.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" disabled={stage.sending}>
                  {stage.sending ? "Sending…" : "Send link"}
                </Button>
              </div>
              {stage.error && (
                <p className="mt-3 text-[13px] text-danger" role="alert">{stage.error}</p>
              )}
              <p className="mt-4 text-[11.5px] text-stone-600 leading-relaxed">
                The link signs you in and creates your account in one step. Data is
                used only for your project — never marketing lists.
              </p>
            </form>
          )}
        </div>
      </Shell>
    );
  }

  // authed
  return (
    <div className="mx-auto max-w-6xl px-5 md:px-10 py-10">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="microlabel microlabel-brass">Project brief</p>
          <h1 className="font-display text-3xl text-bone-50 mt-1.5">
            Five minutes that save a fortnight.
          </h1>
        </div>
        <button
          className="text-[12px] text-stone-500 hover:text-bone-100 transition-colors cursor-pointer underline-offset-4 hover:underline"
          onClick={async () => {
            await stage.client.auth.signOut();
            setStage({ name: "signin" });
          }}
        >
          Sign out ({stage.session.user.email})
        </button>
      </div>
      <BriefWizard
        backend={{ mode: "real", client: stage.client, user: stage.session.user }}
        initialEmail={stage.session.user.email || undefined}
      />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-5 md:px-10 py-24 flex justify-center">
      {children}
    </div>
  );
}
