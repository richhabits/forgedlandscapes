/**
 * IMAGE MANIFEST — every photograph on the site routes through here.
 *
 * These are Forged-branded design *concept* visualisations (self-hosted under
 * /public/images/concepts), standing in until real completed-project photography
 * is ready. They are illustrative of the style we build — never presented as a
 * specific finished job. The before/after slider is explicitly captioned as an
 * illustrative comparison. Swap any entry's `src` for a real project shot (drop
 * it in /public and point here) and the whole site updates.
 * See docs/SHOT-LIST.md for the photography brief.
 */

const c = (name: string) => `/images/concepts/${name}.jpg`;

export type SiteImage = { src: string; alt: string };

export const img = {
  // ——— hero / signature
  heroHome: {
    src: c("hero-home"),
    alt: "Porcelain patio, steel pergola and striped lawn against a red-brick English home",
  },

  // ——— patios & paving
  patioDining: {
    src: c("patio-dining"),
    alt: "Large porcelain patio with outdoor dining and lounge seating beside layered borders",
  },
  patioCourtyard: {
    src: c("patio-courtyard"),
    alt: "Contemporary courtyard with porcelain slabs, outdoor sofa and bamboo screening",
  },
  pavingCircle: {
    src: c("paving-feature"),
    alt: "Sawn-stone path with contrasting dark edging curving across a level lawn",
  },
  pavingBlockTexture: {
    src: c("paving-detail"),
    alt: "Stacked riven slate paving slabs on a work site — material close-up",
  },

  // ——— driveways
  driveEstate: {
    src: c("drive-estate"),
    alt: "Charcoal block-paved driveway edged with lavender and planting",
  },

  // ——— decking & pergolas
  deckBoards: {
    src: c("deck-boards"),
    alt: "Hardwood deck with lit step risers and a lounge terrace at dusk",
  },
  deckWhite: {
    src: c("deck-white"),
    alt: "Timber deck walkway edging a natural planted swimming pond",
  },
  pergolaLouvre: {
    src: c("pergola-louvre"),
    alt: "Aluminium pergola over a garden lounge with lavender and porcelain paving",
  },
  pergolaDark: {
    src: c("pergola-dark"),
    alt: "Covered pergola dining terrace lit for the evening above a garden",
  },

  // ——— lawns & planting
  lawnStudio: {
    src: c("lawn-studio"),
    alt: "Close-mown striped lawn and stone path leading to a timber garden studio",
  },
  turfPanel: {
    src: c("turf-panel"),
    alt: "Striped lawn framed by a timber bench seat, pergola and mixed planting",
  },
  turfBeds: {
    src: c("turf-beds"),
    alt: "Level lawn with sleeper-edged raised borders and architectural planting",
  },
  raisedBeds: {
    src: c("raised-beds"),
    alt: "Timber raised beds planted with vegetables beside a greenhouse",
  },
  planting: {
    src: c("planting"),
    alt: "White-flowered borders and clipped box hedging framing stone steps and lawn",
  },

  // ——— garden design / transformations
  redesignAfter: {
    src: c("redesign-after"),
    alt: "Terraced garden with natural stone retaining walls, lit steps and layered planting",
  },
  redesignModern: {
    src: c("redesign-modern"),
    alt: "Contemporary house with a level lawn, gravel and clean architectural planting",
  },
  wildBefore: {
    src: c("wild-before"),
    alt: "Overgrown, neglected garden before clearance and redesign",
  },

  // ——— craft & graft (authenticity band)
  craftPlanting: {
    src: c("craft-planting"),
    alt: "Rows of terracotta pots staged on paving ready for planting out",
  },
  craftEdging: {
    src: c("craft-edging"),
    alt: "Brick path curving between crisply clipped box hedges",
  },
  craftSoil: {
    src: c("craft-soil"),
    alt: "Timber compost bays with garden tools and a watering can",
  },

  // ——— lighting
  lightBollard: {
    src: c("light-bollard"),
    alt: "Wall-mounted lantern lighting a planted side passage after dark",
  },
  lightModern: {
    src: c("light-modern"),
    alt: "Modern garden uplighting picking out planting and foliage at night",
  },
} as const satisfies Record<string, SiteImage>;

export type ImgKey = keyof typeof img;
