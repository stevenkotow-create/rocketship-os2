"use client";

import { useState } from "react";
import { useAppState } from "@/lib/storage";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import { AI_COACH_BRIEF } from "@/lib/data/frameworks";

const STARTER_PROMPTS = [
  "What's my single highest-leverage action this morning?",
  "Audit my latest outreach — would you have written it differently?",
  "Walk me through how I should prep for my next interview.",
  "Which opp in Scouting should I action next, and why?",
  "Read the room — am I over-indexing on one vertical at the expense of others?",
  "Critique my Mission Identity. Is my positioning landing?",
];

function buildContextSnapshot(state: ReturnType<typeof useAppState>[0]): string {
  const allOpps = OPPORTUNITIES.map((o) => ({ ...o, ...(state.opps[o.id] || {}) }));
  const live = allOpps.filter((o) => o.live || o.stage === "early" || o.stage === "late");
  const targeting = allOpps.filter((o) => o.stage === "targeting").length;
  const contacted = allOpps.filter((o) => o.stage === "contacted").length;
  const applied = allOpps.filter((o) => o.stage === "applied").length;
  const offer = allOpps.filter((o) => o.stage === "offer").length;
  const closed = allOpps.filter((o) => o.stage === "closed").length;

  const todayKey = new Date().toISOString().split("T")[0];
  const ritualToday = state.ritual[todayKey] || { apps: 0, outreach: 0, followups: 0, practice: 0 };
  const energyToday = state.energy[todayKey];
  const logToday = state.log[todayKey] || {};

  return `
PIPELINE STATE
- Scouting: ${targeting}
- Comms Open: ${contacted}
- Payload Sent: ${applied}
- Ignition+Ascent: ${live.length}
- Orbit: ${offer}
- Recovered: ${closed}

LIVE OPPORTUNITIES (need action this week)
${live.map((o) => `- ${o.company} · ${o.position} · ${o.stage} · ${o.daysInStage || 0}d in stage · action: ${o.action || "tbd"}`).join("\n") || "- none"}

TODAY'S MISSION DRILLS (${todayKey})
- Apps: ${ritualToday.apps}/2 · Outreach: ${ritualToday.outreach}/4 · Follow-ups: ${ritualToday.followups}/2 · Practice: ${ritualToday.practice}/15min
- Energy: ${energyToday ? `${energyToday}/5` : "not logged"}

TODAY'S MISSION LOG ENTRIES (so far)
- Win: ${logToday.win || "(empty)"}
- Lesson: ${logToday.lesson || "(empty)"}
- Observation: ${logToday.obs || "(empty)"}
- POD: ${logToday.pod || "(empty)"}
`.trim();
}

function buildFullPrompt(userQuestion: string, contextSnapshot: string): string {
  return `${AI_COACH_BRIEF}

## LIVE PLATFORM STATE (current as of this conversation)

${contextSnapshot}

---

You are now in conversation with the user inside their job-search platform. Respond as their co-pilot. Direct, operator mode, honest, warm but not soft. Match the voice in the Build Log and Mission Identity.

## The user's question

${userQuestion}`;
}

