import type {
  LeadRow,
  LeadDetail,
  LeadEvent,
  ProjectDetail,
  AdminMetrics,
  MediaView,
  StaffRow,
  PartnerRow,
} from "@/lib/admin-data";

/**
 * Sample data for demo/preview mode (no Supabase). Lets the whole console be
 * reviewed with zero secrets — the same honest preview pattern the portal and
 * assessor use. Timestamps are relative to now so "time ago" reads live.
 */

const H = 3600_000;
const D = 24 * H;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

const demoLeadsBase: Omit<LeadRow, "assigned_to">[] = [
  {
    id: "demo-1", created_at: ago(0.4 * H), email: "harriet.doyle@example.co.uk",
    name: "Harriet Doyle", phone: "07700 900123", postcode: "WD17 3AB",
    in_area: true, distance_miles: 1.2, project_type: "full_redesign",
    budget_band: "15k_40k", timeline: "1_3_months",
    message: "Back garden is a slope and a mess — want terracing, a porcelain patio and lighting.",
    source: "assessor_ai", status: "new", user_id: null,
  },
  {
    id: "demo-2", created_at: ago(5 * H), email: "raj.patel@example.com",
    name: "Raj Patel", phone: "07700 900456", postcode: "HP2 4NW",
    in_area: true, distance_miles: 8.6, project_type: "driveway",
    budget_band: "5k_15k", timeline: "asap",
    message: "Cracked tarmac drive, want block paving with proper drainage before winter.",
    source: "form", status: "new", user_id: null,
  },
  {
    id: "demo-3", created_at: ago(1.2 * D), email: "sam.okafor@example.com",
    name: "Sam Okafor", phone: "07700 900789", postcode: "AL1 2RJ",
    in_area: true, distance_miles: 12.4, project_type: "patio_paving",
    budget_band: "5k_15k", timeline: "1_3_months",
    message: "Sandstone patio, roughly 30m². Have photos ready.",
    source: "radius_widget", status: "qualified", user_id: null,
  },
  {
    id: "demo-4", created_at: ago(2.1 * D), email: "eleanor.finch@example.co.uk",
    name: "Eleanor Finch", phone: null, postcode: "WD3 1PP",
    in_area: true, distance_miles: 4.9, project_type: "decking_woodwork",
    budget_band: "5k_15k", timeline: "3_6_months",
    message: "Composite deck with a louvred pergola, garden backs onto woodland.",
    source: "assessor", status: "portal_invited", user_id: "user-eleanor",
  },
  {
    id: "demo-5", created_at: ago(3 * D), email: "eleanor.finch@example.co.uk",
    name: "Eleanor Finch", phone: null, postcode: "WD3 1PP",
    in_area: true, distance_miles: 4.9, project_type: "decking_woodwork",
    budget_band: "5k_15k", timeline: "3_6_months",
    message: null, source: "assessor", status: "brief_submitted", user_id: "user-eleanor",
  },
  {
    id: "demo-6", created_at: ago(9 * H), email: "george.mills@example.com",
    name: "George Mills", phone: "07700 900222", postcode: "MK40 1DL",
    in_area: false, distance_miles: 27.3, project_type: "full_redesign",
    budget_band: "over_40k", timeline: "exploring",
    message: "Large plot in Bedford — appreciate you may not cover this far.",
    source: "form", status: "out_of_area", user_id: null,
  },
  {
    id: "demo-7", created_at: ago(6 * D), email: "priya.shah@example.com",
    name: "Priya Shah", phone: "07700 900333", postcode: "EN5 4QT",
    in_area: true, distance_miles: 9.1, project_type: "lawn_softscape",
    budget_band: "under_5k", timeline: "asap",
    message: "Artificial lawn for a small courtyard, pet-friendly infill.",
    source: "radius_widget", status: "quoted", user_id: null,
  },
  {
    id: "demo-8", created_at: ago(14 * D), email: "tom.wright@example.co.uk",
    name: "Tom Wright", phone: "07700 900444", postcode: "WD25 7LR",
    in_area: true, distance_miles: 3.3, project_type: "patio_paving",
    budget_band: "15k_40k", timeline: "1_3_months",
    message: "Porcelain terrace with steps down to a lower lawn — went ahead, thank you.",
    source: "assessor_ai", status: "won", user_id: "user-tom",
  },
];

export const demoStaff: StaffRow[] = [
  { id: "staff-rob", name: "Rob Ellison", role: "owner", email: "rob@example.co.uk", phone: "07700 900001", active: true, status: "available", status_note: null, status_at: ago(0.5 * H), notes: "Founder — surveys & quotes.", created_at: ago(90 * D) },
  { id: "staff-danny", name: "Danny Cole", role: "crew", email: null, phone: "07700 900002", active: true, status: "en_route", status_note: "Heading to WD17 patio", status_at: ago(0.3 * H), notes: null, created_at: ago(60 * D) },
  { id: "staff-mike", name: "Mike Farrow", role: "crew", email: null, phone: "07700 900003", active: true, status: "on_site", status_note: "WD3 deck build — day 2", status_at: ago(2 * H), notes: null, created_at: ago(60 * D) },
  { id: "staff-aisha", name: "Aisha Khan", role: "office", email: "aisha@example.co.uk", phone: "07700 900004", active: true, status: "available", status_note: null, status_at: ago(1 * H), notes: "Bookings & client care.", created_at: ago(45 * D) },
];

const LEAD_ASSIGN: Record<string, string> = {
  "demo-3": "staff-danny",
  "demo-7": "staff-aisha",
  "demo-8": "staff-rob",
};

export const demoLeads: LeadRow[] = demoLeadsBase.map((l) => ({
  ...l,
  assigned_to: LEAD_ASSIGN[l.id] ?? null,
}));

