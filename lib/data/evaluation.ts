// Six-Dimension Company Evaluator · operator playbook scoring framework
// The 6 dimensions to score every company applied as the gate before any company enters Pipeline
// Foundational principles drawn from established consultative-sales evaluation methodology

import type { CompanyEvaluation, EvaluationVerdict } from "../types";

export interface EvaluationDimension {
  key: keyof Pick<
    CompanyEvaluation,
    "layerInStack" | "categoryMaturity" | "stageOfGrowth" | "gtmMotion" | "commercialHealth" | "mustHave"
  >;
  label: string;
  question: string;
  rubric: { score: 1 | 2 | 3 | 4 | 5; description: string }[];
}

export const EVALUATION_DIMENSIONS: EvaluationDimension[] = [
  {
    key: "layerInStack",
    label: "Layer in stack",
    question: "Which of the 5 layers does this company operate in?",
    rubric: [
      { score: 1, description: "Unclear / undefined positioning" },
      { score: 2, description: "Layer 5 (AI/Agentic) but unproven commercial layer" },
      { score: 3, description: "Layer 3 (Horizontal Apps) · broad market, more competition" },
      { score: 4, description: "Layer 2 (Platform) · system of record territory" },
      { score: 5, description: "Layer 1 (Infrastructure) OR Layer 4 (Vertical) · disproportionate value" },
    ],
  },
  {
    key: "categoryMaturity",
    label: "Category maturity",
    question: "Is the category emerging, growth-stage, or mature?",
    rubric: [
      { score: 1, description: "Mature + declining · being eaten by adjacent categories" },
      { score: 2, description: "Mature stable · ceiling on growth" },
      { score: 3, description: "Emerging · exciting but too early for stable career" },
      { score: 4, description: "Growth-stage · $50-100M ARR sweet spot range" },
      { score: 5, description: "Growth-stage CATEGORY-DEFINING leader" },
    ],
  },
  {
    key: "stageOfGrowth",
    label: "Stage of growth",
    question: "Where is the company in its lifecycle?",
    rubric: [
      { score: 1, description: "Pre-Seed / Seed · unproven, high risk" },
      { score: 2, description: "Series A · early product-market fit" },
      { score: 3, description: "Series B-C · scaling but volatile" },
      { score: 4, description: "Series D+ · proven trajectory, equity still meaningful" },
      { score: 5, description: "Late-stage unicorn OR profitable scale-up · best risk/reward" },
    ],
  },
  {
    key: "gtmMotion",
    label: "GTM motion fit",
    question: "Does the GTM motion match the candidate's strengths?",
    rubric: [
      { score: 1, description: "Pure PLG with no commercial team · no real sales role" },
      { score: 2, description: "PLG-dominant · sales is overlay, limited hunter motion" },
      { score: 3, description: "Channel-driven · requires partner ecosystem fluency" },
      { score: 4, description: "Hybrid PLG-SLG · expansion + closing motion" },
      { score: 5, description: "SLG-led · pure consultative selling · the candidate's lane" },
    ],
  },
  {
    key: "commercialHealth",
    label: "Commercial health",
    question: "Funding, ARR, customer logos, innovation roadmap signal?",
    rubric: [
      { score: 1, description: "Down round + no AI roadmap + customer churn signals" },
      { score: 2, description: "Quiet · no recent funding + thin customer logos" },
      { score: 3, description: "Steady · positive signals but nothing standout" },
      { score: 4, description: "Strong · recent round + named customers + roadmap clarity" },
      { score: 5, description: "Best-in-class · top-tier VCs + marquee logos + clear category leadership" },
    ],
  },
  {
    key: "mustHave",
    label: "Must-have vs nice-to-have",
    question: "Is this category mission-critical or discretionary?",
    rubric: [
      { score: 1, description: "Pure nice-to-have · first to be cut when budgets tighten" },
      { score: 2, description: "Productivity-adjacent · cuttable" },
      { score: 3, description: "Strategic but not load-bearing · survives most cuts" },
      { score: 4, description: "Mission-critical · CISO/CIO-mandated, business depends on it" },
      { score: 5, description: "Regulatory + personal-accountability driven · always budgeted (cyber, compliance, ITSM)" },
    ],
  },
];

/**
 * Compute total score, strong dimension count, and verdict for an evaluation.
 * Strong = score >= 4. Verdict thresholds:
 *  - 4-6 strong dims = ROCKET (Pipeline candidate)
 *  - 2-3 strong dims = WATCHLIST (multi-thread but no apply)
 *  - 0-1 strong dims = JETTISON
 */
export function computeVerdict(
  scores: Pick<
    CompanyEvaluation,
    "layerInStack" | "categoryMaturity" | "stageOfGrowth" | "gtmMotion" | "commercialHealth" | "mustHave"
  >,
): { totalScore: number; strongDimensions: number; verdict: EvaluationVerdict } {
  const vals = [
    scores.layerInStack,
    scores.categoryMaturity,
    scores.stageOfGrowth,
    scores.gtmMotion,
    scores.commercialHealth,
    scores.mustHave,
  ];
  const totalScore = vals.reduce((a, b) => a + b, 0);
  const strongDimensions = vals.filter((v) => v >= 4).length;
  let verdict: EvaluationVerdict;
  if (strongDimensions >= 4) verdict = "rocket";
  else if (strongDimensions >= 2) verdict = "watchlist";
  else verdict = "jettison";
  return { totalScore, strongDimensions, verdict };
}

/**
 * Run the evaluator with optional APAC + freshness gates from memory rules.
 */
export function evaluateCompany(input: {
  layerInStack: number;
  categoryMaturity: number;
  stageOfGrowth: number;
  gtmMotion: number;
  commercialHealth: number;
  mustHave: number;
  hasApacSeat?: boolean;
  rolePostedWithin90Days?: boolean;
  notes?: Partial<{
    layerNote: string;
    categoryNote: string;
    stageNote: string;
    gtmNote: string;
    commercialNote: string;
    mustHaveNote: string;
  }>;
}): CompanyEvaluation {
  const computed = computeVerdict(input);

  // Hard rules from memory · APAC-only + 90-day freshness
  // If either gate fails, verdict downgrades regardless of dimensional score
  let finalVerdict = computed.verdict;
  if (input.hasApacSeat === false) finalVerdict = "watchlist"; // No live APAC seat = watchlist, not pipeline
  if (input.rolePostedWithin90Days === false) finalVerdict = "watchlist"; // Stale role = watchlist

  return {
    scoredAt: new Date().toISOString(),
    layerInStack: input.layerInStack,
    layerNote: input.notes?.layerNote,
    categoryMaturity: input.categoryMaturity,
    categoryNote: input.notes?.categoryNote,
    stageOfGrowth: input.stageOfGrowth,
    stageNote: input.notes?.stageNote,
    gtmMotion: input.gtmMotion,
    gtmNote: input.notes?.gtmNote,
    commercialHealth: input.commercialHealth,
    commercialNote: input.notes?.commercialNote,
    mustHave: input.mustHave,
    mustHaveNote: input.notes?.mustHaveNote,
    totalScore: computed.totalScore,
    strongDimensions: computed.strongDimensions,
    verdict: finalVerdict,
    apacGate: input.hasApacSeat,
    freshnessGate: input.rolePostedWithin90Days,
  };
}

/**
 * Sample evaluations · populate with your own evaluated companies to demonstrate the framework.
 */
export const SAMPLE_EVALUATIONS: Record<string, CompanyEvaluation> = {};
