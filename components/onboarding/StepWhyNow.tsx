"use client";

// V3.5 · Discovery step · Why now?
// Single high-signal question that shapes urgency, comp posture, scrape volume

import { useState } from "react";
import { Reticle } from "@/components/icons";
import type { WhyNow, WhyNowReason } from "@/lib/types";

const REASONS: { id: WhyNowReason; label: string; description: string; urgency: "high" | "medium" | "low" }[] = [
  {
    id: "forced",
    label: "Forced move",
    description: "Laid off, made redundant, role changed under me, bad manager · need out fast",
    urgency: "high",
  },
  {
    id: "proactive",
    label: "Proactive growth",
    description: "Career progression, comp upgrade, ready for the next level · not urgent, but moving",
    urgency: "medium",
  },
  {
    id: "exploratory",
    label: "Exploratory",
    description: "Curious about the market, casually looking, not actively applying yet",
    urgency: "low",
  },
  {
    id: "burnout",
    label: "Burnout reset",
    description: "Need a change of pace, want different culture or company stage · pace matters",
    urgency: "medium",
  },
  {
    id: "lifechange",
    label: "Life change",
    description: "Moving cities, relationship change, family situation · logistics matter most",
    urgency: "medium",
  },
];

export function StepWhyNow({
  initial,
  onSave,
  onSkip,
}: {
  initial?: WhyNow;
  onSave: (whyNow: WhyNow) => void;
  onSkip: () => void;
}) {
  const [reason, setReason] = useState<WhyNowReason | undefined>(initial?.reason);
  const [context, setContext] = useState(initial?.context || "");

  function handleSave() {
    if (!reason) return;
    const meta = REASONS.find((r) => r.id === reason)!;
    onSave({
      reason,
      context: context.trim() || undefined,
      urgency: meta.urgency,
      capturedAt: new Date().toISOString(),
    });
  }

  return (
    <div>
      <div className="text-accent mb-3"><Reticle size={28} strokeWidth={1.5} /></div>
      <h2 className="text-[22px] font-bold text-text mb-2 tracking-tight">Why are you searching right now?</h2>
      <p className="text-[13px] text-text-dim mb-5 max-w-2xl leading-relaxed">
        Single biggest signal we capture. Determines urgency, comp posture, how aggressive the scrape gets, and how the platform talks to you. One choice · pick the closest match.
      </p>

      <div className="space-y-2 mb-5">
        {REASONS.map((r) => {
          const isSelected = reason === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setReason(r.id)}
              className={`w-full text-left p-4 rounded-lg border transition ${
                isSelected
                  ? "bg-accent/10 border-accent"
                  : "bg-surface border-border hover:border-accent/40 hover:bg-surface-2"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2 mb-1 flex-wrap">
                <strong className={`text-[15px] ${isSelected ? "text-accent" : "text-navy"}`}>{r.label}</strong>
                <span className={`text-[10px] uppercase tracking-[1.4px] font-bold px-2 py-0.5 rounded ${
                  r.urgency === "high" ? "bg-hot/15 text-hot" : r.urgency === "medium" ? "bg-warn/15 text-warn" : "bg-cool/15 text-cool"
                }`}>
                  {r.urgency} urgency
                </span>
              </div>
              <p className="text-[12px] text-text-dim leading-relaxed">{r.description}</p>
            </button>
          );
        })}
      </div>

      <label className="block label-caps mb-2">Optional · 1-line context</label>
      <input
        type="text"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="e.g. Made redundant 4 weeks ago · runway until end of August"
        className="w-full text-[13px] p-3 border border-border rounded-md bg-surface mb-5"
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSave}
          disabled={!reason}
          className="px-5 py-2.5 bg-accent text-white rounded-md font-bold text-[13px] hover:bg-accent-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save and continue →
        </button>
        <button onClick={onSkip} className="px-5 py-2.5 text-text-dim hover:text-navy text-[13px] underline">
          Skip for now
        </button>
      </div>
    </div>
  );
}
