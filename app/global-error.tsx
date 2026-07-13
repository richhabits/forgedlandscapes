"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/observability";

/** Root error boundary — replaces the whole document if the layout itself throws. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(error, { boundary: "global", digest: error.digest });
  }, [error]);

  return (
    <html lang="en-GB">
      <body style={{ margin: 0, background: "#10140f", color: "#ede6d6", fontFamily: "Georgia, serif", minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: "24px" }}>
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 32, color: "#f4efe4", margin: "0 0 12px" }}>Something went wrong</h1>
          <p style={{ fontSize: 15, color: "#a89f8c", lineHeight: 1.6 }}>
            Sorry — the site hit an unexpected error. Please try again.
          </p>
          <button
            onClick={reset}
            style={{ marginTop: 20, height: 44, padding: "0 24px", background: "#b08a49", color: "#10140f", border: 0, borderRadius: 2, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 12, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
