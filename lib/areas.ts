export type Area = {
  slug: string;
  name: string;
  distance: string;
  postcodeHint: string;
  intro: string[];
  localNote: string;
  popular: string[];
};

export const areas: Area[] = [
  {
    slug: "st-albans",
    name: "St Albans",
    distance: "7 miles",
    postcodeHint: "AL1–AL4",
    intro: [
      "St Albans gardens are a specific challenge we know well: long, narrow Victorian and Edwardian plots off Fishpool Street and the Marshalswick avenues, often with tired concrete paths down one side and a level change buried under decades of lawn.",
      "Our most-requested work here is the full-length rethink — porcelain terrace by the house, a defined lawn panel, and a second seating zone at the end of the garden where the evening sun actually lands.",
    ],
    localNote:
      "Much of central St Albans sits within conservation areas, and period frontages often need sympathetic materials — clay pavers and natural stone rather than pressed concrete. We design to what the conservation officer will actually approve.",
    popular: ["Full garden redesign", "Porcelain patios", "Clay-paved front paths"],
  },
  {
    slug: "hemel-hempstead",
    name: "Hemel Hempstead",
    distance: "6 miles",
    postcodeHint: "HP1–HP3",
    intro: [
      "From Boxmoor's period terraces to the newer plots around Apsley and Grovehill, Hemel gardens range from compact courtyards to generous family lawns — and almost all of them share heavy clay that holds winter water.",
      "That's why drainage leads our Hemel designs: permeable driveways, French drains behind retaining walls, and lawns re-levelled with proper falls before any turf goes down.",
    ],
    localNote:
      "The clay across Hemel punishes shortcut groundworks. We over-specify sub-bases and drainage here as standard — it's the difference between a drive that lasts and one that sinks by year three.",
    popular: ["Resin-bound driveways", "Drainage & lawn levelling", "Family garden redesigns"],
  },
  {
    slug: "harrow",
    name: "Harrow",
    distance: "7 miles",
    postcodeHint: "HA1–HA3",
    intro: [
      "Harrow's 1930s semis come with a gift most owners underuse: proper-sized plots. We turn tired lawns behind Metroland bays into structured family gardens — dining terrace, level lawn, screened side return for the bins and bikes.",
      "Front gardens matter here too. A block-paved or resin drive with a planted border lifts the whole frontage — and done permeably, it needs no planning consent.",
    ],
    localNote:
      "Harrow Council enforces vehicle crossover rules tightly — a widened drive without an approved dropped kerb risks enforcement. We handle the crossover application alongside the build.",
    popular: ["Block-paved driveways", "Dropped kerb applications", "Rear garden redesigns"],
  },
  {
    slug: "bushey",
    name: "Bushey",
    distance: "2 miles",
    postcodeHint: "WD23",
    intro: [
      "Bushey is our back yard — minutes from base, and the village's mix of period cottages, arts-and-crafts houses and newer closes gives us everything from courtyard gardens to half-acre plots.",
      "Being this close means snagging visits, planting top-ups and aftercare happen without scheduling drama. Several of our longest-standing clients are within a mile of the High Street.",
    ],
    localNote:
      "Bushey's older village lanes have narrow access — we plan machinery and skip logistics around them routinely, and hand-dig where a digger can't sensibly go.",
    popular: ["Cottage garden restorations", "Porcelain terraces", "Artificial lawns"],
  },
  {
    slug: "radlett",
    name: "Radlett",
    distance: "5 miles",
    postcodeHint: "WD7",
    intro: [
      "Radlett briefs are the full-board ones: larger plots off Watling Street and The Avenue, and clients who want the whole outdoor space resolved — terraces, lawn, lighting, screening and planting as one scheme.",
      "Recent work in WD7 runs to louvred pergolas with outdoor kitchens, resin driveways with estate-style planting, and gardens lit properly for winter evenings, not just summer parties.",
    ],
    localNote:
      "Larger Radlett plots often involve significant level changes and mature protected trees — we design retaining structures and root-protection zones in from the survey, not as an on-site surprise.",
    popular: ["Full garden transformations", "Louvred pergolas & outdoor kitchens", "Garden lighting schemes"],
  },
];

export const areaBySlug = (slug: string) => areas.find((a) => a.slug === slug);

/** Wider coverage list for the areas page + footer — all within the 20-mile radius. */
export const coveredTowns = [
  "Watford", "Bushey", "Radlett", "St Albans", "Hemel Hempstead", "Harrow",
  "Rickmansworth", "Croxley Green", "Chorleywood", "Amersham", "Berkhamsted",
  "Kings Langley", "Abbots Langley", "Borehamwood", "Elstree", "Edgware",
  "Stanmore", "Pinner", "Northwood", "Ruislip", "Uxbridge", "Barnet",
  "Hatfield", "Welwyn Garden City", "Luton", "Chesham", "Beaconsfield",
] as const;
