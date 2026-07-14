// V3.0 · Mission Compass scoring API
// POST { profile: ValuesProfile, opp: {company, position, description?, comp?} } → assessment JSON
// Calls Claude with the MISSION_COMPASS_SYSTEM_PROMPT from /lib/mission-compass.ts
// Returns the 5-lens structured assessment + Fit Read + Why It Fits + Red Flags +
// Self-Concordance Flag + Crafting Opportunities + Fit Score.

import { NextRequest, NextResponse } from "next/server";
import {
  MISSION_COMPASS_SYSTEM_PROMPT,
  buildAssessmentUserPrompt,
  type ValuesProfile,
} from "@/lib/mission-compass";

interface AssessmentInput {
  profile: ValuesProfile;
  opp: {
    company: string;
    position: string;
    description?: string;
    comp?: string;
  };
}

interface AssessmentResponse {
  reads: {
    valuesAlignment: string;
    needsFit: string;
    selfConcordance: string;
    vocationalFit: string;
    directionVowCheck: string;
  };
  fitRead: string;
  whyItFits: string[];
  redFlags: string[];
  selfConcordanceFlag: string | null;
  craftingOpportunities: string[];
  fitScore: number;
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

  // Dynamic import · matches the evaluate-company pattern
  let AnthropicModule: typeof import("@anthropic-ai/sdk");
  try {
    AnthropicModule = await import("@anthropic-ai/sdk");
  } catch {
    return NextResponse.json(
      {
        error: "@anthropic-ai/sdk not installed",
        message: "Run `npm install` in the rocket-ship-app folder to install the Anthropic SDK.",
      },
      { status: 500 },
    );
  }

  const Anthropic = AnthropicModule.default;
  const client = new Anthropic({ apiKey });

  let body: AssessmentInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.profile || !body.opp) {
    return NextResponse.json(
      { error: "Missing profile or opp in request body" },
      { status: 400 },
    );
  }

  // Sanity check the profile has the minimum required fields
  if (!body.profile.topValues || body.profile.topValues.length < 3) {
    return NextResponse.json(
      {
        error: "Values profile not sufficiently calibrated",
        message: "Run the Mission Compass calibration first (at least top 3 values + 2 direction vows required).",
      },
      { status: 400 },
    );
  }

  const userPrompt = buildAssessmentUserPrompt(body.profile, body.opp);

  try {
    // claude-sonnet-4-6 chosen for the depth of reasoning the 5-lens assessment needs
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: MISSION_COMPASS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const firstBlock = message.content[0];
    let rawJson = firstBlock.type === "text" ? firstBlock.text : "";

    // Strip code fences if present
    if (rawJson.includes("```")) {
      rawJson = rawJson.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }

    let assessment: AssessmentResponse;
    try {
      assessment = JSON.parse(rawJson);
    } catch {
      return NextResponse.json(
        { error: "Claude returned invalid JSON", raw: rawJson },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ...assessment,
      assessedAt: new Date().toISOString(),
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
