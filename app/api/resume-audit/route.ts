// V3.5 · Resume Audit · Claude API endpoint (fallback for local dev only)
// Production uses chat-paste pattern in StepResumeAudit.tsx · no API key needed
// This route only fires if user adds ANTHROPIC_API_KEY to .env.local

import { NextRequest, NextResponse } from "next/server";
import type { ResumeAudit, CareerHypothesis } from "@/lib/types";

interface AuditRequest {
  resumeText: string;
  fileName?: string;
  careerHypothesis?: CareerHypothesis;
  targetSeats?: string[];
}

const SYSTEM_PROMPT = `You are an expert sales/GTM resume reviewer with 15+ years of experience hiring across BDR, SDR, AE, AM, CSM, and Manager seats at high-growth tech companies.

Assess the resume against modern hiring rubrics: STAR-format impact statements, quantified achievements, ATS parseability, narrative coherence, role-shape fit per seat type.

Return ONLY valid JSON matching this exact schema:
{
  "strengths": string[] (3-5 items),
  "gaps": string[] (3-5 items),
  "roleShapeFit": { "BDR": 0-100, "SDR": 0-100, "AE": 0-100, "AM": 0-100, "CSM": 0-100, "Manager": 0-100 },
  "keywordDensity": [{ "keyword": string, "count": number }] (top 10),
  "missingKeywords": string[] (5 items),
  "atsScore": 0-100,
  "narrativeCoherence": 0-100,
  "recommendedSeatLevels": string[] (3-5 items),
  "overallReadiness": "ship-it" | "tighten-first" | "rewrite-needed",
  "summary": string (2-3 sentences)
}

Be specific. Reference actual resume content. Output JSON only, no markdown, no preamble.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "ANTHROPIC_API_KEY not configured",
        message: "Use the chat-paste workflow on the Resume Audit page · no API key needed.",
      },
      { status: 500 },
    );
  }

  let AnthropicModule: typeof import("@anthropic-ai/sdk");
  try {
    AnthropicModule = await import("@anthropic-ai/sdk");
  } catch {
    return NextResponse.json(
      { error: "@anthropic-ai/sdk not installed" },
      { status: 500 },
    );
  }

  const Anthropic = AnthropicModule.default;
  const client = new Anthropic({ apiKey });

  let body: AuditRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { resumeText, fileName, careerHypothesis, targetSeats } = body;

  if (!resumeText || resumeText.trim().length < 100) {
    return NextResponse.json(
      { error: "Resume text too short · paste at least 100 characters." },
      { status: 400 },
    );
  }

  const contextLines: string[] = [];
  if (fileName) contextLines.push(`Filename: ${fileName}`);
  if (careerHypothesis) {
    contextLines.push(`Career hypothesis: ${careerHypothesis.fiveYearVision}`);
    contextLines.push(`Growth pace target: ${careerHypothesis.growthPace}`);
    contextLines.push(`Management appetite: ${careerHypothesis.managementAppetite}`);
    if (careerHypothesis.industryPreference?.length) {
      contextLines.push(`Industry preference: ${careerHypothesis.industryPreference.join(", ")}`);
    }
  }
  if (targetSeats?.length) {
    contextLines.push(`Specific target seats: ${targetSeats.join(", ")}`);
  }

  const userPrompt = [
    contextLines.length ? `CONTEXT:\n${contextLines.join("\n")}\n\n` : "",
    `RESUME:\n${resumeText}\n\n`,
    `Return the JSON audit now.`,
  ].join("");

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const firstBlock = message.content[0];
    let rawJson = firstBlock.type === "text" ? firstBlock.text : "";
    if (rawJson.includes("```")) {
      rawJson = rawJson.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }

    let parsed: Omit<ResumeAudit, "resumeText" | "fileName" | "auditedAt">;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      return NextResponse.json(
        { error: "Claude returned invalid JSON", raw: rawJson },
        { status: 500 },
      );
    }

    const audit: ResumeAudit = {
      ...parsed,
      resumeText: resumeText.slice(0, 50000),
      fileName,
      auditedAt: new Date().toISOString(),
    };

    return NextResponse.json(audit);
  } catch (e) {
    console.error("Resume audit failed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
