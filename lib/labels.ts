/**
 * Human-readable labels for the admin console. Enums stay machine-terse in
 * the database; the back office reads them in plain English. Single source
 * so the inbox, drawer and brief viewer never disagree.
 */

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "New",
  qualified: "Qualified",
  portal_invited: "Portal invited",
  brief_submitted: "Brief submitted",
  survey_booked: "Survey booked",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
  out_of_area: "Out of area",
};

/** Pipeline order for the board columns. */
export const LEAD_STATUS_ORDER = [
  "new",
  "qualified",
  "portal_invited",
  "brief_submitted",
  "survey_booked",
  "quoted",
  "won",
  "lost",
  "out_of_area",
] as const;

/** The natural next step for the one-click advance button. */
export const LEAD_STATUS_NEXT: Record<string, string | null> = {
  new: "qualified",
  qualified: "portal_invited",
  portal_invited: "brief_submitted",
  brief_submitted: "survey_booked",
  survey_booked: "quoted",
  quoted: "won",
  won: null,
  lost: null,
  out_of_area: null,
};

/** Tone drives the chip colour — brass = needs action, moss = won, muted = closed. */
export function leadStatusTone(status: string): "action" | "progress" | "won" | "closed" {
  if (status === "new" || status === "qualified") return "action";
  if (status === "won") return "won";
  if (status === "lost" || status === "out_of_area") return "closed";
  return "progress";
}

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  assessor: "Assessor",
  assessor_ai: "AI assessor",
  form: "Contact form",
  radius_widget: "Radius widget",
};

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  patio_paving: "Patio & paving",
  driveway: "Driveway",
  decking_woodwork: "Decking & woodwork",
  lawn_softscape: "Lawn & planting",
  full_redesign: "Full redesign",
  other: "Other",
};

export const BUDGET_LABELS: Record<string, string> = {
  under_5k: "Under £5k",
  "5k_15k": "£5k–£15k",
  "15k_40k": "£15k–£40k",
  over_40k: "£40k+",
  unsure: "Not sure yet",
};

export const TIMELINE_LABELS: Record<string, string> = {
  asap: "ASAP",
  "1_3_months": "1–3 months",
  "3_6_months": "3–6 months",
  exploring: "Exploring",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  reviewed: "Reviewed",
  archived: "Archived",
};

export const MEDIA_KIND_LABELS: Record<string, string> = {
  garden_photo: "Photo",
  garden_video: "Video",
  sketch_canvas: "Sketch (drawn)",
  sketch_upload: "Sketch (photo)",
  inspiration: "Inspiration",
};

export function label(map: Record<string, string>, key: string | null | undefined): string {
  if (!key) return "—";
  return map[key] ?? key.replace(/_/g, " ");
}

/** "3 min ago", "yesterday", "2 Jul" — compact, no dependency. */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (!isFinite(then)) return "—";
  const sec = Math.round((now - then) / 1000);
  if (sec < 45) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return "yesterday";
  if (day < 7) return `${day} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Seconds → "4h", "2d", "35m" for the median-response tile. */
export function humanDuration(seconds: number | null): string {
  if (seconds == null || !isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round((seconds / 3600) * 10) / 10}h`;
  return `${Math.round((seconds / 86400) * 10) / 10}d`;
}

/** Percentage-point trend for the week-over-week tiles. */
export function weekDelta(thisWeek: number, lastWeek: number): { text: string; dir: "up" | "down" | "flat" } {
  if (lastWeek === 0) {
    if (thisWeek === 0) return { text: "no change", dir: "flat" };
    return { text: "new this week", dir: "up" };
  }
  const pct = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  if (pct === 0) return { text: "level with last week", dir: "flat" };
  return { text: `${pct > 0 ? "+" : ""}${pct}% vs last week`, dir: pct > 0 ? "up" : "down" };
}
