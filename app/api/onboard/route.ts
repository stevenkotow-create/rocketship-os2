// LinkedIn onboarding API · paste profile text -> Claude -> structured setup JSON
// POST { linkedinText: string } -> { candidateSummary, careerHypothesis, resumeAudit, targetCompanies }
// Requires ANTHROPIC_API_KEY in the environment.

import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the onboarding engine for RocketShip OS, an AI-native job-search platform.
The user has pasted the text of their LinkedIn profile (headline, about, and experience).
Read it and produce a structured setup so the platform can populate their board instantly.

Return JSON ONLY, no surrounding prose, in exactly this shape:
{
  "fullName": "string (their name if detectable, else empty string)",
  "candidateSummary": "3-4 sentence sharp summary of who they are as a candidate, leading with their strongest, most quantified achievements",
  "careerHypothesis": {
    "fiveYearVision": "one sentence, inferred from their trajectory",
    "managementAppetite": "love-it | open | avoid",
    "industryPreference": ["array of 1-4 industry tags they lean toward, or [] if broad"],
    "growthPace": "rocket | steady | sustainable",
    "whatWinningLooksLike": "one sentence"
  },
  "resumeAudit": {
    "strengths": ["3-5 concrete strengths"],
    "gaps": ["2-4 honest gaps / risks for their target roles"],
    "roleShapeFit": { "BDR": 0-100, "SDR": 0-100, "AE": 0-100, "AM": 0-100, "CSM": 0-100, "Manager": 0-100 },
    "recommendedSeatLevels": ["e.g. 'Senior SDR', 'AE', 'Channel Account Manager'"],
    "overallReadiness": "ship-it | tighten-first | rewrite-needed",
    "summary": "2-3 sentence read on their positioning for the roles they should target"
  },
  "targetCompanies": [
    { "company": "string", "position": "role title suited to them", "location": "e.g. 'Remote (AU)'", "note": "one line on why this is a fit" }
  ]
}

Rules:
- targetCompanies: suggest 6-10 real, currently-relevant companies that fit their background, seniority and any location/remote signals in the profile. Prefer companies that plausibly hire the roles they'd target.
- Be honest in gaps and roleShapeFit; do not inflate.
- If the profile is sparse, infer sensibly and keep it useful.`;

interface OnboardResult {
  fullName: string;
  candidateSummary: string;
  careerHypothesis: {
    fiveYearVision: string;
    managementAppetite: "love-it" | "open" | "avoid";
    industryPreference: string[];
    growthPace: "rocket" | "steady" | "sustainable";
    whatWinningLooksLike: string;
  };
  resumeAudit: {
    strengths: string[];
    gaps: string[];
    roleShapeFit: { BDR: number; SDR: number; AE: number; AM: number; CSM: number; Manager: number };
    recommendedSeatLevels: string[];
    overallReadiness: "ship-it" | "tighten-first" | "rewrite-needed";
    summary: string;
  };
  targetCompanies: { company: string; position: string; location: string; note: string }[];
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "ANTHROPIC_API_KEY not configured",
        message:
          "Add ANTHROPIC_API_KEY to the project's environment variables (Vercel → Settings → Environment Variables), then redeploy. Get a key at console.anthropic.com.",
      },
      { status: 503 },
    );
  }

  let body: { linkedinText?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const linkedinText = (body.linkedinText || "").trim();
  if (linkedinText.length < 40) {
    return NextResponse.json(
      { error: "Not enough profile text. Paste your LinkedIn headline, About, and Experience." },
      { status: 400 },
    );
  }

  let AnthropicModule;
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore runtime-only dependency
    AnthropicModule = await import("@anthropic-ai/sdk");
  } catch {
    return NextResponse.json(
      { error: "@anthropic-ai/sdk not installed", message: "Run npm install and redeploy." },
      { status: 500 },
    );
  }
  const Anthropic = AnthropicModule.default;
  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here is my LinkedIn profile text. Build my RocketShip setup and return JSON only:\n\n${linkedinText.slice(0, 12000)}`,
        },
      ],
    });

    const textBlock = response.content.find((b: { type: string }) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No text content in Claude response" }, { status: 502 });
    }
    let raw = (textBlock as { type: "text"; text: string }).text.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }
    let result: OnboardResult;
    try {
      result = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Could not parse Claude response", raw: raw.slice(0, 400) }, { status: 502 });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Claude request failed", message: (err as Error).message },
      { status: 502 },
    );
  }
}
