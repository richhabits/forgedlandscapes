import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase";

/**
 * Refreshes the admin magic-link session cookie on every /admin request so
 * server components read a live token. No-op when Supabase isn't configured
 * (demo mode) — the app still runs with zero secrets. This does NOT gate
 * access; the /admin layout does that (router redirect) and RLS backs it.
 */
export async function proxy(req: NextRequest) {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  let res = NextResponse.next({ request: req });
  if (!url || !key) return res;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(list) {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)
        );
      },
    },
  });

  // Touch the session so an expired access token is rotated into the cookie.
  await supabase.auth.getUser();
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
