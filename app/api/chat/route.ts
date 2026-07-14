import { NextResponse } from "next/server";
import { AI_COACH_BRIEF } from "@/lib/data/frameworks";
import type { ChatMessage } from "@/lib/types";

export const runtime = "edge";

interface ChatRequest {
  messages: ChatMessage[];
  contextSnapshot?: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "No API key configured",
        message:
          "Drop your Anthropic API key into the .env.local file in the project root. Get one at console.anthropic.com → API Keys → Create Key. Add a line: ANTHROPIC_API_KEY=sk-ant-...",
      },
      { status: 503 }
    );
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { messages, contextSnapshot } = body;

  // Build system prompt: AI Coach Brief + live context snapshot from app state
  const systemPrompt = `${AI_COACH_BRIEF}

## LIVE PLATFORM STATE (auto-injected each turn)

${contextSnapshot || "No live state snapshot provided this turn."}

---

You are now in conversation with the user inside their job-search platform. Respond as their co-pilot. Direct, operator mode, honest, warm but not soft. Match the voice in the Build Log and Mission Identity.`;

  // Translate ChatMessage[] to Anthropic API format
  const apiMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        system: systemPrompt,
        messages: apiMessages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        { error: "Claude API error", details: errorBody, status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    return NextResponse.json({ text, usage: data.usage });
  } catch (err) {
    return NextResponse.json(
      { error: "Network error contacting Claude API", details: String(err) },
      { status: 500 }
    );
  }
}
