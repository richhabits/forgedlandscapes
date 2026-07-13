import type { ImgKey } from "@/lib/images";

/**
 * Guides engine — data-driven like services.ts / areas.ts, so a new guide is
 * one entry and the page, JSON-LD (Article + FAQ + breadcrumb) and sitemap all
 * follow automatically. No MDX toolchain, no new dependencies: the marketing
 * build stays fast and can't break on a content addition.
 *
 * Trade content is written to be correct: statutes cited accurately, all
 * prices flagged as guides, no fabricated accreditations.
 */

export type GuideSection = {
  heading?: string;
  body: string[];
  list?: { lead?: string; items: string[] };
  callout?: { label: string; text: string };
};

export type Guide = {
  slug: string;
  title: string;
  /** Short SERP/meta description. */
  description: string;
  /** Standfirst shown under the H1. */
  dek: string;
  category: string;
  readMinutes: number;
  /** ISO date — drives Article schema + "reviewed" line. */
  updated: string;
  heroKey: ImgKey;
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
  /** Service slugs to cross-link at the foot. */
  related: string[];
};

export const guides: Guide[] = [
  {
    slug: "driveway-planning-permission-suds",
    title: "Do I need planning permission for my driveway?",
    description:
      "The SuDS 5m² rule in plain English: when a new driveway needs planning permission in England, when it doesn't, and why the dropped kerb is a separate question.",
    dek: "SuDS, the 5m² rule and the dropped kerb — the whole picture, plainly, for a Hertfordshire front garden.",
    category: "Planning",
    readMinutes: 6,
    updated: "2026-07-01",
    heroKey: "driveEstate",
    sections: [
      {
        body: [
          "For most front gardens in England the answer is reassuringly simple: you can lay a new driveway without planning permission, as long as the water has somewhere to go other than the public road. The rule that governs this has been in place since October 2008, and it exists for one reason — to stop rainwater sheeting off thousands of paved front gardens straight into drains that then overwhelm during heavy rain.",
          "This is the SuDS principle — Sustainable Drainage Systems — and it's the single idea behind the whole regulation. Get the drainage right and the paperwork usually looks after itself.",
        ],
      },
      {
        heading: "The 5m² rule, exactly",
        body: [
          "Paving over a front garden is permitted development — meaning no planning application — if either of these is true:",
        ],
        list: {
          lead: "You don't need planning permission when:",
          items: [
            "The new surface is permeable (or porous), so rain soaks through it rather than running off — permeable block paving, resin-bound over an open-grade base, or gravel all qualify; or",
            "Rainwater from an impermeable surface is directed to a permeable area within your own property — a lawn, a border or a soakaway — rather than to the road.",
          ],
        },
        callout: {
          label: "When you DO need permission",
          text: "If you lay more than 5 square metres of impermeable surface (traditional concrete, tarmac or non-permeable blocks) that drains towards the highway, you need planning permission. Under 5m² of impermeable surface is fine — but there's rarely a reason to build a non-draining drive when the permeable options are better anyway.",
        },
      },
      {
        heading: "The dropped kerb is a separate question",
        body: [
          "This trips people up constantly. Whether or not your driveway surface needs planning permission, creating or widening a vehicle crossover — the dropped kerb you drive over to get from the road onto your drive — needs its own approval from the highway authority. In this area that's Hertfordshire County Council, or your borough for some roads.",
          "It's a licensed piece of work: the footway has to be built to the council's specification by an approved contractor, because it carries pedestrians and, underneath, utilities. We handle the crossover application and the licensed build alongside the driveway itself, so it's one project, not two.",
        ],
      },
      {
        heading: "When permitted development doesn't apply",
        body: [
          "A few situations remove the automatic right, and they're worth checking before you commit:",
        ],
        list: {
          items: [
            "Conservation areas and listed buildings — sympathetic materials are often expected, and permitted development rights can be restricted.",
            "Article 4 directions — some streets have had permitted development rights formally withdrawn by the council; a quick check with local planning confirms it.",
            "Flats and maisonettes — the householder permitted development rules don't apply in the same way.",
          ],
        },
      },
      {
        heading: "How we design compliance in",
        body: [
          "Every driveway we design is SuDS-compliant from the first sketch — permeable block, resin-bound over an open-graded sub-base, or engineered falls to a soakaway sized to your actual roof-and-drive run-off, not a guess. That keeps you inside permitted development and, more importantly, means your drive drains properly for the next twenty winters.",
          "Guide pricing, so you can plan: block-paved driveways from around £130/m², resin-bound from around £120/m² over a sound base, permeable systems from around £145/m². A dropped kerb application and build typically starts around £1,800. These are guides — a survey turns them into a fixed, itemised figure.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do I need planning permission for a permeable driveway?",
        a: "No. A permeable or porous driveway — permeable block, resin-bound over an open-grade base, or gravel that drains within your property — is permitted development at any size, because the rainwater soaks away rather than running to the road.",
      },
      {
        q: "What about a gravel driveway?",
        a: "Gravel is permeable, so a gravel driveway is permitted development as long as the water drains within your own boundary. The practical issues with gravel are migration and weeds, which good edging and a bound or stabilised system solve.",
      },
      {
        q: "Does a dropped kerb need separate permission?",
        a: "Yes. A new or widened vehicle crossover always needs approval from the highway authority (Hertfordshire County Council or your borough) and must be built to their specification by an approved contractor — regardless of whether the driveway surface itself needs planning permission.",
      },
      {
        q: "I want a solid concrete drive draining to the road — is that allowed?",
        a: "Only up to 5 square metres. More than 5m² of impermeable surface draining to the highway needs planning permission. In practice a permeable design avoids the application entirely and drains better, so it's almost always the route we recommend.",
      },
    ],
    related: ["driveways"],
  },
  {
    slug: "porcelain-vs-sandstone-hertfordshire-clay",
    title: "Porcelain vs sandstone in Hertfordshire clay",
    description:
      "An honest comparison of porcelain and Indian sandstone paving for Hertfordshire gardens — look, maintenance, cost and, crucially, why the base under either one matters more on clay soil.",
    dek: "Two good materials, one honest comparison — and why, on Hertfordshire's shrink-swell clay, what's under the slab decides everything.",
    category: "Materials",
    readMinutes: 7,
    updated: "2026-07-01",
    heroKey: "patioDining",
    sections: [
      {
        body: [
          "Porcelain and natural sandstone are both excellent patio materials, and the choice between them is more about the look you want and how you like to live than about one being 'better'. But there's a bigger factor most comparisons skip, and in Hertfordshire it matters more than the slab itself: the ground you're building on.",
        ],
      },
      {
        heading: "The honest difference in the surface",
        body: [
          "Porcelain is a vitrified, near-zero-porosity slab, usually 20mm thick. It's frost-proof, stain-resistant and colour-stable — it looks the same in year ten as day one — and it wants almost no maintenance. The look is crisp and contemporary, and the textured finishes grip well in the wet. It costs more per square metre, and it demands more skill to lay: slabs are primed with a slurry, cut with the right blade, and set precisely because there's no 'natural variation' to hide a wandering line.",
          "Indian sandstone is a natural stone, typically 22mm calibrated. It's warmer, more varied and it patinas with age into something softer and more traditional. It's more porous, so it takes a sealer and, in permanent shade, can host algae that needs an occasional wash. It's kinder on the budget and more forgiving to lay. Where a garden wants character and warmth rather than crisp minimalism, sandstone earns its place.",
        ],
      },
      {
        heading: "Why the base matters most on clay",
        body: [
          "Here's the part that decides whether either material still looks right in five years. Much of Hertfordshire sits on shrink-swell clay — ground that expands when wet and contracts as it dries, moving seasonally. A patio laid badly on clay lifts, rocks and cracks regardless of whether the slab on top cost £15 or £150.",
          "A patio fails at the base, never at the surface. Ours go down on a minimum 100–150mm of compacted MOT Type 1 sub-base, over a full wet mortar bed with the slabs primed — not spot-bedded on five dabs of mortar, which is where the hollow, rocking, cracking slabs you've seen at friends' houses come from. Falls are set at 1:60 to 1:80 so water leaves the surface and heads away from the house, and a flexible jointing compound absorbs the small seasonal movement instead of fighting it.",
        ],
        callout: {
          label: "The rule of thumb",
          text: "Spend your decision on the look, but never let anyone save money on the base. On clay, a proper sub-base and full mortar bed is the difference between a patio that outlasts the house and one that needs relaying by year three.",
        },
      },
      {
        heading: "Cost, as a guide",
        body: [
          "For planning purposes: a porcelain patio supplied and laid runs from around £190/m²; Indian sandstone from around £150/m². The gap is mostly the material and the extra laying time porcelain needs. These are guide figures — levels, access, steps and groundworks all move the number, which is why a survey produces a fixed, itemised quote rather than a rate.",
        ],
      },
      {
        heading: "So which one?",
        body: [
          "Porcelain if you want low-maintenance, colour-stable and crisp — especially in a modern scheme or a shady garden where you'd rather not manage algae. Sandstone if you want warmth, character and a softer, aged feel, or you're balancing a bigger project against budget. We bring full-size samples to the survey and lay them down in your actual light — never choose paving from a website swatch or a showroom's LED strip.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is porcelain or sandstone more slippery when wet?",
        a: "Textured, capped porcelain is generally better in the wet than smooth natural stone, and far better than sandstone that has grown algae in the shade. Whichever you choose, the falls we build in mean the surface sheds water rather than holding it, which is what actually keeps a patio safe underfoot.",
      },
      {
        q: "Will porcelain crack in frost?",
        a: "No — porcelain's near-zero porosity makes it frost-proof, so it won't spall or crack from cold. What cracks any paving is a failing base: movement in the ground telegraphs up through slab and joint alike, which is why the sub-base and mortar bed matter more than the material.",
      },
      {
        q: "Does the paving need sealing?",
        a: "Natural sandstone should be sealed, and we seal it as standard; it benefits from re-sealing every few years. Porcelain does not need sealing at all — its surface is effectively non-absorbent, which is a large part of why it's so low-maintenance.",
      },
      {
        q: "Why does Hertfordshire clay matter for my patio?",
        a: "Clay soil swells when wet and shrinks when dry, moving seasonally. If a patio is spot-bedded or laid on a thin sub-base, that movement lifts and cracks it. A 100–150mm compacted sub-base, full mortar bed and flexible jointing absorb the movement — which is why the groundwork, not the slab, is the real investment.",
      },
    ],
    related: ["patios-paving", "garden-design"],
  },
  {
    slug: "what-a-proper-patio-quote-itemises",
    title: "What a proper patio quote itemises",
    description:
      "How to read a landscaping quote: the line items a fair patio quote breaks out, the red flags of a vague one, and the consumer rights (CCR 2013, CRA 2015) that protect you.",
    dek: "A fixed, itemised quote is a promise you can hold someone to. Here's what it should contain — and the rights that sit behind it.",
    category: "Buying well",
    readMinutes: 7,
    updated: "2026-07-01",
    heroKey: "patioCourtyard",
    sections: [
      {
        body: [
          "The difference between a good landscaping job and a bad one is usually visible in the quote, long before anyone lifts a slab. A proper quote is itemised and fixed: it tells you exactly what's being built, to what specification, for what price. A poor one is a single day-rate line and a shrug about 'seeing what we find when we dig'. Knowing what a fair quote contains lets you compare like with like — and spot the corner being cut.",
        ],
      },
      {
        heading: "The line items a fair quote breaks out",
        body: ["A patio quote worth trusting itemises most or all of the following:"],
        list: {
          items: [
            "Excavation and muck-away — digging out to depth and removing the spoil, disposed of by a registered waste carrier (ask for the registration).",
            "Sub-base — the type and compacted depth of hardcore, e.g. 100–150mm of MOT Type 1. This is the single most important line, and the first one cowboys skip.",
            "Edge restraints and haunching — what holds the edges from spreading, set in concrete.",
            "Laying course and bedding — a full wet mortar bed, not spot-bedding.",
            "The paving — material, thickness, area in m² and unit, so you can check the maths.",
            "Cutting and detailing — around drains, walls, curves and steps.",
            "Drainage — the falls, plus any ACO channels or soakaway, sized to the run-off.",
            "Jointing and pointing — the compound and method.",
            "Access, skip and welfare — how machinery and waste get in and out.",
            "Labour, programme and VAT — the days on site and whether VAT is included.",
          ],
        },
      },
      {
        heading: "The red flags",
        body: ["If a quote does any of these, ask questions before you sign:"],
        list: {
          items: [
            "A single day-rate with no specification — you're paying for time, not a result.",
            "No sub-base depth stated, or no muck-away line — the two easiest places to save money at your expense.",
            "No drainage mentioned at all on an area that clearly needs it.",
            "Cash-only, no written quote, no paperwork — which usually also means no insurance and no comeback.",
            "Full payment, or a very large deposit, demanded up front.",
          ],
        },
      },
      {
        heading: "The rights that sit behind the quote",
        body: [
          "You're better protected than most people realise, and a reputable firm will be comfortable with all of it:",
        ],
        callout: {
          label: "Your statutory protections",
          text: "Because a landscaping contract is usually agreed at your home, it's an off-premises contract: under the Consumer Contracts Regulations 2013 you have a 14-day cancellation right (you can waive it to start sooner, in writing). Under the Consumer Rights Act 2015 the work must be carried out with reasonable care and skill and any materials must be as described. On larger projects, the Construction (Design and Management) Regulations 2015 set out who formally holds health-and-safety responsibility — it should be named, not assumed.",
        },
      },
      {
        heading: "Staged payments, not full up front",
        body: [
          "A fair firm never asks for the full amount before work starts. Payments are staged against progress — a modest deposit to secure materials and dates, then instalments tied to milestones. That protects you: your money tracks work actually done. It's how we structure every contract, alongside a written itemised quote, a fixed programme and a 5-year workmanship guarantee.",
        ],
      },
    ],
    faqs: [
      {
        q: "Should I pay a deposit before work starts?",
        a: "A modest deposit to secure materials and dates is normal; full or very large payments up front are not. Payments should be staged against progress so your money always tracks work actually completed. Never pay in full before the job starts.",
      },
      {
        q: "Is a written quote legally binding?",
        a: "A fixed, itemised written quote is an offer that, once accepted, forms the contract — far stronger than a verbal 'estimate'. Insist on it in writing: it's what lets you hold a contractor to the specification and price you agreed.",
      },
      {
        q: "What is the 14-day cancellation right?",
        a: "Because the contract is typically agreed in your home, it's an off-premises contract under the Consumer Contracts Regulations 2013, which give you 14 days to cancel. If you want work to start sooner you can waive that in writing — a reputable firm will explain this rather than skip it.",
      },
      {
        q: "What if the finished patio is defective?",
        a: "The Consumer Rights Act 2015 requires services to be performed with reasonable care and skill and materials to be as described. If workmanship falls short, you're entitled to have it put right. A workmanship guarantee on top of that gives you a clear, direct route to remedy.",
      },
    ],
    related: ["patios-paving", "driveways"],
  },
];

export const guideBySlug = (slug: string) => guides.find((g) => g.slug === slug);
