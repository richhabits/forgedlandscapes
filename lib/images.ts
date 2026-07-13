/**
 * IMAGE MANIFEST — every photograph on the site routes through here.
 *
 * These are curated, HTTP-verified Unsplash comps (real photography, never AI)
 * standing in until Forged Landscapes' own project photography is ready.
 * Swap any entry's `src` for a real project shot (or a /public path) and the
 * whole site updates. See docs/SHOT-LIST.md for the photography brief.
 *
 * Unsplash License: free for commercial use, no attribution required —
 * credits kept here as good practice.
 */

const u = (id: string, w = 1600, extra = "") =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop${extra}`;

export type SiteImage = { src: string; alt: string };

export const img = {
  // ——— hero / signature
  heroHome: {
    src: u("1711098256574-7b497260cdc9", 2000),
    alt: "Porcelain patio and rattan dining set against a red-brick English home",
  },

  // ——— patios & paving
  patioDining: {
    src: u("1711098256574-7b497260cdc9"),
    alt: "Large-format porcelain patio with outdoor dining furniture beside a brick house",
  },
  patioCourtyard: {
    src: u("1655109371498-30745747d279"),
    alt: "Porcelain courtyard with timber garden room and raised stone planter",
  },
  pavingCircle: {
    src: u("1780838446281-9394772d07a8"),
    alt: "Circular granite sett feature patio set within planting",
  },
  pavingBlockTexture: {
    src: u("1607708131130-19ed5e90043b"),
    alt: "Close detail of tumbled block paving",
  },

  // ——— driveways
  driveEstate: {
    src: u("1433784566027-edb004aa7276", 1800),
    alt: "Hedge-lined driveway approaching a white period house",
  },

  // ——— decking & pergolas
  deckBoards: {
    src: u("1734079692147-c6fc9438a2d0"),
    alt: "Hardwood deck boards edged with rock and ferns",
  },
  deckWhite: {
    src: u("1533391120950-2d65c72e5969"),
    alt: "Pale deck terrace with lounge chairs beneath mature trees",
  },
  pergolaLouvre: {
    src: u("1696846912973-3233cc80bf86"),
    alt: "Aluminium louvred pergola over a garden lounge, artificial lawn and fenced borders",
  },
  pergolaDark: {
    src: u("1696846912293-9a8013e17403"),
    alt: "Dark pergola and close-board fencing framing outdoor seating",
  },

  // ——— lawns & planting
  lawnStudio: {
    src: u("1558904541-efa843a96f01", 1800),
    alt: "Close-mown lawn in front of a charcoal garden studio",
  },
  turfPanel: {
    src: u("1715934750401-64a6159a9913"),
    alt: "Artificial lawn panel bordered by porcelain pavers and gravel",
  },
  turfBeds: {
    src: u("1715934514075-06f0dbda1c09"),
    alt: "Artificial lawn with rendered raised beds and contemporary fencing",
  },
  raisedBeds: {
    src: u("1591857177580-dc82b9ac4e1e"),
    alt: "Raised timber beds planted with herbs and salad crops",
  },
  planting: {
    src: u("1534710961216-75c88202f43e"),
    alt: "Allium heads among layered green planting",
  },

  // ——— garden design / transformations
  redesignAfter: {
    src: u("1623358519330-00f61d89396b"),
    alt: "Terraced garden with artificial lawn, steps and architectural planting",
  },
  redesignModern: {
    src: u("1701422052265-64f0ac28dcd6", 1800),
    alt: "Rendered contemporary house with porcelain steps and level lawn",
  },
  wildBefore: {
    src: u("1598902108854-10e335adac99"),
    alt: "Overgrown garden before clearance and redesign",
  },

  // ——— craft & graft (authenticity band)
  craftPlanting: {
    src: u("1530836369250-ef72a3f5cda8"),
    alt: "Hands setting young plants into seed trays",
  },
  craftEdging: {
    src: u("1605117882932-f9e32b03fea9"),
    alt: "Landscaper edging a lawn beside a brick path",
  },
  craftSoil: {
    src: u("1416879595882-3373a0480b5b"),
    alt: "Soil scoop and potting bench detail",
  },

  // ——— lighting
  lightBollard: {
    src: u("1658692051708-519fbdac7e8f"),
    alt: "Garden bollard light glowing among planting at night",
  },
  lightModern: {
    src: u("1763091637367-bcd33b348884"),
    alt: "Modern garden light against ferns after dark",
  },
} as const satisfies Record<string, SiteImage>;

export type ImgKey = keyof typeof img;
