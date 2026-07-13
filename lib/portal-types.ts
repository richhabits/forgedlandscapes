/** Shared shapes for the portal brief wizard. */

export type MediaItem = {
  id: string;
  kind: "garden_photo" | "garden_video" | "sketch_canvas" | "sketch_upload" | "inspiration";
  /** Supabase storage path (real mode) */
  storagePath?: string;
  /** Object URL (preview) or public/external URL */
  url?: string;
  externalUrl?: string;
  name?: string;
  size?: number;
};

export type Brief = {
  projectId?: string;
  project_type: string;
  title: string;
  description: string;
  postcode: string;
  length_m: string;
  width_m: string;
  second_space: string;
  access_notes: string;
  budget_band: string;
  timeline: string;
  media: MediaItem[];
  inspirationLinks: string[];
  consent: boolean;
};

export const emptyBrief: Brief = {
  project_type: "",
  title: "",
  description: "",
  postcode: "",
  length_m: "",
  width_m: "",
  second_space: "",
  access_notes: "",
  budget_band: "unsure",
  timeline: "exploring",
  media: [],
  inspirationLinks: [],
  consent: false,
};

export function briefArea(b: Brief): number | null {
  const l = parseFloat(b.length_m);
  const w = parseFloat(b.width_m);
  if (!isFinite(l) || !isFinite(w) || l <= 0 || w <= 0) return null;
  return Math.round(l * w * 10) / 10;
}
