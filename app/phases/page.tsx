"use client";

import { useState } from "react";
import { useAppState } from "@/lib/storage";
import { PHASE_TASKS } from "@/lib/data/phases";

export default function MissionPhases() {
  const [state, update] = useAppState();
  const [activePhase, setActivePhase] = useState<1 | 2 | 3 | 4>(state.currentPhase || 1);

  const tasks = PHASE_TASKS.filter((t) => t.phase === activePhase);
  const phaseNames = ["Pre-Flight", "Ignition & Ascent", "Orbital Approach", "Docking"];
  const phaseSubtitles = ["Identity, plan, training", "Active outreach + pipeline build", "Live interview cycles", "Offer + decision"];

  function toggleTask(id: string) {
    update((s) => {
      const isInit = Object.keys(s.tasks).length === 0;
      const tasksState = isInit ? PHASE_TASKS.reduce((acc, t) => ({ ...acc, [t.id]: t.done }), {} as Record<string, boolean>) : s.tasks;
      return { ...s, tasks: { ...tasksState, [id]: !tasksState[id] } };
    });
  }

  function getTaskDone(id: string): boolean {
    if (Object.keys(state.tasks).length === 0) {
      return PHASE_TASKS.find((t) => t.id === id)?.done ?? false;
    }
    return state.tasks[id] ?? false;
  }

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight mb-1.5">Mission Phases</h1>
      <p className="text-muted text-sm mb-6">32 mission objectives across 4 launch phases.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        {[1, 2, 3, 4].map((p) => {
          const phaseTasks = PHASE_TASKS.filter((t) => t.phase === p);
          const done = phaseTasks.filter((t) => getTaskDone(t.id)).length;
          const pct = Math.round((done / phaseTasks.length) * 100);
          return (
            <div
              key={p}
              onClick={() => setActivePhase(p as 1 | 2 | 3 | 4)}
              className={`bg-surface border rounded-lg p-3 cursor-pointer transition-all ${activePhase === p ? "border-accent bg-surface-2" : "border-border hover:border-border-strong"}`}
            >
              <div className="text-[10px] text-muted uppercase tracking-wider">Phase {p}</div>
              <div className="text-sm font-bold my-1 text-navy">{phaseNames[p - 1]}</div>
              <div className="text-[10px] text-muted mb-1.5">{phaseSubtitles[p - 1]}</div>
              <div className="text-[11px] text-text-dim">{done}/{phaseTasks.length} · {pct}%</div>
              <div className="progress-track mt-1.5"><div className={`progress-fill ${pct === 100 ? "!bg-good" : ""}`} style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {tasks.map((t) => {
          const done = getTaskDone(t.id);
          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 p-3 bg-surface border rounded-lg ${done ? "opacity-55 border-border" : t.next ? "border-accent bg-gradient-to-r from-accent/10 to-surface" : "border-border"}`}
            >
              <button
                onClick={() => toggleTask(t.id)}
                className={`w-5 h-5 border-2 rounded flex-shrink-0 flex items-center justify-center mt-0.5 ${done ? "bg-good border-good" : "border-muted"}`}
              >
                {done && (
                  <svg width="12" height="12" viewBox="0 0 14 14"><path d="M2 7 L6 11 L12 3" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </button>
              <div className="flex-1">
                <div className={`text-sm font-medium ${done ? "line-through" : ""}`}>{t.title}</div>
                {t.note && <div className="text-xs text-muted mt-1">{t.note}</div>}
                {t.next && !done && <span className="text-[11px] text-accent mt-1 inline-block">← Next action</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
