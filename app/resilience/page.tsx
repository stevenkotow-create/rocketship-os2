"use client";

import { useState } from "react";
import { useAppState } from "@/lib/storage";
import { DAILY_MANTRAS, REFRAMES, WIND_DOWN_CHECKLIST, RECOVERY_PROTOCOLS, CRISIS_PROTOCOL } from "@/lib/data/resilience";

type TabId = "mantra" | "wins" | "reframes" | "wind-down" | "crisis";

export default function Resilience() {
  const [state] = useAppState();
  const [tab, setTab] = useState<TabId>("mantra");
  const [reframeSearch, setReframeSearch] = useState("");

  const today = new Date();
  const dayOfWeek = today.getDay();
  const mantra = DAILY_MANTRAS[dayOfWeek];

  // Collect all Wins from Mission Log (auto-populates Wins Reservoir)
  const allWins = Object.entries(state.log || {})
    .filter(([_, e]) => e.win)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, e]) => ({ date, win: e.win || "" }));

  // Energy trend (last 14 days)
  const energyHistory: { date: string; energy: number }[] = [];
  const d = new Date();
  for (let i = 13; i >= 0; i--) {
    const dt = new Date(d);
    dt.setDate(d.getDate() - i);
    const k = dt.toISOString().split("T")[0];
    if (state.energy[k]) energyHistory.push({ date: k, energy: state.energy[k] });
  }
  const avgEnergy = energyHistory.length > 0 ? (energyHistory.reduce((s, e) => s + e.energy, 0) / energyHistory.length).toFixed(1) : "—";

  const filteredReframes = reframeSearch
    ? REFRAMES.filter((r) =>
        r.trigger.toLowerCase().includes(reframeSearch.toLowerCase()) ||
        r.reframe.toLowerCase().includes(reframeSearch.toLowerCase())
      )
    : REFRAMES;

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight mb-1.5">Resilience Hub 💚</h1>
      <p className="text-muted text-sm mb-6">
        The emotional layer. Daily mantras, the Wins Reservoir, reframes for the hard moments, wind-down protocols, and a crisis mode for the heavy days.
      </p>

      {/* Tab nav */}
      <div className="flex gap-2 mb-5 border-b border-border overflow-x-auto">
        {[
          { id: "mantra" as const, label: "☀️ Daily Mantra" },
          { id: "wins" as const, label: "🏆 Wins Reservoir" },
          { id: "reframes" as const, label: "🔄 Reframes" },
          { id: "wind-down" as const, label: "🌙 Wind-Down" },
          { id: "crisis" as const, label: "💚 Hard Days" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-all ${
              tab === t.id ? "border-accent text-accent" : "border-transparent text-text-dim hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* MANTRA TAB */}
      {tab === "mantra" && (
        <div>
          <div className="card !border-accent bg-gradient-to-br from-surface to-surface-2 text-center py-10">
            <div className="text-[11px] text-muted uppercase tracking-wider mb-2">
              {today.toLocaleDateString("en-AU", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h2 className="text-3xl font-bold text-navy mb-4 leading-tight">&ldquo;{mantra.mantra}&rdquo;</h2>
            <p className="text-base text-text-dim max-w-[600px] mx-auto leading-relaxed">{mantra.subtext}</p>
          </div>

          <h2 className="text-xl font-semibold mt-7 mb-4">Energy trend · last 14 days</h2>
          <div className="card">
            <div className="flex justify-between items-baseline mb-4">
              <div>
                <div className="text-[11px] text-muted uppercase tracking-wider">Average energy</div>
                <div className="text-3xl font-bold text-accent">{avgEnergy}<span className="text-base text-muted"> / 5</span></div>
              </div>
              <div className="text-xs text-text-dim">{energyHistory.length} check-ins</div>
            </div>
            {energyHistory.length === 0 ? (
              <p className="text-sm text-text-dim text-center py-6">No energy check-ins yet. Log one in Mission Drills tonight.</p>
            ) : (
              <div className="flex gap-1 items-end" style={{ height: "60px" }}>
                {energyHistory.map((e) => {
                  const heightPct = (e.energy / 5) * 100;
                  const color = e.energy >= 4 ? "bg-good" : e.energy >= 3 ? "bg-accent" : e.energy >= 2 ? "bg-warn" : "bg-hot";
                  return (
                    <div key={e.date} className="flex-1 flex flex-col items-center justify-end" title={`${e.date}: ${e.energy}/5`}>
                      <div className={`w-full rounded-t ${color}`} style={{ height: `${heightPct}%` }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <h2 className="text-xl font-semibold mt-7 mb-4">Weekly mantras</h2>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 0].map((day) => {
              const m = DAILY_MANTRAS[day];
              const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day];
              const isToday = day === dayOfWeek;
              return (
                <div key={day} className={`card ${isToday ? "!border-accent" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`text-xs font-bold uppercase w-10 ${isToday ? "text-accent" : "text-muted"}`}>{dayName}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold mb-1">{m.mantra}</div>
                      <div className="text-xs text-text-dim">{m.subtext}</div>
                    </div>
                    {isToday && <span className="badge bg-accent/20 text-accent">today</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WINS RESERVOIR */}
      {tab === "wins" && (
        <div>
          <div className="card !border-accent mb-4">
            <h3 className="text-base font-semibold text-accent mt-0 mb-2">The Wins Reservoir</h3>
            <p className="text-sm text-text-dim">
              Auto-populated from every Mission Log entry. When things feel heavy, open this page. The list of what you&apos;ve actually done is louder than the noise of what you haven&apos;t.
            </p>
          </div>

          {allWins.length === 0 ? (
            <div className="card text-center py-8">
              <div className="text-4xl mb-3">📓</div>
              <p className="text-sm text-text-dim">No wins logged yet. Mission Log → today&apos;s entry → Win field. Start small. Anything counts.</p>
            </div>
          ) : (
            <div>
              <div className="text-sm text-muted mb-3">{allWins.length} wins captured · {Math.round(allWins.length / 7 * 10) / 10} per week average</div>
              <div className="space-y-2">
                {allWins.map((w) => (
                  <div key={w.date} className="card !mb-0">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">🏆</div>
                      <div className="flex-1">
                        <div className="text-[11px] text-muted uppercase tracking-wider mb-1">
                          {new Date(w.date).toLocaleDateString("en-AU", { weekday: "long", month: "short", day: "numeric" })}
                        </div>
                        <div className="text-sm leading-relaxed">{w.win}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* REFRAMES */}
      {tab === "reframes" && (
        <div>
          <div className="card !border-accent mb-4">
            <h3 className="text-base font-semibold text-accent mt-0 mb-2">Reframe Library</h3>
            <p className="text-sm text-text-dim mb-3">
              Common negative loops + the actual reframe grounded in your platform&apos;s data. When the trigger shows up, the reframe is here.
            </p>
            <input
              type="text"
              value={reframeSearch}
              onChange={(e) => setReframeSearch(e.target.value)}
              placeholder="Search reframes... (e.g. 'ghosted', 'too long', 'broke me')"
              className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-3">
            {filteredReframes.map((r) => (
              <div key={r.trigger} className="card">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl flex-shrink-0">⚠️</div>
                  <div className="flex-1">
                    <div className="text-[10px] text-muted uppercase tracking-wider mb-1">When you catch yourself thinking</div>
                    <div className="text-base font-semibold text-hot">&ldquo;{r.trigger}&rdquo;</div>
                  </div>
                </div>
                <div className="border-l-3 border-good bg-good/5 rounded-r p-3 mb-2" style={{ borderLeftWidth: "3px" }}>
                  <div className="text-[10px] text-good uppercase tracking-wider mb-1">Reframe</div>
                  <p className="text-sm leading-relaxed">{r.reframe}</p>
                </div>
                <p className="text-[11px] text-muted">Source: {r.source}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WIND-DOWN */}
      {tab === "wind-down" && (
        <div>
          <div className="card !border-accent mb-4">
            <h3 className="text-base font-semibold text-accent mt-0 mb-2">Wind-Down Protocol · 6:30pm lockout</h3>
            <p className="text-sm text-text-dim">
              The platform shows a lockout overlay at 6:30pm to enforce the boundary. Soft-dismissable, but the reminder is there. Work-life balance is structural here, not a vibe.
            </p>
          </div>

          <h2 className="text-xl font-semibold mt-7 mb-3">5-step wind-down checklist</h2>
          <div className="card">
            {WIND_DOWN_CHECKLIST.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border last:border-b-0">
                <div className="text-accent font-bold w-6">{i + 1}.</div>
                <div className="text-sm">{item}</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-semibold mt-7 mb-3">Recovery protocols · what counts as &ldquo;work&rdquo; after 6:30pm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RECOVERY_PROTOCOLS.map((r) => (
              <div key={r.name} className="card">
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">{r.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold mt-0 mb-1">{r.name}</h3>
                    <p className="text-xs text-text-dim">{r.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card mt-5 !border-good bg-good/5">
            <h3 className="text-base font-semibold text-good mt-0 mb-2">The principle</h3>
            <p className="text-sm leading-relaxed">
              Recovery IS execution. The pipeline doesn&apos;t expire because you took the night off. The rocket fires harder on rested fuel. The week doesn&apos;t suffer for one properly enforced evening.
            </p>
          </div>
        </div>
      )}

      {/* CRISIS */}
      {tab === "crisis" && (
        <div>
          <div className="card !border-good bg-gradient-to-br from-good/5 to-surface mb-4">
            <h2 className="text-xl font-bold text-good mt-0 mb-3">{CRISIS_PROTOCOL.title}</h2>
            <div className="text-sm leading-relaxed whitespace-pre-line text-text">{CRISIS_PROTOCOL.body}</div>
          </div>

          <div className="card !border-accent">
            <h3 className="text-base font-semibold text-accent mt-0 mb-2">If today is genuinely heavy · 3 prompts</h3>
            <ol className="text-sm space-y-3 pl-5 list-decimal">
              <li><strong className="text-navy">Name one win from yesterday.</strong> Open the Wins Reservoir if you can&apos;t remember. There&apos;s always one.</li>
              <li><strong className="text-navy">Pick one recovery protocol</strong> (Walk, see someone, sleep) and actually do it within the next 2 hours.</li>
              <li><strong className="text-navy">Reach out to one person.</strong> A mentor, a friend, family. Not about the job hunt — just contact.</li>
            </ol>
          </div>

          <div className="card mt-5">
            <h3 className="text-base font-semibold mt-0 mb-2 text-navy">Mental health resources (Australia)</h3>
            <p className="text-sm text-text-dim mb-3">If today is genuinely hard in a way that needs real support, not just rest:</p>
            <ul className="text-sm space-y-1.5 pl-5 list-disc text-text-dim">
              <li><strong>Lifeline</strong> · 13 11 14 · 24/7 crisis support</li>
              <li><strong>Beyond Blue</strong> · 1300 22 4636 · mental health support</li>
              <li><strong>Headspace</strong> · headspace.org.au · for under-25s</li>
              <li>Your GP for a Mental Health Care Plan if things are persistent</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
