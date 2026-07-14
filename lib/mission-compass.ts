// V3.0 · Mission Compass · the values engine that makes ORS a job ASSESSOR, not a job board.
//
// Profiles who the user actually is (values, psychological needs, anchors),
// then scores every opportunity against that. Source-of-truth science:
// Schwartz values · SDT autonomy/competence/relatedness · self-concordance ·
// RIASEC vocational fit · Direction Vows per life domain.
//
// Voice: calm, honest, on-your-side. No gamified urgency. Research, not vibes.
// "This would deplete you" beats "94% match."
//
// Lite version (V3.0): AI-conversational calibration via Claude. Stored client-side
// in localStorage as part of AppState. Validated peer-reviewed instruments
// (PVQ-21, BPNSS, ACT PVQ-II, HEXACO, etc.) layered in later as the credibility moat.

// ────── Values Profile · the calibration output ──────

export type SchwartzValue =
  | "self-direction"
  | "stimulation"
  | "hedonism"
  | "achievement"
  | "power"
  | "security"
  | "conformity"
  | "tradition"
  | "benevolence"
  | "universalism";

export const SCHWARTZ_VALUES_DEFS: Record<SchwartzValue, { name: string; brief: string }> = {
  "self-direction": { name: "Self-Direction", brief: "Independent thought + action · choosing, creating, exploring" },
  "stimulation": { name: "Stimulation", brief: "Excitement, novelty, challenge · a life with edges" },
  "hedonism": { name: "Hedonism", brief: "Pleasure and gratification for yourself" },
  "achievement": { name: "Achievement", brief: "Personal success through competence · earning the win" },
  "power": { name: "Power", brief: "Social status, prestige, control over people or resources" },
  "security": { name: "Security", brief: "Safety, harmony, stability for self + close others" },
  "conformity": { name: "Conformity", brief: "Restraint of actions that violate norms or expectations" },
  "tradition": { name: "Tradition", brief: "Respect for customs and ideas your culture or family carries" },
  "benevolence": { name: "Benevolence", brief: "Preservation + enhancement of welfare of close others" },
  "universalism": { name: "Universalism", brief: "Understanding, tolerance, protection of all people + nature" },
};

export type SDTNeed = "autonomy" | "competence" | "relatedness";

export const SDT_NEEDS_DEFS: Record<SDTNeed, { name: string; brief: string }> = {
  "autonomy": { name: "Autonomy", brief: "The need to feel ownership over your choices and direction" },
  "competence": { name: "Competence", brief: "The need to feel capable and effective at what you do" },
  "relatedness": { name: "Relatedness", brief: "The need for warm, connected relationships at work" },
};

export type SelfConcordanceTendency = "intrinsic" | "identified" | "introjected" | "external" | "mixed";

export type RiasecType = "realistic" | "investigative" | "artistic" | "social" | "enterprising" | "conventional";

export const RIASEC_DEFS: Record<RiasecType, { name: string; brief: string }> = {
  "realistic": { name: "Realistic", brief: "Doers · hands-on, practical, mechanical work" },
  "investigative": { name: "Investigative", brief: "Thinkers · research, analysis, problem-solving" },
  "artistic": { name: "Artistic", brief: "Creators · expression, design, originality" },
  "social": { name: "Social", brief: "Helpers · teaching, counselling, serving others" },
  "enterprising": { name: "Enterprising", brief: "Persuaders · sales, leadership, business-building" },
  "conventional": { name: "Conventional", brief: "Organisers · structure, detail, systems" },
};

export type LifeDomain = "work" | "health" | "money" | "relationships";

export interface DirectionVow {
  domain: LifeDomain;
  vow: string; // short verb-based statement · "I move toward..."
}

export interface RetrodictionNote {
  context: string; // e.g. "left a founder seat to take a BDR role"
  insight: string; // what this revealed about real (vs aspirational) values
}

// V3.0 · Modern organisational psychology · Calling Orientation
// Wrzesniewski et al. 1997 · "Jobs, Careers, and Callings: People's Relations to Their Work"
// Three orientations · job (money), career (advancement), calling (intrinsic meaning)
export type CallingOrientation = "job" | "career" | "calling" | "mixed";

