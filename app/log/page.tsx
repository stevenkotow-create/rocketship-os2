"use client";

import { useAppState, today } from "@/lib/storage";
import type { DailyEntry } from "@/lib/types";

export default function MissionLog() {
  const [state, update] = useAppState();
  const t = today();
  const entry = state.log[t] || { win: "", lesson: "", obs: "", pod: "" };

  function updateEntry(field: keyof DailyEntry, value: string) {
    update((s) => ({
      ...s,
      log: { ...s.log, [t]: { ...(s.log[t] || {}), [field]: value } },
    }));
  }

  const recent: { date: Date; entry: DailyEntry }[] = [];
  const now = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const k = d.toISOString().split("T")[0];
    const e = state.log[k];
    if (e && (e.win || e.lesson || e.obs || e.pod)) recent.push({ date: d, entry: e });
  }

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight mb-1.5">Mission Log</h1>
      <p className="text-muted text-sm mb-6">Daily entry. Three small fields plus POD. Compounds week-over-week into a portfolio asset.</p>

      <h2 className="text-xl font-semibold mb-4">
        Today · {new Date().toLocaleDateString("en-AU", { weekday: "long", month: "long", day: "numeric" })}
      </h2>
      <div className="card">
        {[
          { key: "win" as const, label: "🏆 Today's Win", color: "text-accent", placeholder: "One specific thing that worked." },
          { key: "lesson" as const, label: "📚 Today's Lesson", color: "text-warn", placeholder: "One thing learned. Can be small." },
          { key: "obs" as const, label: "👁 Observation", color: "text-cool", placeholder: "Something you noticed." },
          { key: "pod" as const, label: "🙏 POD · Gratitude + Tomorrow's Energy", color: "text-good", placeholder: "What you're grateful for + one positive forward note." },
        ].map((f) => (
          <div key={f.key} className="mb-3.5 last:mb-0">
            <label className={`block text-xs uppercase tracking-wider mb-1.5 ${f.color}`}>{f.label}</label>
            <textarea
              value={entry[f.key] || ""}
              onChange={(e) => updateEntry(f.key, e.target.value)}
              rows={2}
              placeholder={f.placeholder}
              className="w-full bg-surface-2 border border-border rounded-md p-2.5 text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-7 mb-4">Recent Entries</h2>
      {recent.length === 0 ? (
        <p className="text-xs text-muted">No entries in the last 7 days yet. Today&apos;s entry is the start.</p>
      ) : (
        recent.map(({ date, entry }) => (
          <div key={date.toISOString()} className="card">
            <div className="text-xs text-muted uppercase tracking-wider mb-2.5">
              {date.toLocaleDateString("en-AU", { weekday: "long", month: "short", day: "numeric" })}
            </div>
            {entry.win && <p className="text-sm mb-2"><span className="text-accent font-semibold">Win:</span> {entry.win}</p>}
            {entry.lesson && <p className="text-sm mb-2"><span className="text-warn font-semibold">Lesson:</span> {entry.lesson}</p>}
            {entry.obs && <p className="text-sm mb-2"><span className="text-cool font-semibold">Observation:</span> {entry.obs}</p>}
            {entry.pod && <p className="text-sm"><span className="text-good font-semibold">🙏 POD:</span> {entry.pod}</p>}
          </div>
        ))
      )}
    </div>
  );
}
