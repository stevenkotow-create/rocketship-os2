// Direct-to-source job ingestion · client helpers + company registry.
// Talks to the /api/jobs proxy which fetches Greenhouse / Lever / Ashby live boards.

export type Provider = "greenhouse" | "lever" | "ashby";

export interface NormalizedJob {
  id: string;
  company: string;
  title: string;
  location: string;
  remote: boolean;
  department?: string;
  url: string;
  postedAt?: string;
  snippet?: string;
}

export interface SourceCompany {
  company: string;
  provider: Provider;
  token: string;
}

// Curated seed of remote-friendly tech-sales rockets on public ATS boards.
// Tokens verified/pruned against live boards. Users can add any company by careers URL.
export const JOB_SOURCES: SourceCompany[] = [
  { company: "Deel", provider: "ashby", token: "deel" },
  { company: "Deputy", provider: "lever", token: "deputy" },
  { company: "GitLab", provider: "greenhouse", token: "gitlab" },
  { company: "Vanta", provider: "ashby", token: "vanta" },
  { company: "Datadog", provider: "greenhouse", token: "datadog" },
  { company: "HubSpot", provider: "greenhouse", token: "hubspot" },
  { company: "Samsara", provider: "greenhouse", token: "samsara" },
  { company: "Figma", provider: "greenhouse", token: "figma" },
  { company: "Ramp", provider: "ashby", token: "ramp" },
  { company: "Vercel", provider: "greenhouse", token: "vercel" },
  { company: "Anthropic", provider: "greenhouse", token: "anthropic" },
];

const SALES_RX =
  /\b(sdr|bdr|sales development|business development|account executive|\bae\b|account manager|channel|partnership|alliances|revenue|gtm|go[- ]to[- ]market|customer success|\bcsm\b|solutions? (engineer|consultant)|pre[- ]?sales|sales)\b/i;

export function isSalesRole(title: string): boolean {
  return SALES_RX.test(title || "");
}

const APAC_RX =
  /\b(remote|anywhere|distributed|australia|sydney|melbourne|brisbane|perth|canberra|apac|apj|asia|singapore|japan|tokyo|new zealand|auckland|wellington|india|bengaluru|hong kong|manila|philippines|jakarta|kuala lumpur|seoul|korea)\b/i;

export function inAPAC(loc: string): boolean {
  return APAC_RX.test(loc || "");
}

const ANZ_RX =
  /\b(australia|australian|sydney|melbourne|brisbane|perth|canberra|adelaide|gold coast|hobart|darwin|new zealand|auckland|wellington|christchurch|nz|anz|australasia)\b/i;
const GLOBAL_REMOTE_RX = /\b(anywhere|worldwide|global|globally|fully remote)\b/i;

// A role an ANZ-based person could realistically take: located in ANZ, or a
// genuinely global/anywhere remote posting (not region-locked elsewhere).
export function inANZ(loc: string): boolean {
  const s = loc || "";
  if (ANZ_RX.test(s)) return true;
  if (GLOBAL_REMOTE_RX.test(s)) return true;
  // bare "Remote" with no country attached reads as open
  if (/^\s*remote\s*$/i.test(s)) return true;
  return false;
}

export async function scanCompany(c: SourceCompany): Promise<NormalizedJob[]> {
  try {
    const res = await fetch(
      `/api/jobs?provider=${c.provider}&token=${encodeURIComponent(c.token)}&company=${encodeURIComponent(c.company)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jobs as NormalizedJob[]) || [];
  } catch {
    return [];
  }
}

export async function scanByUrl(url: string): Promise<{ company: string; jobs: NormalizedJob[] }> {
  try {
    const res = await fetch(`/api/jobs?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    return { company: data.company || "Company", jobs: (data.jobs as NormalizedJob[]) || [] };
  } catch {
    return { company: "Company", jobs: [] };
  }
}
