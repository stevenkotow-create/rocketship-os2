"use client";

// V3.5 · Discovery step · Resume Audit · chat-paste pattern
// No API needed in production · user copies prompt → pastes into Claude.ai → pastes JSON back
// Same pattern as V2 Evaluator (task #96). API endpoint remains for local dev with ANTHROPIC_API_KEY.

import { useState } from "react";
import { StarChart } from "@/components/icons";
import type { ResumeAudit } from "@/lib/types";

const RESUME_AUDIT_PROMPT = `You are an expert sales/GTM resume reviewer with 15+ years of experience hiring across BDR, SDR, AE, AM, CSM, and Manager seats at high-growth tech companies.

Assess the resume below against modern hiring rubrics: STAR-format impact statements, quantified achievements, ATS parseability, narrative coherence, and role-shape fit per seat type.

Return ONLY valid JSON matching this exact schema (no markdown fences, no preamble):

{
  "strengths": ["3-5 specific evidence-based strengths citing actual resume content"],
  "gaps": ["3-5 specific actionable gaps"],
  "roleShapeFit": {
    "BDR": 0-100,
    "SDR": 0-100,
    "AE": 0-100,
    "AM": 0-100,
    "CSM": 0-100,
    "Manager": 0-100
  },
  "keywordDensity": [{"keyword": "string", "count": number}],
  "missingKeywords": ["5 keywords the resume SHOULD include given target lane"],
  "atsScore": 0-100,
  "narrativeCoherence": 0-100,
  "recommendedSeatLevels": ["3-5 specific seat levels to target"],
  "overallReadiness": "ship-it" | "tighten-first" | "rewrite-needed",
  "summary": "2-3 sentence overall read, honest, specific, actionable"
}

Be specific. Reference actual resume content. Avoid generic advice.

RESUME:
`;

