"use client";

import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { useAppState } from "@/lib/storage";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import { PATTERNS } from "@/lib/data/patterns";
import type { Pattern, Opportunity } from "@/lib/types";

type OutputType = "loom" | "dm" | "cover";

const PATTERN_VOICE_GUIDANCE: Record<Pattern, string> = {
  A: `LEAD with your AI thesis: how you use AI tools in your daily workflow and why that matters for this role. Use real, verifiable proof only. Avoid buzzwords and unverifiable multipliers.`,
  B: `LEAD with your operator/founder energy: concrete ownership experience and P&L thinking. The energy should read as a habit, not a pitch. Use real proof only.`,
  C: `LEAD with your most relevant hard results, quantified. Never inflate a title or fabricate stakeholder counts. Stick to what is real and verifiable.`,
  D: `LEAD with your relationship-first thesis: trust compounds, treat people like people first, results follow. Draw on the variety of your background as evidence. Consultative selling.`,
  E: `LEAD with the breadth of your background plus your AI thesis. Layer operator reality in paragraph 2. For roles needing both operator backbone AND future-sight. Use specific, verifiable proof.`,
};

const OUTREACH_TEMPLATE = `STRUCTURE — outreach template:
1. "Hi [name], I'll be upfront: [specific personal hook from their LinkedIn or recent activity]"
2. "What actually made me reach out: [the actual ask]"
3. Tight credibility (3-4 sentences, real numbers only)
4. Loom / video link
5. Specific soft CTA (15-min, a specific day, what you'll come with)
6. "Either way — thanks for reading."
7. Your name

VOICE RULES:
- 4-5 paragraphs MAX
- No fabricated credentials. No inflated titles or unverifiable multipliers.
- Sound like a human writing to a human.
- Consistent, warm close.`;

function buildLoomPrompt(opp: Partial<Opportunity>, pattern: Pattern, hmName: string, hookContext: string): string {
  return `You are helping the candidate write a Loom script for an outreach to ${hmName || "[HM]"} at ${opp.company}.

ROLE: ${opp.position}
COMPANY CONTEXT: ${opp.note || "(no notes captured)"}
URL: ${opp.url || "(none)"}

PATTERN: ${pattern} (${PATTERNS.find(p => p.letter === pattern)?.name})

${PATTERN_VOICE_GUIDANCE[pattern]}

ADDITIONAL HOOK / PERSONAL TOUCHPOINT: ${hookContext || "(none provided — you need to suggest one based on the company context above)"}

STRUCTURE — 5-part Loom, target 75-85 seconds total:
1. Hook (10 sec) — name, role, why THIS company (one specific researched detail)
2. Credibility (15-20 sec) — most relevant 1-2 wins, quantified, real numbers only
3. Differentiator (20-25 sec) — what makes you a strong fit for this specific role
4. Honest friction (10 sec) — name the gap, frame as a fast learner rather than a tenured incumbent
5. Soft CTA (15 sec) — specific Who/When/Length/Agenda

Write the script in the candidate's own voice. First person, conversational, no jargon.

Output ONLY the 5 sections clearly labelled. No preamble.`;
}

function buildDMPrompt(opp: Partial<Opportunity>, pattern: Pattern, hmName: string, hookContext: string): string {
  return `You are helping the candidate write a LinkedIn DM to ${hmName || "[HM]"} at ${opp.company}.

ROLE the candidate is pursuing: ${opp.position}
COMPANY CONTEXT: ${opp.note || "(no notes captured)"}

PATTERN: ${pattern} (${PATTERNS.find(p => p.letter === pattern)?.name})

${PATTERN_VOICE_GUIDANCE[pattern]}

PERSONAL HOOK / TOUCHPOINT (use this in the opener): ${hookContext || "(none provided — open with a generic acknowledgment of the company's trajectory)"}

${OUTREACH_TEMPLATE}

LOOM LINK to include: [LOOM LINK]

Write the DM directly, no preamble. Output ONLY the message text to paste into LinkedIn.`;
}