export const demoPartners: PartnerRow[] = [
  { id: "p1", name: "Tom Beck", company: "Beck Groundworks Ltd", kind: "subcontractor", trade: "Groundworks & drainage", email: "tom@beckgroundworks.example", phone: "07700 900101", active: true, notes: "Reliable digger crew, good on clay sites.", created_at: ago(120 * D) },
  { id: "p2", name: "Hertfordshire Stone Co.", company: "Herts Stone", kind: "supplier", trade: "Porcelain & natural stone", email: "sales@hertsstone.example", phone: "01923 900200", active: true, notes: "Trade account — samples next-day.", created_at: ago(120 * D) },
  { id: "p3", name: "Priya Nair", company: "Nair Electrical", kind: "subcontractor", trade: "Garden lighting & power (Part P)", email: null, phone: "07700 900102", active: true, notes: "Part P certified for outdoor circuits.", created_at: ago(80 * D) },
  { id: "p4", name: "Studio Verde", company: "Studio Verde Architects", kind: "referrer", trade: "Architect — sends garden projects", email: "hello@studioverde.example", phone: null, active: true, notes: "Referred the Radlett job. Thank-you due.", created_at: ago(200 * D) },
];

const demoEvents: Record<string, LeadEvent[]> = {
  "demo-3": [
    { id: "e1", lead_id: "demo-3", kind: "status", note: "Advanced new → qualified", actor: "owner", created_at: ago(1.1 * D) },
    { id: "e2", lead_id: "demo-3", kind: "note", note: "Called back — keen, sending portal link.", actor: "owner", created_at: ago(1.0 * D) },
  ],
  "demo-7": [
    { id: "e3", lead_id: "demo-7", kind: "status", note: "Advanced qualified → quoted", actor: "owner", created_at: ago(4 * D) },
    { id: "e4", lead_id: "demo-7", kind: "reply", note: "Sent survey-slots email", actor: "owner", created_at: ago(4 * D) },
  ],
  "demo-8": [
    { id: "e5", lead_id: "demo-8", kind: "status", note: "Advanced quoted → won", actor: "owner", created_at: ago(10 * D) },
  ],
};

export function demoLeadDetail(id: string): LeadDetail | null {
  const lead = demoLeads.find((l) => l.id === id);
  if (!lead) return null;
  const transcript =
    lead.source === "assessor_ai" || lead.source === "assessor"
      ? [
          { role: "assistant", content: "What are you hoping to change about the garden?" },
          { role: "user", content: lead.message ?? "A full refresh." },
          { role: "assistant", content: "And roughly what postcode is the property?" },
          { role: "user", content: lead.postcode },
        ]
      : null;
  const linkedProject =
    lead.id === "demo-5" ? { id: "demo-project-1", title: "Deck & pergola — woodland side", status: "submitted" as const } : null;
  return { ...lead, transcript, events: demoEvents[id] ?? [], project: linkedProject };
}

const SKETCH_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='520' height='360'><rect width='520' height='360' fill='#f4efe4'/><rect x='40' y='40' width='440' height='280' fill='none' stroke='#10140f' stroke-width='2'/><rect x='60' y='60' width='240' height='120' fill='none' stroke='#b08a49' stroke-width='2'/><text x='70' y='130' font-family='Georgia' font-size='18' fill='#10140f'>Porcelain patio</text><rect x='60' y='200' width='400' height='100' fill='none' stroke='#5f6e50' stroke-width='2'/><text x='70' y='260' font-family='Georgia' font-size='18' fill='#10140f'>Lawn + beds</text></svg>`
  );

export const demoProjects: Record<string, ProjectDetail> = {
  "demo-project-1": {
    id: "demo-project-1",
    title: "Deck & pergola — woodland side",
    project_type: "decking_woodwork",
    description:
      "Rear garden backs onto woodland and drops about 400mm across its width. We'd like a composite deck spanning the level change with a louvred aluminium pergola over the seating end, and low-voltage lighting wired into the steps. The lawn beyond stays but needs re-levelling.",
    postcode: "WD3 1PP",
    length_m: 9, width_m: 6, area_m2: 54,
    budget_band: "5k_15k", timeline: "3_6_months",
    status: "submitted",
    created_at: ago(3 * D), submitted_at: ago(2.9 * D),
    clientEmail: "eleanor.finch@example.co.uk",
    second_space: "Front path approx 1.2m × 8m",
    access_notes: "Side gate 0.9m wide, shared drive — skip must go on the road with a permit.",
    inspirationLinks: ["https://www.pinterest.co.uk/search/pins/?q=louvred%20pergola%20deck", "https://www.instagram.com/explore/tags/compositedecking/"],
    media: [
      { id: "m1", kind: "garden_photo", caption: "From the house looking out", signedUrl: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1200&q=70", externalUrl: null },
      { id: "m2", kind: "garden_photo", caption: "The level change", signedUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=70", externalUrl: null },
      { id: "m3", kind: "sketch_canvas", caption: "Layout sketch", signedUrl: SKETCH_SVG, externalUrl: null },
      { id: "m4", kind: "inspiration", caption: "Reference — louvred roof", signedUrl: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=70", externalUrl: null },
    ],
  },
};

export function demoProjectDetail(id: string): ProjectDetail | null {
  return demoProjects[id] ?? null;
}

export const demoMetrics: AdminMetrics = {
  leads_this_week: 4,
  leads_last_week: 3,
  briefs_this_week: 1,
  briefs_last_week: 2,
  out_of_area_total: 1,
  out_of_area_this_week: 1,
  assessor_leads_total: 3,
  assessor_converted_total: 2,
  median_lead_to_action_seconds: 5 * 3600,
};

export const demoMedia: MediaView[] = []; // unused placeholder kept for symmetry
