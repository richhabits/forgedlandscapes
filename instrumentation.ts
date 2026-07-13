/**
 * Next.js instrumentation. `onRequestError` fires for every server-side error
 * (RSC, route handlers, SSR) — routed through the single observability seam so
 * failures surface in logs (and Sentry when a DSN is configured) instead of
 * dying silently. See lib/observability.ts.
 */
export async function onRequestError(
  err: unknown,
  request: { path?: string; method?: string },
) {
  const { reportError } = await import("@/lib/observability");
  reportError(err, { path: request?.path, method: request?.method });
}

export async function register() {
  // Reserved for tracing SDK init (e.g. @sentry/nextjs) once a DSN is added.
}
