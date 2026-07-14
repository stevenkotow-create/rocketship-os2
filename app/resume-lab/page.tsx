"use client";

// Resume Lab v2 · multi-tab resume + LinkedIn + outreach lab
// Multi-pass probing · 4-lens output · strategic insights · audit history · asset generation
// All chat-paste · no API key needed in production

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/storage";
import { StarChart, Sparkle } from "@/components/icons";
import type { ResumeAudit } from "@/lib/types";

type Tab = "readiness" | "rewrite" | "linkedin" | "outreach";

const TABS: { id: Tab; label: string; meta: string }[] = [
  { id: "readiness", label: "Readiness", meta: "Audit + scores" },
  { id: "rewrite", label: "Resume Rewrite", meta: "Bullet-level fixes" },
  { id: "linkedin", label: "LinkedIn Pack", meta: "About + headline" },
  { id: "outreach", label: "Outreach", meta: "DM openers + hooks" },
];

const AUDIT_PROMPT_V2 = `You are an expert sales/GTM resume reviewer with 15+ years of experience hiring across BDR, SDR, AE, AM, CSM, and Manager seats at high-growth tech companies.

Assess the resume against modern hiring rubrics: STAR-format impact statements, quantified achievements, ATS parseability, narrative coherence, role-shape fit per seat type.

Return ONLY valid JSON matching this exact schema (no markdown fences, no preamble):

{
  "strengths": ["3-5 specific evidence-based strengths citing resume content"],
  "gaps": ["3-5 specific actionable gaps"],
  "roleShapeFit": { "BDR": 0-100, "SDR": 0-100, "AE": 0-100, "AM": 0-100, "CSM": 0-100, "Manager": 0-100 },
  "keywordDensity": [{ "keyword": "string", "count": number }],
  "missingKeywords": ["5 keywords the resume SHOULD include"],
  "atsScore": 0-100,
  "narrativeCoherence": 0-100,
  "recommendedSeatLevels": ["3-5 specific seat levels to target"],
  "overallReadiness": "ship-it" | "tighten-first" | "rewrite-needed",
  "summary": "2-3 sentence overall read",
  "probingQuestions": ["5-8 specific follow-up questions to extract metrics the user likely has but didn't include · ask for win rate, deal size, sales cycle, close rate, quota attainment, retention rate, expansion rate, etc · be specific to the roles in the resume"],
  "strategicInsights": ["2-3 paragraph-length narrative reads on POSITIONING · NOT bullets · these should be substantial paragraphs that explain how to reframe, what the bridge story is, where the unique differentiation lies"],
  "actionPlan": [{ "priority": 1-5, "action": "specific action", "timeframe": "this-week" | "this-month" | "ongoing" }],
  "linkedinAbout": "200-word LinkedIn About section rewrite in the user's voice",
  "outreachHooks": ["5 short DM opener variations using the user's positioning"],
  "resumeRewrites": [{ "section": "section name", "before": "current text optional", "after": "rewritten version", "why": "what this fixes" }]
}

Be specific. Reference actual resume content. Output JSON only · no markdown, no preamble.`;

const PROBING_SYNTHESIS_PROMPT = `You are the same expert sales/GTM resume reviewer from the first audit pass.

The user has now answered your follow-up probing questions with real numbers and details. Synthesise a SHARPER audit using both their original resume AND their probing answers. Same JSON schema as the first pass · the difference should be: strengths are more specific (cite the new numbers), gaps are reduced (probing answers filled some), strategic insights are sharper, resume rewrites incorporate the new metrics, outreach hooks lead with the new specificity.

Return ONLY valid JSON matching the same schema as the first pass. No markdown, no preamble.`;

