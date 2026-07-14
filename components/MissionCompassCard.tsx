"use client";

// V3.0 · Mission Compass · the assessment hero card on Mission Profile
// V3.5 · Refactored to chat-paste pattern (no API needed in production)
// Renders the 5-lens read + Fit Read + Why It Fits + Red Flags + Self-Concordance Flag + Crafting Opportunities
// Voice: calm, honest, on-your-side. Plain language leads, fit score never headlines.

import { useState } from "react";
import Link from "next/link";
import type { AppState, Opportunity, MissionCompassStoredAssessment } from "@/lib/types";
import type { ValuesProfile } from "@/lib/mission-compass";
import { isCalibrated, MISSION_COMPASS_SYSTEM_PROMPT, buildAssessmentUserPrompt } from "@/lib/mission-compass";

interface Props {
  opp: Opportunity;
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
}

export function MissionCompassCard({ opp, state, update }: Props) {
  const profile = state.valuesProfile as unknown as ValuesProfile | undefined;
  const existing = state.missionCompassAssessments?.[opp.id];
  const [error, setError] = useState<string | null>(null);
  const [showPasteUI, setShowPasteUI] = useState(false);
  const [pasted, setPasted] = useState("");
  const [copied, setCopied] = useState(false);

  const calibrated = isCalibrated(profile);

  function copyAssessmentPrompt() {
    if (!profile || typeof navigator === "undefined" || !navigator.clipboard) return;
    const userPrompt = buildAssessmentUserPrompt(profile, {
      company: opp.company,
      position: opp.position,
      description: opp.note,
    });
    const fullPrompt = `${MISSION_COMPASS_SYSTEM_PROMPT}\n\n---\n\n${userPrompt}`;
    navigator.clipboard.writeText(fullPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function parseAssessment() {
    setError(null);
    if (!pasted.trim()) {
      setError("Paste the JSON Claude returned.");
      return;
    }
    let cleaned = pasted.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }
    try {
      const data = JSON.parse(cleaned);
      const assessment: MissionCompassStoredAssessment = {
        oppId: opp.id,
        reads: data.reads,
        fitRead: data.fitRead,
        whyItFits: data.whyItFits || [],
        redFlags: data.redFlags || [],
        selfConcordanceFlag: data.selfConcordanceFlag || undefined,
        fitScore: data.fitScore,
        assessedAt: data.assessedAt || new Date().toISOString(),
      };
      update((s) => ({
        ...s,
        missionCompassAssessments: {
          ...(s.missionCompassAssessments || {}),
          [opp.id]: assessment,
        },
      }));
      setShowPasteUI(false);
      setPasted("");
    } catch {
      setError("Couldn't parse JSON · make sure you pasted the JSON block exactly as Claude provided it.");
    }
  }

  // ────── Empty state · no calibration yet ──────
  if (!calibrated) {
    return (
      <div className="mb-6 bg-gradient-to-br from-purple-50 to-white border-2 border-dashed border-purple-300 rounded-xl p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <span className="text-3xl">🧭</span>
          <div className="flex-1 min-w-[260px]">
            <h2 className="text-[18px] font-bold text-navy mb-1">Mission Compass · not yet calibrated</h2>
            <p className="text-[13px] text-text-dim leading-relaxed mb-3">
              Calibrate your Values Profile to get a research-informed read on this opportunity · 5 lenses, plain language, honest red flags.
            </p>
            <Link
              href="/mission-compass"
              className="inline-flex items-center px-4 py-2 bg-purple text-white rounded-md text-[12px] font-semibold hover:opacity-90"
              style={{ backgroundColor: "#6B5BD6" }}
            >
              Calibrate now (10-15 min) →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ────── No assessment yet · chat-paste CTA ──────
  if (!existing) {
    return (
      <div className="mb-6 bg-gradient-to-br from-navy/95 via-navy to-accent/30 text-white rounded-xl p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <span className="text-3xl">🧭</span>
          <div className="flex-1 min-w-[260px]">
            <div className="text-[10px] uppercase tracking-[2px] opacity-70 font-semibold mb-1">
              Mission Compass · ready to assess
            </div>
            <h2 className="text-[20px] font-bold leading-tight mb-2">
              Run a values-fit assessment on {opp.company}
            </h2>
            <p className="text-[13px] opacity-85 leading-relaxed mb-3">
              5 lenses, grounded in Schwartz · SDT · Self-Concordance · Holland · ACT · plus modern OB (Job Crafting, Calling Orientation, P-E Fit, Meaningful Work, Psychological Safety). Plain-language honest read · no scores-as-theatre.
            </p>
            {error && (
              <div className="bg-white/10 border border-white/20 rounded p-2 text-[12px] mb-3">
                ⚠ {error}
              </div>
            )}
            {!showPasteUI ? (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    copyAssessmentPrompt();
                    setShowPasteUI(true);
                  }}
                  className={`px-5 py-2 rounded-md text-[13px] font-bold transition ${
                    copied ? "bg-good text-white" : "bg-white text-navy hover:bg-white/90"
                  }`}
                >
                  {copied ? "✓ Copied · paste in Claude.ai" : "Copy prompt → run in Claude.ai"}
                </button>
                <a
                  href="https://claude.ai/new"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-md text-[13px] font-semibold transition"
                >
                  Open Claude.ai →
                </a>
              </div>
            ) : (
              <div>
                <p className="text-[12px] opacity-90 mb-2">
                  Paste Claude&apos;s JSON response below to save the assessment:
                </p>
                <textarea
                  value={pasted}
                  onChange={(e) => setPasted(e.target.value)}
                  placeholder='{"reads":{...},"fitRead":"...","whyItFits":[...],...}'
                  rows={6}
                  className="w-full text-[11px] p-2 rounded-md bg-white/10 border border-white/30 text-white placeholder-white/50 font-mono mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={parseAssessment}
                    className="px-5 py-2 bg-white text-navy rounded-md text-[13px] font-bold hover:bg-white/90 transition"
                  >
                    Parse + save →
                  </button>
                  <button
                    onClick={copyAssessmentPrompt}
                    className="px-3 py-2 text-[11px] bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-md transition"
                  >
                    {copied ? "✓ Copied again" : "Re-copy prompt"}
                  </button>
                  <button
                    onClick={() => { setShowPasteUI(false); setPasted(""); setError(null); }}
                    className="px-3 py-2 text-[11px] text-white/70 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ────── Assessment exists · render it ──────
  return (
    <div className="mb-6 bg-white border border-purple-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header strip */}
      <div className="bg-gradient-to-r from-navy to-purple-700 text-white px-6 py-3 flex items-center justify-between flex-wrap gap-2" style={{ background: "linear-gradient(90deg, #1A2540, #6B5BD6)" }}>
        <div className="flex items-center gap-2">
          <span className="text-[18px]">🧭</span>
          <span className="text-[10px] uppercase tracking-[1.6px] font-bold opacity-90">
            Mission Compass · assessment
          </span>
        </div>
        <div className="flex items-center gap-3">
          {existing.fitScore !== undefined && (
            <span className="text-[10px] uppercase tracking-[1.4px] opacity-75 font-semibold">
              Fit · {existing.fitScore}/100
            </span>
          )}
          <button
            onClick={() => {
              // Re-run · clear existing assessment so the empty-state chat-paste UI shows again
              if (confirm("Re-run will clear the current assessment and let you paste a fresh one. Continue?")) {
                update((s) => {
                  const next = { ...(s.missionCompassAssessments || {}) };
                  delete next[opp.id];
                  return { ...s, missionCompassAssessments: next };
                });
              }
            }}
            className="text-[10px] uppercase tracking-[1.4px] font-bold bg-white/15 hover:bg-white/25 px-2 py-1 rounded"
          >
            Re-run
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* The Fit Read · plain language leads */}
        <div>
          <div className="text-[10px] uppercase tracking-[1.6px] text-purple-600 font-bold mb-2" style={{ color: "#6B5BD6" }}>
            Fit read
          </div>
          <p className="text-[15px] leading-relaxed text-navy font-medium">
            {existing.fitRead}
          </p>
        </div>

        {/* Self-Concordance Flag · the killer feature · only if present */}
        {existing.selfConcordanceFlag && (
          <div className="bg-orange-50 border-l-4 border-orange-400 rounded-r-lg p-4" style={{ background: "#FFF7E8", borderLeftColor: "#E5662A" }}>
            <div className="text-[10px] uppercase tracking-[1.4px] text-accent font-bold mb-1">
              ⚠ Self-concordance flag
            </div>
            <p className="text-[13px] text-text-dim leading-relaxed">
              {existing.selfConcordanceFlag}
            </p>
          </div>
        )}

        {/* Why it fits + Red flags · two-column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {existing.whyItFits.length > 0 && (
            <div className="bg-bg border border-border rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-[1.4px] text-good font-bold mb-2" style={{ color: "#2E7D32" }}>
                Why it fits
              </div>
              <ul className="space-y-2">
                {existing.whyItFits.map((reason, i) => (
                  <li key={i} className="text-[12.5px] text-text-dim leading-relaxed flex gap-2">
                    <span className="text-good flex-shrink-0" style={{ color: "#2E7D32" }}>✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {existing.redFlags.length > 0 && (
            <div className="bg-bg border border-border rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-[1.4px] text-crimson font-bold mb-2" style={{ color: "#C41E3A" }}>
                Red flags
              </div>
              <ul className="space-y-2">
                {existing.redFlags.map((flag, i) => (
                  <li key={i} className="text-[12.5px] text-text-dim leading-relaxed flex gap-2">
                    <span className="text-crimson flex-shrink-0" style={{ color: "#C41E3A" }}>⚠</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* The 5 lenses · collapsible · always available */}
        <details className="border border-border rounded-lg group">
          <summary className="cursor-pointer p-3 text-[12px] font-semibold text-navy hover:bg-bg flex items-center justify-between">
            <span>The 5-lens reasoning</span>
            <span className="text-muted text-[11px] group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-3 border-t border-border">
            <LensRead
              label="Values alignment"
              framework="Schwartz + Meaningful Work"
              body={existing.reads.valuesAlignment}
            />
            <LensRead
              label="Needs fit"
              framework="SDT + JD-R + AWS + Psychological Safety"
              body={existing.reads.needsFit}
            />
            <LensRead
              label="Self-concordance"
              framework="Sheldon + Wrzesniewski Calling Orientation"
              body={existing.reads.selfConcordance}
            />
            <LensRead
              label="Vocational + P-E fit"
              framework="Holland + Kristof-Brown + Job Crafting"
              body={existing.reads.vocationalFit}
            />
            <LensRead
              label="Direction-vow check"
              framework="ACT cross-domain integrity"
              body={existing.reads.directionVowCheck}
            />
          </div>
        </details>

        {/* CTA · log this decision in the journal */}
        <div className="bg-bg border border-border rounded-lg p-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[12px] text-text-dim">
            Made a decision on this? Log it in the journal · review at 30 or 90 days · your prediction accuracy compounds.
          </div>
          <Link
            href="/decision-journal"
            className="px-3 py-1.5 bg-accent text-white rounded text-[11px] font-bold whitespace-nowrap hover:bg-accent-2"
          >
            Log decision →
          </Link>
        </div>

        {/* Footer meta */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-[10px] uppercase tracking-[1.4px] text-muted font-semibold">
          <span>Assessed {new Date(existing.assessedAt).toLocaleDateString()}</span>
          <Link href="/mission-compass" className="hover:text-navy">
            Re-calibrate profile →
          </Link>
        </div>
      </div>
    </div>
  );
}

function LensRead({ label, framework, body }: { label: string; framework: string; body: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1 flex-wrap">
        <span className="text-[12px] font-bold text-navy">{label}</span>
        <span className="text-[10px] uppercase tracking-[1.2px] text-purple-600 font-bold" style={{ color: "#6B5BD6" }}>
          {framework}
        </span>
      </div>
      <p className="text-[12.5px] text-text-dim leading-relaxed">{body}</p>
    </div>
  );
}