export function StepResumeAudit({
  initial,
  onSave,
  onSkip,
}: {
  initial?: ResumeAudit;
  onSave: (audit: ResumeAudit) => void;
  onSkip: () => void;
}) {
  const [resumeText, setResumeText] = useState(initial?.resumeText || "");
  const [fileName, setFileName] = useState(initial?.fileName || "");
  const [audit, setAudit] = useState<ResumeAudit | undefined>(initial);
  const [pasted, setPasted] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function copyPrompt() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    const full = RESUME_AUDIT_PROMPT + resumeText.trim();
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function parseResponse() {
    setParseError(null);
    if (!pasted.trim()) {
      setParseError("Paste the JSON Claude returned.");
      return;
    }
    let cleaned = pasted.trim();
    // Strip markdown fences if present
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }
    try {
      const parsed = JSON.parse(cleaned);
      const auditResult: ResumeAudit = {
        ...parsed,
        resumeText: resumeText.slice(0, 50000),
        fileName: fileName || undefined,
        auditedAt: new Date().toISOString(),
      };
      setAudit(auditResult);
      setParseError(null);
    } catch {
      setParseError("Couldn't parse JSON · make sure you pasted the JSON block exactly as Claude provided it.");
    }
  }

  function handleSave() {
    if (audit) onSave(audit);
  }

  function readinessColor(r: ResumeAudit["overallReadiness"]) {
    if (r === "ship-it") return "text-good bg-good/15";
    if (r === "tighten-first") return "text-warn bg-warn/15";
    return "text-hot bg-hot/15";
  }

  function scoreColor(s: number) {
    if (s >= 80) return "text-good";
    if (s >= 60) return "text-warn";
    return "text-hot";
  }

  return (
    <div>
      <div className="text-accent mb-3"><StarChart size={28} strokeWidth={1.5} /></div>
      <h2 className="text-[22px] font-bold text-text mb-2 tracking-tight">Resume Audit</h2>
      <p className="text-[13px] text-text-dim mb-5 max-w-2xl leading-relaxed">
        Paste your resume below · we generate a full audit prompt · you paste it into Claude.ai chat · Claude returns structured JSON · you paste it back here. Result feeds Probe Config so we score future roles against your actual profile.
      </p>

      {!audit && (
        <>
          {/* STEP 1 · resume text + filename */}
          <div className="bg-surface-2 border border-border rounded-lg p-4 mb-4">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[1.4px] bg-accent text-white px-2 py-0.5 rounded">Step 1</span>
              <strong className="text-[13px] text-navy">Paste your resume text</strong>
            </div>

            <label className="block label-caps mb-1.5">Filename (optional)</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. My CV 2026.pdf"
              className="w-full text-[13px] p-2.5 border border-border rounded-md bg-surface mb-3"
            />

            <label className="block label-caps mb-1.5">Resume text</label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text · headings, roles, bullets, everything"
              className="w-full text-[12px] p-3 border border-border rounded-md bg-surface min-h-[200px] font-mono"
            />
            <p className="text-[11px] text-muted mt-1">
              {resumeText.length} characters · minimum 100 needed
            </p>
          </div>

          {/* STEP 2 · copy prompt */}
          <div className="bg-surface-2 border border-border rounded-lg p-4 mb-4">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[1.4px] bg-accent text-white px-2 py-0.5 rounded">Step 2</span>
              <strong className="text-[13px] text-navy">Copy prompt → paste in Claude.ai</strong>
            </div>
            <p className="text-[12px] text-text-dim mb-3 leading-relaxed">
              Click below to copy a complete audit prompt (instructions + your resume text). Paste it into a new Claude.ai chat. Claude returns JSON. Paste that JSON in Step 3.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyPrompt}
                disabled={resumeText.trim().length < 100}
                className={`px-5 py-2.5 rounded-md font-bold text-[13px] transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  copied ? "bg-good text-white" : "bg-accent text-white hover:bg-accent-2"
                }`}
              >
                {copied ? "✓ Copied · paste into Claude.ai" : "Copy audit prompt →"}
              </button>
              <a
                href="https://claude.ai/new"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 border border-border text-navy rounded-md font-semibold text-[13px] hover:bg-surface-2 transition"
              >
                Open Claude.ai →
              </a>
            </div>
          </div>

          {/* STEP 3 · paste response */}
          <div className="bg-surface-2 border border-border rounded-lg p-4 mb-4">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[1.4px] bg-accent text-white px-2 py-0.5 rounded">Step 3</span>
              <strong className="text-[13px] text-navy">Paste Claude&apos;s JSON response</strong>
            </div>
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder='{"strengths":["..."],"gaps":["..."],"roleShapeFit":{...},...}'
              rows={8}
              className="w-full text-[12px] p-3 border border-border rounded-md bg-surface font-mono"
            />
            {parseError && (
              <div className="mt-3 p-3 bg-hot/10 border border-hot/30 rounded-md text-[12px] text-hot">
                {parseError}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={parseResponse}
                disabled={!pasted.trim()}
                className="px-5 py-2.5 bg-accent text-white rounded-md font-bold text-[13px] hover:bg-accent-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Parse + display audit →
              </button>
              <button
                onClick={() => setPasted("")}
                className="px-3 py-2.5 text-[12px] text-muted hover:text-navy"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={onSkip} className="px-5 py-2.5 text-text-dim hover:text-navy text-[13px] underline">
              Skip for now · come back later
            </button>
          </div>
        </>
      )}

      {audit && (
        <div>
          {/* Readiness banner */}
          <div className={`rounded-lg p-4 mb-5 ${readinessColor(audit.overallReadiness)}`}>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <strong className="text-[16px] uppercase tracking-[1px]">
                {audit.overallReadiness === "ship-it" && "✓ Ship it"}
                {audit.overallReadiness === "tighten-first" && "⚡ Tighten first"}
                {audit.overallReadiness === "rewrite-needed" && "✗ Rewrite needed"}
              </strong>
              <button
                onClick={() => { setAudit(undefined); setPasted(""); }}
                className="text-[11px] underline opacity-70 hover:opacity-100"
              >
                Re-run audit
              </button>
            </div>
            <p className="text-[13px] leading-relaxed">{audit.summary}</p>
          </div>

          {/* Scores grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="stat">
              <div className={`text-data-lg ${scoreColor(audit.atsScore)}`}>{audit.atsScore}</div>
              <div className="label-caps mt-1">ATS score</div>
            </div>
            <div className="stat">
              <div className={`text-data-lg ${scoreColor(audit.narrativeCoherence)}`}>{audit.narrativeCoherence}</div>
              <div className="label-caps mt-1">Narrative</div>
            </div>
            <div className="stat">
              <div className="text-data-lg text-cool">{audit.strengths.length}</div>
              <div className="label-caps mt-1">Strengths</div>
            </div>
            <div className="stat">
              <div className="text-data-lg text-warn">{audit.gaps.length}</div>
              <div className="label-caps mt-1">Gaps</div>
            </div>
          </div>

          {/* Role-shape fit */}
          <div className="card mb-4">
            <h3 className="text-[15px] font-semibold text-navy mb-3">Role-shape fit per seat type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(audit.roleShapeFit).map(([seat, score]) => (
                <div key={seat} className="flex items-center justify-between bg-surface-2 rounded-md p-2.5">
                  <span className="text-[12px] font-semibold text-navy">{seat}</span>
                  <span className={`text-[14px] font-bold ${scoreColor(score)}`}>{score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div className="card mb-4">
            <h3 className="text-[15px] font-semibold text-good mb-2">✓ Strengths</h3>
            <ul className="space-y-1.5">
              {audit.strengths.map((s, i) => (
                <li key={i} className="text-[13px] text-text-dim leading-relaxed pl-3 border-l-2 border-good/40">{s}</li>
              ))}
            </ul>
          </div>

          {/* Gaps */}
          <div className="card mb-4">
            <h3 className="text-[15px] font-semibold text-warn mb-2">⚡ Gaps to address</h3>
            <ul className="space-y-1.5">
              {audit.gaps.map((g, i) => (
                <li key={i} className="text-[13px] text-text-dim leading-relaxed pl-3 border-l-2 border-warn/40">{g}</li>
              ))}
            </ul>
          </div>

          {/* Keywords */}
          <div className="card mb-4">
            <h3 className="text-[15px] font-semibold text-navy mb-2">Keywords</h3>
            <div className="mb-3">
              <div className="label-caps mb-1.5">Detected · top 10</div>
              <div className="flex flex-wrap gap-1.5">
                {audit.keywordDensity.map((k) => (
                  <span key={k.keyword} className="chip bg-surface-2 border-border text-text-dim">
                    {k.keyword} <span className="opacity-60 ml-1">{k.count}</span>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="label-caps mb-1.5 text-warn">Missing · consider adding</div>
              <div className="flex flex-wrap gap-1.5">
                {audit.missingKeywords.map((k) => (
                  <span key={k} className="chip bg-warn/10 border-warn/30 text-warn">
                    + {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended seats */}
          <div className="card mb-5">
            <h3 className="text-[15px] font-semibold text-accent mb-2">🎯 Recommended seats to target</h3>
            <ul className="space-y-1">
              {audit.recommendedSeatLevels.map((r, i) => (
                <li key={i} className="text-[13px] text-text-dim">→ {r}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-accent text-white rounded-md font-bold text-[13px] hover:bg-accent-2 transition"
            >
              Save and continue →
            </button>
            <button onClick={onSkip} className="px-5 py-2.5 text-text-dim hover:text-navy text-[13px] underline">
              Skip (don&apos;t save)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
