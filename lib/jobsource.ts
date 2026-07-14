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
  { company: "GitLab", provider: "greenhouse", token: "gitlab" },
  { company: "Vanta", provider: "ashby", token: "vanta" },
  { company: "Rippling", provider: "ashby", token: "rippling" },
  { company: "Notion", provider: "greenhouse", token: "notion" },
  { company: "Gong", provider: "greenhouse", token: "gong" },
  { company: "Remote", provider: "greenhouse", token: "remote" },
  { company: "Datadog", provider: "greenhouse", token: "datadog" },
  { company: "Canva", provider: "lever", token: "canva" },
  { company: "Airwallex", provider: "lever", token: "airwallex" },
  { company: "Deputy", provider: "lever", token: "deputy" },
  { company: "Culture Amp", provider: "lever", token: "cultureamp" },
  { company: "SafetyCulture", provider: "lever", token: "safetyculture" },
  { company: "Go1", provider: "lever", token: "go1" },
  { company: "Employment Hero", provider: "greenhouse", token: "employmenthero" },
  { company: "Linear", provider: "ashby", token: "linear" },
  { company: "Ramp", provider: "ashby", token: "ramp" },
  { company: "Vercel", provider: "greenhouse", token: "vercel" },
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
