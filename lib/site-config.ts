/**
 * FORGED LANDSCAPES — single source of truth for brand + business facts.
 * Everything marked TODO is a placeholder awaiting the real trading detail.
 */

export const site = {
  name: "Forged Landscapes",
  domain: "forgedlandscapes.co.uk",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://forgedlandscapes.co.uk",
  tagline: "Design & build landscaping — Watford, Hertfordshire",
  description:
    "Premium design-and-build landscaping across Watford and a 20-mile radius: porcelain patios, block-paved and resin driveways, bespoke decking and pergolas, lawns, planting and full garden transformations.",
  phone: "01923 000 000", // TODO: real number
  phoneHref: "tel:+441923000000",
  email: "richhabitslondon@gmail.com", // interim public inbox — swap for a domain mailbox (e.g. enquiries@forgedlandscapes.co.uk) when set up
  adminEmail: process.env.ADMIN_EMAIL || "richhabitslondon@gmail.com",

  base: {
    // WD17 outcode centroid, via postcodes.io — the compass point for the 20-mile radius
    lat: 51.66394539929949,
    lng: -0.4055810175131353,
    town: "Watford",
    county: "Hertfordshire",
  },
  radiusMiles: 20,

  hours: "Mon–Fri 8:00–18:00 · Sat 9:00–13:00",

  // UK trust facts. Add these back ONLY once actually in place — never claim
  // insurance or a waste-carrier registration you don't hold:
  //   insurance: "£Xm public liability insurance",
  //   wasteCarrier: "Environment Agency registered waste carrier — CBDUxxxxxx",
  trust: {
    guarantee: "5-year workmanship guarantee on all hard landscaping",
    payments: "Staged payments — never full payment up front",
  },

  // Industry affiliations — none held yet, so intentionally empty and the
  // affiliation banner renders nothing. Add an entry ONLY for a body actually
  // joined (e.g. { key: "bali", label: "BALI Registered Member" }) and drop its
  // licensed logo into /public/badges. Never list an unheld accreditation.
  badges: [] as { key: string; label: string }[],

  social: {
    instagram: "https://instagram.com/forgedlandscapes", // TODO
    facebook: "https://facebook.com/forgedlandscapes", // TODO
  },

  // Google Business Profile short review link (g.page/r/…). Once set, the
  // "review us" ask can be surfaced in post-completion emails. See
  // docs/GBP-PLAYBOOK.md for how to create the profile and get this link.
  reviewUrl: "", // TODO: paste GBP review link once the profile is live
} as const;

export const nav = [
  { href: "/patios-paving", label: "Patios & Paving" },
  { href: "/driveways", label: "Driveways" },
  { href: "/decking-pergolas", label: "Decking & Pergolas" },
  { href: "/lawns-planting", label: "Lawns & Planting" },
  { href: "/garden-design", label: "Garden Design" },
  { href: "/areas", label: "Areas" },
] as const;
