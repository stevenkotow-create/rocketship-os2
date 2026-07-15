// Auto-scaffold a Star Map from just company + role. Fully deterministic (no AI,
// no network). Produces the role-mapped stakeholder slots — HM + Peer + Recruiter,
// a recruiter backup, and a collapsed round-2 exec/reference tier — each with a
// target title and a ready LinkedIn search recipe. This is the "the map builds
// itself, you verify and approve" step the manual Vanta/Heidi/Halter maps needed.

import type { Contact, ContactRole } from "./types";

type Seat = "SDR/BDR" | "AE" | "AM/CSM" | "Channel" | "Sales";

function seatFor(roleType: string): Seat {
  const t = (roleType || "").toLowerCase();
  if (/sdr|bdr|sales development|business development rep/.test(t)) return "SDR/BDR";
  if (/account executive|\bae\b|\bbdm\b/.test(t)) return "AE";
  if (/account manager|\bam\b|csm|customer success/.test(t)) return "AM/CSM";
  if (/channel|partner|alliance/.test(t)) return "Channel";
  return "Sales";
}

const HM_TITLE: Record<Seat, string> = {
  "SDR/BDR": "Head of Sales Development / SDR Manager",
  AE: "Sales Manager / Regional Sales Director",
  "AM/CSM": "Customer Success / Account Management Lead",
  Channel: "Head of Channel / Partnerships",
  Sales: "Sales Leader",
};

const PEER_TITLE: Record<Seat, string> = {
  "SDR/BDR": "SDR / BDR (peer in seat)",
  AE: "Account Executive (peer in seat)",
  "AM/CSM": "Account Manager / CSM (peer in seat)",
  Channel: "Channel / Partner Manager (peer in seat)",
  Sales: "Peer in the seat",
};

const PEER_KEYWORD: Record<Seat, string> = {
  "SDR/BDR": "SDR",
  AE: "Account Executive",
  "AM/CSM": "Account Manager",
  Channel: "Channel Manager",
  Sales: "Sales",
};

export interface Slot {
  role: ContactRole;
  title: string;
  keyword: string; // for the search recipe
  why: string;
  tier: "core" | "backup" | "round2";
}

export function stakeholderSlots(roleType: string, region = "APAC"): Slot[] {
  const seat = seatFor(roleType);
  return [
    {
      role: "HM",
      title: `${HM_TITLE[seat]} · ${region}`,
      keyword: HM_TITLE[seat].split("/")[0].trim(),
      why: "The hiring manager. Your primary thread — credibility plus the ask.",
      tier: "core",
    },
    {
      role: "PEER",
      title: `${PEER_TITLE[seat]} · ${region}`,
      keyword: PEER_KEYWORD[seat],
      why: "The peer voice — what the day actually feels like. Ask them a different question than the HM.",
      tier: "core",
    },
    {
      role: "GTM_RECRUITER",
      title: `GTM / Talent Partner · ${region}`,
      keyword: "Talent Partner",
      why: "Logistics and a quick flag. Skip the pre-touch — a short, direct note is fine here.",
      tier: "core",
    },
    {
      role: "GTM_RECRUITER",
      title: `Backup recruiter / Talent Partner · ${region}`,
      keyword: "Recruiter",
      why: "Fallback if the primary recruiter is silent past 5 days.",
      tier: "backup",
    },
    {
      role: "OTHER",
      title: `Skip-level leader (VP / Head of Sales) · ${region}`,
      keyword: "VP Sales",
      why: "Round 2 only — activate once you reach interview stage.",
      tier: "round2",
    },
    {
      role: "OTHER",
      title: "Warm reference / ex-employee",
      keyword: "",
      why: "Round-2 cross-thread — a candid inside read for later rounds.",
      tier: "round2",
    },
  ];
}

export function searchRecipe(keyword: string, company: string, region = "APAC"): string {
  if (!keyword) return `Ask your network for a warm intro into ${company}`;
  return `site:linkedin.com/in/ "${company}" "${keyword}" ${region}`;
}

// Build empty, role-mapped Contact slots ready for the user to fill + verify.
export function scaffoldContacts(company: string, roleType: string, region = "APAC"): Contact[] {
  return stakeholderSlots(roleType, region).map((s) => ({
    name: "",
    role: s.role,
    title: s.title,
    linkedin: "",
    status: "identified",
    verified: false,
    personalHook: s.why,
    tier: s.tier,
    searchRecipe: searchRecipe(s.keyword, company, region),
  }));
}

// The proven 14-day sequence · shown as guidance per node.
export const SEQUENCE: { day: string; step: string }[] = [
  { day: "Day 0", step: "Silent connect (no note), or a 300-char note for the HM" },
  { day: "Day 1-5", step: "Pre-touch: like / thoughtfully comment on 2-3 of their posts" },
  { day: "Day 5-7", step: "If the connect is accepted, send the tailored DM" },
  { day: "Day 10", step: "One nudge if no reply" },
  { day: "Day 14", step: "Graceful close — leave the door open" },
];