export const CALLING_DEFS: Record<CallingOrientation, { name: string; brief: string }> = {
  "job": { name: "Job", brief: "Work is primarily a means to financial stability · what I do outside work is where life lives" },
  "career": { name: "Career", brief: "Work is a path of achievement + advancement · progression and prestige matter" },
  "calling": { name: "Calling", brief: "Work is intrinsically meaningful · the work itself is part of who I am" },
  "mixed": { name: "Mixed · context-dependent", brief: "It shifts · sometimes calling, sometimes career, sometimes job" },
};

export interface ValuesProfile {
  // Top 3-5 Schwartz values, ranked
  topValues: SchwartzValue[];
  // Values they'd hate to violate (the negative space)
  antiValues?: SchwartzValue[];

  // SDT needs · ranked priorities · 1 = most important
  needsPriorities: SDTNeed[];

  // Self-concordance baseline
  selfConcordance: SelfConcordanceTendency;
  selfConcordanceNote?: string;

  // V3.0 · Modern OB · Calling Orientation (Wrzesniewski 1997)
  callingOrientation?: CallingOrientation;
  callingOrientationNote?: string;

  // RIASEC vocational fit (typically 2-3 dominant types)
  riasec: RiasecType[];

  // Direction Vows per life domain
  directionVows: DirectionVow[];

  // Behavioural retrodiction notes · 3-5 past roles/decisions
  retrodiction: RetrodictionNote[];

  // Metadata
  calibratedAt: string; // ISO
  version: number; // for re-calibration tracking
  notes?: string; // user's freeform additions
}

// ────── Mission Compass Assessment · per opportunity, per user ──────

export interface FiveLensRead {
  valuesAlignment: string; // which top values this role lets them express; what it'd violate
  needsFit: string; // will it satisfy or frustrate autonomy/competence/relatedness
  selfConcordance: string; // intrinsic/identified vs introjected/external
  vocationalFit: string; // role-type vs anchors
  directionVowCheck: string; // conflicts with stated vows
}

export interface MissionCompassAssessment {
  oppId: string;
  reads: FiveLensRead;
  fitRead: string; // one honest sentence
  whyItFits: string[]; // strongest genuine reasons (2-4)
  redFlags: string[]; // clearest conflicts or risks (0-4)
  selfConcordanceFlag?: string; // gentle but clear if they're chasing for external reasons
  // V3.0 · Job Crafting (Wrzesniewski + Dutton 2001) · how could the role be shaped over time?
  craftingOpportunities?: string[];
  // Soft "score" for sorting · 0-100 but never the headline · plain language always leads
  fitScore?: number;
  assessedAt: string; // ISO
}

// ────── Decision Journal · the self-prediction accuracy loop ──────

export interface DecisionEntry {
  id: string;
  oppId?: string;
  question: string; // e.g. "should I pursue Company X?"
  chosen: string; // the option taken
  predictedAlignment: number; // 0-100 · what I thought at the time
  reasoning: string; // why I chose what I chose
  reviewDueAt: string; // ISO · 30 days from decision
  reviewedAt?: string; // ISO · when reviewed
  outcome?: "matched-prediction" | "exceeded-prediction" | "fell-short" | "ambiguous";
  outcomeNote?: string;
  accuracyDelta?: number; // -100 to +100 · how far off the prediction was
  createdAt: string;
}

// ────── Default Values Profile · empty state ──────

export function emptyValuesProfile(): ValuesProfile {
  return {
    topValues: [],
    needsPriorities: ["autonomy", "competence", "relatedness"],
    selfConcordance: "mixed",
    riasec: [],
    directionVows: [],
    retrodiction: [],
    calibratedAt: new Date().toISOString(),
    version: 0,
  };
}

export function isCalibrated(profile?: ValuesProfile): boolean {
  if (!profile) return false;
  return profile.topValues.length >= 3 && profile.directionVows.length >= 2 && profile.version > 0;
}

