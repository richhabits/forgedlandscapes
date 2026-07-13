import { getServerSupabase } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";

export type Showcase = {
  id: string;
  title: string;
  location: string | null;
  before_url: string | null;
  after_url: string | null;
  caption: string | null;
  published: boolean;
  sort: number;
};

const COLS = "id,title,location,before_url,after_url,caption,published,sort";

/** Public read — published before/afters for the /work gallery. */
export async function loadPublishedShowcase(): Promise<Showcase[]> {
  if (!supabaseConfigured()) return [];
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("showcase")
    .select(COLS)
    .eq("published", true)
    .order("sort", { ascending: true });
  return (data as Showcase[] | null) ?? [];
}

/** Admin read — every entry, published or not. */
export async function loadAllShowcase(): Promise<Showcase[]> {
  if (!supabaseConfigured()) return [];
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("showcase").select(COLS).order("sort", { ascending: true });
  return (data as Showcase[] | null) ?? [];
}
