/**
 * SCRAPE REGISTRY · automated Step 0 for every scrape (daily + weekly + on-demand)
 *
 * This file is the single source of truth for duplicate-check + jettison-check + watchlist-check.
 * Every scrape agent reads this BEFORE doing any candidate research.
 *
 * Maintained by:
 *  - Daily Rocket Scanner (07:05 AEST Mon-Fri) appends to SCRAPE_HISTORY
 *  - Friday Large Scrape (weekly) appends to SCRAPE_HISTORY + updates WATCHLIST
 *  - The operator adds JETTISONED entries when an opp moves to closed with a reason
 *  - The operator adds WATCHLIST entries when a scrape surfaces a "watch for X" candidate
 */

import type { Stage } from "../types";

// ───────────────────────────────────────────────────────────────────────────
// KNOWN COMPANIES · already in the pipeline · do NOT re-surface as net-new
// ───────────────────────────────────────────────────────────────────────────

export interface KnownCompany {
  name: string;
  variants: string[]; // alternate names to grep against (e.g. "Acme AI", "Acme Technologies")
  opportunityId: string; // links to opportunities.ts id
  currentStage: Stage;
  lastTouched: string; // ISO date
  notes?: string;
}

export const KNOWN_COMPANIES: KnownCompany[] = [];

// ───────────────────────────────────────────────────────────────────────────
// JETTISONED · do NOT re-surface unless a re-engage trigger fires
// ───────────────────────────────────────────────────────────────────────────

export interface JettisonedCompany {
  name: string;
  variants: string[];
  jettisonedDate: string;
  jettisonReason: string;
  reEngageTriggers?: string[]; // conditions under which the jettison reverses
  lastReChecked?: string;
}

export const JETTISONED: JettisonedCompany[] = [];

// ───────────────────────────────────────────────────────────────────────────
// WATCHLIST · companies surfaced but not yet ready to ship · monitor for triggers
// ───────────────────────────────────────────────────────────────────────────

export interface WatchlistCompany {
  name: string;
  variants: string[];
  addedDate: string;
  scrapeRunSource: string; // which scrape surfaced it
  reason: string;
  triggerConditions: string[]; // what needs to happen for this to graduate to apply-tier
  rocketScore?: number; // /8 if calculated
  vertical?: string;
  notes?: string;
  lastChecked?: string;
}

export const WATCHLIST: WatchlistCompany[] = [];

// ───────────────────────────────────────────────────────────────────────────
// SCRAPE HISTORY · log of every candidate considered (for de-dup across runs)
// ───────────────────────────────────────────────────────────────────────────

export interface ScrapeRunLog {
  runDate: string;
  scrapeType: "daily" | "weekly-large" | "on-demand";
  durationMin: number;
  candidatesConsidered: number;
  netNewSurfaced: number;
  duplicatesSkipped: number;
  jettisonedSkipped: number;
  reEngageFlagged: number;
  topPicks: string[]; // company names of top picks from this run
  notes?: string;
}

export const SCRAPE_HISTORY: ScrapeRunLog[] = [];

// ───────────────────────────────────────────────────────────────────────────
// VC PORTFOLIOS · scrape these weekly for new portfolio companies (mentor input 2026-06-25)
// ───────────────────────────────────────────────────────────────────────────

export interface VCFirm {
  name: string;
  url: string;
  portfolioUrl: string;
  focus: string;
  cadence: "daily" | "weekly" | "monthly"; // re-check cadence
  known_portfolio_anchors: string[]; // companies we know are in their portfolio (seed list, not exhaustive)
}

export const VC_FIRMS: VCFirm[] = [];

// ───────────────────────────────────────────────────────────────────────────
// RECENT FUNDING ROUNDS · signal for GTM team expansion (mentor input 2026-06-25)
// Series B+ tracked by default · seed/A optional for "watch first commercial hire"
// ───────────────────────────────────────────────────────────────────────────

