"use client";

import { useAppState, today, weekStart } from "@/lib/storage";
import { PageHero } from "@/components/PageHero";

export default function MissionDrills() {
  const [state, update] = useAppState();
  const t = today();
  const ritual = state.ritual[t] || { apps: 0, outreach: 0, followups: 0, practice: 0 };
  const energy = state.energy[t];

  function adj(key: "apps" | "outreach" | "followups" | "practice", delta: number) {
    const step = key === "practice" ? 5 : 1;
    update((s) => ({
      ...s,
      ritual: { ...s.ritual, [t]: { ...(s.ritual[t] || { apps: 0, outreach: 0, followups: 0, practice: 0 }), [key]: Math.max(0, (s.ritual[t]?.[key] || 0) + delta * step) } },
    }));
  }

  function setEnergy(n: number) {
    update((s) => ({ ...s, energy: { ...s.energy, [t]: n } }));
  }

  // Week grid
  const ws = new Date(weekStart());
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(ws);
    d.setDate(ws.getDate() + i);
    const k = d.toISOString().split("T")[0];
    const r = state.ritual[k] || { apps: 0, outreach: 0, followups: 0, practice: 0 };
    const score = (r.apps >= 2 ? 1 : 0) + (r.outreach >= 4 ? 1 : 0) + (r.followups >= 2 ? 1 : 0) + (r.practice >= 15 ? 1 : 0);
    days.push({ name: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], num: d.getDate(), score, isToday: k === t });
  }

  const items = [
    { key: "apps" as const, label: "Applications", target: 2, unit: "" },
    { key: "outreach" as const, label: "Outreach", target: 4, unit: "" },
    { key: "followups" as const, label: "Follow-ups", target: 2, unit: "" },
    { key: "practice" as const, label: "Interview practice", target: 15, unit: " min" },
  ];

  const energyLabels = ["", "🪫 Wiped", "😮‍💨 Low", "🆗 Steady", "🚀 Good", "🔥 On fire"];

  return (
    <div>
      <PageHero eyebrow="Cadence" title="Mission Drills" subtitle="Mentor-prescribed daily cadence + energy check-in." marker="MD.01" />

      <h2 className="text-xl font-semibold mb-4">Today · {new Date().toLocaleDateString("en-AU", { weekday: "long", month: "long", day: "numeric" })}</h2>
      {items.map((it) => {
        const v = ritual[it.key];
        const status = v >= it.target ? "done" : v > 0 ? "partial" : "todo";
        const statusLabel = v >= it.target ? "Complete" : v > 0 ? "In progress" : "Not started";
        return (
          <div key={it.key} className="flex items-center gap-3.5 p-3.5 bg-surface border border-border rounded-lg mb-2">
            <div className="flex-1 font-medium">{it.label}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => adj(it.key, -1)} className="w-7 h-7 bg-surface-3 border border-border rounded-md hover:bg-accent hover:text-bg">−</button>
              <span className="font-bold text-base min-w-[30px] text-center">{v}</span>
              <button onClick={() => adj(it.key, 1)} className="w-7 h-7 bg-surface-3 border border-border rounded-md hover:bg-accent hover:text-bg">+</button>
            </div>
            <span className="text-muted text-[13px]">/ {it.target}{it.unit}</span>
            <span className={`text-[11px] px-2 py-1 rounded ${status === "done" ? "bg-good/20 text-good" : status === "partial" ? "bg-warn/20 text-warn" : "bg-surface-3 text-muted"}`}>{statusLabel}</span>
          </div>
        );
      })}

      <h2 className="text-xl font-semibold mt-7 mb-4">Energy Check-in</h2>
      <div className="card">
        <p className="text-sm mb-3">How&apos;s the tank feeling today?</p>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setEnergy(n)}
              className={`flex-1 min-w-[100px] py-3 px-2 border rounded-md text-[13px] ${energy === n ? "bg-accent text-bg border-accent font-bold" : "bg-surface-2 text-text border-border"}`}
            >
              {energyLabels[n]}
            </button>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-7 mb-4">This Week</h2>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => (
          <div key={d.name} className={`bg-surface border rounded-md p-3 text-center ${d.isToday ? "border-accent" : "border-border"}`}>
            <div className="text-[11px] text-muted uppercase tracking-wider">{d.name}</div>
            <div className="text-lg font-bold my-1">{d.num}</div>
            <div className="text-[10px] text-text-dim">{d.score}/4</div>
          </div>
        ))}
      </div>
    </div>
  );
}