export default function CoPilotConsole() {
  const [state] = useAppState();
  const [question, setQuestion] = useState("");
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  function generatePrompt(text: string) {
    if (!text.trim()) return;
    const contextSnapshot = buildContextSnapshot(state);
    const fullPrompt = buildFullPrompt(text.trim(), contextSnapshot);
    setGenerated(fullPrompt);
    setQuestion(text.trim());
    setCopied(false);

    setTimeout(() => {
      document.getElementById("generated-prompt")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function copyAndGo() {
    navigator.clipboard.writeText(generated).then(() => {
      setCopied(true);
      // Open Claude.ai in new tab
      window.open("https://claude.ai/new", "_blank");
    });
  }

  function copyOnly() {
    navigator.clipboard.writeText(generated).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight mb-1.5">Co-Pilot Briefing</h1>
          <p className="text-muted text-sm">
            Smart prompt builder. Bundles your AI Coach Brief + live platform state + your question into a single prompt → opens Claude.ai → you paste → get Co-Pilot answer with full context.
          </p>
        </div>
      </div>

      <div className="card !border-accent">
        <h3 className="text-base font-semibold text-accent mt-0 mb-2">How this works · $0 cost</h3>
        <ol className="text-sm text-text-dim space-y-1 pl-5 list-decimal">
          <li>Pick a starter prompt OR type your own question below</li>
          <li>Click <strong>&quot;Build prompt&quot;</strong> — the platform assembles your full context</li>
          <li>Click <strong>&quot;Copy &amp; open Claude.ai&quot;</strong> — your prompt is on your clipboard, Claude.ai opens</li>
          <li>Paste into Claude.ai (Cmd+V) and hit send</li>
          <li>You get answers grounded in YOUR pipeline, drills, and frameworks — for free</li>
        </ol>
      </div>

      <h2 className="text-xl font-semibold mt-7 mb-3">Pick a starter or write your own</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        {STARTER_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => generatePrompt(p)}
            className="text-left text-[13px] px-3 py-2.5 bg-surface border border-border rounded-md hover:border-accent text-text-dim hover:text-text transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          generatePrompt(question);
        }}
        className="flex gap-2 mb-6"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your own question for the Co-Pilot..."
          className="flex-1 bg-surface border border-border rounded-md px-4 py-3 text-sm text-text focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={!question.trim()}
          className="px-5 py-3 bg-accent text-white rounded-md text-sm font-semibold disabled:opacity-40 hover:bg-accent-2"
        >
          Build prompt
        </button>
      </form>

      {generated && (
        <div id="generated-prompt" className="card !border-accent bg-gradient-to-br from-surface to-surface-2">
          <div className="flex justify-between items-start gap-3 mb-3 flex-wrap">
            <div>
              <h3 className="text-base font-semibold mt-0 text-accent">Your prompt is ready</h3>
              <p className="text-xs text-text-dim mt-1">~{generated.length} characters. Includes your full AI Coach Brief + current pipeline + today&apos;s drills + your question.</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={copyOnly}
                className={`px-3 py-2 text-[11px] uppercase tracking-wider rounded border ${copied ? "bg-good border-good text-white" : "border-border text-muted hover:border-accent hover:text-accent"}`}
              >
                {copied ? "Copied ✓" : "Copy only"}
              </button>
              <button
                onClick={copyAndGo}
                className="px-4 py-2 text-[11px] uppercase tracking-wider rounded bg-accent text-white font-semibold hover:bg-accent-2"
              >
                Copy &amp; open Claude.ai →
              </button>
            </div>
          </div>
          <pre className="bg-surface-2 border border-border rounded-md p-3 font-mono text-[11px] leading-relaxed text-text whitespace-pre-wrap max-h-[400px] overflow-y-auto">
            {generated}
          </pre>
        </div>
      )}

      <div className="card mt-5">
        <h3 className="text-base font-semibold mt-0 mb-2 text-navy">Why this works without API costs</h3>
        <p className="text-sm text-text-dim mb-2">
          The expensive part of AI is the inference (Claude generating the response). When you use claude.ai directly, Anthropic eats the cost — it&apos;s included in your free Claude.ai account. What this platform does is the EXPENSIVE-TO-DO-MANUALLY part: assembling all your context into one perfect prompt.
        </p>
        <p className="text-sm text-text-dim">
          Bonus: claude.ai keeps your conversation history per chat. You can ask follow-ups in the same Claude.ai conversation without re-pasting the brief. Just keep asking inside that thread.
        </p>
      </div>

      <div className="card mt-3 !border-warn">
        <h3 className="text-base font-semibold mt-0 mb-2 text-warn">Want live in-platform chat instead? Optional upgrade later</h3>
        <p className="text-sm text-text-dim">
          If you ever want the Co-Pilot to chat directly inside this page (no copy-paste step), drop an Anthropic API key into <code className="bg-surface-3 px-1.5 py-0.5 rounded text-xs">.env.local</code> when you&apos;re ready. Typical usage is &lt;$2/month at your scale. But totally optional — the prompt-builder version above works at $0.
        </p>
      </div>
    </div>
  );
}
