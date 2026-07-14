// Company Evaluator API · paste URL → Claude analysis → 6-dimension scoring back
// POST { url: string } → CompanyEvaluation JSON
// Requires ANTHROPIC_API_KEY in .env.local AND @anthropic-ai/sdk installed (npm install)

import { NextRequest, NextResponse } from "next/server";
import { evaluateCompany } from "@/lib/data/evaluation";

const SYSTEM_PROMPT = `You are the Six-Dimension Company Evaluator for this job-search platform,
which scores tech companies for whether they're worth pursuing as commercial sales seats.

Your job: read the company context the user gives you and output a structured JSON evaluation.

The 6 dimensions, each scored 1-5 with one-sentence rationale:

1. layerInStack (1-5)
   5 = Layer 1 (Infrastructure) OR Layer 4 (Vertical / industry-specific)
   4 = Layer 2 (Platforms)
   3 = Layer 3 (Horizontal Apps)
   2 = Layer 5 (AI/Agentic) but unproven commercial
   1 = Unclear positioning

2. categoryMaturity (1-5)
   5 = Growth-stage category-defining leader
   4 = Growth-stage $50-100M ARR sweet spot
   3 = Emerging (exciting but too early)
   2 = Mature stable (ceiling on growth)
   1 = Mature declining

3. stageOfGrowth (1-5)
   5 = Late-stage unicorn OR profitable scale-up (best risk/reward)
   4 = Series D+ proven trajectory
   3 = Series B-C scaling but volatile
   2 = Series A early PMF
   1 = Pre-Seed/Seed unproven

4. gtmMotion (1-5)
   5 = SLG-led pure consultative selling
   4 = Hybrid PLG-SLG expansion + closing
   3 = Channel-driven requires partner fluency
   2 = PLG-dominant sales is overlay
   1 = Pure PLG no commercial team

5. commercialHealth (1-5)
   5 = Best-in-class top VCs + marquee logos + category leadership
   4 = Strong recent round + named customers + roadmap
   3 = Steady positive signals
   2 = Quiet no recent funding + thin logos
   1 = Down round + no AI roadmap + churn signals

6. mustHave (1-5)
   5 = Regulatory + personal-accountability driven (cyber, compliance, ITSM)
   4 = Mission-critical CISO/CIO-mandated
   3 = Strategic but not load-bearing
   2 = Productivity-adjacent cuttable
   1 = Pure nice-to-have first cut

Hard gates (separate from dimensional score):
- hasApacSeat: true/false (Sydney / Singapore / Tokyo presence)
- rolePostedWithin90Days: true/false/null (null if no specific role URL given)

Output JSON only · no surrounding prose · this shape:
{
  "companyName": "string",
  "layerInStack": number,
  "layerNote": "string",
  "categoryMaturity": number,
  "categoryNote": "string",
  "stageOfGrowth": number,
  "stageNote": "string",
  "gtmMotion": number,
  "gtmNote": "string",
  "commercialHealth": number,
  "commercialNote": "string",
  "mustHave": number,
  "mustHaveNote": "string",
  "hasApacSeat": boolean,
  "apacNote": "string",
  "rolePostedWithin90Days": boolean | null,
  "freshnessNote": "string",
  "summary": "2-3 sentence overall read for the user"
}`;

interface ScoringResponse {
  companyName: string;
  layerInStack: number;
  layerNote: string;
  categoryMaturity: number;
  categoryNote: string;
  stageOfGrowth: number;
  stageNote: string;
  gtmMotion: number;
  gtmNote: string;
  commercialHealth: number;
  commercialNote: string;
  mustHave: number;
  mustHaveNote: string;
  hasApacSeat: boolean;
  apacNote: string;
  rolePostedWithin90Days: boolean | null;
  freshnessNote: string;
  summary: string;
}

async function fetchPageContext(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return `URL fetch returned status ${res.status}. Paste context as a fallback.`;
    }
    const html = await res.text();
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);
    return text;
  } catch (err) {
    return `URL fetch failed: ${(err as Error).message}. Paste context as a fallback.`;
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "ANTHROPIC_API_KEY not configured",
        message:
          "Add ANTHROPIC_API_KEY to .env.local in the rocket-ship-app folder. Get a key at console.anthropic.com. Restart the dev server after adding.",
      },
      { status: 500 },
    );
  }

  // Dynamic import so the build doesn't fail when @anthropic-ai/sdk isn't installed yet.
  // @ts-ignore · runtime-only dependency, may not be installed at build time
  let AnthropicModule;
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    AnthropicModule = await import("@anthropic-ai/sdk");
  } catch (err) {
    return NextResponse.json(
      {
        error: "@anthropic-ai/sdk not installed",
        message:
          "Run `npm install` in the rocket-ship-app folder to install the Anthropic SDK. Then restart the dev server.",
      },
      { status: 500 },
    );
  }
  const Anthropic = AnthropicModule.default;

  let body: { url?: string; manualContext?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url, manualContext } = body;
  if (!url && !manualContext) {
    return NextResponse.json(
      { error: "Provide either url or manualContext in the request body" },
      { status: 400 },
    );
  }

  let context = manualContext || "";
  if (url) {
    const fetched = await fetchPageContext(url);
    context = `URL: ${url}\n\nPAGE CONTENT (first 8K chars):\n${fetched}\n\n${manualContext ? `MANUAL CONTEXT: ${manualContext}` : ""}`;
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Evaluate this company against the 6-Dimension framework:\n\n${context}\n\nReturn JSON only.`,
        },
      ],
    });

    const textBlock = response.content.find((b: { type: string }) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No text content in Claude response" }, { status: 500 });
    }

    let rawJson = (textBlock as { type: "text"; text: string }).text.trim();
    if (rawJson.startsWith("```")) {
      rawJson = rawJson.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }

    let scoring: ScoringResponse;
    try {
      scoring = JSON.parse(rawJson);
    } catch {
      return NextResponse.json(
        { error: "Claude returned invalid JSON", raw: rawJson },
        { status: 500 },
      );
    }

    const evaluation = evaluateCompany({
      layerInStack: scoring.layerInStack,
      categoryMaturity: scoring.categoryMaturity,
      stageOfGrowth: scoring.stageOfGrowth,
      gtmMotion: scoring.gtmMotion,
      commercialHealth: scoring.commercialHealth,
      mustHave: scoring.mustHave,
      hasApacSeat: scoring.hasApacSeat,
      rolePostedWithin90Days: scoring.rolePostedWithin90Days || undefined,
      notes: {
        layerNote: scoring.layerNote,
        categoryNote: scoring.categoryNote,
        stageNote: scoring.stageNote,
        gtmNote: scoring.gtmNote,
        commercialNote: scoring.commercialNote,
        mustHaveNote: scoring.mustHaveNote,
      },
    });

    return NextResponse.json({
      companyName: scoring.companyName,
      summary: scoring.summary,
      apacNote: scoring.apacNote,
      freshnessNote: scoring.freshnessNote,
      evaluation,
    });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json(
      {
        error: "Claude API call failed",
        message: e.message,
      },
      { status: 500 },
    );
  }
}