function buildCoverPrompt(opp: Partial<Opportunity>, pattern: Pattern, hmName: string, hookContext: string): string {
  return `You are helping the candidate draft a cover letter for ${opp.position} at ${opp.company}.

COMPANY CONTEXT: ${opp.note || "(no notes captured)"}

PATTERN: ${pattern} (${PATTERNS.find(p => p.letter === pattern)?.name})

${PATTERN_VOICE_GUIDANCE[pattern]}

PERSONAL HOOK: ${hookContext || "(none provided)"}

VOICE RULES:
- No fabricated credentials
- Lead with the line that fits the pattern
- 3 paragraphs max
- Specific not generic
- Close with a confident, flexible framing if appropriate
- Warm, consistent close

Draw only on the candidate's own verified credentials (fill these in for your own background):
- [Most relevant role + quantified result]
- [Prior role or project + outcome]
- [Any founder / operator / ownership experience]
- [Relevant tools or AI workflow you use daily]

Output ONLY the cover letter body. No "Dear Hiring Manager" / "Sincerely" — the candidate will add those.`;
}

const MUST_HAVES_CHECKLIST = [
  "Personal touchpoint specific to recipient (not generic)",
  "Recipient recognition (their work / trajectory / role)",
  "30-second bio with quantified credibility",
  "Social proof",
  "Why YOU specifically tied to THEIR context",
  "Honest friction acknowledgment",
  "At least one accountability line",
  "Specific soft CTA (Who/When/Length/Agenda)",
  "Reciprocal value offer (Loom, written read, plan)",
  "Voice: honest opener, no fabricated claims",
  "Warm, consistent close",
  "4-5 paragraphs max",
];