export default function ResumeLabPage() {
  const [state, update] = useAppState();
  const [tab, setTab] = useState<Tab>("readiness");
  const [resumeText, setResumeText] = useState(state.resumeAudit?.resumeText || "");
  const [fileName, setFileName] = useState(state.resumeAudit?.fileName || "");
  const [pasted, setPasted] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"audit" | "synthesis" | null>(null);
  const [probingAnswers, setProbingAnswers] = useState<Record<string, string>>(
    state.resumeAudit?.probingAnswers || {},
  );
  const [phase, setPhase] = useState<"first-pass" | "probing" | "second-pass" | "complete">(
    state.resumeAudit?.strategicInsights ? "complete" : state.resumeAudit?.probingQuestions ? "probing" : "first-pass",
  );

  const audit = state.resumeAudit;
  const history = state.resumeAuditHistory || [];

  const auditCount = history.length + (audit ? 1 : 0);

  function copyAuditPrompt() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    const full = AUDIT_PROMPT_V2 + "\n\nRESUME:\n" + resumeText.trim();
    navigator.clipboard.writeText(full).then(() => {
      setCopied("audit");
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function copySynthesisPrompt() {
    if (!audit || typeof navigator === "undefined" || !navigator.clipboard) return;
    const answersBlock = Object.entries(probingAnswers)
      .filter(([, a]) => a.trim())
      .map(([q, a]) => `Q: ${q}\nA: ${a.trim()}`)
      .join("\n\n");
    const full = `${PROBING_SYNTHESIS_PROMPT}\n\nORIGINAL RESUME:\n${audit.resumeText || resumeText}\n\nPROBING Q&A:\n${answersBlock}\n\nReturn the SHARPER JSON audit now.`;
    navigator.clipboard.writeText(full).then(() => {
      setCopied("synthesis");
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function parseFirstPass() {
    setParseError(null);
    let cleaned = pasted.trim();
    if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      const newAudit: ResumeAudit = {
        ...parsed,
        resumeText: resumeText.slice(0, 50000),
        fileName: fileName || undefined,
        auditedAt: new Date().toISOString(),
        version: auditCount + 1,
      };
      update((s) => ({
        ...s,
        resumeAudit: newAudit,
        resumeAuditHistory: audit ? [audit, ...(s.resumeAuditHistory || [])] : s.resumeAuditHistory,
      }));
      setPasted("");
      setPhase("probing");
    } catch {
      setParseError("Couldn't parse JSON · paste Claude's response exactly as returned.");
    }
  }

  function parseSecondPass() {
    setParseError(null);
    let cleaned = pasted.trim();
    if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      const sharper: ResumeAudit = {
        ...parsed,
        resumeText: audit?.resumeText || resumeText.slice(0, 50000),
        fileName: audit?.fileName || fileName || undefined,
        probingAnswers,
        auditedAt: new Date().toISOString(),
        version: auditCount + 1,
      };
      update((s) => ({
        ...s,
        resumeAudit: sharper,
        resumeAuditHistory: audit ? [audit, ...(s.resumeAuditHistory || [])] : s.resumeAuditHistory,
      }));
      setPasted("");
      setPhase("complete");
    } catch {
      setParseError("Couldn't parse JSON · paste Claude's response exactly as returned.");
    }
  }

  function scoreColor(s: number) {
    if (s >= 80) return "text-good";
    if (s >= 60) return "text-warn";
    return "text-hot";
  }

  const completionPct = useMemo(() => {
    if (!audit) return 0;
    const answered = Object.values(probingAnswers).filter((v) => v.trim()).length;
    const asked = audit.probingQuestions?.length || 0;
    return asked ? Math.round((answered / asked) * 100) : 0;
  }, [probingAnswers, audit]);

  return (
    <div>
      {/* V4 · Header */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-accent"><StarChart size={20} strokeWidth={1.5} /></span>
            <h1 className="display text-glow text-[34px] leading-[1.1] text-text m-0">Resume Lab</h1>
            <span className="font-mono text-[9px] uppercase tracking-[2px] font-bold text-purple bg-purple/15 px-2 py-0.5 rounded">V4.2</span>
          </div>
          <p className="text-[14px] text-text-dim m-0 max-w-3xl">
            Multi-pass audit · probing questions surface metrics you forgot · four lenses (readiness · rewrite · LinkedIn · outreach) from one input · version history tracks your progress over time.
          </p>
        </div>
        <span className="font-mono text-[10px] text-muted lowercase">RL.01</span>
      </div>

      <div className="retro-band mb-6"><span /><span /></div>

      {/* Tab strip */}
      <div className="flex gap-1 bg-surface-2 border border-border rounded-md p-0.5 mb-6 inline-flex">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`font-mono text-[11px] uppercase tracking-[1.5px] px-3 py-2 rounded transition ${
              tab === t.id ? "bg-accent text-white" : "text-muted hover:text-text"
            }`}
            disabled={!audit && t.id !== "readiness"}
            title={!audit && t.id !== "readiness" ? "Run first audit to unlock" : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─────────────── READINESS TAB ─────────────── */}
      {tab === "readiness" && (
        <div className="space-y-4">
          {/* Phase 1 · first-pass setup */}
          {phase === "first-pass" && (
            <div className="bg-surface border border-border rounded-lg p-5 relative">
              <span className="absolute top-3 right-3 font-mono text-[9px] text-muted/60 lowercase">rl.02</span>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[1.8px] bg-accent text-white px-2 py-0.5 rounded">Step 1</span>
                <strong className="text-[14px] text-text">First-pass audit</strong>
              </div>
              <p className="text-[12px] text-text-dim mb-4 leading-relaxed">
                Paste your resume below. Generate the v2 audit prompt · copy · paste into Claude.ai · paste JSON response back here. The audit identifies strengths, gaps, role-shape fit, AND probing questions to sharpen the second pass.
              </p>
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
                className="w-full text-[12px] p-3 border border-border rounded-md bg-surface min-h-[180px] font-mono"
              />
              <p className="font-mono text-[10px] text-muted mt-1 mb-4">
                {resumeText.length} characters · minimum 100 needed
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={copyAuditPrompt}
                  disabled={resumeText.trim().length < 100}
                  className={`px-5 py-2.5 rounded-md font-bold text-[13px] transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    copied === "audit" ? "bg-good text-white" : "bg-accent text-white hover:bg-accent-2"
                  }`}
                >
                  {copied === "audit" ? "✓ Copied · paste into Claude.ai" : "Copy v2 audit prompt →"}
                </button>
                <a
                  href="https://claude.ai/new"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 border border-border text-text rounded-md font-semibold text-[13px] hover:bg-surface-2 transition"
                >
                  Open Claude.ai →
                </a>
              </div>

              <label className="block label-caps mb-1.5">Paste Claude&apos;s JSON response</label>
              <textarea
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                placeholder='{"strengths":["..."],"probingQuestions":["..."],...}'
                rows={6}
                className="w-full text-[12px] p-3 border border-border rounded-md bg-surface font-mono"
              />
              {parseError && (
                <div className="mt-3 p-3 bg-hot/10 border border-hot/30 rounded-md text-[12px] text-hot">{parseError}</div>
              )}
              <button
                onClick={parseFirstPass}
                disabled={!pasted.trim()}
                className="mt-3 px-5 py-2.5 bg-accent text-white rounded-md font-bold text-[13px] hover:bg-accent-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Parse + unlock probing →
              </button>
            </div>
          )}

          {/* Phase 2 · probing questions */}
          {phase === "probing" && audit?.probingQuestions && (
            <div className="bg-surface border border-border rounded-lg p-5 relative">
              <span className="absolute top-3 right-3 font-mono text-[9px] text-muted/60 lowercase">rl.03</span>
              <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[1.8px] bg-accent text-white px-2 py-0.5 rounded">Step 2</span>
                <strong className="text-[14px] text-text">Probing questions · sharpen the audit</strong>
                <span className="font-mono text-[10px] text-muted ml-auto">{completionPct}% answered</span>
              </div>
              <p className="text-[12px] text-text-dim mb-4 leading-relaxed">
                Claude flagged {audit.probingQuestions.length} metrics you likely have but didn&apos;t include. Answer as many as you can · short specific numbers beat long explanations. The second pass uses these to sharpen positioning.
              </p>
              <div className="space-y-3 mb-5">
                {audit.probingQuestions.map((q, i) => (
                  <div key={i} className="border border-border rounded-md p-3 bg-surface-2">
                    <div className="text-[12px] text-text mb-2 leading-relaxed">{q}</div>
                    <input
                      type="text"
                      value={probingAnswers[q] || ""}
                      onChange={(e) => setProbingAnswers({ ...probingAnswers, [q]: e.target.value })}
                      placeholder="Your answer · short + specific · e.g. '32% close rate · $48K average deal · 67 day cycle'"
                      className="w-full text-[12px] p-2 border border-border rounded-md bg-surface"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={copySynthesisPrompt}
                  disabled={Object.values(probingAnswers).filter((v) => v.trim()).length < 2}
                  className={`px-5 py-2.5 rounded-md font-bold text-[13px] transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    copied === "synthesis" ? "bg-good text-white" : "bg-accent text-white hover:bg-accent-2"
                  }`}
                >
                  {copied === "synthesis" ? "✓ Copied · paste into Claude.ai" : "Copy sharper-audit prompt →"}
                </button>
                <a
                  href="https://claude.ai/new"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 border border-border text-text rounded-md font-semibold text-[13px] hover:bg-surface-2 transition"
                >
                  Open Claude.ai →
                </a>
                <button
                  onClick={() => setPhase("complete")}
                  className="px-3 py-2.5 text-[12px] text-muted hover:text-text underline"
                >
                  Skip · use first-pass audit
                </button>
              </div>

              <label className="block label-caps mb-1.5">Paste sharper JSON response</label>
              <textarea
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                placeholder='{"strengths":["..."],"strategicInsights":["..."],...}'
                rows={6}
                className="w-full text-[12px] p-3 border border-border rounded-md bg-surface font-mono"
              />
              {parseError && (
                <div className="mt-3 p-3 bg-hot/10 border border-hot/30 rounded-md text-[12px] text-hot">{parseError}</div>
              )}
              <button
                onClick={parseSecondPass}
                disabled={!pasted.trim()}
                className="mt-3 px-5 py-2.5 bg-accent text-white rounded-md font-bold text-[13px] hover:bg-accent-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Parse sharper audit →
              </button>
            </div>
          )}

          {/* Phase 3 · audit display */}
          {phase === "complete" && audit && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-surface border border-border rounded-md p-4 relative">
                  <div className="font-mono text-[10px] text-muted uppercase tracking-[1.8px] font-semibold mb-2">ATS Score</div>
                  <div className={`font-mono text-[32px] font-bold leading-none ${scoreColor(audit.atsScore)}`}>{audit.atsScore}</div>
                  <span className="absolute top-2 right-2 font-mono text-[9px] text-muted/60">rl.04</span>
                </div>
                <div className="bg-surface border border-border rounded-md p-4 relative">
                  <div className="font-mono text-[10px] text-muted uppercase tracking-[1.8px] font-semibold mb-2">Narrative</div>
                  <div className={`font-mono text-[32px] font-bold leading-none ${scoreColor(audit.narrativeCoherence)}`}>{audit.narrativeCoherence}</div>
                  <span className="absolute top-2 right-2 font-mono text-[9px] text-muted/60">rl.05</span>
                </div>
                <div className="bg-surface border border-border rounded-md p-4 relative">
                  <div className="font-mono text-[10px] text-muted uppercase tracking-[1.8px] font-semibold mb-2">Version</div>
                  <div className="font-mono text-[32px] font-bold leading-none text-text">{audit.version || 1}</div>
                  <span className="absolute top-2 right-2 font-mono text-[9px] text-muted/60">rl.06</span>
                </div>
                <div className="bg-surface border border-border rounded-md p-4 relative">
                  <div className="font-mono text-[10px] text-muted uppercase tracking-[1.8px] font-semibold mb-2">Readiness</div>
                  <div className={`font-mono text-[14px] uppercase font-bold tracking-[1.2px] leading-none mt-2 ${
                    audit.overallReadiness === "ship-it" ? "text-good" : audit.overallReadiness === "tighten-first" ? "text-warn" : "text-hot"
                  }`}>{audit.overallReadiness}</div>
                  <span className="absolute top-2 right-2 font-mono text-[9px] text-muted/60">rl.07</span>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-lg p-5">
                <h3 className="text-[15px] font-semibold text-text mb-2">Summary</h3>
                <p className="text-[13px] text-text-dim leading-relaxed m-0">{audit.summary}</p>
              </div>

              {audit.strategicInsights && audit.strategicInsights.length > 0 && (
                <div className="bg-purple/5 border border-purple/30 rounded-lg p-5 relative">
                  <span className="absolute top-3 right-3 font-mono text-[9px] text-muted/60 lowercase">rl.08</span>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-purple"><Sparkle size={18} strokeWidth={1.5} /></span>
                    <h3 className="text-[15px] font-semibold text-text m-0">Strategic insights · positioning</h3>
                  </div>
                  <div className="space-y-3">
                    {audit.strategicInsights.map((insight, i) => (
                      <p key={i} className="text-[13px] text-text leading-relaxed m-0">{insight}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-surface border border-border rounded-lg p-5">
                  <h3 className="text-[15px] font-semibold text-good mb-3">✓ Strengths</h3>
                  <ul className="space-y-2">
                    {audit.strengths.map((s, i) => (
                      <li key={i} className="text-[12px] text-text-dim leading-relaxed pl-3 border-l-2 border-good/40">{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-surface border border-border rounded-lg p-5">
                  <h3 className="text-[15px] font-semibold text-warn mb-3">⚡ Gaps</h3>
                  <ul className="space-y-2">
                    {audit.gaps.map((g, i) => (
                      <li key={i} className="text-[12px] text-text-dim leading-relaxed pl-3 border-l-2 border-warn/40">{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {audit.actionPlan && audit.actionPlan.length > 0 && (
                <div className="bg-surface border border-border rounded-lg p-5">
                  <h3 className="text-[15px] font-semibold text-text mb-3">Step-by-step action plan</h3>
                  <ol className="space-y-3">
                    {audit.actionPlan.sort((a, b) => a.priority - b.priority).map((step, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="font-mono text-[14px] font-bold text-accent w-6 flex-shrink-0">{step.priority}</span>
                        <div className="flex-1">
                          <p className="text-[12px] text-text leading-relaxed m-0">{step.action}</p>
                          <span className={`font-mono text-[9px] uppercase tracking-[1.5px] font-bold mt-1 inline-block ${
                            step.timeframe === "this-week" ? "text-hot" : step.timeframe === "this-month" ? "text-warn" : "text-muted"
                          }`}>· {step.timeframe.replace("-", " ")}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="bg-surface border border-border rounded-lg p-5">
                <h3 className="text-[15px] font-semibold text-text mb-3">Role-shape fit per seat type</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(audit.roleShapeFit).map(([seat, score]) => (
                    <div key={seat} className="flex items-center justify-between bg-surface-2 rounded-md p-2.5">
                      <span className="text-[12px] font-semibold text-text">{seat}</span>
                      <span className={`font-mono text-[16px] font-bold ${scoreColor(score)}`}>{score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {history.length > 0 && (
                <div className="bg-surface-2 border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[1.8px] text-muted font-semibold">Audit history · {history.length + 1} versions</span>
                    <span className="font-mono text-[10px] text-muted">latest · v{audit.version || 1} · {new Date(audit.auditedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => { setPhase("first-pass"); setProbingAnswers({}); setResumeText(audit.resumeText || ""); }}
                className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted hover:text-text underline"
              >
                Re-run audit with newer resume
              </button>
            </>
          )}
        </div>
      )}

      {/* ─────────────── RESUME REWRITE TAB ─────────────── */}
      {tab === "rewrite" && audit && (
        <div className="bg-surface border border-border rounded-lg p-5 relative">
          <span className="absolute top-3 right-3 font-mono text-[9px] text-muted/60 lowercase">rl.09</span>
          <h3 className="text-[15px] font-semibold text-text mb-3">Resume rewrite suggestions</h3>
          {audit.resumeRewrites && audit.resumeRewrites.length > 0 ? (
            <div className="space-y-4">
              {audit.resumeRewrites.map((r, i) => (
                <div key={i} className="border-l-2 border-accent pl-4">
                  <div className="font-mono text-[10px] uppercase tracking-[1.8px] text-accent font-bold mb-2">{r.section}</div>
                  {r.before && (
                    <div className="bg-hot/5 border border-hot/20 rounded p-3 mb-2">
                      <div className="font-mono text-[9px] uppercase tracking-[1.5px] text-hot font-bold mb-1">Before</div>
                      <p className="text-[12px] text-text-dim line-through m-0">{r.before}</p>
                    </div>
                  )}
                  <div className="bg-good/5 border border-good/20 rounded p-3 mb-2">
                    <div className="font-mono text-[9px] uppercase tracking-[1.5px] text-good font-bold mb-1">After</div>
                    <p className="text-[12px] text-text m-0">{r.after}</p>
                  </div>
                  <p className="text-[11px] text-muted italic m-0">{r.why}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-muted m-0">No rewrites in this audit version. Run a v2 audit with the new prompt to unlock.</p>
          )}
        </div>
      )}

      {/* ─────────────── LINKEDIN PACK TAB ─────────────── */}
      {tab === "linkedin" && audit && (
        <div className="bg-surface border border-border rounded-lg p-5 relative">
          <span className="absolute top-3 right-3 font-mono text-[9px] text-muted/60 lowercase">rl.10</span>
          <h3 className="text-[15px] font-semibold text-text mb-3">LinkedIn About · auto-derived</h3>
          {audit.linkedinAbout ? (
            <>
              <div className="bg-surface-2 border border-border rounded-lg p-4 mb-3">
                <p className="text-[13px] text-text leading-relaxed whitespace-pre-wrap m-0">{audit.linkedinAbout}</p>
              </div>
              <button
                onClick={() => navigator.clipboard?.writeText(audit.linkedinAbout || "")}
                className="px-4 py-2 bg-accent text-white rounded-md font-bold text-[12px] hover:bg-accent-2 transition"
              >
                Copy to clipboard
              </button>
              <p className="text-[11px] text-muted italic mt-3 m-0">
                Drop into LinkedIn → About section. Tune the voice if needed but keep the structural reframes.
              </p>
            </>
          ) : (
            <p className="text-[12px] text-muted m-0">No LinkedIn rewrite in this audit version. Run a v2 audit to unlock.</p>
          )}
        </div>
      )}

      {/* ─────────────── OUTREACH TAB ─────────────── */}
      {tab === "outreach" && audit && (
        <div className="bg-surface border border-border rounded-lg p-5 relative">
          <span className="absolute top-3 right-3 font-mono text-[9px] text-muted/60 lowercase">rl.11</span>
          <h3 className="text-[15px] font-semibold text-text mb-3">Outreach DM openers · auto-derived</h3>
          {audit.outreachHooks && audit.outreachHooks.length > 0 ? (
            <div className="space-y-3">
              {audit.outreachHooks.map((hook, i) => (
                <div key={i} className="bg-surface-2 border border-border rounded-md p-3 flex items-start gap-3">
                  <span className="font-mono text-[12px] font-bold text-accent flex-shrink-0">#{i + 1}</span>
                  <p className="text-[13px] text-text leading-relaxed flex-1 m-0">{hook}</p>
                  <button
                    onClick={() => navigator.clipboard?.writeText(hook)}
                    className="font-mono text-[10px] uppercase tracking-[1.5px] text-muted hover:text-text"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-muted m-0">No outreach hooks in this audit version. Run a v2 audit to unlock.</p>
          )}
        </div>
      )}

      {!audit && tab !== "readiness" && (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <p className="text-[13px] text-muted m-0">Run the Readiness audit first to unlock this lens.</p>
          <button
            onClick={() => setTab("readiness")}
            className="mt-3 px-4 py-2 bg-accent text-white rounded-md font-bold text-[12px] hover:bg-accent-2 transition"
          >
            Open Readiness →
          </button>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-border text-[11px] text-muted flex items-center justify-between flex-wrap gap-2">
        <Link href="/onboarding" className="text-accent hover:underline font-mono uppercase tracking-[1.5px]">← Back to Discovery</Link>
        <Link href="/brand" className="text-accent hover:underline font-mono uppercase tracking-[1.5px]">LinkedIn Brand Progress →</Link>
      </div>
    </div>
  );
}
