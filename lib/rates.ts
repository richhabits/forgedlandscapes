import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";

/**
 * The rate sheet the AI quoter prices against. Admin-editable in the database
 * (table `rates`, migration 0004); falls back to these defaults so the quoter
 * works even before the migration runs or with zero config.
 */

export type Rate = {
  key: string;
  label: string;
  category: "rate_per_m2" | "labour" | "travel" | "markup" | "other";
  unit: string | null;
  amount: number;
  sort: number;
};

export const DEFAULT_RATES: Rate[] = [
  { key: "patio_paving", label: "Patio & paving", category: "rate_per_m2", unit: "£/m²", amount: 170, sort: 10 },
  { key: "driveway", label: "Driveway", category: "rate_per_m2", unit: "£/m²", amount: 130, sort: 20 },
  { key: "decking_woodwork", label: "Decking & woodwork", category: "rate_per_m2", unit: "£/m²", amount: 170, sort: 30 },
  { key: "lawn_softscape", label: "Lawn & planting", category: "rate_per_m2", unit: "£/m²", amount: 60, sort: 40 },
  { key: "full_redesign", label: "Full garden redesign", category: "rate_per_m2", unit: "£/m²", amount: 250, sort: 50 },
  { key: "other", label: "Other landscaping", category: "rate_per_m2", unit: "£/m²", amount: 150, sort: 60 },
  { key: "travel_per_mile", label: "Travel (per mile, round trip)", category: "travel", unit: "£/mile", amount: 0.6, sort: 70 },
  { key: "contingency", label: "Estimate range (±)", category: "markup", unit: "%", amount: 15, sort: 80 },
];

export async function loadRates(): Promise<Rate[]> {
  if (!supabaseConfigured()) return DEFAULT_RATES;
  const supabase = await createServerSupabase();
  if (!supabase) return DEFAULT_RATES;
  const { data, error } = await supabase
    .from("rates")
    .select("key,label,category,unit,amount,sort")
    .order("sort", { ascending: true });
  if (error || !data || data.length === 0) return DEFAULT_RATES;
  return data as Rate[];
}

export function rateMap(rates: Rate[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const r of rates) m[r.key] = Number(r.amount);
  return m;
}
