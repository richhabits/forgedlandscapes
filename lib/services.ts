import type { ImgKey } from "@/lib/images";

export type PriceRow = { item: string; guide: string; note?: string };
export type Faq = { q: string; a: string };

export type Service = {
  slug: string;
  index: string;
  title: string;
  navLabel: string;
  strap: string;
  heroKey: ImgKey;
  intro: string[];
  materials: { name: string; detail: string }[];
  prices: PriceRow[];
  faqs: Faq[];
  galleryKeys: ImgKey[];
  planningNote?: { title: string; body: string };
  metaDescription: string;
};

export const services: Service[] = [
  {
    slug: "patios-paving",
    index: "01",
    title: "Patios & Paving",
    navLabel: "Patios & Paving",
    strap: "Porcelain, natural stone and setts — laid to outlast the house",
    heroKey: "patioDining",
    intro: [
      "A patio fails at the base, never at the surface. Ours are built on a minimum 100mm compacted MOT Type 1 sub-base with a full wet mortar bed and primed slabs — not spot-bedded, not dry-laid, not rushed.",
      "We work in large-format 20mm porcelain, hand-cut Indian sandstone and granite setts, with falls calculated so water leaves the surface and never your side of the damp-proof course.",
    ],
    materials: [
      { name: "20mm porcelain", detail: "Large-format Italian and Spanish vitrified slabs. Frost-proof, stain-proof, near-zero maintenance." },
      { name: "Indian sandstone", detail: "Hand-cut Kandla grey and Raj green, calibrated 22mm. Sealed as standard." },
      { name: "Granite & clay setts", detail: "Edging courses, circles and borders that define the design." },
      { name: "The base", detail: "100–150mm MOT Type 1, full mortar bed, flexible jointing compound. The part nobody sees is the part that matters." },
    ],
    prices: [
      { item: "Porcelain patio, supplied & laid", guide: "from £190/m²" },
      { item: "Indian sandstone patio", guide: "from £150/m²" },
      { item: "Granite sett detailing", guide: "from £110/lm" },
      { item: "Steps, plinths & raised terraces", guide: "priced on design" },
    ],
    faqs: [
      { q: "How long does a patio take?", a: "A typical 30–40m² patio runs 5–8 working days including groundworks, depending on access and levels. You'll get a fixed programme with the quote." },
      { q: "Porcelain or natural stone?", a: "Porcelain for crisp, low-maintenance and colour-stable; sandstone for warmth and a softer, aged character. We bring full-size samples to the survey — never choose from a website swatch." },
      { q: "Do you handle drainage?", a: "Always. Falls are set at 1:60–1:80 away from the property, with ACO channels or soakaways where ground conditions demand them." },
    ],
    galleryKeys: ["patioCourtyard", "pavingCircle", "pavingBlockTexture"],
    metaDescription:
      "Porcelain and natural stone patios in Watford & Hertfordshire. Full mortar bed, 100mm+ sub-base, 5-year guarantee. Guide prices from £150/m².",
  },
  {
    slug: "driveways",
    index: "02",
    title: "Driveways",
    navLabel: "Driveways",
    strap: "Block paving and resin-bound surfaces with drainage designed in, not bolted on",
    heroKey: "driveEstate",
    intro: [
      "A driveway carries a tonne and a half of car through a Hertfordshire winter, so we build for load first: 150–250mm compacted sub-base, machine-screeded laying course, and edge restraints set in concrete haunching.",
      "Every drive we design is SuDS-compliant from the first sketch — permeable block, resin-bound over an open-grade base, or engineered falls to soakaways — so you avoid planning trouble and your rainwater goes where it should.",
    ],
    materials: [
      { name: "Block paving", detail: "Tumbled and chamfered concrete or clay pavers, machine-laid herringbone for maximum interlock." },
      { name: "Resin-bound", detail: "UV-stable resin with kiln-dried quartz aggregate — a seamless, permeable, weed-free surface." },
      { name: "Permeable systems", detail: "Priora-style blocks and open-grade sub-bases that drain through the surface itself." },
      { name: "Drainage", detail: "ACO channels, linear drains and soakaways sized to your run-off, not a guess." },
    ],
    prices: [
      { item: "Block-paved driveway", guide: "from £130/m²" },
      { item: "Resin-bound driveway", guide: "from £120/m²", note: "over existing sound base; new base priced on survey" },
      { item: "Permeable block system", guide: "from £145/m²" },
      { item: "Dropped kerb (council application + build)", guide: "from £1,800" },
    ],
    faqs: [
      { q: "Do I need planning permission for a new driveway?", a: "Not if the surface is permeable, or run-off drains to a lawn or border — that's permitted development. Over 5m² of impermeable surface draining to the road needs planning consent. Use the checker on this page; we design compliance in either way." },
      { q: "What about the kerb?", a: "A new vehicle crossover (dropped kerb) needs approval from Hertfordshire County Council or your borough — we handle the application and the licensed build." },
      { q: "How long before I can park on it?", a: "Block paving: 48 hours. Resin-bound: foot traffic in 8 hours, vehicles after 24–48 depending on temperature." },
    ],
    galleryKeys: ["pavingBlockTexture", "patioCourtyard", "pavingCircle"],
    planningNote: {
      title: "SuDS & the 5m² rule",
      body: "Since 2008, paving more than 5m² of front garden with an impermeable surface that drains to the highway requires planning permission. Permeable surfaces — or drainage to a soakaway or border — keep you within permitted development. Every Forged driveway is designed SuDS-compliant as standard.",
    },
    metaDescription:
      "Block paving and resin-bound driveways in Watford & Hertfordshire. SuDS-compliant drainage designed in, dropped kerb applications handled. From £120/m².",
  },
  {
    slug: "decking-pergolas",
    index: "03",
    title: "Decking & Pergolas",
    navLabel: "Decking & Pergolas",
    strap: "Composite decks, bespoke pergolas and joinery with lighting built into the design",
    heroKey: "pergolaLouvre",
    intro: [
      "We build decks the way a joiner would: C24 treated subframes at 400mm centres on adjustable pedestals or concrete pads, stainless fixings throughout, and ventilation designed in so the frame outlives the boards.",
      "Composite boards carry a 25-year residential warranty and never need staining. Overhead, our pergolas run from oak and slatted cedar to aluminium louvred systems — with low-voltage LED step and rail lighting wired in during the build, not retrofitted.",
    ],
    materials: [
      { name: "Composite decking", detail: "Capped composite boards — woodgrain finishes, hidden clip fixings, 25-year warranty." },
      { name: "C24 subframe", detail: "Structural-graded, pressure-treated timber at 400mm centres. The deck's skeleton." },
      { name: "Pergolas", detail: "Green oak, western red cedar or powder-coated aluminium louvred roofs." },
      { name: "Integrated LED", detail: "IP65 step lights, recessed deck dots and rail washes on a garden-safe transformer." },
      { name: "Fencing & screens", detail: "Close-board, slatted cedar and acoustic screening to frame the space." },
    ],
    prices: [
      { item: "Composite deck on new subframe", guide: "from £170/m²" },
      { item: "Bespoke timber pergola", guide: "from £2,400" },
      { item: "Aluminium louvred pergola", guide: "from £6,500" },
      { item: "Integrated LED lighting package", guide: "from £850" },
      { item: "Close-board fencing", guide: "from £95/lm" },
    ],
    faqs: [
      { q: "Does decking need planning permission?", a: "Only if the deck sits more than 30cm above ground level, or covers more than half the garden — then it needs consent. Most of our decks are designed under the threshold; where yours can't be, we prepare the application." },
      { q: "Composite or timber boards?", a: "Composite costs more per metre and repays it within three seasons of not sanding, staining or splintering. We still build hardwood decks where the brief calls for the real thing." },
      { q: "Will it get slippery?", a: "Textured capped composite is dramatically better than timber in the wet, and we design falls so the deck sheds water rather than holding it." },
    ],
    galleryKeys: ["pergolaDark", "deckBoards", "deckWhite"],
    planningNote: {
      title: "The 30cm rule",
      body: "Raised decks over 30cm above ground level fall outside permitted development and need planning consent. We design to the threshold where possible and manage the application where not.",
    },
    metaDescription:
      "Composite decking, bespoke pergolas and integrated LED lighting in Watford & Hertfordshire. C24 subframes, stainless fixings, 5-year workmanship guarantee.",
  },
  {
    slug: "lawns-planting",
    index: "04",
    title: "Lawns & Planting",
    navLabel: "Lawns & Planting",
    strap: "Premium turf — real and artificial — raised beds and planting that earns its place",
    heroKey: "lawnStudio",
    intro: [
      "A lawn is groundwork with grass on top. Real turf goes onto 100mm of screeded topsoil over decompacted ground; artificial lawn goes onto a compacted Type 1 and grano base with a shock pad and proper edge fixing — which is why ours still look right in year eight.",
      "Around the lawn we build oak-sleeper and rendered raised beds, then plant in layered schemes — structure, seasonal interest, pollinators — matched to your soil and the hours of sun your garden actually gets.",
    ],
    materials: [
      { name: "Premium artificial turf", detail: "35–40mm dual-tone pile, permeable backing, brushed silica sand infill. 10-year UV warranty." },
      { name: "Cultivated turf", detail: "Seeded-and-grown lawn turf on prepared, levelled, fertilised topsoil." },
      { name: "Oak sleeper beds", detail: "New green oak or reclaimed sleepers, lined and drained." },
      { name: "Planting schemes", detail: "RHS-informed plans: evergreen structure, perennials, grasses and bulbs in layers." },
    ],
    prices: [
      { item: "Artificial lawn, supplied & installed", guide: "from £80/m²" },
      { item: "Real turf, full preparation", guide: "from £38/m²" },
      { item: "Oak sleeper raised beds", guide: "from £160/lm" },
      { item: "Planting plan + supply + planting", guide: "priced on design" },
    ],
    faqs: [
      { q: "Does artificial grass drain?", a: "Ours does — permeable backing over a free-draining sub-base sized to UK rainfall. No puddles, no smells, and pet-friendly infills where needed." },
      { q: "Is artificial turf the right call environmentally?", a: "It's honest to say it divides opinion. Where clients want zero-maintenance green we fit the best permeable systems available; where wildlife matters more, we'll make the case for real turf and pollinator planting instead. You'll get a straight recommendation, not a sales line." },
      { q: "When's the best time to plant?", a: "Autumn for structure and bare-root, spring for perennials. We plant year-round except frozen or waterlogged ground." },
    ],
    galleryKeys: ["turfPanel", "turfBeds", "raisedBeds", "planting"],
    metaDescription:
      "Premium artificial and real lawns, oak sleeper raised beds and layered planting schemes across Watford & Hertfordshire. Artificial turf from £80/m².",
  },
  {
    slug: "garden-design",
    index: "05",
    title: "Full Garden Design",
    navLabel: "Garden Design",
    strap: "Structural overhauls, from measured survey to the last bedded plant",
    heroKey: "redesignModern",
    intro: [
      "This is the whole board: levels, drainage, walls, terraces, lawn, lighting and planting resolved as one design rather than five separate trades guessing at each other's work.",
      "It starts with a measured survey and a scaled concept plan. You approve the design and a fixed, itemised cost before a single slab moves. One team takes it from demolition to handover — typically two to six weeks on site.",
    ],
    materials: [
      { name: "Design & survey", detail: "Measured survey, scaled 2D plan, material palette and planting plan. Yours to keep." },
      { name: "Groundworks", detail: "Levels, retaining structures, drainage and services routed before anything pretty happens." },
      { name: "Hard landscaping", detail: "Terraces, paths, steps, walls and edges — the permanent architecture." },
      { name: "Soft landscaping", detail: "Lawn, beds, specimen trees and layered planting to finish." },
      { name: "Lighting & power", detail: "Garden-rated circuits, outdoor sockets and layered LED lighting schemes." },
    ],
    prices: [
      { item: "Design package (survey, concept, planting plan)", guide: "from £950", note: "credited against the build when we deliver it" },
      { item: "Full garden transformation", guide: "typically £15k–£60k" },
      { item: "Phased builds", guide: "staged to budget" },
    ],
    faqs: [
      { q: "What does a full redesign cost?", a: "Most complete transformations land between £15k and £60k depending on size, levels and materials. The design stage produces a fixed itemised cost — you'll never be estimating from a day rate." },
      { q: "Can we phase the work?", a: "Yes — the master plan is designed to split cleanly: groundworks and hard landscaping first, planting and lighting in a later phase, without redoing anything." },
      { q: "Who manages the project?", a: "One contract, one project lead, our own team on site. Under CDM 2015 we take construction-phase health and safety responsibility formally — it's in the paperwork, not just goodwill." },
    ],
    galleryKeys: ["redesignAfter", "patioCourtyard", "lightBollard"],
    metaDescription:
      "Full garden design and build in Watford & Hertfordshire: measured survey, scaled design, fixed itemised cost, one team from groundworks to planting.",
  },
  {
    slug: "garden-clearance",
    index: "06",
    title: "Garden Clearance",
    navLabel: "Garden Clearance",
    strap: "Overgrown, tired or cluttered — stripped back to a clean, level canvas",
    heroKey: "wildBefore",
    intro: [
      "Every good garden starts from zero. Overgrown borders, self-set trees, tired decking, a slab pile the last lot left behind — we strip it back to a clean, level plot, cleared and carted away, so you can actually see what you're working with.",
      "It's the honest first step, and often the quickest way to fall back in love with a space. Plenty of clients stop here with a tidy blank canvas; others ask us to design and build it from there. There's no obligation to go further — but the site is left ready if you do.",
    ],
    materials: [
      { name: "Strip-out", detail: "Overgrowth, brambles, self-set trees, old turf, redundant structures and rubble — cleared by hand and machine as access allows." },
      { name: "Levelling & grading", detail: "The plot graded back to a workable, walkable level, ready to design on or seed over." },
      { name: "Site protection", detail: "Access routes boarded, existing surfaces and boundaries protected. We leave it tidier than we found it." },
      { name: "Waste & haulage", detail: "Green waste, spoil and old materials cleared, loaded and removed — disposed of responsibly, nothing left for you to deal with." },
    ],
    prices: [
      { item: "Garden clearance & haulage", guide: "priced on size, access & volume" },
      { item: "Overgrowth & bramble strip-out", guide: "from a half-day" },
      { item: "Full site reset — strip, level, grade", guide: "fixed quote after a quick look" },
    ],
    faqs: [
      { q: "Do I have to commit to a full design afterwards?", a: "Not at all. Clearance is a standalone job with its own fixed price. Plenty of clients just want the space tamed and tidy. If you do want it designed and built from there, we've already got a head start — but there's never any pressure." },
      { q: "What happens to all the waste?", a: "We clear it, load it and take it away — green waste, spoil and any old materials — and dispose of it responsibly. You're not left with skips lingering or a pile at the side of the house." },
      { q: "How quickly can you clear a garden?", a: "Most domestic clearances run one to three days depending on how overgrown it is and how easy the access. You'll get a fixed price and a firm date, not an open-ended day rate." },
    ],
    galleryKeys: ["craftSoil", "craftEdging", "redesignModern"],
    metaDescription:
      "Garden and site clearance in Watford & Hertfordshire: overgrown gardens stripped back, levelled and cleared to a clean canvas, all waste taken away. Fixed price, no obligation.",
  },
];

export const serviceBySlug = (slug: string) =>
  services.find((s) => s.slug === slug);

/** Chip options shared by the AI assessor, scripted assessor and forms. */
export const projectTypeOptions = [
  { value: "patio_paving", label: "Patio or paving" },
  { value: "driveway", label: "Driveway" },
  { value: "decking_woodwork", label: "Decking or pergola" },
  { value: "lawn_softscape", label: "Lawn or planting" },
  { value: "full_redesign", label: "Full garden redesign" },
  { value: "other", label: "Something else" },
] as const;

export const budgetOptions = [
  { value: "under_5k", label: "Under £5k" },
  { value: "5k_15k", label: "£5k–£15k" },
  { value: "15k_40k", label: "£15k–£40k" },
  { value: "over_40k", label: "£40k+" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export const timelineOptions = [
  { value: "asap", label: "As soon as possible" },
  { value: "1_3_months", label: "1–3 months" },
  { value: "3_6_months", label: "3–6 months" },
  { value: "exploring", label: "Just exploring" },
] as const;
