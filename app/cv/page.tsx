"use client";

import { useState } from "react";
import { PageHero } from "@/components/PageHero";

const CV_DIMENSIONS = [
  {
    id: "metrics",
    name: "Metrics & Numbers",
    weight: 20,
    questions: [
      { id: "metrics-1", text: "Does the CV lead with quantified achievements (e.g. revenue settled, % to target)?", weight: 5 },
      { id: "metrics-2", text: "Are bullet points action-verb + number + outcome (not duty descriptions)?", weight: 5 },
      { id: "metrics-3", text: "Does every commercial role show quota attainment % or revenue settled?", weight: 5 },
      { id: "metrics-4", text: "Are time periods shown (Q4 only? Full year? 6 months?)?", weight: 5 },
    ],
  },
  {
    id: "positioning",
    name: "Positioning & Voice",
    weight: 20,
    questions: [
      { id: "positioning-1", text: "Does the profile/summary lead with a specific brand, not a generic 'tech sales professional'?", weight: 5 },
      { id: "positioning-2", text: "Is your strongest positioning angle visible early?", weight: 5 },
      { id: "positioning-3", text: "Is any varied background framed as an edge, not a detour?", weight: 5 },
      { id: "positioning-4", text: "Does the CV avoid fabricated or inflated claims?", weight: 5 },
    ],
  },
  {
    id: "fit",
    name: "JD Fit",
    weight: 20,
    questions: [
      { id: "fit-1", text: "Are 3+ keywords from the JD reflected in the CV?", weight: 5 },
      { id: "fit-2", text: "Is the target role title (BDR/AE/AM/BDM) reflected in the desired-roles line?", weight: 5 },
      { id: "fit-3", text: "Does the vertical (AI / healthcare / cyber / etc.) match what's targeted?", weight: 5 },
      { id: "fit-4", text: "Is the cycle pace (consultative / transactional) matched to the company's actual sales motion?", weight: 5 },
    ],
  },
  {
    id: "scannability",
    name: "Scannability (10-sec test)",
    weight: 20,
    questions: [
      { id: "scan-1", text: "Can an HM see the headline metric in <3 seconds?", weight: 5 },
      { id: "scan-2", text: "Is the most recent role on page 1 with full bullets?", weight: 5 },
      { id: "scan-3", text: "Are skills tagged at the top (not buried)?", weight: 5 },
      { id: "scan-4", text: "Is the CV under 2 pages total?", weight: 5 },
    ],
  },
  {
    id: "story",
    name: "Narrative Arc",
    weight: 20,
    questions: [
      { id: "story-1", text: "Does the career history read as a progression, not random jumps?", weight: 5 },
      { id: "story-2", text: "Are short stints framed in service of the through-line, not as random detours?", weight: 5 },
      { id: "story-3", text: "Is any founder/operator experience positioned as proof of ownership, not a side hustle?", weight: 5 },
      { id: "story-4", text: "Does the 'why now' for this move come through implicitly?", weight: 5 },
    ],
  },
];

const TOTAL_POSSIBLE = CV_DIMENSIONS.reduce((sum, d) => sum + d.questions.reduce((s, q) => s + q.weight, 0), 0);

