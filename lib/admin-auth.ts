import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";

/**
 * The admin gate. Two truthful modes:
 *  - "demo"  — Supabase absent: the console renders sample data, no auth,
 *              so the UI is reviewable with zero secrets (matches the rest
 *              of the stack's preview behaviour).
 *  - "live"  — a signed-in user who IS in `admins`.
 *
 * Returns a discriminated result so the caller (the /admin layout) can
 * redirect at the router when access is null. RLS enforces the same rule
 * independently — this is the router half of a two-layer gate.
 */
export type AdminGate =
  | { mode: "demo" }
  | { mode: "live"; email: string; userId: string };

export type AdminAccess =
  | { ok: true; gate: AdminGate }
  | { ok: false; reason: "signed-out" | "not-admin" };

export async function getAdminAccess(): Promise<AdminAccess> {
  if (!supabaseConfigured()) return { ok: true, gate: { mode: "demo" } };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: true, gate: { mode: "demo" } };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "signed-out" };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return { ok: false, reason: "not-admin" };

  return { ok: true, gate: { mode: "live", email: user.email ?? "", userId: user.id } };
}

/**
 * Route-handler guard. Returns the RLS-scoped admin client + identity, or null
 * for anyone not signed in as an admin (routes then return 403). Never available
 * in demo mode — mutations require a real, authorised session.
 */
export async function getApiAdmin(): Promise<{ supabase: SupabaseClient; email: string } | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return null;
  return { supabase, email: user.email ?? "" };
}
