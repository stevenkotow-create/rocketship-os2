// Built-in LinkedIn parser. Zero cost, no API key: reads pasted profile text,
// pulls signals heuristically, and produces a usable RocketShip setup.
import type { CareerHypothesis, ResumeAudit } from "./types";

export interface OnboardResult {
  fullName: string;
  candidateSummary: string;
  careerHypothesis: Omit<CareerHypothesis, "capturedAt">;
  resumeAudit: Pick<
    ResumeAudit,
    "strengths" | "gaps" | "roleShapeFit" | "recommendedSeatLevels" | "overallReadiness" | "summary"
  >;
  targetCompanies: { company: string; position: string; location: string; note: string }[];
}

type Family = "sdr" | "ae" | "channel" | "csm" | "manager";

const TARGETS: {
  company: string;
  position: string;
  location: string;
  families: Family[];
  remote: boolean;
  note: string;
}[] = [
  { company: "Huntress", position: "Channel Account Manager", location: "100% remote (AU)", families: ["channel"], remote: true, note: "Cyber SaaS with a strong channel motion. Verify current opening." },
  { company: "Xero", position: "Partner / Channel Manager", location: "Remote (AU/NZ)", families: ["channel", "ae"], remote: true, note: "AU/NZ accounting SaaS, partner-led motion." },
  { company: "HubSpot", position: "BDR → AE, APAC", location: "Remote (APAC)", families: ["sdr", "ae"], remote: true, note: "Best-in-class ramp and a clean promotion track." },
  { company: "GitLab", position: "BDR / SDR, APAC", location: "100% remote", families: ["sdr"], remote: true, note: "Fully-remote devtools, elite SDR training." },
  { company: "Remote (remote.com)", position: "Account Executive, APAC", location: "100% remote", families: ["ae"], remote: true, note: "Remote-first global employment platform." },
  { company: "Deel", position: "Account Executive / SDR, APAC", location: "Remote (verify AU/APAC)", families: ["ae", "sdr"], remote: true, note: "Remote-first payroll/HR. Confirm the seat is APAC-friendly." },
  { company: "Employment Hero", position: "Account Executive / BDM", location: "Remote (AU)", families: ["ae"], remote: true, note: "AU HR/payroll unicorn, remote roles nationwide." },
  { company: "Deputy", position: "Account Executive, SMB", location: "Remote (AU)", families: ["ae"], remote: true, note: "AU workforce-management SaaS." },
  { company: "Go1", position: "SDR / Senior SDR", location: "Remote (AU · Brisbane)", families: ["sdr"], remote: true, note: "AU edtech SaaS, remote-friendly." },
  { company: "Atlassian", position: "BDR / Sales, APAC (Team Anywhere)", location: "Remote (AU)", families: ["sdr", "ae"], remote: true, note: "AU-founded, remote-first, large tech-sales org." },
  { company: "Rippling", position: "Account Executive, APAC", location: "Remote", families: ["ae"], remote: true, note: "Fast-scaling HR/IT SaaS, hiring APAC AEs." },
  { company: "Culture Amp", position: "Account Executive", location: "Remote (AU)", families: ["ae"], remote: true, note: "AU people-analytics SaaS." },
  { company: "SafetyCulture", position: "AE / BDM", location: "Hybrid (Sydney)", families: ["ae", "channel"], remote: false, note: "AU operations SaaS, strong industrial/field angle." },
  { company: "Gong", position: "SDR / AE", location: "Remote", families: ["sdr", "ae"], remote: true, note: "Revenue-intelligence SaaS, strong brand." },
  { company: "Datadog", position: "SDR / AE, APAC", location: "Remote", families: ["sdr", "ae"], remote: true, note: "Observability leader, structured sales org." },
  { company: "Notion", position: "Account Executive, APAC", location: "Remote", families: ["ae"], remote: true, note: "High-demand product, expanding APAC sales." },
  { company: "Salesforce", position: "BDR / Account Executive", location: "Hybrid (AU)", families: ["sdr", "ae"], remote: false, note: "The CRM standard, deep sales training." },
  { company: "Vidyard", position: "Account Executive", location: "Remote", families: ["ae"], remote: true, note: "Remote-first video-for-sales platform." },
];

function has(text: string, words: string[]): number {
  return words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0);
}