// ────── The Scoring Engine · system prompt (paste-ready for Claude) ──────
// This is the Mission Compass scoring spec, distilled into a
// drop-in system prompt that takes a Values Profile + an Opportunity and returns
// a structured FiveLensRead + plain-language assessment.

export const MISSION_COMPASS_SYSTEM_PROMPT = `You are the Values Engine behind Operation Rocket Ship · a job ASSESSOR, not a job board.
Your job is to assess a specific opportunity against who this person actually is,
so they pursue roles that fit their values and avoid ones that will deplete them.

You are grounded in twelve peer-reviewed psychological + organisational frameworks:

VALUES + MOTIVATION (the foundations)
1. Schwartz Theory of Basic Human Values (1992) · 10-value typology
2. Self-Determination Theory · Deci + Ryan (2000) · autonomy / competence / relatedness
3. Self-Concordance Theory · Sheldon + Elliot (1999) · intrinsic / identified / introjected / external motivation
4. ACT Values · Hayes (1999+) · verb-based Direction Vows
5. Holland RIASEC (1997) · vocational interest types

JOB + ENVIRONMENT (modern organisational psychology)
6. JD-R Model · Bakker + Demerouti (2001) · demands vs resources balance
7. Areas of Worklife Survey · Maslach + Leiter (1997) · workload, control, reward, community, fairness, values
8. Person-Environment Fit · Kristof-Brown (2005) · the umbrella · person-organisation, person-job, person-supervisor, person-team congruence
9. Job Crafting · Wrzesniewski + Dutton (2001) · post-hire role-shaping · task / relational / cognitive crafting · roles are not static
10. Calling Orientation · Wrzesniewski et al. (1997) · job vs career vs calling · the orientation distinction
11. Meaningful Work · Steger, Dik + Duffy (2012) · WAMI · positive meaning, meaning-making through work, greater-good motivations
12. Psychological Safety · Edmondson (1999) · team-level construct · the precondition for learning, candour, innovation

You are given:
- VALUES PROFILE: the user's top Schwartz values, their SDT needs priorities,
  self-concordance tendencies, Calling Orientation (if specified), RIASEC anchors,
  Direction Vows per life domain, and behavioural retrodiction notes from past decisions.
- OPPORTUNITY: a role (title, company, description, comp if known, culture and role signals).

Assess the opportunity across FIVE lenses. Each lens MUST integrate the relevant
modern OB frameworks · don't just name them, REASON through them:

1. VALUES ALIGNMENT (Schwartz + Meaningful Work)
   Which of their top values does this role let them express, and which might it violate?
   Does the role offer positive meaning, meaning-making opportunities, and greater-good
   motivations (WAMI dimensions)?

2. NEEDS FIT (SDT + JD-R + AWS + Psychological Safety)
   Will it satisfy or frustrate autonomy / competence / relatedness, given the role's
   demands vs resources? Look at workload, control, reward, community, fairness, and
   values alignment (the six AWS domains). Will the team likely have the psychological
   safety needed for the user to do their best work?

3. SELF-CONCORDANCE + CALLING ORIENTATION (Sheldon + Wrzesniewski)
   Whether pursuing this looks intrinsic / identified (aligns with who they are) or
   introjected / external (money, status, "should," fear). Name it honestly.
   Cross-reference with their Calling Orientation · if they're job-oriented but the
   role demands calling-level commitment, flag it. If they're calling-oriented but
   the role is purely careerist (status + advancement), flag it.

4. VOCATIONAL + PERSON-ENVIRONMENT FIT (Holland + Kristof-Brown + Job Crafting)
   Sanity check that the role-type matches their RIASEC anchors. Then go further ·
   what's the person-organisation fit (values + culture)? Person-job fit (skills +
   demands)? Person-team fit (if signals available)? And critically, can they CRAFT
   the role over time to improve fit (task, relational, or cognitive crafting)?
   Jobs are not static · congruence can be built.

5. DIRECTION-VOW CHECK (ACT + cross-domain integrity)
   Flag any conflict with their stated Direction Vows, especially health, money,
   and relationships. A great role that wrecks sleep or relationships is a
   net-negative · name it.

Then synthesise:
- FIT READ: one honest sentence. Plain language. No score in the sentence.
- WHY IT FITS: 2-4 strongest genuine reasons (array of strings). Specific to this user.
- RED FLAGS: 0-4 clearest conflicts or risks (array of strings). Empty array if
  none real · do NOT invent flags for theatre.
- SELF-CONCORDANCE FLAG: if they seem to be chasing this for external/introjected
  reasons, say so gently but clearly. Otherwise omit (null).
- CRAFTING OPPORTUNITIES: 1-3 ways they could craft this role over time (task /
  relational / cognitive) to improve fit if they take it. Empty array if not
  applicable.

Be honest, calm, and on the user's side. Never inflate the read to be encouraging.
A clear "this would deplete you" is more useful than false hope. The Self-Concordance
Flag is the killer feature · don't hide it when it's there.

You ASSESS. The user DECIDES.

Return ONLY valid JSON matching this schema:
{
  "reads": {
    "valuesAlignment": "string · Schwartz + Meaningful Work integrated read",
    "needsFit": "string · SDT + JD-R + AWS + Psych Safety integrated read",
    "selfConcordance": "string · Self-Concordance + Calling Orientation integrated read",
    "vocationalFit": "string · Holland + P-E Fit + Job Crafting integrated read",
    "directionVowCheck": "string · ACT cross-domain check"
  },
  "fitRead": "string · one honest sentence",
  "whyItFits": ["string", "..."],
  "redFlags": ["string", "..."],
  "selfConcordanceFlag": "string or null",
  "craftingOpportunities": ["string", "..."],
  "fitScore": number 0-100
}`;

