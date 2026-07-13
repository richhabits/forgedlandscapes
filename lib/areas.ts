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
  {
    slug: "rickmansworth",
    name: "Rickmansworth",
    distance: "4 miles",
    postcodeHint: "WD3",
    intro: [
      "Rickmansworth sits where the Chess, Gade and Colne meet, and that water table shapes every garden here — plots near the Aquadrome, Batchworth and the canal sit low and wet, while the ground rises and dries toward Loudwater and Moor Park.",
      "We match the build to the water: permeable and resin driveways that drain rather than pool, raised beds and terraces that lift planting clear of winter damp, and lawns re-graded with falls that actually take the runoff away.",
    ],
    localNote:
      "Low-lying gardens near the rivers and Grand Union Canal can border flood zones — we design drainage and permeable surfaces to suit, and the private Moor Park estate carries its own covenants and approval process, which we work within.",
    popular: ["Resin & permeable driveways", "Drainage & re-grading", "Full garden redesigns"],
  },
  {
    slug: "northwood",
    name: "Northwood",
    distance: "5 miles",
    postcodeHint: "HA6",
    intro: [
      "Northwood is deep Metro-land: large interwar and Arts-and-Crafts detached houses on generous, established plots, often with mature specimen trees that have been part of the garden for eighty years.",
      "The briefs here are whole-garden — terraces, level lawns, screened working zones and lighting resolved as one design — built around the trees rather than through them, with the quality of finish these houses expect.",
    ],
    localNote:
      "Mature trees over London clay mean root-protection zones and retaining are planned from the survey, not discovered on site — and several of Northwood's private roads need access and skip logistics agreed in advance.",
    popular: ["Full garden transformations", "Porcelain & stone terraces", "Garden lighting schemes"],
  },
  {
    slug: "pinner",
    name: "Pinner",
    distance: "7 miles",
    postcodeHint: "HA5",
    intro: [
      "Pinner pairs a timber-framed medieval High Street with street after street of classic 1930s Metro-land semis — long, straight rear gardens that respond beautifully to being zoned into terrace, lawn and a destination at the far end.",
      "Front gardens count for a lot on these roads: a permeable block or resin drive with a planted border lifts the whole frontage, and done permeably it stays within permitted development.",
    ],
    localNote:
      "The old village around the High Street is a conservation area where sympathetic materials — clay pavers, natural stone — matter; elsewhere the Pinner clay and gently sloping streets mean levels and drainage need proper attention.",
    popular: ["Rear garden redesigns", "Block-paved & resin driveways", "Sympathetic front paths"],
  },
  {
    slug: "chorleywood",
    name: "Chorleywood",
    distance: "6 miles",
    postcodeHint: "WD3",
    intro: [
      "On the Chilterns edge around the common, Chorleywood plots are leafy, often sloping and frequently wooded — chalk-and-flint ground, big gardens, and the Arts-and-Crafts legacy of Chorleywoodside setting a high bar for craft.",
      "Our work here leans on terracing and retaining to tame the slopes, with louvred pergolas, outdoor kitchens and layered planting that suits a garden framed by mature trees and open common beyond.",
    ],
    localNote:
      "Sitting over the chalk aquifer near the common, drainage must be genuinely SuDS-compliant; sloping wooded plots also bring protected trees, so retaining and root-protection are designed in from the start.",
    popular: ["Terracing & retaining walls", "Louvred pergolas & outdoor kitchens", "Full garden redesigns"],
  },
  {
    slug: "berkhamsted",
    name: "Berkhamsted",
    distance: "11 miles",
    postcodeHint: "HP4",
    intro: [
      "Berkhamsted climbs the sides of a Chilterns valley along the Grand Union Canal, so its gardens rarely sit flat — Victorian terraces stepping up the hill and newer estates alike ask for level changes to be handled properly.",
      "Retaining and terracing are the backbone of our Berkhamsted work: usable flat zones cut into the slope, natural-stone terraces by the house, and planting that holds the banks together.",
    ],
    localNote:
      "The flinty chalk soil and steep valley-side plots make retaining structures the norm rather than the exception; near the High Street and castle, the conservation area favours brick and natural stone over pressed concrete.",
    popular: ["Retaining walls & terraces", "Natural stone patios", "Sloping garden redesigns"],
  },
  {
    slug: "borehamwood",
    name: "Borehamwood",
    distance: "6 miles",
    postcodeHint: "WD6",
    intro: [
      "Borehamwood — Elstree's studio town — is mostly postwar and newer housing, with fresh developments still going up, which means compact family plots and, often, thin topsoil laid straight over compacted builder's clay.",
      "That's exactly what we correct: proper decompaction and sub-bases before any lawn or paving, then clever zoning that makes a smaller garden feel like three spaces — dining, lawn and a screened utility corner.",
    ],
    localNote:
      "New-build gardens here frequently hide compacted clay and buried rubble under a shallow turf skin — we dig it out and build the base properly, which is the difference between a lawn that thrives and one that puddles.",
    popular: ["Artificial & real lawns", "Compact courtyard patios", "Family garden makeovers"],
  },
  {
    slug: "stanmore",
    name: "Stanmore",
    distance: "7 miles",
    postcodeHint: "HA7",
    intro: [
      "Stanmore rises to leafy, affluent heights around Stanmore Hill and Bentley Priory — large plots, mature trees and gravel-over-clay ground, with several conservation areas keeping the character intact.",
      "Briefs here are the full board: measured survey, retaining where the land falls, generous porcelain or natural-stone terraces, and lighting that makes the garden work on a winter evening, not just a summer afternoon.",
    ],
    localNote:
      "Elevated plots with mature trees and conservation controls mean retaining and root-protection are designed in early, and natural materials are usually the right — and the approvable — call.",
    popular: ["Full garden transformations", "Porcelain & stone terraces", "Garden lighting schemes"],
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
