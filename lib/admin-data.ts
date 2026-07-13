import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseConfigured } from "@/lib/supabase";
import {
  demoLeads,
  demoLeadDetail,
  demoProjectDetail,
  demoMetrics,
} from "@/lib/admin-demo";

/**
 * Admin read layer. All queries run through the cookie-bound server client
 * (createServerSupabase) so RLS — specifically the is_admin() policies from
 * 0002_admin.sql — decides what comes back. Not the service-role key: the
 * boundary is the database. Falls back to demo fixtures when unconfigured.
 */

export type LeadRow = {
  id: string;
  created_at: string;
  email: string;
  name: string | null;
  phone: string | null;
  postcode: string;
  in_area: boolean | null;
  distance_miles: number | null;
  project_type: string;
  budget_band: string;
  timeline: string;
  message: string | null;
  source: string;
  status: string;
  user_id: string | null;
};

export type LeadEvent = {
  id: string;
  lead_id: string;
  kind: string;
  note: string | null;
  actor: string | null;
  created_at: string;
};

export type LinkedProject = { id: string; title: string | null; status: string };

export type LeadDetail = LeadRow & {
  transcript: Array<{ role: string; content: string }> | null;
  events: LeadEvent[];
  project: LinkedProject | null;
};

export type MediaView = {
  id: string;
  kind: string;
  caption: string | null;
  signedUrl: string | null;
  externalUrl: string | null;
};

export type ProjectDetail = {
  id: string;
  title: string | null;
  project_type: string;
  description: string | null;
  postcode: string | null;
  length_m: number | null;
  width_m: number | null;
  area_m2: number | null;
  budget_band: string;
  timeline: string;
  status: string;
  created_at: string;
  submitted_at: string | null;
  clientEmail: string | null;
  second_space: string | null;
  access_notes: string | null;
  inspirationLinks: string[];
  media: MediaView[];
};

export type AdminMetrics = {
  leads_this_week: number;
  leads_last_week: number;
  briefs_this_week: number;
  briefs_last_week: number;
  out_of_area_total: number;
  out_of_area_this_week: number;
  assessor_leads_total: number;
  assessor_converted_total: number;
  median_lead_to_action_seconds: number | null;
};

const LEAD_COLS =
  "id,created_at,email,name,phone,postcode,in_area,distance_miles,project_type,budget_band,timeline,message,source,status,user_id";

export async function listLeads(): Promise<LeadRow[]> {
  if (!supabaseConfigured()) return demoLeads;
  const supabase = await createServerSupabase();
  if (!supabase) return demoLeads;
  const { data } = await supabase
    .from("leads")
    .select(LEAD_COLS)
    .order("created_at", { ascending: false })
    .limit(1000);
  return (data as LeadRow[] | null) ?? [];
}

export async function getLeadDetail(id: string): Promise<LeadDetail | null> {
  if (!supabaseConfigured()) return demoLeadDetail(id);
  const supabase = await createServerSupabase();
  if (!supabase) return demoLeadDetail(id);

  const { data: lead } = await supabase
    .from("leads")
    .select(`${LEAD_COLS},transcript`)
    .eq("id", id)
    .maybeSingle();
  if (!lead) return null;

  const { data: events } = await supabase
    .from("lead_events")
    .select("id,lead_id,kind,note,actor,created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  // A brief linked to this lead, either directly (projects.lead_id) or via the
  // portal account that grew out of it (projects.user_id).
  let project: LinkedProject | null = null;
  const orFilter = lead.user_id
    ? `lead_id.eq.${id},user_id.eq.${lead.user_id}`
    : `lead_id.eq.${id}`;
  const { data: proj } = await supabase
    .from("projects")
    .select("id,title,status")
    .or(orFilter)
    .in("status", ["submitted", "reviewed"])
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (proj) project = proj as LinkedProject;

  const transcript = Array.isArray(lead.transcript)
    ? (lead.transcript as Array<{ role: string; content: string }>)
    : null;

  return {
    ...(lead as LeadRow),
    transcript,
    events: (events as LeadEvent[] | null) ?? [],
    project,
  };
}

export async function getProjectDetail(id: string): Promise<ProjectDetail | null> {
  if (!supabaseConfigured()) return demoProjectDetail(id);
  const supabase = await createServerSupabase();
  if (!supabase) return demoProjectDetail(id);

  const { data: p } = await supabase
    .from("projects")
    .select(
      "id,title,project_type,description,postcode,length_m,width_m,area_m2,budget_band,timeline,status,created_at,submitted_at,details,lead_id,user_id"
    )
    .eq("id", id)
    .maybeSingle();
  if (!p) return null;

  // Client email: from the linked lead, else any lead owned by this user.
  let clientEmail: string | null = null;
  if (p.lead_id) {
    const { data: l } = await supabase.from("leads").select("email").eq("id", p.lead_id).maybeSingle();
    clientEmail = l?.email ?? null;
  }
  if (!clientEmail && p.user_id) {
    const { data: l } = await supabase
      .from("leads")
      .select("email")
      .eq("user_id", p.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    clientEmail = l?.email ?? null;
  }

  const { data: mediaRows } = await supabase
    .from("project_media")
    .select("id,kind,caption,storage_path,external_url")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  const rows = (mediaRows as Array<{
    id: string; kind: string; caption: string | null; storage_path: string | null; external_url: string | null;
  }> | null) ?? [];

  // Sign every stored object in one batch (admin storage read policy).
  const paths = rows.filter((r) => r.storage_path).map((r) => r.storage_path!) as string[];
  const signedByPath = new Map<string, string>();
  if (paths.length) {
    const { data: signed } = await supabase.storage.from("project-media").createSignedUrls(paths, 3600);
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) signedByPath.set(s.path, s.signedUrl);
    }
  }

  const media: MediaView[] = rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    caption: r.caption,
    signedUrl: r.storage_path ? signedByPath.get(r.storage_path) ?? null : null,
    externalUrl: r.external_url,
  }));

  const details = (p.details ?? {}) as {
    second_space?: string | null;
    access_notes?: string | null;
    inspiration_links?: string[];
  };

  return {
    id: p.id,
    title: p.title,
    project_type: p.project_type,
    description: p.description,
    postcode: p.postcode,
    length_m: p.length_m,
    width_m: p.width_m,
    area_m2: p.area_m2,
    budget_band: p.budget_band,
    timeline: p.timeline,
    status: p.status,
    created_at: p.created_at,
    submitted_at: p.submitted_at,
    clientEmail,
    second_space: details.second_space ?? null,
    access_notes: details.access_notes ?? null,
    inspirationLinks: Array.isArray(details.inspiration_links) ? details.inspiration_links : [],
    media,
  };
}

export async function getMetrics(): Promise<AdminMetrics> {
  if (!supabaseConfigured()) return demoMetrics;
  const supabase = await createServerSupabase();
  if (!supabase) return demoMetrics;
  const { data } = await supabase.from("admin_metrics").select("*").maybeSingle();
  if (!data) {
    return {
      leads_this_week: 0, leads_last_week: 0, briefs_this_week: 0, briefs_last_week: 0,
      out_of_area_total: 0, out_of_area_this_week: 0, assessor_leads_total: 0,
      assessor_converted_total: 0, median_lead_to_action_seconds: null,
    };
  }
  return data as AdminMetrics;
}
