"use client";

// V3.5 · Probe Learning Card · pattern reveal from triage history
// Sits at the top of /probes · analyses approve/deny/watchlist decisions
// to show users what the platform is learning about their preferences
//
// Current state: simple counted patterns + heuristics. The actual ML re-tuning
// of probe criteria lives in V3.6. This UI sets the expectation that probes get smarter.

import { useMemo } from "react";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import type { AppState, TriageStatus } from "@/lib/types";

interface Pattern {
  insight: string;
  confidence: "emerging" | "strong" | "locked";
  evidenceCount: number;
}

function getTriageStatus(oppId: string, state: AppState): TriageStatus | undefined {
  const stateTriage = state.opps[oppId]?.triage;
  const seedTriage = OPPORTUNITIES.find((o) => o.id === oppId)?.triage;
  return (stateTriage || seedTriage)?.status;
}

export function ProbeLearningCard({ state }: { state: AppState }) {
  const allOpps = OPPORTUNITIES.map((o) => ({ ...o, ...(state.opps[o.id] || {}) }));

  const stats = useMemo(() => {
    const approved = allOpps.filter((o) => getTriageStatus(o.id, state) === "approved");
    const denied = allOpps.filter((o) => getTriageStatus(o.id, state) === "denied");
    const watchlist = allOpps.filter((o) => getTriageStatus(o.id, state) === "watchlist");
    const total = approved.length + denied.length + watchlist.length;
    return { approved, denied, watchlist, total };
  }, [allOpps, state]);

  const patterns = useMemo<Pattern[]>(() => {
    const out: Pattern[] = [];
    if (stats.total < 3) return out;

    // Pattern 1 · approve vs deny ratio reveals selectivity
    const approveRate = stats.total ? Math.round((stats.approved.length / stats.total) * 100) : 0;
    if (approveRate < 30) {
      out.push({
        insight: `You're highly selective · ${approveRate}% approval rate · we'll narrow scrape criteria toward your strongest signals`,
        confidence: stats.total > 8 ? "strong" : "emerging",
        evidenceCount: stats.total,
      });
    } else if (approveRate > 60) {
      out.push({
        insight: `You're approving broadly · ${approveRate}% approval rate · we'll widen scrape volume to give you more options`,
        confidence: stats.total > 8 ? "strong" : "emerging",
        evidenceCount: stats.total,
      });
    }

    // Pattern 2 · stage of growth preference
    const approvedRocket = stats.approved.filter((o) => o.triage?.companyEvaluation?.verdict === "rocket").length;
    if (approvedRocket >= 2 && stats.approved.length > 0) {
      out.push({
        insight: `${approvedRocket} of your ${stats.approved.length} approvals are rocket-tier · we'll prioritise rocket verdicts on future scrapes`,
        confidence: approvedRocket >= 5 ? "locked" : approvedRocket >= 3 ? "strong" : "emerging",
        evidenceCount: approvedRocket,
      });
    }

    // Pattern 3 · denial reasons reveal hard constraints
    const denialReasons = stats.denied.map((o) => o.triage?.denialReason || "").filter(Boolean);
    if (denialReasons.length >= 2) {
      // Simple keyword grouping
      const keywords = ["comp", "headcount", "stage", "industry", "location", "remote", "enterprise", "SMB"];
      const counts: Record<string, number> = {};
      for (const reason of denialReasons) {
        for (const kw of keywords) {
          if (reason.toLowerCase().includes(kw.toLowerCase())) {
            counts[kw] = (counts[kw] || 0) + 1;
          }
        }
      }
      const topKeyword = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (topKeyword && topKeyword[1] >= 2) {
        out.push({
          insight: `You've jettisoned ${topKeyword[1]} roles mentioning "${topKeyword[0]}" · we'll de-prioritise this signal going forward`,
          confidence: topKeyword[1] >= 4 ? "strong" : "emerging",
          evidenceCount: topKeyword[1],
        });
      }
    }

    // Pattern 4 · watchlist behaviour
    if (stats.watchlist.length >= 3) {
      out.push({
        insight: `${stats.watchlist.length} companies parked on watchlist · we'll re-surface them when conditions change (new role, funding round, new exec)`,
        confidence: "strong",
        evidenceCount: stats.watchlist.length,
      });
    }

    // Pattern 5 · velocity tracking · time-to-decide
    if (stats.total >= 5) {
      out.push({
        insight: `You've triaged ${stats.total} companies · feedback loop is active · probes will refine each cycle`,
        confidence: stats.total >= 15 ? "locked" : "strong",
        evidenceCount: stats.total,
      });
    }

    return out;
  }, [stats]);

  // Don't show if no patterns yet
  if (patterns.length === 0 && stats.total < 3) {
    return (
      <div className="card mb-4 bg-cool/5 border-cool/30">
        <div className="flex items-center gap-3">
          <div className="text-[24px]">🧠</div>
          <div className="flex-1">
            <strong className="block text-[14px] text-cool mb-0.5">Probe learning · warming up</strong>
            <p className="text-[12px] text-text-dim m-0">
              Triage {3 - stats.total} more probe{3 - stats.total === 1 ? "" : "s"} to unlock pattern detection. Every approve / jettison / watchlist tunes future scrapes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated mb-4">
      <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
        <h2 className="text-[16px] font-bold text-navy m-0">
          🧠 Probe learning · what we&apos;ve learned about you
        </h2>
        <span className="text-[10px] uppercase tracking-[1.4px] font-bold text-purple bg-purple/15 px-2 py-0.5 rounded">
          V3.5
        </span>
      </div>
      <p className="text-[12px] text-text-dim mb-4 leading-relaxed">
        Every triage decision is a labelled training example. Patterns below are detected from your history · they tune future probe scrape criteria automatically.
      </p>

      {/* Triage summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-good/10 border border-good/30 rounded-md p-3 text-center">
          <div className="text-[20px] font-bold text-good leading-none">{stats.approved.length}</div>
          <div className="text-[10px] uppercase tracking-[1.4px] text-good mt-1 font-bold">Approved</div>
        </div>
        <div className="bg-cool/10 border border-cool/30 rounded-md p-3 text-center">
          <div className="text-[20px] font-bold text-cool leading-none">{stats.watchlist.length}</div>
          <div className="text-[10px] uppercase tracking-[1.4px] text-cool mt-1 font-bold">Watchlist</div>
        </div>
        <div className="bg-hot/10 border border-hot/30 rounded-md p-3 text-center">
          <div className="text-[20px] font-bold text-hot leading-none">{stats.denied.length}</div>
          <div className="text-[10px] uppercase tracking-[1.4px] text-hot mt-1 font-bold">Jettisoned</div>
        </div>
      </div>

      {/* Patterns */}
      {patterns.length > 0 ? (
        <div className="space-y-2">
          {patterns.map((p, i) => (
            <div key={i} className="flex items-start gap-3 bg-surface-2 border border-border rounded-md p-3">
              <div className="flex-shrink-0">
                <span className={`text-[10px] uppercase tracking-[1.4px] px-2 py-1 rounded font-bold ${
                  p.confidence === "locked"
                    ? "bg-good text-white"
                    : p.confidence === "strong"
                    ? "bg-accent text-white"
                    : "bg-warn/20 text-warn"
                }`}>
                  {p.confidence}
                </span>
              </div>
              <p className="text-[12px] text-text-dim leading-relaxed m-0 flex-1">{p.insight}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-muted italic">No strong patterns yet · keep triaging.</p>
      )}

      <div className="mt-3 pt-3 border-t border-border text-[11px] text-muted leading-relaxed">
        <strong>How this works:</strong> Patterns become &ldquo;emerging&rdquo; with 3-5 data points · &ldquo;strong&rdquo; with 5-10 · &ldquo;locked&rdquo; with 10+. Locked patterns automatically tune your Probe Config on the next scrape cycle (V3.6 ships the auto-re-tuning loop).
      </div>
    </div>
  );
}
