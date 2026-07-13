/**
 * Minimal observability seam. Always logs; forwards to Sentry when a DSN is
 * configured (set NEXT_PUBLIC_SENTRY_DSN / SENTRY_DSN and add @sentry/nextjs to
 * light up full tracing). Zero dependency, zero cost until then — so error
 * boundaries and API routes have one consistent place to report.
 */
type Extra = Record<string, unknown>;

export function reportError(error: unknown, extra?: Extra) {
  const err = error instanceof Error ? error : new Error(String(error));
  // Always visible in Vercel logs.
  console.error("[error]", err.message, extra ?? "", err.stack ?? "");

  // Best-effort forward to Sentry's ingestion if a DSN is present (no SDK needed).
  const dsn =
    (typeof process !== "undefined" && (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN)) || "";
  if (!dsn) return;
  try {
    const w = globalThis as unknown as { Sentry?: { captureException?: (e: unknown, c?: unknown) => void } };
    if (w.Sentry?.captureException) w.Sentry.captureException(err, { extra });
  } catch {
    /* never let reporting throw */
  }
}