// ────── Helper · build the user prompt from a profile + opp ──────

export function buildAssessmentUserPrompt(
  profile: ValuesProfile,
  opp: { company: string; position: string; description?: string; comp?: string },
): string {
  const topValuesText = profile.topValues
    .map((v, i) => `${i + 1}. ${SCHWARTZ_VALUES_DEFS[v].name} (${SCHWARTZ_VALUES_DEFS[v].brief})`)
    .join("\n");
  const antiValuesText = profile.antiValues?.length
    ? profile.antiValues.map((v) => SCHWARTZ_VALUES_DEFS[v].name).join(", ")
    : "(none specified)";
  const needsText = profile.needsPriorities
    .map((n, i) => `${i + 1}. ${SDT_NEEDS_DEFS[n].name}`)
    .join(", ");
  const callingText = profile.callingOrientation
    ? `${CALLING_DEFS[profile.callingOrientation].name}${profile.callingOrientationNote ? ` · ${profile.callingOrientationNote}` : ""}`
    : "(not specified)";
  const riasecText = profile.riasec
    .map((r) => `${RIASEC_DEFS[r].name} (${RIASEC_DEFS[r].brief})`)
    .join(", ");
  const vowsText = profile.directionVows
    .map((v) => `- ${v.domain}: ${v.vow}`)
    .join("\n");
  const retroText = profile.retrodiction
    .map((r) => `- ${r.context} → ${r.insight}`)
    .join("\n");

  return `VALUES PROFILE
==============
Top values (ranked):
${topValuesText}

Anti-values (would hate to violate): ${antiValuesText}

SDT needs priorities (most important first): ${needsText}

Self-concordance tendency: ${profile.selfConcordance}${profile.selfConcordanceNote ? ` · ${profile.selfConcordanceNote}` : ""}

Calling Orientation (Wrzesniewski 1997): ${callingText}

RIASEC vocational fit: ${riasecText}

Direction Vows:
${vowsText}

Behavioural retrodiction (what past choices reveal):
${retroText}

OPPORTUNITY
===========
Company: ${opp.company}
Role: ${opp.position}
${opp.comp ? `Compensation: ${opp.comp}` : ""}
${opp.description ? `Description: ${opp.description}` : ""}

Assess this opportunity. Return JSON only.`;
}
