"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminBrowserSupabase } from "@/lib/supabase-browser";
import { supabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

type State =
  | { name: "loading" }
  | { name: "demo" }
  | { name: "form"; sending?: boolean; sent?: boolean; error?: string }
  | { name: "not-admin"; email: string };

/**
 * Admin magic-link sign-in. Reuses the same passwordless flow as the portal,
 * but stores the session in cookies (via the SSR browser client) so the
 * server can gate /admin before render. If a signed-in user isn't an admin,
 * we say so plainly and offer sign-out — the redirect already bounced them.
 */
export function AdminLogin() {
  const router = useRouter();
  const [state, setState] = useState<State>({ name: "loading" });
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!supabaseConfigured()) {
      setState({ name: "demo" });
      return;
    }
    const client = getAdminBrowserSupabase();
    if (!client) {
      setState({ name: "demo" });
      return;
    }
    client.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: isAdmin } = await client.rpc("is_admin");
        if (isAdmin) {
          router.replace("/admin");
          router.refresh();
        } else {
          setState({ name: "not-admin", email: data.user.email ?? "" });
        }
      } else {
        setState({ name: "form" });
      }
    });
    const { data: sub } = client.auth.onAuthStateChange((_e, session) => {
      if (session) {
        router.replace("/admin");
        router.refresh();
      }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const client = getAdminBrowserSupabase();
    if (!client || !email.trim()) return;
    setState({ name: "form", sending: true });
    const { error } = await client.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    if (error) {
      setState({
        name: "form",
        error:
          error.message.includes("rate") || error.status === 429
            ? "Email limit reached for the moment — try again in an hour."
            : "Couldn't send the link — check the address and try again.",
      });
      return;
    }
    setState({ name: "form", sent: true });
  }

  if (state.name === "loading") {
    return <p className="text-stone-500 text-sm animate-pulse">Checking access…</p>;
  }

  if (state.name === "demo") {
    return (
      <div className="max-w-md">
        <p className="microlabel microlabel-brass">Admin · preview</p>
        <h1 className="font-display text-4xl text-bone-50 mt-4">Back office</h1>
        <p className="text-[14.5px] text-stone-400 mt-4 leading-relaxed">
          Supabase isn't connected in this preview, so the console opens in demo mode with
          sample leads and briefs — no sign-in needed. Once the database is attached, this
          page becomes admin magic-link sign-in, gated to approved accounts only.
        </p>
        <Button size="lg" className="mt-7" onClick={() => router.push("/admin")}>
          Open the console (demo)
        </Button>
      </div>
    );
  }

  if (state.name === "not-admin") {
    return (
      <div className="max-w-md">
        <p className="microlabel microlabel-brass">Admin</p>
        <h1 className="font-display text-4xl text-bone-50 mt-4">Not an admin account</h1>
        <p className="text-[14px] text-stone-400 mt-4 leading-relaxed">
          You're signed in as <span className="text-bone-100">{state.email}</span>, but this
          account isn't on the admin list. If that's a mistake, ask the owner to add you.
        </p>
        <Button
          variant="outline"
          size="lg"
          className="mt-7"
          onClick={async () => {
            await getAdminBrowserSupabase()?.auth.signOut();
            setState({ name: "form" });
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full">
      <p className="microlabel microlabel-brass">Admin</p>
      <h1 className="font-display text-4xl text-bone-50 mt-4">Back office sign-in</h1>
      <p className="text-[14px] text-stone-400 mt-4 leading-relaxed">
        No passwords. Enter your admin email and we'll send a secure one-time link.
      </p>

      {state.sent ? (
        <div className="mt-7 border border-moss-600/60 bg-moss-600/10 p-6" role="status">
          <p className="text-moss-400 font-semibold text-[15px]">Link sent — check your inbox.</p>
          <p className="text-stone-400 text-[13px] mt-2 leading-relaxed">
            Open it on this device to land straight in the console.
          </p>
        </div>
      ) : (
        <form onSubmit={sendLink} className="mt-7">
          <label htmlFor="admin-email" className="microlabel block mb-2">Admin email</label>
          <div className="flex gap-2">
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              className="field flex-1"
              placeholder="you@email.co.uk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" disabled={state.sending}>
              {state.sending ? "Sending…" : "Send link"}
            </Button>
          </div>
          {state.error && <p className="mt-3 text-[13px] text-danger" role="alert">{state.error}</p>}
        </form>
      )}
    </div>
  );
}
