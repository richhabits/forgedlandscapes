import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Env resolution — tolerant of every name the Vercel × Supabase Marketplace
 * integration (and a hand-rolled .env) might inject.
 * Public values (URL + anon/publishable key) are safe to expose by design:
 * Row Level Security is the boundary, not key secrecy.
 */

export function supabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    undefined
  );
}

export function supabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    undefined
  );
}

export function supabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

/** Browser client — one per tab, session persisted for portal auth. */
let browserClient: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!supabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createClient(supabaseUrl()!, supabaseAnonKey()!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }
  return browserClient;
}

/**
 * Server client for public writes (leads, chat transcripts).
 * Prefers the service-role key when the deployment has it (Marketplace
 * integration injects one); falls back to the anon key + RLS insert
 * policies so the stack still works with zero secrets configured.
 */
export function getServerSupabase(): SupabaseClient | null {
  if (!supabaseUrl()) return null;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    supabaseAnonKey();
  if (!key) return null;
  return createClient(supabaseUrl()!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
