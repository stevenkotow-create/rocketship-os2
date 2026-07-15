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

// A real one-click LinkedIn people-search deep link. Works for any logged-in
// LinkedIn account (no Sales Nav required) — opens the right search for the slot.
export function linkedInPeopleSearch(keyword: string, company: string, region = "APAC"): string {
  const q = [company, keyword, region].filter(Boolean).join(" ");
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(q)}`;
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
    searchKeyword: s.keyword,
  }));
}

// The "Claude angle" · turn a raw LinkedIn profile into ready-to-send, personalised
// outreach. One keyless prompt: paste the profile, get hooks + connect note + DM in
// Steven's voice. This is the LinkedIn Bridge that closes the enrichment gap without
// any paid API or ToS-risky scraping.
export function buildEnrichPrompt(company: string, roleType: string, contact: Contact): string {
  const label = ROLE_LABEL[contact.role] || contact.role;
  const who = contact.name && contact.name.trim() ? contact.name : `the ${label}`;
  const titleBit = contact.title ? ` (${contact.title})` : "";
  return `I'm targeting a ${roleType || "sales"} role at ${company} and reaching out to ${who}${titleBit}. Below I'll paste their LinkedIn profile — About, experience, recent posts, interests.

Match my voice: punchy, present-tense, confident and human, Australian English, NO em dashes, executive presence, and NEVER ask for the job — I show conviction and let them offer the seat.

From the profile, give me:

1) WHAT THEY CARE ABOUT — 3-4 tight bullets: their priorities, the themes in their posts, what they signal they value.

2) TWO PERSONAL HOOKS — specific, honest observations relevant to ${company} and this role. No flattery, no generic praise. Only things actually in the profile.

3) A 300-CHARACTER LINKEDIN CONNECT NOTE — count the characters and stay under 300. Lead with a hook, not a pitch. Do not ask for the job.

4) A POST-ACCEPT DM — short, my voice, one clear reason I'm worth a reply, a soft open (not a hard ask).

Only use what's actually in the profile. If a detail isn't there, say so rather than inventing it.

LinkedIn profile:
[PASTE THE PROFILE HERE]`;
}

const ROLE_LABEL: Record<string, string> = {
  HM: "Hiring Manager",
  PEER: "Peer in seat",
  GTM_RECRUITER: "Recruiter / Talent Partner",
  APAC_AE: "Account Executive",
  FOUNDER: "Founder",
  OTHER: "Contact",
};

// One comprehensive Claude.ai prompt that produces the whole research pack:
// 4-dimension company intel + a 5-field deep brief per stakeholder + a per-node
// message stack (distinct angle per role) + a sequencing note. Keyless — the user
// pastes this into Claude.ai and pastes the result back.
export function buildStarMapResearchPrompt(
  company: string,
  roleType: string,
  region: string,
  contacts: Contact[]
): string {
  const slots = contacts.filter((c) => c.tier);
  const lines =
    slots
      .map((c) => {
        const label = ROLE_LABEL[c.role] || c.role;
        const who = c.name && c.name.trim() ? `${c.name} — ${c.title}` : `${c.title} (name TBD — I will confirm)`;
        return `- ${label}: ${who}`;
      })
      .join("\n") || "- Hiring Manager, Peer in seat, and Recruiter (names TBD)";

  return `You are helping me prepare a multi-thread outreach and interview pack for a ${roleType || "sales"} role at ${company} (${region}). Match this voice: punchy, present-tense, confident and human, Australian English, NO em dashes, executive presence, and NEVER ask for the job in outreach — I express conviction and let them offer the seat.

Produce four things:

1) COMPANY INTEL — four dimensions, tight bullets each:
   - Commercial: funding, stage, ARR / traction signals, notable investors.
   - Market: ICP, main competitors, where they win.
   - Language: 3-4 phrases their leaders actually use, so I can mirror them.
   - Context: what has changed in the last 6 months (launches, senior hires, funding, press).

2) STAKEHOLDER DEEP BRIEFS — for EACH person below, five fields: Background · Public signals (recent posts / activity) · What they hire for · Interview-use angle (how I use this in the room) · Outreach angle (the hook for my message). Where a name is TBD, give me the exact LinkedIn search to run and what a strong person for that slot looks like.
${lines}

3) PER-STAKEHOLDER MESSAGE STACK — in my voice, with a DISTINCT angle per role (Hiring Manager = credentials plus a sharp observation; Peer = a genuine peer question, not a recruiter pitch; Recruiter = a short, direct logistics flag). For each person give:
   - a 300-character LinkedIn connect note (count the characters and stay under 300),
   - a post-accept DM,
   - a short email version,
   - an 80-second Loom script outline.

4) SEQUENCING NOTE — how to run these across 14 days: silent connect on day 0, 3-5 days of pre-touch (like / thoughtful comment) on the Hiring Manager and Peer, DM on day 5-7 once the connect is accepted, one nudge on day 10, graceful close on day 14. The recruiter can go direct.

Before you write, here are my proof points to weave in: [PASTE YOUR CV / TOP 3-4 QUANTIFIED WINS HERE]. Keep everything honest, specific, and ready to send.`;
}

// The proven 14-day sequence · shown as guidance per node.
export const SEQUENCE: { day: string; step: string }[] = [
  { day: "Day 0", step: "Silent connect (no note), or a 300-char note for the HM" },
  { day: "Day 1-5", step: "Pre-touch: like / thoughtfully comment on 2-3 of their posts" },
  { day: "Day 5-7", step: "If the connect is accepted, send the tailored DM" },
  { day: "Day 10", step: "One nudge if no reply" },
  { day: "Day 14", step: "Graceful close — leave the door open" },
];