export interface FundingRound {
  company: string;
  round: string; // "Series B" · "Series C extension" · "Growth Equity"
  amount: string; // "$50M USD" or "$50M AUD"
  date: string; // ISO date of announcement
  leadInvestor: string;
  significance: string; // hiring/expansion signal we should act on
  source?: string; // URL or publication
}

export const RECENT_FUNDING_ROUNDS: FundingRound[] = [];

// ───────────────────────────────────────────────────────────────────────────
// GEOGRAPHIC CLUSTERS · HQ geography matters for hiring patterns + culture (mentor input 2026-06-25)
// ───────────────────────────────────────────────────────────────────────────

export type GeoCluster = "israeli" | "us" | "nz" | "au_local" | "uk_eu" | "asia";

export interface GeoClusterProfile {
  cluster: GeoCluster;
  description: string;
  hiring_pattern: string; // what ANZ hiring typically looks like for this cluster
  cultural_signals: string;
  anchor_companies: string[];
  fit_notes: string;
}

export const GEOGRAPHIC_CLUSTERS: GeoClusterProfile[] = [];

// ───────────────────────────────────────────────────────────────────────────
// REGIONAL VS GLOBAL ROLE SHAPE · evaluation overlay (mentor input 2026-06-25)
// ───────────────────────────────────────────────────────────────────────────

export type RoleShape = "regional_founding" | "regional_established" | "global_distributed" | "global_in_office";

export interface RoleShapeProfile {
  shape: RoleShape;
  description: string;
  equity_signal: "high" | "med" | "low";
  autonomy_signal: "high" | "med" | "low";
  risk_signal: "high" | "med" | "low";
  comp_pattern: string;
  fit_score: number; // /10 · how strong is the fit for the candidate's profile
}

export const ROLE_SHAPES: RoleShapeProfile[] = [];

// ───────────────────────────────────────────────────────────────────────────
// AU SETUP TRACKER · PRIMARY SCRAPE SIGNAL (mentor clarification 2026-06-25)
// Foreign rockets setting up in AU/ANZ = founding-team energy moment.
// A locally-based candidate has home-field advantage exactly when they need it.
// ───────────────────────────────────────────────────────────────────────────

export type SetupStage =
  | "office_opened" // physical office or registered entity in AU
  | "first_au_exec_hired" // first GM / Country Manager / Sales Lead announced
  | "first_anz_role_posted" // first commercial role visible on Ashby/Greenhouse/Lever
  | "apac_expansion_announced" // funding round or press release naming APAC expansion
  | "anz_customer_logo_announced"; // first ANZ enterprise customer = revenue building locally

export interface AUSetupEvent {
  company: string;
  stage: SetupStage;
  date: string; // ISO date of the signal
  detail: string;
  action: "apply_now" | "thread_now" | "monitor" | "watchlist";
  source?: string;
}

/**
 * Confirmed AU/ANZ setups in the last 12 months · these are the hottest scrape targets.
 * The operator should be on every one of these via direct application OR always-on threading.
 */
export const AU_SETUP_TRACKER: AUSetupEvent[] = [];

/**
 * Forward-looking watchlist · foreign rockets we believe are LIKELY to set up in AU/ANZ
 * within the next 6-12 months based on signals (funding + customer wins + adjacent expansion).
 *
 * These are the candidates to thread leadership on NOW so when the ANZ seat opens,
 * you are already in the room.
 */
export interface AUSetupLikely {
  company: string;
  vertical: string;
  funding_signal: string; // why we think they're capitalized for expansion
  expansion_signal: string; // what makes us think ANZ specifically is next
  trigger_conditions: string[]; // what we're watching for that confirms set-up
  action: "thread_leadership_now" | "monitor_funding" | "monitor_hiring";
  geo_origin: GeoCluster;
}

export const AU_SETUP_LIKELY: AUSetupLikely[] = [];