export default function BriefingLab() {
  const [state] = useAppState();
  const ALL_OPPS = [...OPPORTUNITIES, ...(state.customOpps || [])];
  const allOpps: Opportunity[] = ALL_OPPS.map((o) => ({ ...o, ...(state.opps[o.id] || {}) } as Opportunity));
  const activeOpps = allOpps.filter((o) => !["closed", "accepted"].includes(o.stage));

  const [selectedOppId, setSelectedOppId] = useState("");
  const [manualOpp, setManualOpp] = useState({ company: "", position: "", note: "", url: "" });
  const [pattern, setPattern] = useState<Pattern>("A");
  const [hmName, setHmName] = useState("");
  const [hookContext, setHookContext] = useState("");
  const [outputType, setOutputType] = useState<OutputType>("loom");
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedOpp = selectedOppId ? allOpps.find((o) => o.id === selectedOppId) : null;
  const oppForGeneration = selectedOpp || manualOpp;

  function build() {
    if (!oppForGeneration.company || !oppForGeneration.position) {
      alert("Pick an opp from the dropdown OR fill in company + position manually");
      return;
    }

    let prompt = "";
    if (outputType === "loom") prompt = buildLoomPrompt(oppForGeneration, pattern, hmName, hookContext);
    else if (outputType === "dm") prompt = buildDMPrompt(oppForGeneration, pattern, hmName, hookContext);
    else if (outputType === "cover") prompt = buildCoverPrompt(oppForGeneration, pattern, hmName, hookContext);

    setGenerated(prompt);
    setCopied(false);
    setTimeout(() => document.getElementById("generated-output")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function copyAndGo() {
    navigator.clipboard.writeText(generated).then(() => {
      setCopied(true);
      window.open("https://claude.ai/new", "_blank");
    });
  }

  function copyOnly() {
    navigator.clipboard.writeText(generated).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function loadOpp(id: string) {
    setSelectedOppId(id);
    const opp = allOpps.find((o) => o.id === id);
    if (opp) {
      if (opp.pattern) setPattern(opp.pattern);
      if (opp.contacts && opp.contacts.length > 0) setHmName(opp.contacts[0].name);
    }
  }

  return (
    <div>
      <PageHero
        eyebrow="Playbook"
        title="Mission Briefing Lab"
        subtitle="Generate tailored Loom + DM + Cover Letter prompts. Same pattern as Co-Pilot: build the perfect prompt → copy → paste into Claude.ai → get AI-quality output at $0."
        marker="MBL.01"
      />

      <div className="card">
        <h3 className="text-base font-semibold mt-0 mb-3">1. Pick an opp (or enter manually)</h3>
        <select
          value={selectedOppId}
          onChange={(e) => loadOpp(e.target.value)}
          className="w-full bg-surface-2 border border-border rounded-md px-3 py-2.5 text-sm text-text focus:outline-none focus:border-accent mb-3"
        >
          <option value="">-- Manual entry --</option>
          {activeOpps.map((o) => (
            <option key={o.id} value={o.id}>
              {o.company} · {o.position}
            </option>
          ))}
        </select>

        {!selectedOppId && (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={manualOpp.company}
              onChange={(e) => setManualOpp({ ...manualOpp, company: e.target.value })}
              placeholder="Company"
              className="bg-surface-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              value={manualOpp.position}
              onChange={(e) => setManualOpp({ ...manualOpp, position: e.target.value })}
              placeholder="Position"
              className="bg-surface-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <textarea
              value={manualOpp.note}
              onChange={(e) => setManualOpp({ ...manualOpp, note: e.target.value })}
              placeholder="Company context, recent news, JD highlights..."
              rows={3}
              className="col-span-2 bg-surface-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
        )}

        <h3 className="text-base font-semibold mt-5 mb-3">2. Set the angle</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] text-muted uppercase tracking-wider mb-1">Pattern</label>
            <select
              value={pattern}
              onChange={(e) => setPattern(e.target.value as Pattern)}
              className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {PATTERNS.map((p) => (
                <option key={p.letter} value={p.letter}>
                  {p.letter} · {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-muted uppercase tracking-wider mb-1">Recipient name (HM)</label>
            <input
              type="text"
              value={hmName}
              onChange={(e) => setHmName(e.target.value)}
              placeholder="e.g. Hiring Manager name"
              className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <label className="block text-[11px] text-muted uppercase tracking-wider mb-1">Specific hook (recent post, customer win, news)</label>
        <input
          type="text"
          value={hookContext}
          onChange={(e) => setHookContext(e.target.value)}
          placeholder="e.g. a recent post of theirs, a customer win, a shared connection"
          className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent mb-3"
        />

        <h3 className="text-base font-semibold mt-5 mb-3">3. What to generate</h3>
        <div className="flex gap-2 mb-4">
          {[
            { id: "loom" as const, label: "📹 Loom Script", desc: "75-85 sec script" },
            { id: "dm" as const, label: "💬 LinkedIn DM", desc: "Outreach template" },
            { id: "cover" as const, label: "📝 Cover Letter", desc: "3-paragraph body" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setOutputType(opt.id)}
              className={`flex-1 p-3 border rounded-md text-left transition-all ${outputType === opt.id ? "border-accent bg-accent/5" : "border-border hover:border-border-strong"}`}
            >
              <div className="font-semibold text-sm">{opt.label}</div>
              <div className="text-[11px] text-muted mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>

        <button
          onClick={build}
          className="w-full bg-accent text-white font-semibold py-3 rounded-md hover:bg-accent-2 transition-all"
        >
          ⚡ Build prompt
        </button>
      </div>

      {generated && (
        <div id="generated-output" className="card !border-accent mt-4 bg-gradient-to-br from-surface to-surface-2">
          <div className="flex justify-between items-start gap-3 mb-3 flex-wrap">
            <div>
              <h3 className="text-base font-semibold mt-0 text-accent">Your {outputType.toUpperCase()} prompt is ready</h3>
              <p className="text-xs text-text-dim mt-1">{generated.length} characters. Pattern {pattern}. Tailored to {oppForGeneration.company}.</p>
            </div>
            <div className="flex gap-2">
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

      <div className="card mt-4">
        <h3 className="text-base font-semibold mt-0 mb-3 text-navy">Pre-flight check · 12-point Outreach Must-Haves</h3>
        <p className="text-xs text-text-dim mb-3">When Claude returns your output, run it through this checklist. If you can&apos;t tick 10+, ask Claude to rewrite.</p>
        <ul className="text-[13px] text-text-dim space-y-1.5 pl-5 list-disc">
          {MUST_HAVES_CHECKLIST.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