export default function CVAnalyser() {
  const [responses, setResponses] = useState<Record<string, boolean>>({});
  const [jdText, setJdText] = useState("");
  const [cvText, setCvText] = useState("");
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  const score = CV_DIMENSIONS.reduce(
    (sum, d) => sum + d.questions.filter((q) => responses[q.id]).reduce((s, q) => s + q.weight, 0),
    0
  );
  const pct = Math.round((score / TOTAL_POSSIBLE) * 100);
  const grade = pct >= 90 ? "S" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : "D";
  const gradeColor = pct >= 80 ? "text-good" : pct >= 70 ? "text-warn" : "text-hot";

  function toggle(id: string) {
    setResponses((r) => ({ ...r, [id]: !r[id] }));
  }

  function buildClaudePrompt() {
    const failedQs = CV_DIMENSIONS.flatMap((d) =>
      d.questions.filter((q) => !responses[q.id]).map((q) => `- ${d.name}: ${q.text}`)
    );
    const prompt = `You are helping a candidate tailor their CV for a specific job application.

## The candidate's CV (full text)
${cvText || "(CV not provided - ask the candidate to paste it)"}

## Target Job Description
${jdText || "(JD not provided - ask the candidate to paste it)"}

## Self-audit results
The candidate scored ${score}/${TOTAL_POSSIBLE} (${pct}%) on their CV against the 5 dimensions: Metrics, Positioning, JD Fit, Scannability, Narrative Arc.

## Gaps the candidate identified
${failedQs.length > 0 ? failedQs.join("\n") : "All dimensions passed self-audit."}

## What the candidate needs from you
1. Read the JD carefully. Identify the 3 most important things THIS specific company is hiring for.
2. Critique the CV against the JD. Where does it land, where does it fall short?
3. Suggest 5-7 specific edits to tailor the CV for this exact application. Be concrete (specific bullet rewrites, specific sections to reorder).
4. Flag any inflated claims that should be softened.
5. If a specific Pattern (A: AI fluency, B: Founder DNA, C: Enterprise rigor, D: Consultative discovery, E: Hybrid) fits the JD better than how the CV currently leads, suggest the swap.

## Guardrails
- Draw only on what appears in the candidate's CV above. Do NOT fabricate credentials, employers, or numbers.

Output: specific, actionable, tied to the JD. No generic advice.`;
    setGenerated(prompt);
    setCopied(false);
    setTimeout(() => document.getElementById("cv-output")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function copyAndGo() {
    navigator.clipboard.writeText(generated).then(() => {
      setCopied(true);
      window.open("https://claude.ai/new", "_blank");
    });
  }

  return (
    <div>
      <PageHero eyebrow="Playbook" title="CV Analyser" subtitle="5-dimension CV self-audit + Claude prompt builder. Tick what your CV does well, paste the JD, get a tailored rewrite plan for free via Claude.ai." marker="CV.01" />

      {/* Score panel */}
      <div className="card !border-accent bg-gradient-to-br from-surface to-surface-2 mb-5">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <div>
            <div className="text-[11px] text-muted uppercase tracking-wider">Current CV Score</div>
            <div className={`text-5xl font-bold ${gradeColor}`}>
              {pct}<span className="text-2xl">%</span> · {grade}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{score}<span className="text-sm text-muted"> / {TOTAL_POSSIBLE}</span></div>
            <div className="text-xs text-muted mt-1">{Object.values(responses).filter(Boolean).length} checks passed</div>
          </div>
        </div>
        <div className="progress-track" style={{ height: "10px" }}>
          <div className={`progress-fill ${pct >= 80 ? "!bg-good" : pct >= 60 ? "!bg-warn" : "!bg-hot"}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Dimensions checklist */}
      <h2 className="text-xl font-semibold mb-3">5-Dimension Self-Audit</h2>
      {CV_DIMENSIONS.map((d) => {
        const passed = d.questions.filter((q) => responses[q.id]).length;
        const total = d.questions.length;
        return (
          <div key={d.id} className="card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold mt-0">{d.name}</h3>
              <span className="text-sm text-muted">{passed}/{total}</span>
            </div>
            <div className="space-y-2">
              {d.questions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => toggle(q.id)}
                  className={`flex items-start gap-3 p-2.5 rounded-md cursor-pointer transition-all ${responses[q.id] ? "bg-good/5" : "hover:bg-surface-2"}`}
                >
                  <div className={`w-5 h-5 border-2 rounded flex-shrink-0 flex items-center justify-center mt-0.5 ${responses[q.id] ? "bg-good border-good" : "border-muted"}`}>
                    {responses[q.id] && <svg width="12" height="12" viewBox="0 0 14 14"><path d="M2 7 L6 11 L12 3" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  <div className={`text-sm ${responses[q.id] ? "text-text-dim" : "text-text"}`}>{q.text}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Tailor for specific JD */}
      <h2 className="text-xl font-semibold mt-7 mb-3">Tailor for a specific job</h2>
      <div className="card">
        <label className="block text-[11px] text-muted uppercase tracking-wider mb-1">Paste your current CV text</label>
        <textarea
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          placeholder="Paste the full text of your current CV here (Cmd+A inside your PDF/Word doc → Cmd+C → paste here)..."
          rows={6}
          className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-accent mb-3 font-mono text-[11px]"
        />

        <label className="block text-[11px] text-muted uppercase tracking-wider mb-1">Paste the Job Description</label>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the full JD from the company's careers page..."
          rows={8}
          className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-accent mb-3 font-mono text-[11px]"
        />

        <button
          onClick={buildClaudePrompt}
          disabled={!jdText.trim() || !cvText.trim()}
          className="w-full bg-accent text-white font-semibold py-3 rounded-md hover:bg-accent-2 disabled:opacity-40 transition-all"
        >
          ⚡ Build Claude tailoring prompt
        </button>
      </div>

      {generated && (
        <div id="cv-output" className="card !border-accent mt-4 bg-gradient-to-br from-surface to-surface-2">
          <div className="flex justify-between items-start gap-3 mb-3 flex-wrap">
            <div>
              <h3 className="text-base font-semibold mt-0 text-accent">CV tailoring prompt ready</h3>
              <p className="text-xs text-text-dim mt-1">{generated.length} chars · includes your CV + JD + self-audit gaps + verified credential guardrails</p>
            </div>
            <button
              onClick={copyAndGo}
              className={`px-4 py-2 text-[11px] uppercase tracking-wider rounded font-semibold ${copied ? "bg-good text-white" : "bg-accent text-white hover:bg-accent-2"}`}
            >
              {copied ? "Copied ✓ Claude.ai opening" : "Copy & open Claude.ai →"}
            </button>
          </div>
          <pre className="bg-surface-2 border border-border rounded-md p-3 font-mono text-[10px] leading-relaxed text-text whitespace-pre-wrap max-h-[400px] overflow-y-auto">
            {generated}
          </pre>
        </div>
      )}
    </div>
  );
}