export function parseLinkedIn(raw: string): OnboardResult {
  const text = raw.replace(/\r/g, "");
  const lower = text.toLowerCase();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Name: first line that looks like a person's name (2-4 capitalised words, no digits).
  let fullName = "";
  for (const l of lines.slice(0, 5)) {
    if (/^[A-Z][a-z'’-]+(?:\s+[A-Z][a-z'’-]+){1,3}$/.test(l) && !/\d/.test(l)) {
      fullName = l;
      break;
    }
  }

  // Metrics as proof points.
  const money = Array.from(text.matchAll(/\$\s?\d[\d.,]*\s?(?:m|k|b|million|billion)?/gi)).map((m) => m[0].replace(/\s+/g, ""));
  const pcts = Array.from(text.matchAll(/\b\d{1,3}(?:\.\d+)?\s?%/g)).map((m) => m[0].replace(/\s+/g, ""));
  const topMoney = money.sort((a, b) => b.length - a.length)[0];

  // Family signal scores.
  const scores: Record<Family, number> = {
    sdr: has(lower, ["sdr", "bdr", "sales development", "business development representative", "outbound", "prospect", "cold call", "cold outreach"]),
    ae: has(lower, ["account executive", " ae ", "business development manager", "bdm", "full-cycle", "full cycle", "closing", "quota", "revenue", "deals", "pipeline"]),
    channel: has(lower, ["channel", "dealer", "partner", "reseller", "distributor", "alliances"]),
    csm: has(lower, ["customer success", "csm", "account manager", "retention", "renewal", "onboarding", "book of business"]),
    manager: has(lower, ["led a team", "managing", "head of", "director", "team of", "people leader", "sales manager"]),
  };
  const remote = /(remote|work from home|wfh|100%\s*remote|distributed)/.test(lower);

  const ranked = (Object.keys(scores) as Family[]).sort((a, b) => scores[b] - scores[a]);
  const top = ranked.filter((f) => scores[f] > 0).slice(0, 2);
  if (top.length === 0) top.push("ae", "sdr");

  const familyLabel: Record<Family, string> = {
    sdr: "SDR / Senior SDR",
    ae: "Account Executive / BDM",
    channel: "Channel / Partner Manager",
    csm: "Account Manager / CSM",
    manager: "Sales Team Lead",
  };
  const recommendedSeatLevels = top.map((f) => familyLabel[f]);

  // Role-shape fit 0-100 (scaled from signal counts).
  const scale = (n: number) => Math.min(95, 45 + n * 12);
  const roleShapeFit = {
    BDR: scale(scores.sdr),
    SDR: scale(scores.sdr),
    AE: scale(scores.ae),
    AM: scale(scores.csm + Math.round(scores.channel / 2)),
    CSM: scale(scores.csm),
    Manager: scale(scores.manager),
  };

  // Strengths from detected signals.
  const strengths: string[] = [];
  if (topMoney) strengths.push(`Quantified revenue results (${topMoney}${pcts[0] ? `, ${pcts[0]} growth` : ""})`);
  if (scores.channel) strengths.push("Channel and partner / dealer network development");
  if (scores.sdr) strengths.push("Outbound pipeline generation from a standing start");
  if (scores.ae) strengths.push("Full-cycle B2B selling and closing");
  if (/crm|hubspot|salesforce/.test(lower)) strengths.push("CRM and sales-operations fluency");
  if (strengths.length < 3) strengths.push("Consultative, value-based selling");

  // Honest gaps.
  const gaps: string[] = [];
  if (!/saas|software|tech|platform/.test(lower)) gaps.push("Limited named-SaaS logos — lead with transferable skills");
  if (money.length === 0) gaps.push("Add quantified results (revenue, quota attainment, growth %)");
  if (!remote) gaps.push("Make remote-readiness explicit if targeting remote roles");
  if (gaps.length === 0) gaps.push("Tighten role-title alignment to each target seat");

  const overallReadiness: ResumeAudit["overallReadiness"] =
    money.length > 0 && top.length > 0 ? "tighten-first" : "rewrite-needed";

  // Candidate summary.
  const who = fullName ? fullName.split(" ")[0] : "You";
  const proof = topMoney ? ` with proof on the board (${topMoney}${pcts[0] ? `, ${pcts[0]} YoY` : ""})` : "";
  const candidateSummary = `${who} is a B2B sales operator${proof}. Strongest fit for ${recommendedSeatLevels.join(" and ")} roles, with clear strengths in ${strengths.slice(0, 2).join(" and ").toLowerCase()}. ${remote ? "Already set up for remote work." : "Positioned to move into remote tech sales."}`;

  // Target companies: match top families, prefer remote if signalled, then fill.
  const scoreTarget = (t: (typeof TARGETS)[number]) => {
    let s = t.families.filter((f) => top.includes(f)).length * 2;
    if (remote && t.remote) s += 1;
    return s;
  };
  const targetCompanies = [...TARGETS]
    .map((t) => ({ t, s: scoreTarget(t) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 9)
    .map(({ t }) => ({ company: t.company, position: t.position, location: t.location, note: t.note }));

  const careerHypothesis: OnboardResult["careerHypothesis"] = {
    fiveYearVision: scores.manager ? "Move into sales leadership" : "Grow into senior / enterprise sales at a high-growth company",
    managementAppetite: scores.manager ? "open" : "open",
    industryPreference: [],
    growthPace: "rocket",
    whatWinningLooksLike: "A remote seat at a company that's genuinely scaling, with an achievable, well-designed number.",
  };

  return {
    fullName,
    candidateSummary,
    careerHypothesis,
    resumeAudit: { strengths: strengths.slice(0, 5), gaps: gaps.slice(0, 4), roleShapeFit, recommendedSeatLevels, overallReadiness, summary: candidateSummary },
    targetCompanies,
  };
}
