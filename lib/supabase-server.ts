import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase";

/**
 * Cookie-bound server client for the admin area — the first server-session
 * layer in the app. Reads the caller's magic-link session from cookies so
 * server components and route handlers can gate on it, and so RLS (is_admin)
 * evaluates against the real signed-in user. Uses the public anon key: the
 * boundary is RLS, not the key.
 *
 * Returns null when Supabase isn't configured (demo/preview mode).
 */
export async function createServerSupabase(): Promise<SupabaseClient | null> {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // set() throws in a Server Component render — the middleware
          // refreshes the session cookie instead, so this is safe to ignore.
        }
      },
    },
  });
}
