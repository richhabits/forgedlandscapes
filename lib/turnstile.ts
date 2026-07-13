/**
 * Cloudflare Turnstile verification for public writes. Graceful by default:
 * with no `TURNSTILE_SECRET_KEY` set it returns `true` (disabled) so the lead
 * form keeps working exactly as today. Set the secret + the public site key
 * (NEXT_PUBLIC_TURNSTILE_SITE_KEY) to switch on bot protection with zero code
 * change. Free, unlimited.
 */
export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // disabled — do not block
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      cache: "no-store",
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    // Verification endpoint unreachable — fail OPEN so a Cloudflare blip never
    // costs a real lead (honeypot + rate limit still apply).
    return true;
  }
}
