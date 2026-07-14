// Rocket Ranker · standardised cross-company scoring
// Ships composite score (0-30 from Six-Dimension Evaluator) + role-shape fit (0-10)
// Derives tier · P1_TARGET / P2_STRONG / WATCHLIST / JETTISON
//
// Rule set:
// - APAC-only (hard rule 2026-06-26) · non-APAC seats auto-drop to WATCHLIST max
// - BDR-first targeting · BDR/SDR at high-growth/high-equity rockets > AE/AM titles
// - AE tier calibration · founding-region companies → AE = WATCHLIST default (5-10yr operator seat)
// - Candidate lane · BDR/SDR/AM/CSM primary · AE only at Series C+ with structured onboarding

import type { Opportunity, CompanyEvaluation, Score } from "./types";

export type RocketTier = "P1_TARGET" | "P2_STRONG" | "WATCHLIST" | "JETTISON";

export interface RocketRank {
  companyScore: number; // 0-30 · from Six-Dimension Evaluator (or Score fallback)
  roleShapeFit: number; // 0-10 · candidate-specific role-type fit
  compositeIndex: number; // weighted final rank number 0-100
  tier: RocketTier;
  tierLabel: string;
  gaps: string[]; // what would move it up a tier
  reasons: string[]; // why it's ranked here
}

// ── Company score (0-30) ──────────────────────────────
// Prefer full CompanyEvaluation.totalScore · fall back to legacy Score object
function deriveCompanyScore(opp: Opportunity): number {
  if (opp.evaluation?.totalScore != null) return opp.evaluation.totalScore;

  const s = opp.score as Score | undefined;
  if (!s) return 0;
  // Legacy score is 0-30 style · v + l + r + c (max 5+5+10+5 = 25) · normalise up to /30
  const legacy = (s.v ?? 0) + (s.l ?? 0) + (s.r ?? 0) + (s.c ?? 0);
  // v/5 · l/5 · r/10 · c/5 max = 25 · scale to 30
  return Math.round((legacy / 25) * 30);
}

// ── Role-shape fit (0-10) ─────────────────────────────
// Candidate lane · BDR/SDR/AM/CSM first · AE only where shape is a fit
function deriveRoleShapeFit(opp: Opportunity): { fit: number; reason: string } {
  const type = (opp.type ?? "").toUpperCase();
  const position = (opp.position ?? "").toLowerCase();

  // Strategic / Enterprise AE at large public companies · WATCHLIST shape
  if (position.includes("strategic") || position.includes("enterprise account")) {
    return { fit: 3, reason: "Strategic/Enterprise AE requires 5-10yr closing motion · outside the candidate's lane" };
  }

  // Founding / regional-lead AE seats · likely mismatch
  if (position.includes("founding") && type === "AE") {
    return { fit: 4, reason: "Founding-region AE = senior enterprise operator seat · thread, don't apply" };
  }

  switch (type) {
    case "BDR":
    case "SDR":
      return { fit: 10, reason: "BDR/SDR = the candidate's primary lane · rocket-shape fit" };
    case "AM":
    case "CSM":
      return { fit: 9, reason: "AM/CSM = the candidate's secondary lane · customer-expansion motion applies" };
    case "AE":
      return { fit: 6, reason: "AE = stretch · works at Series B-C with structured onboarding" };
    default:
      return { fit: 5, reason: `Role type "${opp.type}" · needs manual audit` };
  }
}

// ── APAC gate ─────────────────────────────────────────
function isAPAC(opp: Opportunity): boolean {
  const loc = (opp.location ?? "").toLowerCase();
  if (!loc) return true; // no location = assume APAC pending audit
  return (
    loc.includes("sydney") ||
    loc.includes("melbourne") ||
    loc.includes("brisbane") ||
    loc.includes("perth") ||
    loc.includes("australia") ||
    loc.includes("aus") ||
    loc.includes("apac") ||
    loc.includes("anz") ||
    loc.includes("apj") ||
    loc.includes("singapore") ||
    loc.includes("nz") ||
    loc.includes("remote au") ||
    loc.includes("hybrid")
  );
}

// ── Compute the rank ──────────────────────────────────
export function rankOpportunity(opp: Opportunity): RocketRank {
  const companyScore = deriveCompanyScore(opp);
  const { fit: roleShapeFit, reason: roleReason } = deriveRoleShapeFit(opp);
  const apacPass = isAPAC(opp);

  const gaps: string[] = [];
  const reasons: string[] = [`Company score ${companyScore}/30`, `Role-shape fit ${roleShapeFit}/10`, roleReason];

  // Composite index · 70% company + 30% shape · scale to /100
  const compositeIndex = Math.round((companyScore / 30) * 70 + (roleShapeFit / 10) * 30);

  // ── Tier derivation ────────────────────────────────
  let tier: RocketTier = "JETTISON";
  let tierLabel = "";

  if (!apacPass) {
    tier = "WATCHLIST";
    tierLabel = "Watchlist · APAC gate failed";
    gaps.push("Move to APAC seat or wait for AU-based role to open");
    reasons.push("APAC gate: FAIL");
  } else if (companyScore >= 26 && roleShapeFit >= 8) {
    tier = "P1_TARGET";
    tierLabel = "P1 · TARGET · apply now";
  } else if (companyScore >= 22 && roleShapeFit >= 7) {
    tier = "P2_STRONG";
    tierLabel = "P2 · STRONG · thread + monitor";
  } else if (companyScore >= 20 || roleShapeFit >= 8) {
    tier = "WATCHLIST";
    tierLabel = "Watchlist · thread, don't apply";
    if (companyScore < 22) gaps.push(`Company score ${companyScore}/30 · needs 22+ for P2`);
    if (roleShapeFit < 7) gaps.push(`Role-shape fit ${roleShapeFit}/10 · wait for BDR/SDR/AM/CSM seat`);
  } else {
    tier = "JETTISON";
    tierLabel = "Jettison · out of frame";
    gaps.push("Company + role both below threshold");
  }

  return { companyScore, roleShapeFit, compositeIndex, tier, tierLabel, gaps, reasons };
}

// ── Rank many · sorted leaderboard ────────────────────
export interface RankedRow {
  opp: Opportunity;
  rank: RocketRank;
}

export function rankAll(opps: Opportunity[]): RankedRow[] {
  return opps
    .filter((o) => o.company && o.company.trim().length > 0)
    .map((opp) => ({ opp, rank: rankOpportunity(opp) }))
    .sort((a, b) => {
      // Sort by tier first · then composite index
      const tierOrder: Record<RocketTier, number> = {
        P1_TARGET: 0,
        P2_STRONG: 1,
        WATCHLIST: 2,
        JETTISON: 3,
      };
      const tierDelta = tierOrder[a.rank.tier] - tierOrder[b.rank.tier];
      if (tierDelta !== 0) return tierDelta;
      return b.rank.compositeIndex - a.rank.compositeIndex;
    });
}

// ── Tier styling constants ────────────────────────────
export const TIER_STYLE: Record<RocketTier, { color: string; bg: string; label: string }> = {
  P1_TARGET: { color: "#0BCE3A", bg: "rgba(11,206,58,0.12)", label: "P1 · TARGET" },
  P2_STRONG: { color: "#AC55FF", bg: "rgba(172,85,255,0.12)", label: "P2 · STRONG" },
  WATCHLIST: { color: "#F5B94A", bg: "rgba(245,185,74,0.12)", label: "WATCHLIST" },
  JETTISON: { color: "#7A7A7A", bg: "rgba(122,122,122,0.10)", label: "JETTISON" },
};
