export interface StandingRule {
  id: string;
  category: RuleCategory;
  icon: string;
  title: string;
  one_liner: string;
  body: string;
  apply_when: string;
  examples?: string[];
}

export type RuleCategory =
  | "Voice & Tone"
  | "Outreach Craft"
  | "Targeting & Pipeline"
  | "Positioning"
  | "Negotiation"
  | "Frameworks"
  | "Process Discipline";


export const STANDING_RULES: StandingRule[] = [
  // VOICE & TONE
  {
    id: "executive-presence",
    category: "Voice & Tone",
    icon: "💼",
    title: "Executive Presence (default)",
    one_liner: "Confident declarative prose. No hedging. No filler. Active voice. Outward CTAs.",
    body: "All professional written materials default to Executive Presence. Cut hedging openers (\"I'd love\", \"would love\"), filler intensifiers (\"genuinely\", \"honestly\", \"really\"), passive servility, apologetic framing, and soft qualifiers on numbers. Lean into declarative thesis openers, active voice, strong verbs, colon-led mini-headers, anchored numbers, and confident closing posture.",
    apply_when: "ATS form answers · cover letters · LinkedIn DMs · recruiter follow-ups · interview written responses · any professional outreach with a subject field",
    examples: [
      "\"I'd love a conversation\" → \"Happy to walk through... when it suits\"",
      "\"I'd love to\" → \"I'd like to\" or \"I'll\" or omit",
      "\"genuinely\" → omit (90% of the time)"
    ]
  },
  {
    id: "no-em-dashes",
    category: "Voice & Tone",
    icon: "✂️",
    title: "No em dashes",
    one_liner: "Never use em dashes in formal outreach materials.",
    body: "Use commas, colons, or sentence breaks. Em dashes are visually conspicuous and read as either AI-generated or amateur-formal. A direct voice does not need that punctuation.",
    apply_when: "Every cover letter, ATS answer, cold email, follow-up · INCLUDING when paraphrasing or compressing thought",
    examples: [
      "❌ \"clinicians won't put a tool — between themselves and a patient — unless they trust it\"",
      "✅ \"clinicians won't put a tool between themselves and a patient unless they trust it\""
    ]
  },
  {
    id: "accountability-lines",
    category: "Voice & Tone",
    icon: "🎯",
    title: "Accountability lines (rapport-first selling)",
    one_liner: "Every sales script includes 4-6 \"I don't know but I'll come back in 24 hrs\" variants.",
    body: "Sell rapport-first, never waffle. Top-1% closers admit gaps with confidence. The \"I don't know\" library converts unknowns into trust-building moments.",
    apply_when: "Sales role-play prep · live discovery calls · interview written exercises · any moment a buyer asks a question outside your lane",
    examples: [
      "\"I don't know the latest revenue split between X and Y. I'll get back to you in 24 hrs.\"",
      "\"I haven't run a campaign against that ICP before. I'd want to spend a week mapping it before I quoted you a number.\""
    ]
  },

  // OUTREACH CRAFT
  {
    id: "scroll-stop-openers",
    category: "Outreach Craft",
    icon: "🛑",
    title: "Scroll-stop DM openers",
    one_liner: "Every outreach first-line must be a thesis, reframe, or specific personal observation. NEVER generic \"Hi [name], just applied\".",
    body: "The first sentence either earns the next 30 seconds or doesn't. Open with: (1) a memorable thesis claim, (2) a counterintuitive reframe that's also true, or (3) a specific personal observation tied to THEIR work. The audit question: \"If a recruiter had 200 unread DMs and this was line one, would they scroll past?\"",
    apply_when: "Every LinkedIn DM, cold email, first-touch outreach · audit BEFORE send",
    examples: [
      "✅ \"Trust is the only thing that compounds in sales. This is the rare product where trust IS the commercial loop.\"",
      "✅ \"Clinicians don't buy software. They grant access. That's not commerce, it's trust transfer.\"",
      "❌ \"Hi [name], just applied for the [role]\"",
      "❌ \"Hi [name], hope you're well\""
    ]
  },
  {
    id: "subject-line-audit",
    category: "Outreach Craft",
    icon: "📧",
    title: "Subject line audit",
    one_liner: "Every email/InMail subject gets its own crafting pass. Specific company + role + differentiator under 60 chars.",
    body: "Subject lines are their own asset, not an afterthought. Never default to generic \"Quick question / Following up / Introduction\". Lead with the highest-value detail. Match the body content. Compress under 60 chars.",
    apply_when: "Cold emails · LinkedIn InMail · application emails · follow-up emails",
    examples: [
      "✅ \"BDR role at [Company], referred by [mutual connection]\"",
      "✅ \"SDR ANZ at [Company] + 60-sec product-demo video\"",
      "❌ \"Quick question\" · \"Introduction\" · \"Following up\""
    ]
  },
  {
    id: "linkedin-intel-leverage",
    category: "Outreach Craft",
    icon: "🔍",
    title: "LinkedIn intel · 30-sec profile dig before every send",
    one_liner: "Dig their LinkedIn for shared connection, prior employer overlap, mutual interest, or content they've posted.",
    body: "30 seconds of profile work before any outreach. Look for: mutual 2nd-degree connections, prior employer overlap, geographic overlap (shared city), career arc parallels, recent posts they've made, education overlap, sport/hobby signals, or content they've quoted. Never fabricate.",
    apply_when: "Every LinkedIn DM · cold email · connection request · follow-up",
    examples: [
      "Shared city → warmth anchor",
      "Prior-employer career-arc recognition",
      "Shared interests, founder DNA, or industry overlap"
    ]
  },
  {
    id: "use-product-in-demo",
    category: "Outreach Craft",
    icon: "🎬",
    title: "Use the product in the first Loom/asset",
    one_liner: "Every first video/asset must demo the company's actual product live, not pitch it.",
    body: "Don't pitch the product, use it. Spin up the free tier or use existing access. Build a 60-90 sec walkthrough showing logged-in product use plus how you would workflow it day-1 in the SDR/AE seat.",
    apply_when: "Any product-led / dev-tools / AI company where the product is accessible",
    examples: [
      "Use the product's free tier live in the asset (e.g. generate a real output on their platform)",
      "Show the exact day-1 workflow you'd run if you had the seat"
    ]
  },
  {
    id: "loom-script-template",
    category: "Outreach Craft",
    icon: "🎥",
    title: "Warm-intro Loom script (75-85 sec)",
    one_liner: "Hook → Credibility → Differentiator → Honest friction → Soft CTA.",
    body: "5-part structure: 1) Hook (10 sec) — name + role + why THIS company (one researched detail). 2) Credibility (15-20 sec) — most relevant 1-2 wins, quantified. 3) Differentiator (20-25 sec) — what makes you 10x. 4) Honest friction (10 sec) — name the gap, frame as AI-native operator who learns fast. 5) Soft CTA (15 sec) — Who/When/Length/Agenda.",
    apply_when: "Warm-intro Loom video for selective applications · top 3-4 compound fits per sprint",
    examples: ["Generate from the opportunity, pattern, and hiring-manager context"]
  },

  // TARGETING & PIPELINE
  {
    id: "three-stakeholder-framework",
    category: "Targeting & Pipeline",
    icon: "⭐",
    title: "3-stakeholder star map",
    one_liner: "Every role's star map = exactly HM + Recruiter + Peer. Not founders. Not global heads.",
    body: "Stakeholder 1: Hiring Manager (the specific person the role reports to — NOT the global sales lead unless they're literally the line manager). Stakeholder 2: Internal Recruiter / TA Partner. Stakeholder 3: Peer in role (current SDR/AE at the company). Find HM via the job ad's \"Meet the hiring team\" first, then LinkedIn filter by Sales Manager / Head of SDR + city.",
    apply_when: "Every Mission Profile · every new opportunity entering the pipeline",
    examples: [
      "HM = the person the role reports to · found via 'Meet the hiring team' or a LinkedIn Sales Manager filter + city",
      "Recruiter = internal TA partner · Peer = a current SDR/AE already in the seat"
    ]
  },
  {
    id: "bdr-first-targeting",
    category: "Targeting & Pipeline",
    icon: "🚀",
    title: "BDR/SDR-first at high-equity rockets",
    one_liner: "Default to BDR/SDR roles at high-growth/high-equity rockets over AE/AM titles.",
    body: "Pride at the door. Equity through the door. 12-18 months of SDR-shape work at a Series A-D rocket beats 4 years of Senior AE at a mature company. The shape of the seat matters less than the rocket and the equity.",
    apply_when: "Default targeting filter · only deviate for AE seats where you have a deliberate stretch case + AE framework",
    examples: ["SDR at a high-equity rocket > Enterprise AE at a slower-growth company > generic Senior AE at mature SaaS"]
  },
  {
    id: "always-on-threading",
    category: "Targeting & Pipeline",
    icon: "🕸",
    title: "Always-on threading",
    one_liner: "Any rocket that meets criteria gets multi-threaded even if no current role matches.",
    body: "Build relationships now, ship application when seat opens. Silent connect + 3-5 days of content engagement BEFORE the silent connect for active HMs. By the time the seat posts, you are already in their notification feed.",
    apply_when: "Watchlist companies · Series A-D rockets with team being built · founding-region stage with no IC role posted yet",
    examples: [
      "IC BDR not posted but BDR Manager open · thread the sales lead + TA + a peer AE in the city",
      "A new regional GM just appointed · thread them + the recruiter early",
      "Team being built with no IC role live yet · thread leadership now"
    ]
  },
  {
    id: "pre-touch-engagement",
    category: "Targeting & Pipeline",
    icon: "👀",
    title: "Pre-touch engagement cadence",
    one_liner: "For LinkedIn-active HMs, like/comment for 3-5 days BEFORE the silent connect.",
    body: "When the HM's notification feed already shows your name, the connection request lands as familiar rather than cold. Engage substantively before you connect.",
    apply_when: "Any HM who posts 1+/week on LinkedIn · if inactive, skip straight to silent connect → DM",
    examples: ["Comment substantively on 2-3 posts → connect with no message → DM after accept"]
  },
  {
    id: "dont-peak-first-touch",
    category: "Targeting & Pipeline",
    icon: "🎯",
    title: "Don't peak at first-touch",
    one_liner: "Ship clean and human at application stage. Save Playbook/Agent/audio firepower for later rounds.",
    body: "A hard-won lesson. Going maximum effort on first interaction (1) sets unsustainable expectations, (2) reads as try-hard to senior screeners, (3) burns energy before decision-maker rounds, (4) undermines the human-to-human \"I'd love a conversation\" rapport play.",
    apply_when: "Initial application + first DM phase · DO use heavy artillery for round 2-3 of interview process (custom playbooks, Conversational AI agents, multi-asset pitches, account plans)",
    examples: [
      "Simple application + a few DMs first (not a full Conversational Agent + Playbook combo)",
      "Application + 30-60-90 plan attached for round 2, not round 1"
    ]
  },

  // NEGOTIATION
  {
    id: "senior-ae-comp-benchmarks",
    category: "Negotiation",
    icon: "💰",
    title: "Senior Tech AE comp benchmarks",
    one_liner: "Mean OTE ~$330K USD across major tech AE seats. Top performers $1M-$1.4M+.",
    body: "Major cloud, data, and security vendors cluster in the $320K-$355K USD OTE band for senior AE seats, with top performers reaching $1M-$1.4M+. AU conversion is roughly 0.66x USD, then 25-40% lower again for the AU equivalent seat.",
    apply_when: "Every comp negotiation · recruiter screen comp question · HM offer conversation · counter-offer construction",
    examples: ["Anchor: \"the senior tech AE band runs $320K-$355K USD OTE across major cloud, data, and security vendors\""]
  },

  // FRAMEWORKS
  {
    id: "interview-prep-template",
    category: "Frameworks",
    icon: "📋",
    title: "Interview prep deliverable template",
    one_liner: "Default to single styled HTML file with 14-section structure for every interview prep request.",
    body: "14 required sections: Strategic breakdown · LinkedIn pre-call audit · Top 5 questions · Competencies tested · Your biggest gaps + reframes · 3 sharp discovery questions · Objection handling · Comp research + rehearsal · 90-day KPI expectations · Segment-specific tactics · Red flags · Day-by-day timeline · Cheat-sheet · Post-interview debrief template.",
    apply_when: "Every interview prep request for any company",
    examples: ["A mock prep runs ~10 min using the template vs hours of manual work before it existed"]
  },
  {
    id: "pitch-deck-iteration",
    category: "Frameworks",
    icon: "🎤",
    title: "Pitch deck iteration pattern",
    one_liner: "9-slide max · time-flex color markings · Gamma handoff · top-1%-closer audit · soft CTA with specific Who/When/Length/Agenda.",
    body: "When iterating pitch decks, default to: 9 slides max · time-flex color markings on each slide · ready for Gamma.AI handoff · top-1%-closer audit pass · soft CTA with specific Who/When/Length/Agenda meeting ask.",
    apply_when: "Every pitch deck request · sales meeting prep · interview leave-behind deck",
    examples: ["Interview leave-behind deck · sales-meeting pitch"]
  },
  {
    id: "ae-stretch-framework",
    category: "Frameworks",
    icon: "🎯",
    title: "AE-stretch pitch (bet-based, not fit-based)",
    one_liner: "For Senior/Enterprise AE roles stretching beyond formal SaaS tenure · lead with the gap acknowledgment · reframe operator history into AE muscle · show MEDDPICC fluency · ship a 30-60-90 leave-behind plan.",
    body: `<strong>The core insight:</strong> SDR/BDR roles are fit-based ("does this candidate match the JD?"). Senior/Enterprise AE roles are bet-based ("is this candidate worth a quota bet on?"). Different sales architecture required.<br/><br/>
<strong>5-part pitch architecture:</strong><br/>
<strong>1. Lead with gap acknowledgment.</strong> Don't hide it. Open with: "I'm not a 5-year senior AE on paper. Here's why I'm worth the bet." Honesty disarms the hiring filter.<br/>
<strong>2. Reframe operator history into AE muscle.</strong> A quantified short-tenure sales result = full-cycle qualification + discovery + close-handoff exposure. Years of founder revenue with enterprise procurement across blue-chip corporate clients = multi-stakeholder, multi-quarter cycles, board-level conversations. International wholesale partnerships = cross-border BD muscle.<br/>
<strong>3. Demonstrate MEDDPICC fluency in the pitch itself.</strong> Reference Metrics from their public case studies (their published customer outcomes, volumes, and uplift figures). Name the Economic Buyer pattern. Show you understand the Decision Process (90-180d enterprise AI procurement through Security + Legal + Data + Procurement). Map Pain to Champion to Competition.<br/>
<strong>4. Ship a 30-60-90 leave-behind plan.</strong> Concrete commitments per phase. Not aspirational. Day 30: logos mapped, first-call patterns documented, 2 champion conversations initiated. Day 60: first qualified opp sourced, deep product fluency, reference deck shipped. Day 90: first closed-won committed, market intel brief delivered, AE playbook iterations contributed back.<br/>
<strong>5. The differentiator close.</strong> "Most senior AEs walk in with 5 yrs of pattern-matching from one vertical. I walk in with years of founder reality, formal sales discipline, and an AI-native operator workflow that lets me move 3x faster than peers on prep. The bet is which is more transferable into the [Company] shape role."`,
    apply_when: "Every Senior/Enterprise/Founding AE role where your formal SaaS tenure is short of the JD requirement",
    examples: [
      "Enterprise AE role asking 5-8 yr full-cycle vs a short formal sales tenure + long operator history → bet-based pitch with blue-chip logo reframe + MEDDPICC demonstration + 30-60-90 leave-behind",
      "Legal or vertical AI Enterprise AE → same architecture, swap in the industry-adjacent narrative from your operator background"
    ]
  },
  {
    id: "meddpicc-quick-reference",
    category: "Frameworks",
    icon: "📐",
    title: "MEDDPICC · quick reference for AE conversations",
    one_liner: "The enterprise B2B qualification framework · use as discovery scaffolding in every AE interview + leave-behind plan.",
    body: `<strong>M · Metrics</strong> — the quantifiable pain or outcome. What's measured today? What's the target? Reference the vendor's published customer outcome and volume figures.<br/>
<strong>E · Economic Buyer</strong> — who signs the cheque. Title + level + budget authority. Usually 2 levels above the Champion. In enterprise AI: SVP CX Ops, Chief Customer Officer, VP Digital Transformation.<br/>
<strong>D · Decision Criteria</strong> — what they evaluate vendors against. For enterprise AI: governance, model lineage, audit trail, latency SLAs, customer experience metric uplift, security posture, on-prem/data-residency options.<br/>
<strong>D · Decision Process</strong> — how the org actually buys. Enterprise AI typically: 90-180d through Security review + Legal + Data team + Procurement + sometimes Board. Map the steps.<br/>
<strong>P · Paper Process</strong> — MSA, DPA, security questionnaire, redlines, procurement docs. Where deals stall. Get this in motion at Day 60, not Day 100.<br/>
<strong>I · Identify Pain</strong> — the specific cost/risk/inefficiency that compels action. Quantify it. "$X cost-to-serve crushing margin" / "Y compliance deadline forcing AI explainability investment."<br/>
<strong>C · Champion</strong> — your internal seller. Has personal political capital riding on the project. Will navigate procurement for you. Test: do they talk to others about you when you're not there?<br/>
<strong>C · Competition</strong> — what else they're considering. Almost always includes (a) in-house build, (b) point solutions / incumbents, (c) other AI startups. Name them. Position against them.`,
    apply_when: "Every Senior/Enterprise AE interview · AE-stretch pitch · leave-behind 30-60-90 plan · discovery role-play",
    examples: [
      "M=published completion-uplift metric, EB=SVP CX Ops, DC=governance + audit trail, DP=90-180d, PP=MSA+DPA+security, IP=CX cost-to-serve, Ch=VP Digital Transformation, Co=in-house build / incumbent point solutions / other AI startups"
    ]
  },
  {
    id: "thirty-sixty-ninety",
    category: "Frameworks",
    icon: "📅",
    title: "30-60-90 day plan (AE leave-behind template)",
    one_liner: "Concrete commitments per phase · not aspirational · ship as a one-page leave-behind after final round.",
    body: `<strong>Days 1-30 · Land + Map</strong><br/>
- Product certification + competitive landscape memorisation<br/>
- Map 8-15 named regional logos in vertical X with revenue band + likely buying centre<br/>
- 2 champion conversations initiated (warm intros via your existing corporate network — target contacts with an SVP-level digital/CX function)<br/>
- First-call patterns documented · share with manager Day 30<br/>
- Internal: meet every AE, SE, CS, and product peer in-region + a few global counterparts<br/><br/>
<strong>Days 31-60 · Source + Demonstrate</strong><br/>
- First qualified opportunity sourced from cold outbound (target: $200K+ ACV)<br/>
- Deep product fluency · ship a reference architecture deck for a target vertical use case<br/>
- First demo delivered solo · feedback captured · iteration shipped<br/>
- 6+ pipeline meetings booked from outbound + AE-network warm intros<br/>
- Internal: contribute 3+ region-specific GTM insights back to product (procurement quirks, data sovereignty, etc.)<br/><br/>
<strong>Days 61-90 · Commit + Compound</strong><br/>
- First closed-won committed (target: by Day 90 OR clear path to close in Q+1)<br/>
- Market intel brief delivered to the relevant exec sponsor<br/>
- AE playbook iterations contributed back (what works in-region, what doesn't translate)<br/>
- Pipeline coverage at 3x quota by Day 90<br/>
- Internal: established as the founder-DNA AE for the region — go-to for any local account or region-specific deal motion<br/><br/>
<strong>Format:</strong> One page, three columns, bullet points, share as PDF at end of final round interview.`,
    apply_when: "Every Senior/Enterprise/Founding AE final-round interview · any role where 'show me your plan' is the close-out ask",
    examples: ["Enterprise AE final-round leave-behind · ship Day 0 of final round"]
  },
];

export const RULE_CATEGORIES: RuleCategory[] = [
  "Voice & Tone",
  "Outreach Craft",
  "Targeting & Pipeline",
  "Positioning",
  "Negotiation",
  "Frameworks",
  "Process Discipline",
];
