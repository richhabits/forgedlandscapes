/**
 * Real client reviews — the single source for on-site testimonials AND the
 * Review/AggregateRating structured data (star ratings in Google).
 *
 * INTENTIONALLY EMPTY: the previous placeholders were removed because fake
 * social proof is a trust liability on a premium brand. Add real, attributable
 * reviews here (from Google review screenshots → text) and they appear on the
 * home page and emit schema automatically. `rating` is 1–5.
 */
export type Review = {
  quote: string;
  who: string; // e.g. "K. Patel"
  where: string; // town
  job: string; // what was built
  rating: number; // 1–5
  date?: string; // ISO, for schema
};

export const reviews: Review[] = [
  // { quote: "…", who: "K. Patel", where: "Bushey", job: "Porcelain patio", rating: 5, date: "2026-05-01" },
];

export function hasReviews(): boolean {
  return reviews.length > 0;
}

export function averageRating(): number | null {
  if (!reviews.length) return null;
  return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
}