// ───────────────────────────────────────────────────────────────────────────
// HELPERS · use these in every scrape agent prompt
// ───────────────────────────────────────────────────────────────────────────

/**
 * Returns status of a candidate company against the registry.
 * Scrape agents call this for EVERY candidate before doing depth research.
 *
 * Returns:
 *  - "duplicate" with opportunityId · the company is already in pipeline
 *  - "jettisoned" with reason · do not re-surface unless trigger condition fires
 *  - "watchlist" with trigger conditions · check if triggers have fired
 *  - "net-new" · proceed with depth research and scoring
 */
export function checkCandidate(candidateName: string): {
  status: "duplicate" | "jettisoned" | "watchlist" | "net-new";
  match?: KnownCompany | JettisonedCompany | WatchlistCompany;
  triggers?: string[];
} {
  const nameLower = candidateName.toLowerCase().trim();

  // Check duplicates
  for (const k of KNOWN_COMPANIES) {
    if (k.name.toLowerCase() === nameLower || k.variants.some((v) => v.toLowerCase() === nameLower)) {
      return { status: "duplicate", match: k };
    }
  }

  // Check jettisoned
  for (const j of JETTISONED) {
    if (j.name.toLowerCase() === nameLower || j.variants.some((v) => v.toLowerCase() === nameLower)) {
      return { status: "jettisoned", match: j, triggers: j.reEngageTriggers };
    }
  }

  // Check watchlist
  for (const w of WATCHLIST) {
    if (w.name.toLowerCase() === nameLower || w.variants.some((v) => v.toLowerCase() === nameLower)) {
      return { status: "watchlist", match: w, triggers: w.triggerConditions };
    }
  }

  return { status: "net-new" };
}

/**
 * Returns the geographic cluster for a company name, if known.
 * Used to apply cluster-specific hiring patterns + cultural signals during scoring.
 */
export function getGeoCluster(companyName: string): GeoClusterProfile | null {
  const nameLower = companyName.toLowerCase().trim();
  for (const profile of GEOGRAPHIC_CLUSTERS) {
    if (profile.anchor_companies.some((c) => c.toLowerCase() === nameLower)) {
      return profile;
    }
  }
  return null;
}

/**
 * Returns recent funding round data for a company, if tracked.
 * Used to surface fresh signals (Series B+ rounds in last 6 months = GTM expansion likely).
 */
export function getRecentFunding(companyName: string): FundingRound | null {
  const nameLower = companyName.toLowerCase().trim();
  return RECENT_FUNDING_ROUNDS.find((f) => f.company.toLowerCase() === nameLower) ?? null;
}

/**
 * Returns true if a company appears in any tracked VC firm's known portfolio anchors.
 * Used to prioritise candidates that come pre-vetted by Tier 1 AU VCs.
 */
export function getVCPortfolioMatches(companyName: string): VCFirm[] {
  const nameLower = companyName.toLowerCase().trim();
  return VC_FIRMS.filter((vc) =>
    vc.known_portfolio_anchors.some((c) => c.toLowerCase() === nameLower)
  );
}

/**
 * Returns AU setup events for a company (confirmed setups in last 12 months).
 * PRIMARY scrape signal · foreign rockets setting up in AU/ANZ = founding-team energy moment.
 */
export function getAUSetupEvents(companyName: string): AUSetupEvent[] {
  const nameLower = companyName.toLowerCase().trim();
  return AU_SETUP_TRACKER.filter((e) => e.company.toLowerCase() === nameLower);
}

/**
 * Returns AU setup likelihood for a company (forward-looking watchlist).
 * Used to identify thread-leadership-now candidates before the ANZ seat opens.
 */
export function getAUSetupLikely(companyName: string): AUSetupLikely | null {
  const nameLower = companyName.toLowerCase().trim();
  return AU_SETUP_LIKELY.find((l) => l.company.toLowerCase() === nameLower) ?? null;
}
