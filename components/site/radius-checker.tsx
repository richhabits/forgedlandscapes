"use client";

import { useState } from "react";
import Link from "next/link";
import type { RadiusCheck } from "@/lib/geo";
import { checkServiceAreaClient } from "@/lib/geo-client";
import { Button, buttonClass } from "@/components/ui/button";
import { site } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/** Instant postcode → radius verdict. Runs client-side against postcodes.io. */
export function RadiusChecker({ className }: { className?: string }) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<RadiusCheck | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || state === "loading") return;
    setState("loading");
    const r = await checkServiceAreaClient(value);
    setResult(r);
    setState("done");
  }

  return (
    <div className={className}>
      <form onSubmit={run} className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Your postcode — e.g. WD17 1AB"
          aria-label="Postcode"
          autoComplete="postal-code"
          className="field flex-1"
          maxLength={10}
        />
        <Button type="submit" disabled={state === "loading"}>
          {state === "loading" ? "Checking…" : "Check"}
        </Button>
      </form>

      {result && state === "done" && (
        <div
          role="status"
          className={cn(
            "mt-4 border p-4 text-sm leading-relaxed",
            result.status === "in" && "border-moss-600/60 bg-moss-600/10",
            result.status === "out" && "border-brass-600/50 bg-brass-500/5",
            (result.status === "invalid" || result.status === "error") &&
              "border-danger/50 bg-danger/10"
          )}
        >
          {result.status === "in" && (
            <>
              <p className="text-moss-400 font-semibold">
                You're covered — {result.distanceMiles} miles from our Watford base.
              </p>
              <p className="text-stone-400 mt-1.5">
                {result.place} is comfortably inside the {site.radiusMiles}-mile radius.
                Start your project brief and we'll take it from there.
              </p>
              <Link href="/portal" className={cn(buttonClass({ size: "sm" }), "mt-3")}>
                Start your brief
              </Link>
            </>
          )}
          {result.status === "out" && (
            <>
              <p className="text-brass-300 font-semibold">
                Just outside the patch — {result.distanceMiles} miles from base.
              </p>
              <p className="text-stone-400 mt-1.5">
                We hold a strict {site.radiusMiles}-mile radius so our quotes stay honest.
                Leave your details on the contact page and you'll hear first as coverage grows.
              </p>
            </>
          )}
          {(result.status === "invalid" || result.status === "error") && (
            <p className="text-danger">{result.reason}</p>
          )}
        </div>
      )}
    </div>
  );
}
