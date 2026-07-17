import type { Opportunity, Contact } from "./types";

// One keyless Claude.ai prompt that produces a tailored cover letter in the house
// voice. Same copy-paste bridge pattern as the research pack. Pulls in the role, the
// hiring manager (if named), and any role context already on the mission.
export function buildCoverLetterPrompt(opp: Opportunity, contacts: Contact[]): string {
  const hm = contacts.find((c) => c.role === "HM" && c.name && c.name.trim());
  const hmLine = hm ? ` The hiring manager is ${hm.name}${hm.title ? ", " + hm.title : ""}.` : "";
  const loc = opp.location ? ` (${opp.location})` : "";
  const ctx = opp.note ? `\n\nContext on the role: ${opp.note}` : "";

  return `Write a tailored cover letter for the ${opp.position || "role"} at ${opp.company}${loc}.${hmLine}

Match my voice: punchy, present-tense, confident and human, Australian English, NO em dashes, executive presence. No generic openers, and never "I am writing to apply for."

Structure it like this:
- Open with a specific, honest reason ${opp.company} matters to me and one sharp observation about their business or market.
- Then three short paragraphs: what I have done that maps directly to this role (with quantified proof), why my shape fits their stage, and a confident close that invites a conversation without begging.
- Keep it under one page and ready to send.${ctx}

Before you write, here are my proof points to weave in: [PASTE YOUR CV / TOP 3-4 QUANTIFIED WINS HERE]. Only use what is true and specific.`;
}
