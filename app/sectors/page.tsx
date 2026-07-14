"use client";

import { useAppState } from "@/lib/storage";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import { SECTORS } from "@/lib/data/sectors";
import { STAGES } from "@/lib/constants";
import { PageHero } from "@/components/PageHero";

export default function TargetSectors() {
  const [state] = useAppState();
  const ALL_OPPS = [...OPPORTUNITIES, ...(state.customOpps || [])];
  const allOpps = ALL_OPPS.map((o) => ({ ...o, ...(state.opps[o.id] || {}) }));

  return (
    <div>
      <PageHero
        eyebrow="Playbook"
        title="Target Sectors"
        subtitle="Six thesis verticals. Each with rationale, named targets, pattern fit, and current pipeline count."
        marker="TS.01"
      />

      {SECTORS.map((s) => {
        const active = s.pipelineIds.map((id) => allOpps.find((o) => o.id === id)).filter((o) => o && !["closed", "accepted"].includes(o.stage));
        return (
          <div key={s.id} className="card">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[260px]">
                <h3 className="text-[17px] font-semibold mt-0">{s.name}</h3>
                <p className="text-text-dim text-[13px] mt-1 mb-2.5">{s.thesis}</p>
                <p className="text-xs text-muted mb-1"><strong>Pattern fit:</strong> {s.pattern}</p>
                <p className="text-xs text-muted"><strong>Named targets:</strong> {s.companies.join(" · ")}</p>
              </div>
              <div className="text-center min-w-[100px]">
                <div className="text-[32px] font-bold text-accent">{active.length}</div>
                <div className="text-[11px] text-muted uppercase tracking-wider">active in pipe</div>
              </div>
            </div>
            {active.length > 0 && (
              <div className="mt-3.5 pt-3.5 border-t border-border">
                <div className="text-[11px] text-muted uppercase tracking-wider mb-1.5">Current opps</div>
                {active.map((o) => o && (
                  <span key={o.id} className="inline-flex items-center text-[11px] bg-surface-3 text-text-dim px-2 py-0.5 rounded-[10px] mr-1.5 mb-1">
                    {o.company} · {(STAGES.find((st) => st.id === o.stage) || { label: o.stage }).label}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
