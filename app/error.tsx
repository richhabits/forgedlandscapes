"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportError } from "@/lib/observability";
import { site } from "@/lib/site-config";

/** Segment-level error boundary — friendly recovery, and the error is reported. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(error, { boundary: "page", digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-[60svh] grid place-items-center px-5 py-24 text-center">
      <div className="max-w-md">
        <p className="microlabel microlabel-brass">Something went wrong</p>
        <h1 className="font-display text-4xl text-bone-50 mt-4">A hiccup on our end.</h1>
        <p className="text-[14.5px] text-stone-400 mt-4 leading-relaxed">
          Sorry — that didn't load as it should. Try again, or reach us directly and we'll sort it.
        </p>
        <div className="mt-7 flex flex-wrap gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center h-11 px-6 bg-brass-500 hover:bg-brass-400 text-forge-950 text-[11.5px] font-semibold uppercase tracking-[0.14em] rounded-[2px] transition-colors cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center h-11 px-6 border rule text-bone-100 text-[11.5px] font-semibold uppercase tracking-[0.14em] rounded-[2px] hover:border-bone-100/35 transition-colors"
          >
            Back to home
          </Link>
        </div>
        <p className="mt-6 text-[12px] text-stone-600">
          Or call <a href={site.phoneHref} className="text-brass-300">{site.phone}</a>
        </p>
      </div>
    </div>
  );
}
