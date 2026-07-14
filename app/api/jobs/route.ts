import { NextResponse } from "next/server";
import type { Provider, NormalizedJob } from "@/lib/jobsource";

// Direct-to-source job ingestion · FREE · no API key.
// Most tech companies host careers on Greenhouse, Lever or Ashby, each of which
// exposes a public JSON endpoint. We fetch server-side (no CORS headache) and
// normalise to one shape. This is the company's own live hiring data.

export const runtime = "nodejs";
export const revalidate = 1800; // 30 min cache

function detectFromUrl(raw: string): { provider: Provider; token: string } | null {
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const host = u.hostname.toLowerCase();
    const segs = u.pathname.split("/").filter(Boolean);
    if (host.includes("greenhouse.io")) {
      // boards.greenhouse.io/{token} · job-boards.greenhouse.io/{token} · boards-api.greenhouse.io/v1/boards/{token}/jobs
      const bIdx = segs.indexOf("boards");
      const token = bIdx >= 0 ? segs[bIdx + 1] : segs[0];
      if (token) return { provider: "greenhouse", token };
    }
    if (host.includes("lever.co")) {
      if (segs[0]) return { provider: "lever", token: segs[0] };
    }
    if (host.includes("ashbyhq.com")) {
      // jobs.ashbyhq.com/{token} · api.ashbyhq.com/posting-api/job-board/{token}
      const jIdx = segs.indexOf("job-board");
      const token = jIdx >= 0 ? segs[jIdx + 1] : segs[0];
      if (token) return { provider: "ashby", token };
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "RocketShipOS/1.0 (+careers-radar)" },
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return res.json();
}

function isRemote(s: string) {
  return /remote|anywhere|work from home|distributed/i.test(s || "");
}

async function greenhouse(token: string, company: string): Promise<NormalizedJob[]> {
  const data = await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=false`);
  return (data.jobs || []).map((j: any) => ({
    id: `gh-${j.id}`,
    company,
    title: j.title,
    location: j.location?.name || "",
    remote: isRemote(j.location?.name || ""),
    department: j.departments?.[0]?.name,
    url: j.absolute_url,
    postedAt: j.updated_at,
  }));
}

async function lever(token: string, company: string): Promise<NormalizedJob[]> {
  const data = await fetchJson(`https://api.lever.co/v0/postings/${token}?mode=json`);
  return (Array.isArray(data) ? data : []).map((j: any) => {
    const loc = j.categories?.location || (j.categories?.allLocations || []).join(", ") || "";
    return {
      id: `lv-${j.id}`,
      company,
      title: j.text,
      location: loc,
      remote: isRemote(loc) || isRemote(j.workplaceType || ""),
      department: j.categories?.team || j.categories?.department,
      url: j.hostedUrl || j.applyUrl,
      postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : undefined,
      snippet: (j.descriptionPlain || "").slice(0, 240),
    };
  });
}

async function ashby(token: string, company: string): Promise<NormalizedJob[]> {
  const data = await fetchJson(`https://api.ashbyhq.com/posting-api/job-board/${token}?includeCompensation=false`);
  return (data.jobs || [])
    .filter((j: any) => j.isListed !== false)
    .map((j: any) => {
      const loc = j.location || j.address?.postalAddress?.addressCountry || "";
      return {
        id: `as-${j.id}`,
        company,
        title: j.title,
        location: loc,
        remote: !!j.isRemote || isRemote(j.workplaceType || "") || isRemote(loc),
        department: j.team || j.department,
        url: j.applyUrl || j.jobUrl,
        postedAt: j.publishedAt,
        snippet: (j.descriptionPlain || "").slice(0, 240),
      };
    });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let provider = searchParams.get("provider") as Provider | null;
  let token = searchParams.get("token");
  const url = searchParams.get("url");
  const company = searchParams.get("company") || token || "Company";

  if ((!provider || !token) && url) {
    const detected = detectFromUrl(url);
    if (detected) {
      provider = detected.provider;
      token = detected.token;
    }
  }

  if (!provider || !token) {
    return NextResponse.json(
      { error: "Provide provider+token, or a careers url (Greenhouse / Lever / Ashby)." },
      { status: 400 }
    );
  }

  try {
    let jobs: NormalizedJob[] = [];
    if (provider === "greenhouse") jobs = await greenhouse(token, company);
    else if (provider === "lever") jobs = await lever(token, company);
    else if (provider === "ashby") jobs = await ashby(token, company);
    return NextResponse.json({ company, provider, token, count: jobs.length, jobs });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "fetch failed", company, provider, token, jobs: [] },
      { status: 502 }
    );
  }
}
