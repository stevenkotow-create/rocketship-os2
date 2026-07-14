"use client";

import { useAppState, weekStart } from "@/lib/storage";
import { PageHero } from "@/components/PageHero";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import { FUNNEL_STAGES } from "@/lib/constants";

export default function TrajectoryDensity() {
  const [state] = useAppState();
  const ALL_OPPS = [...OPPORTUNITIES, ...(state.customOpps || [])];
  const allOpps = ALL_OPPS.map((o) => ({ ...o, ...(state.opps[o.id] || {}) }));

  const funnel = FUNNEL_STAGES.map((s) => {
    const count = allOpps.filter((o) => (s.stages as readonly string[]).includes(o.stage)).length;
    const health = count < s.target[0] ? "hot" : count <= s.target[1] ? "good" : "warn";
    return { ...s, count, health };
  });

  // Weekly cadence trend - Mon to Sun
  const ws = new Date(weekStart());
  const weekDays: { name: string; num: number; apps: number; outreach: number; followups: number; isToday: boolean; isFuture: boolean }[] = [];
  const todayKey = new Date().toISOString().split("T")[0];
  for (let i = 0; i < 7; i++) {
    const d = new Date(ws);
    d.setDate(ws.getDate() + i);
    const k = d.toISOString().split("T")[0];
    const r = state.ritual[k] || { apps: 0, outreach: 0, followups: 0, practice: 0 };
    weekDays.push({
      name: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      num: d.getDate(),
      apps: r.apps,
      outreach: r.outreach,
      followups: r.followups,
      isToday: k === todayKey,
      isFuture: d > new Date(),
    });
  }

  const weekTotals = weekDays.reduce(
    (acc, d) => ({ apps: acc.apps + d.apps, outreach: acc.outreach + d.outreach, followups: acc.followups + d.followups }),
    { apps: 0, outreach: 0, followups: 0 }
  );

  const maxBar = Math.max(...weekDays.map((d) => Math.max(d.apps, d.outreach, d.followups)), 4);

  return (
    <div>
      <PageHero
        eyebrow="Analytics"
        title="Trajectory Density"
        subtitle="Marketing funnel applied to job hunt. Density targets per stage + Mon-Sun trend bars showing whether pipeline is growing or shrinking."
        marker="TD.01"
      />

      {/* Funnel density */}
      <h2 className="text-xl font-semibold mb-4">Funnel density · right now</h2>
      <div className="space-y-2 mb-7">
        {funnel.map((f) => {
          const widthMap: Record<string, string> = { targeting: "220px", contacted: "180px", applied: "140px", interview: "100px", offer: "60px" };
          return (
            <div key={f.id} className="flex items-center gap-4 bg-surface border border-border rounded-lg p-4">
              <div className="bg-accent text-white font-bold text-sm rounded h-[30px] flex items-center justify-center px-3" style={{ width: widthMap[f.id] }}>
                {f.count}
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-semibold">{f.name}</div>
                <div className="text-xs text-muted mt-1">{f.desc}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{f.count}</div>
                <div className="text-[11px] text-muted">target {f.target[0]}-{f.target[1]}</div>
                <span className={`text-[11px] mt-1 inline-block px-2 py-0.5 rounded uppercase tracking-wider ${f.health === "good" ? "bg-good/20 text-good" : f.health === "warn" ? "bg-warn/20 text-warn" : "bg-hot/20 text-hot"}`}>
                  {f.health === "good" ? "On target" : f.health === "warn" ? "Over-stocked" : `Below (need ${f.target[0] - f.count})`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly trend */}
      <h2 className="text-xl font-semibold mt-7 mb-4">This week · activity trend (Mon-Sun)</h2>
      <div className="card">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((d) => (
            <div key={d.name} className="text-center">
              <div className={`text-[10px] text-muted uppercase tracking-wider ${d.isToday ? "text-accent font-bold" : ""}`}>{d.name}</div>
              <div className={`text-sm font-bold mt-0.5 ${d.isToday ? "text-accent" : ""}`}>{d.num}</div>
            </div>
          ))}
        </div>

        {/* Three stacked bar rows · Apps, Outreach, Follow-ups */}
        {[
          { key: "apps" as const, label: "Apps", target: 2, color: "bg-accent" },
          { key: "outreach" as const, label: "Outreach", target: 4, color: "bg-navy" },
          { key: "followups" as const, label: "Follow-ups", target: 2, color: "bg-gold" },
        ].map((row) => (
          <div key={row.key} className="mb-4 last:mb-0">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-dim">{row.label}</span>
              <span className="text-xs text-muted">
                {weekTotals[row.key]} / {row.target * 7} this week · daily target {row.target}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2 items-end" style={{ height: "80px" }}>
              {weekDays.map((d) => {
                const value = d[row.key];
                const heightPct = (value / maxBar) * 100;
                const hitTarget = value >= row.target;
                return (
                  <div key={d.name} className="flex flex-col items-center justify-end h-full relative group">
                    {/* Target line */}
                    <div className="absolute bottom-0 left-0 right-0 border-t border-dashed border-border" style={{ bottom: `${(row.target / maxBar) * 100}%` }} />
                    {/* Bar */}
                    {!d.isFuture && (
                      <div
                        className={`w-full rounded-t transition-all ${hitTarget ? row.color : value > 0 ? `${row.color} opacity-60` : "bg-surface-3"} ${d.isToday ? "ring-2 ring-accent" : ""}`}
                        style={{ height: value > 0 ? `${Math.max(heightPct, 8)}%` : "4px" }}
                      />
                    )}
                    {d.isFuture && <div className="w-full bg-surface-3 opacity-30 rounded-t" style={{ height: "4px" }} />}
                    {/* Value label */}
                    <div className={`text-[10px] mt-1 font-mono ${value > 0 ? "text-text" : "text-muted"}`}>{value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="text-xs text-muted mt-4 pt-3 border-t border-border">
          Dashed line = daily target. Solid bar = hit target. Faded bar = below target. Today highlighted in orange.
        </div>
      </div>

      {/* The Daily Math */}
      <h2 className="text-xl font-semibold mt-7 mb-4">The Daily Math</h2>
      <div className="card">
        <p className="text-sm mb-2">To maintain healthy density:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-text-dim">
          <li><strong className="text-text">2 applications/day</strong> → 12/week → ~4 active SQL at 33% response rate</li>
          <li><strong className="text-text">4 outreach/day</strong> → 20/week (60% direct HM, 30% GTM recruiter, 10% peer warm-ups)</li>
          <li><strong className="text-text">2 follow-ups/day</strong> → 8/week (Day 1, Day 5, Day 14 cadence)</li>
          <li><strong className="text-text">15-20 min interview practice/day</strong></li>
        </ul>
        <p className="text-sm mt-3 text-text-dim">Response rate is the constraint, not volume. Tighter quality beats more applications.</p>
      </div>
    </div>
  );
}
