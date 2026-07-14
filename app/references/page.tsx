"use client";

import { useAppState } from "@/lib/storage";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import { STAGES } from "@/lib/constants";
import type { Opportunity, ReferenceStatus } from "@/lib/types";

export default function References() {
  const [state, update] = useAppState();
  const ALL_OPPS = [...OPPORTUNITIES, ...(state.customOpps || [])];
  const allOpps: Opportunity[] = ALL_OPPS.map((o) => ({ ...o, ...(state.opps[o.id] || {}) } as Opportunity));

  // Only show active opps where reference is relevant (applied → late interview)
  const referenceRelevant = allOpps.filter((o) => ["contacted", "applied", "early", "late", "offer"].includes(o.stage));

  function getRef(id: string): ReferenceStatus {
    return state.opps[id]?.reference || { briefed: false };
  }

  function updateRef(id: string, patch: Partial<ReferenceStatus>) {
    update((s) => ({
      ...s,
      opps: { ...s.opps, [id]: { ...(s.opps[id] || {}), reference: { ...(s.opps[id]?.reference || { briefed: false }), ...patch } } },
    }));
  }

  // Detect opps needing imminent reference brief
  const needsBriefing = referenceRelevant.filter((o) => {
    const ref = getRef(o.id);
    return !ref.briefed && (o.stage === "early" || o.stage === "late" || o.stage === "offer");
  });

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight mb-1.5">Reference Activation Tracker</h1>
      <p className="text-muted text-sm mb-6">Per-opp reference brief status. Reference calls usually land 1-2 weeks into active interview cycles. Brief your referee BEFORE the company asks.</p>

      {needsBriefing.length > 0 && (
        <div className="card !border-hot bg-hot/5 mb-4">
          <h3 className="text-base font-semibold text-hot mt-0 mb-2">⚠ {needsBriefing.length} opp{needsBriefing.length > 1 ? "s" : ""} need your referee briefed NOW</h3>
          <p className="text-sm text-text-dim mb-3">These opps are in active interview / offer stages. Reference calls could land any day. Brief your referee ahead of time.</p>
          <ul className="text-sm space-y-1 pl-5 list-disc">
            {needsBriefing.map((o) => (
              <li key={o.id}><strong>{o.company}</strong> · {o.position} · in {(STAGES.find((s) => s.id === o.stage) || { label: o.stage }).label}</li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="text-xl font-semibold mt-7 mb-4">Active opps · reference status</h2>
      <div className="space-y-3">
        {referenceRelevant.length === 0 ? (
          <div className="card"><p className="text-sm text-text-dim">No opps in reference-relevant stages yet. References become important when opps hit Comms Open through Offer.</p></div>
        ) : (
          referenceRelevant.map((o) => {
            const ref = getRef(o.id);
            const stageLabel = (STAGES.find((s) => s.id === o.stage) || { label: o.stage }).label;
            return (
              <div key={o.id} className="card">
                <div className="flex justify-between items-start gap-4 flex-wrap mb-3">
                  <div className="flex-1 min-w-[240px]">
                    <h3 className="text-base font-semibold mt-0 mb-1">{o.company}</h3>
                    <p className="text-xs text-text-dim">{o.position}</p>
                    <span className="badge bg-navy/15 text-navy mt-2 inline-block">{stageLabel}</span>
                  </div>
                  <div className="text-right">
                    {ref.briefed ? (
                      <span className="badge bg-good/20 text-good">✓ Referee briefed</span>
                    ) : (
                      <span className="badge bg-warn/20 text-warn">⚠ Not yet briefed</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateRef(o.id, { briefed: !ref.briefed, briefedAt: !ref.briefed ? new Date().toISOString().split("T")[0] : undefined })}
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center ${ref.briefed ? "bg-good border-good" : "border-muted"}`}
                    >
                      {ref.briefed && <svg width="12" height="12" viewBox="0 0 14 14"><path d="M2 7 L6 11 L12 3" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </button>
                    <span className="text-sm">Referee briefed on this opp</span>
                    {ref.briefedAt && <span className="text-xs text-muted ml-auto">on {ref.briefedAt}</span>}
                  </div>

                  <div>
                    <label className="block text-[11px] text-muted uppercase tracking-wider mb-1">Expected reference call window</label>
                    <input
                      type="text"
                      placeholder="e.g. Week of 7 July, after final round"
                      value={ref.expectedCallWindow || ""}
                      onChange={(e) => updateRef(o.id, { expectedCallWindow: e.target.value })}
                      className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-muted uppercase tracking-wider mb-1">Outcome / Notes</label>
                    <textarea
                      placeholder="What your referee said, key talking points, who actually called, anything to capture..."
                      value={ref.notes || ""}
                      onChange={(e) => updateRef(o.id, { notes: e.target.value })}
                      rows={2}
                      className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <h2 className="text-xl font-semibold mt-7 mb-4">Briefing your referee · the script</h2>
      <div className="card">
        <p className="text-sm text-text-dim mb-2">When an opp escalates, send your referee a quick brief:</p>
        <div className="bg-surface-2 border border-border rounded-md p-4 text-xs font-mono leading-relaxed">
          <p>Hi [Referee], [Company] are likely to call you for a reference in the next [1-2 weeks].</p>
          <p className="mt-2">Quick context: pitching for [role] at [company]. They&apos;re a [stage] company in [industry]. The 90-day plan I&apos;ve shared with them is [one line on what I&apos;d build].</p>
          <p className="mt-2">If anything specific would be useful to know before the call, let me know. Appreciate you. [Your initial]</p>
        </div>
      </div>
    </div>
  );
}
