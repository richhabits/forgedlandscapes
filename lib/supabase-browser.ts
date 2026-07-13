"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "@/lib/supabase";

/**
 * Cookie-storing browser client for admin sign-in. Distinct from the portal's
 * localStorage client (lib/supabase.ts) on purpose: admin sessions live in
 * cookies so the server can read them and gate /admin before render.
 */
let adminClient: SupabaseClient | null = null;

export function getAdminBrowserSupabase(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) return null;
  if (!adminClient) adminClient = createBrowserClient(url, key);
  return adminClient;
}
