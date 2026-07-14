"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/lib/storage";
import {
  EVALUATION_DIMENSIONS,
  SAMPLE_EVALUATIONS,
  evaluateCompany,
} from "@/lib/data/evaluation";
import type { CompanyEvaluation, EvaluationVerdict, Opportunity, Stage } from "@/lib/types";

interface EvaluationResult {
  companyName: string;
  summary: string;
  apacNote?: string;
  freshnessNote?: string;
  evaluation: CompanyEvaluation;
}

const VERDICT_LABEL: Record<EvaluationVerdict, string> = {
  rocket: "🚀 ROCKET · pipeline candidate",
  watchlist: "👁️ WATCHLIST · thread but do not apply",
  jettison: "🚫 JETTISON · do not pursue",
};

const VERDICT_COLOUR: Record<EvaluationVerdict, string> = {
  rocket: "bg-good/15 text-good border-good/30",
  watchlist: "bg-accent/15 text-accent border-accent/30",
  jettison: "bg-hot/15 text-hot border-hot/30",
};

export default function EvaluatorPage() {
  const [, update] = useAppState();
  const [url, setUrl] = useState("");
  const [manualContext, setManualContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Manual override state · only used when showManualOverride
  const [manualScores, setManualScores] = useState<Record<string, number>>({
    layerInStack: 3,
    categoryMaturity: 3,
    stageOfGrowth: 3,
    gtmMotion: 3,
    commercialHealth: 3,
    mustHave: 3,
  });
  const [manualApac, setManualApac] = useState(true);
  const [manualFresh, setManualFresh] = useState(true);

  // Chat-paste workflow · paste JSON from Claude.ai chat
  const [chatJson, setChatJson] = useState("");
  const [chatPasteError, setChatPasteError] = useState<string | null>(null);

  function parseChatPaste() {
    setChatPasteError(null);
    if (!chatJson.trim()) {
      setChatPasteError("Paste the JSON block from your Claude chat.");
      return;
    }
    let cleaned = chatJson.trim();
    // Strip markdown code fences if present
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }
    try {
      const parsed = JSON.parse(cleaned);
      // Build EvaluationResult shape · accept either full result envelope or just the scoring object
      const scoring = parsed.evaluation ? parsed : parsed;
      const ev: CompanyEvaluation = scoring.evaluation || evaluateCompany({
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
      setResult({
        companyName: scoring.companyName || "Pasted evaluation",
        summary: scoring.summary || "Pasted from Claude chat.",
        apacNote: scoring.apacNote,
        freshnessNote: scoring.freshnessNote,
        evaluation: ev,
      });
      setError(null);
    } catch (e) {
      setChatPasteError(
        "Could not parse JSON. Make sure you pasted the JSON block exactly as Claude provided it.",
      );
    }
  }

  const manualEvaluation: CompanyEvaluation = evaluateCompany({
    layerInStack: manualScores.layerInStack,
    categoryMaturity: manualScores.categoryMaturity,
    stageOfGrowth: manualScores.stageOfGrowth,
    gtmMotion: manualScores.gtmMotion,
    commercialHealth: manualScores.commercialHealth,
    mustHave: manualScores.mustHave,
    hasApacSeat: manualApac,
    rolePostedWithin90Days: manualFresh,
  });

  async function runAutoEval() {
    if (!url && !manualContext) {
      setError("Drop a company URL or paste some context to evaluate.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/evaluate-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url || undefined, manualContext: manualContext || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }
      const data: EvaluationResult = await res.json();
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function saveToPipeline() {
    const ev = result?.evaluation || manualEvaluation;
    const name = result?.companyName || "Unnamed company";
    const stage: Stage = ev.verdict === "rocket" ? "targeting" : "targeting";
    const id = `eval-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const newOpp: Opportunity = {
      id,
      company: name,
      position: "Evaluator candidate · seat TBD",
      type: "AM",
      location: ev.apacGate ? "APAC" : "TBD",
      stage,
      priority: ev.verdict === "rocket" ? "P2" : "Watch",
      pattern: "B",
      url: url || undefined,
      evaluation: ev,
      note: result?.summary || "Manually scored via Evaluator override",
      contacts: [],
    };

    update((s) => ({
      ...s,
      customOpps: [...s.customOpps, newOpp],
    }));
    setSavedId(id);
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4 text-xs text-muted">
          <Link href="/" className="hover:text-text">← Mission Control</Link>
          <span className="tracking-widest">SIX-DIMENSION COMPANY EVALUATOR · V2</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Company Evaluator</h1>
        <p className="text-muted text-sm max-w-3xl">
          Drop a company URL. The platform fetches the page, scores against 6 dimensions, and returns a verdict.
          Rocket goes to Pipeline. Watchlist goes to scrape registry. Jettison gets logged with rationale.
        </p>
      </header>

      {/* PRIMARY · Paste evaluation JSON from Claude chat (no API needed) */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4 shadow-sm">
        <label className="text-[10px] uppercase tracking-widest text-muted mb-2 block font-bold">
          ⚡ Paste evaluation JSON from Claude chat
        </label>
        <p className="text-xs text-text-dim mb-3">
          Drop a company URL into your Claude.ai chat with the standing eval prompt. Claude returns a JSON block. Paste it here.
        </p>
        <textarea
          value={chatJson}
          onChange={(e) => setChatJson(e.target.value)}
          placeholder='{"companyName":"Example Corp","layerInStack":5,...}'
          rows={6}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
        />
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <button
            onClick={parseChatPaste}
            className="px-5 py-2 bg-accent text-white rounded-lg font-semibold text-sm hover:bg-accent/90"
          >
            Parse + score
          </button>
          <button
            onClick={() => setChatJson("")}
            className="px-3 py-2 text-xs text-muted hover:text-text"
          >
            Clear
          </button>
        </div>
        {chatPasteError && (
          <div className="mt-3 p-3 bg-hot/10 border border-hot/30 rounded-lg text-xs text-hot">
            {chatPasteError}
          </div>
        )}
      </div>

      {/* SECONDARY · URL paste via API (only useful if ANTHROPIC_API_KEY is set) */}
      <details className="bg-card border border-border rounded-xl p-5 mb-6 shadow-sm">
        <summary className="cursor-pointer">
          <span className="text-[10px] uppercase tracking-widest text-muted font-bold">
            🔌 Auto-fetch via API · requires Anthropic key
          </span>
        </summary>
        <div className="mt-3">
          <p className="text-xs text-text-dim mb-3">
            Add ANTHROPIC_API_KEY to .env.local to use the auto-fetch route. Costs a few cents per evaluation.
            Most of the time the chat paste flow above is faster and free.
          </p>
          <div className="flex gap-2 flex-wrap">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.com/"
              className="flex-1 min-w-[200px] bg-bg border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
            <button
              onClick={runAutoEval}
              disabled={loading}
              className="px-5 py-2.5 bg-accent text-white rounded-lg font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Evaluating..." : "Run evaluation"}
            </button>
          </div>
          <details className="mt-3 text-xs text-muted">
            <summary className="cursor-pointer hover:text-text">Or paste context manually (fallback)</summary>
            <textarea
              value={manualContext}
              onChange={(e) => setManualContext(e.target.value)}
              placeholder="Paste anything: company description, funding history, customer logos, recent news."
              rows={4}
              className="w-full mt-2 bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </details>
          {error && (
            <div className="mt-3 p-3 bg-hot/10 border border-hot/30 rounded-lg text-xs text-hot">
              {error}
            </div>
          )}
        </div>
      </details>

      {/* RESULT · auto-eval response */}
      {result && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Left 2 columns: dimension breakdown */}
          <div className="md:col-span-2 space-y-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs uppercase tracking-widest text-muted mb-1">Company</div>
              <div className="text-xl font-bold text-navy mb-2">{result.companyName}</div>
              <p className="text-sm text-text-dim">{result.summary}</p>
            </div>
            {EVALUATION_DIMENSIONS.map((dim) => {
              const score = result.evaluation[dim.key] as number;
              const note =
                dim.key === "layerInStack" ? result.evaluation.layerNote :
                dim.key === "categoryMaturity" ? result.evaluation.categoryNote :
                dim.key === "stageOfGrowth" ? result.evaluation.stageNote :
                dim.key === "gtmMotion" ? result.evaluation.gtmNote :
                dim.key === "commercialHealth" ? result.evaluation.commercialNote :
                result.evaluation.mustHaveNote;
              return (
                <div key={dim.key} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-semibold text-sm">{dim.label}</h3>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div
                          key={s}
                          className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                            score === s ? "bg-accent text-white" : "bg-bg text-muted border border-border"
                          }`}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                  {note && <p className="text-xs text-text-dim mt-2 italic">{note}</p>}
                </div>
              );
            })}
            <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted">APAC seat</div>
                <div className={`text-sm font-bold mt-1 ${result.evaluation.apacGate ? "text-good" : "text-hot"}`}>
                  {result.evaluation.apacGate ? "PASS" : "FAIL"}
                </div>
                {result.apacNote && <p className="text-[11px] text-text-dim mt-1">{result.apacNote}</p>}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted">90-day freshness</div>
                <div
                  className={`text-sm font-bold mt-1 ${
                    result.evaluation.freshnessGate === true ? "text-good" :
                    result.evaluation.freshnessGate === false ? "text-hot" :
                    "text-muted"
                  }`}
                >
                  {result.evaluation.freshnessGate === true ? "PASS" :
                   result.evaluation.freshnessGate === false ? "FAIL" :
                   "NEEDS JD URL"}
                </div>
                {result.freshnessNote && <p className="text-[11px] text-text-dim mt-1">{result.freshnessNote}</p>}
              </div>
            </div>
          </div>

          {/* Right column · verdict + save */}
          <div className="md:col-span-1">
            <div className={`sticky top-6 border-2 rounded-xl p-6 ${VERDICT_COLOUR[result.evaluation.verdict]}`}>
              <div className="text-xs uppercase tracking-widest mb-2 opacity-80">VERDICT</div>
              <div className="text-xl font-bold mb-4">{VERDICT_LABEL[result.evaluation.verdict]}</div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-70">Total score</span>
                  <span className="font-bold">{result.evaluation.totalScore} / 30</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Strong dimensions</span>
                  <span className="font-bold">{result.evaluation.strongDimensions} / 6</span>
                </div>
              </div>
              {savedId ? (
                <div className="mt-4 pt-4 border-t border-current/20">
                  <div className="text-xs mb-2 opacity-80">Saved to Pipeline.</div>
                  <Link href={`/mission/${savedId}`} className="block w-full text-center px-3 py-2 bg-white/20 hover:bg-white/30 rounded font-semibold text-sm">
                    Open Mission Profile →
                  </Link>
                  <Link href="/pipeline" className="block w-full text-center mt-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-xs">
                    See in Pipeline →
                  </Link>
                </div>
              ) : (
                <button
                  onClick={saveToPipeline}
                  className="mt-4 w-full px-3 py-2.5 bg-white/20 hover:bg-white/30 rounded font-semibold text-sm"
                >
                  Save to Pipeline as Targeting →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL OVERRIDE · collapsed by default */}
      <div className="bg-card border border-border rounded-xl mb-6">
        <button
          onClick={() => setShowManualOverride((v) => !v)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-surface-2 transition"
        >
          <div>
            <div className="font-semibold text-sm">Manual override · score yourself</div>
            <div className="text-xs text-muted mt-0.5">Use if URL fetch fails or you want full control of the rubric</div>
          </div>
          <span className="text-muted">{showManualOverride ? "▼" : "▶"}</span>
        </button>
        {showManualOverride && (
          <div className="border-t border-border p-5 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              {EVALUATION_DIMENSIONS.map((dim) => (
                <div key={dim.key} className="bg-bg border border-border rounded-lg p-3">
                  <div className="flex items-baseline justify-between mb-2">
                    <h4 className="font-semibold text-xs">{dim.label}</h4>
                    <span className="text-[10px] text-muted">{dim.question}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setManualScores({ ...manualScores, [dim.key]: s })}
                        className={`py-1.5 rounded text-xs font-bold transition ${
                          manualScores[dim.key] === s
                            ? "bg-accent text-white"
                            : "bg-card border border-border text-muted hover:border-accent"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted">
                    {dim.rubric.find((r) => r.score === manualScores[dim.key])?.description}
                  </p>
                </div>
              ))}
              <div className="bg-bg border border-border rounded-lg p-3 space-y-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={manualApac} onChange={(e) => setManualApac(e.target.checked)} className="w-4 h-4 accent-accent" />
                  Has live APAC commercial seat
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={manualFresh} onChange={(e) => setManualFresh(e.target.checked)} className="w-4 h-4 accent-accent" />
                  Role posted within 90 days
                </label>
              </div>
            </div>
            <div>
              <div className={`sticky top-6 border-2 rounded-xl p-5 ${VERDICT_COLOUR[manualEvaluation.verdict]}`}>
                <div className="text-[10px] uppercase tracking-widest mb-1 opacity-80">MANUAL VERDICT</div>
                <div className="text-base font-bold mb-3">{VERDICT_LABEL[manualEvaluation.verdict]}</div>
                <div className="text-xs flex justify-between">
                  <span className="opacity-70">Score</span>
                  <span className="font-bold">{manualEvaluation.totalScore}/30 · {manualEvaluation.strongDimensions}/6 strong</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SAMPLE EVALUATIONS · reference */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-xs uppercase tracking-widest text-muted mb-3 font-bold">Sample evaluations · from your pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(SAMPLE_EVALUATIONS).map(([key, evalData]) => (
            <div key={key} className="bg-bg border border-border rounded-lg p-3">
              <div className="text-sm font-bold capitalize text-navy mb-1">{key}</div>
              <div className="text-xs text-text-dim">
                {evalData.totalScore}/30 · {evalData.strongDimensions}/6 strong
              </div>
              <div className={`text-xs font-semibold mt-1 ${
                evalData.verdict === "rocket" ? "text-good" :
                evalData.verdict === "watchlist" ? "text-accent" :
                "text-hot"
              }`}>
                {evalData.verdict.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
