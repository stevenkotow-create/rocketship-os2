"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState, today, weekStart, resetState } from "@/lib/storage";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import { FUNNEL_STAGES, STAGES } from "@/lib/constants";
import { calculateXP, getRank, getEarnedAchievements } from "@/lib/xp";
import { getTodaysQuote } from "@/lib/data/resilience";
import { computeStakeholderHealth, healthColour, healthLabel } from "@/lib/star-map";
import type { TriageStatus, AppState } from "@/lib/types";
import { TodayActions } from "@/components/TodayActions";
import { MissionControlV4 } from "@/components/MissionControlV4";

// V2.4 · Global Assets card · Loom + Gamma URLs stored once, used everywhere
function GlobalAssetsCard({ state, update }: { state: AppState; update: (fn: (s: AppState) => AppState) => void }) {
  const [editing, setEditing] = useState(false);
  const assets = state.globalAssets || {};
  const [loomDraft, setLoomDraft] = useState(assets.loomUrl || "");
  const [gammaDraft, setGammaDraft] = useState(assets.gammaUrl || "");

  function save() {
    update((s) => ({
      ...s,
      globalAssets: {
        loomUrl: loomDraft.trim() || undefined,
        gammaUrl: gammaDraft.trim() || undefined,
        updatedAt: new Date().toISOString(),
      },
    }));
    setEditing(false);
  }

  const hasLoom = !!assets.loomUrl;
  const hasGamma = !!assets.gammaUrl;
  const allSet = hasLoom && hasGamma;

  return (
    <div className={`mb-6 border rounded-xl p-4 ${
      allSet ? "bg-good/5 border-good/30" : "bg-gradient-to-r from-warn/10 via-warn/5 to-transparent border-warn/30"
    }`}>
      <div className="flex items-start gap-3 flex-wrap">
        <span className="text-2xl flex-shrink-0">{allSet ? "🎯" : "⚠️"}</span>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <span className="text-[14px] font-bold text-navy">Global Volume Assets</span>
            {allSet ? (
              <span className="text-[10px] font-bold text-good bg-good/15 px-2 py-0.5 rounded">READY</span>
            ) : (
              <span className="text-[10px] font-bold text-warn bg-warn/20 px-2 py-0.5 rounded">{(!hasLoom ? 1 : 0) + (!hasGamma ? 1 : 0)} MISSING</span>
            )}
          </div>
          <p className="text-[12px] text-text-dim">
            One Loom + one Gamma deck shared across every HM follow-up DM. Drop once, used everywhere [LOOM LINK] + [GAMMA LINK] placeholders appear.
          </p>
          {!editing && (
            <div className="mt-2 space-y-1 text-[11px] font-mono">
              <div className="flex items-baseline gap-2">
                <span className="text-muted w-14">Loom:</span>
                <span className={`flex-1 truncate ${hasLoom ? "text-cool" : "text-warn italic"}`}>{assets.loomUrl || "not set"}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-muted w-14">Gamma:</span>
                <span className={`flex-1 truncate ${hasGamma ? "text-cool" : "text-warn italic"}`}>{assets.gammaUrl || "not set"}</span>
              </div>
            </div>
          )}
          {editing && (
            <div className="mt-3 space-y-2">
              <input
                type="url"
                value={loomDraft}
                onChange={(e) => setLoomDraft(e.target.value)}
                placeholder="Loom URL · https://www.loom.com/share/..."
                className="w-full text-[12px] font-mono px-2 py-1.5 border border-border rounded bg-surface text-navy"
              />
              <input
                type="url"
                value={gammaDraft}
                onChange={(e) => setGammaDraft(e.target.value)}
                placeholder="Gamma URL · https://gamma.app/docs/..."
                className="w-full text-[12px] font-mono px-2 py-1.5 border border-border rounded bg-surface text-navy"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          {editing ? (
            <>
              <button onClick={save} className="px-3 py-1.5 bg-good text-white rounded text-[11px] font-bold">Save</button>
              <button onClick={() => { setLoomDraft(assets.loomUrl || ""); setGammaDraft(assets.gammaUrl || ""); setEditing(false); }} className="px-3 py-1.5 text-muted text-[11px]">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="px-3 py-1.5 bg-surface border border-border hover:border-accent text-navy rounded text-[11px] font-semibold">
              {allSet ? "Edit" : "Set URLs"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MissionControl() {
  const [state, update] = useAppState();
  const xp = calculateXP(state);
  const { currentRank, nextRank, progressPct } = getRank(xp);
  const achievements = getEarnedAchievements(state);
  const earnedCount = achievements.filter((a) => a.earned).length;
  const quote = getTodaysQuote();

  // Live opps (live: true OR stages early/late)
  const allOpps = OPPORTUNITIES.map((o) => ({ ...o, ...(state.opps[o.id] || {}) }));
  const liveOpps = allOpps.filter((o) => o.live || o.stage === "early" || o.stage === "late");

  // Weekly cadence
  const ws = new Date(weekStart());
  let weekTotals = { apps: 0, outreach: 0, followups: 0, practice: 0 };
  for (let i = 0; i < 7; i++) {
    const d = new Date(ws);
    d.setDate(ws.getDate() + i);
    const k = d.toISOString().split("T")[0];
    const r = state.ritual[k] || { apps: 0, outreach: 0, followups: 0, practice: 0 };
    weekTotals.apps += r.apps;
    weekTotals.outreach += r.outreach;
    weekTotals.followups += r.followups;
    weekTotals.practice += r.practice;
  }

  // Funnel snapshot
  const funnel = FUNNEL_STAGES.map((s) => {
    const count = allOpps.filter((o) => (s.stages as readonly string[]).includes(o.stage)).length;
    const health = count < s.target[0] ? "hot" : count <= s.target[1] ? "good" : "warn";
    return { ...s, count, health };
  });

  // Velocity stats · time invested per mission
  const shippedOpps = allOpps.filter((o) => o.hoursSpent !== undefined && o.hoursSpent > 0);
  const totalHours = shippedOpps.reduce((s, o) => s + (o.hoursSpent || 0), 0);
  const avgHours = shippedOpps.length > 0 ? totalHours / shippedOpps.length : 0;
  const fastestMission = shippedOpps.length > 0 ? shippedOpps.reduce((a, b) => ((a.hoursSpent ?? 0) < (b.hoursSpent ?? 0) ? a : b)) : null;
  const slowestMission = shippedOpps.length > 0 ? shippedOpps.reduce((a, b) => ((a.hoursSpent ?? 0) > (b.hoursSpent ?? 0) ? a : b)) : null;

  // V2.1 · Probes Inbox · Tinder triage queue from morning + midday probes
  // Show pending probes + approved-awaiting-action probes
  // Daily cap of 5 pending visible to prevent decision fatigue
  function getTriageStatus(oppId: string): TriageStatus | undefined {
    const stateTriage = state.opps[oppId]?.triage;
    const seedTriage = OPPORTUNITIES.find((o) => o.id === oppId)?.triage;
    return (stateTriage || seedTriage)?.status;
  }
  const pendingProbes = allOpps
    .filter((o) => getTriageStatus(o.id) === "pending")
    .slice(0, 5);
  const approvedProbes = allOpps.filter((o) => getTriageStatus(o.id) === "approved");
  const watchlistProbes = allOpps.filter((o) => getTriageStatus(o.id) === "watchlist");

  function triageProbe(id: string, status: TriageStatus, denialReason?: string) {
    // Find seed triage (surfacedAt / surfacedBy) from OPPORTUNITIES so we preserve required fields
    const seedOpp = OPPORTUNITIES.find((o) => o.id === id);
    const seedTriage = seedOpp?.triage;
    if (!seedTriage) return;
    update((s) => {
      const existing = s.opps[id] || {};
      const stateTriage = existing.triage;
      return {
        ...s,
        opps: {
          ...s.opps,
          [id]: {
            ...existing,
            triage: {
              ...seedTriage,
              ...(stateTriage || {}),
              status,
              decidedAt: new Date().toISOString(),
              ...(denialReason ? { denialReason } : {}),
              ...(status === "later" ? { laterUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() } : {}),
            },
          },
        },
      };
    });
  }

  // V2.2 · Copy URL + standardised eval prompt to clipboard for one-tap drop to Claude chat
  function copyPromptToClipboard(url: string, company: string) {
    const prompt = `Action this through the evaluator: ${url}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(prompt).then(() => {
        // No native toast yet · the visual confirmation lives on the card via approved state
        // eslint-disable-next-line no-console
        console.log(`[ORS] Copied evaluator prompt for ${company} to clipboard`);
      });
    }
  }

  // V2 · Stakeholder Health · the operator playbook surface
  // For every active opp, compute whether HM + Recruiter + Peer are engaged
  const activeOpps = allOpps.filter((o) => !["closed", "accepted"].includes(o.stage));
  const healthByOpp = activeOpps.map((o) => ({
    id: o.id,
    company: o.company,
    health: computeStakeholderHealth(o.contacts),
  }));
  const complete = healthByOpp.filter((h) => h.health === "complete").length;
  const partial = healthByOpp.filter((h) => h.health === "partial").length;
  const single = healthByOpp.filter((h) => h.health === "single-thread").length;
  const unthreaded = healthByOpp.filter((h) => h.health === "unthreaded").length;
  const needsAttention = single + unthreaded;

  return (
    <div>
      {/* V3.6 · Mission Control header · clean title + tiny demo reset link */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-text mb-1.5">Mission Control</h1>
          <p className="text-[14px] text-text-dim m-0">
            Operation Rocket Ship · the job ASSESSOR grounded in 12 peer-reviewed frameworks.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm("Reset to the demo pipeline? This wipes your local browser state and reloads.")) {
              resetState();
            }
          }}
          className="text-[11px] text-muted hover:text-text underline whitespace-nowrap"
        >
          Reset to demo
        </button>
      </div>

      {/* Mission-shape dashboard · hero stats + weekly targets + funnel + weekly progress + quick-jump cards */}
      <MissionControlV4 state={state} />

      {/* V3.0 · The "Today" surface · live action feed with checkboxes
          Sits below the dashboard now · the day's pending actions, post-context */}
      <TodayActions />

      {/* V2.4 · GLOBAL ASSETS · one place to drop Loom + Gamma URLs · auto-fills every DM draft */}
      <GlobalAssetsCard state={state} update={update} />

      {/* V2.3 · PROBES SUMMARY · companies auto-evaluated, branch to Apply or Watch */}
      {(pendingProbes.length > 0 || approvedProbes.length > 0 || watchlistProbes.length > 0) && (
        <Link
          href="/probes"
          className="mb-6 flex items-center gap-3 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/30 rounded-xl p-4 hover:border-accent transition group"
        >
          <span className="text-3xl flex-shrink-0 relative">
            🛰
            {pendingProbes.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-hot ring-2 ring-surface animate-pulse" />
            )}
          </span>
          <div className="flex-1">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-[14px] font-bold text-navy">Probes Inbox</span>
              {pendingProbes.length > 0 && (
                <span className="text-[11px] font-bold tracking-wider text-hot bg-hot/15 px-2 py-0.5 rounded">
                  {pendingProbes.length} pending
                </span>
              )}
              {approvedProbes.length > 0 && (
                <span className="text-[11px] font-bold tracking-wider text-good bg-good/15 px-2 py-0.5 rounded">
                  🚀 {approvedProbes.length} applying
                </span>
              )}
              {watchlistProbes.length > 0 && (
                <span className="text-[11px] font-bold tracking-wider text-cool bg-cool/15 px-2 py-0.5 rounded">
                  👁 {watchlistProbes.length} on watch
                </span>
              )}
            </div>
            <p className="text-[12px] text-text-dim mt-1">
              {pendingProbes.length > 0
                ? `Companies auto-evaluated with live APAC roles surfaced · Apply (pick a role → Playbook drafts) or Watch (30-day re-probe)`
                : `Apply queue + Watchlist relationship builds · re-probe runs at 7am AEST tomorrow`}
            </p>
          </div>
          <span className="text-accent text-sm font-semibold opacity-0 group-hover:opacity-100 transition flex-shrink-0">Open →</span>
        </Link>
      )}

      {/* Daily Quote · POD opener */}
      <div className="bg-gradient-to-r from-navy/10 via-accent/5 to-gold/10 border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl flex-shrink-0 opacity-80">✨</div>
          <div className="flex-1">
            <div className="label-caps mb-2">Today&apos;s transmission</div>
            <p className="text-[16px] leading-[1.55] text-navy font-medium italic">&ldquo;{quote.quote}&rdquo;</p>
            <p className="text-[12px] text-text-dim mt-3">
              — <strong className="text-navy">{quote.author}</strong>
              {quote.context && <span className="text-muted"> · {quote.context}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Rank + Phase Heroes side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Rank hero */}
        <div className="bg-gradient-to-br from-surface-2 to-surface border border-accent/40 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="text-5xl">{currentRank.icon}</div>
          <div className="flex-1">
            <div className="label-caps">Rank</div>
            <div className="text-[17px] font-bold text-navy leading-tight mt-0.5">Lvl {currentRank.level} · {currentRank.name}</div>
            <div className="text-[12px] text-text-dim mt-0.5">{xp.toLocaleString()} XP · {earnedCount}/13 achievements</div>
            <div className="progress-track mt-2">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        {/* V2 · Stakeholder Health · the operator playbook surface · replaces hardcoded Phase 1 placeholder */}
        <Link
          href="/threads"
          className="bg-gradient-to-br from-surface-2 to-surface border border-accent/40 rounded-xl p-5 shadow-sm hover:border-accent hover:shadow-md transition-all block group"
        >
          <div className="label-caps flex items-center gap-2">
            <span>Star Map · stakeholder health</span>
            <span className="text-[9px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">V2</span>
          </div>
          <div className="text-[17px] font-bold text-navy leading-tight mt-0.5">
            {complete} of {healthByOpp.length} fully threaded
          </div>
          <div className="text-[12px] text-text-dim mb-2 mt-0.5">
            {needsAttention > 0
              ? `${needsAttention} opp${needsAttention !== 1 ? "s" : ""} need stakeholder attention · HM + Recruiter + Peer`
              : "Every active opp has 3-stakeholder coverage"}
          </div>
          <div className="flex gap-1.5 mt-2">
            {complete > 0 && <div className="h-1.5 rounded-full bg-good" style={{ flex: complete }} />}
            {partial > 0 && <div className="h-1.5 rounded-full bg-accent" style={{ flex: partial }} />}
            {single > 0 && <div className="h-1.5 rounded-full bg-warn" style={{ flex: single }} />}
            {unthreaded > 0 && <div className="h-1.5 rounded-full bg-hot" style={{ flex: unthreaded }} />}
          </div>
          <div className="text-[11px] text-accent mt-3 opacity-0 group-hover:opacity-100 transition font-semibold">Open Star Map →</div>
        </Link>
      </div>

      {/* Mission Velocity */}
      {shippedOpps.length > 0 && (
        <div>
          <h2 className="section-title">⏱ Mission Velocity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="stat">
              <div className="label-caps">Avg hrs / mission</div>
              <div className="text-data-xl text-accent mt-2">{avgHours.toFixed(1)}</div>
              <div className="text-[11px] text-text-dim mt-1.5">target: ≤2 hrs reuse · 3-5 hrs first</div>
            </div>
            <div className="stat">
              <div className="label-caps">Total hrs invested</div>
              <div className="text-data-xl text-navy mt-2">{totalHours.toFixed(1)}</div>
              <div className="text-[11px] text-text-dim mt-1.5">{shippedOpps.length} mission{shippedOpps.length !== 1 ? "s" : ""} shipped</div>
            </div>
            {fastestMission && (
              <Link href={`/mission/${fastestMission.id}`} className="stat hover:border-good hover:shadow-md transition-all">
                <div className="label-caps">Fastest mission</div>
                <div className="text-data-xl text-good mt-2">{fastestMission.hoursSpent}<span className="text-[16px] text-text-dim">h</span></div>
                <div className="text-[11px] text-text-dim mt-1.5">{fastestMission.company}</div>
              </Link>
            )}
            {slowestMission && (
              <Link href={`/mission/${slowestMission.id}`} className="stat hover:border-warn hover:shadow-md transition-all">
                <div className="label-caps">Slowest mission</div>
                <div className="text-data-xl text-warn mt-2">{slowestMission.hoursSpent}<span className="text-[16px] text-text-dim">h</span></div>
                <div className="text-[11px] text-text-dim mt-1.5">{slowestMission.company}</div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Live Opportunities */}
      <h2 className="section-title">Live Opportunities · Action Today</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3 mb-6">
        {liveOpps.map((o) => (
          <Link
            key={o.id}
            href={`/mission/${o.id}`}
            className="bg-surface border border-border rounded-xl p-5 relative block hover:border-accent hover:shadow-md transition-all group"
          >
            <div className="absolute top-4 right-4 w-2 h-2 bg-cool rounded-full animate-pulse" />
            <div className="text-[15px] font-bold text-navy leading-tight">{o.company}</div>
            <div className="text-[12px] text-text-dim mt-1 mb-3 leading-snug">{o.position}</div>
            <div className="text-[11px] text-muted">{o.daysInStage}d in stage</div>
            <div className="text-[12px] text-cool font-medium mt-2 leading-snug">▶ {o.action || "Action pending"}</div>
            <div className="text-[11px] text-accent mt-3 opacity-0 group-hover:opacity-100 transition font-semibold">Open Mission Profile →</div>
          </Link>
        ))}
      </div>

      {/* Weekly Cadence */}
      <h2 className="section-title">Weekly Cadence · Mon–Sun</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Applications", val: weekTotals.apps, target: 12 },
          { label: "Outreach", val: weekTotals.outreach, target: 20 },
          { label: "Follow-ups", val: weekTotals.followups, target: 8 },
          { label: "Practice", val: weekTotals.practice, target: 105, unit: " min" },
        ].map((s) => (
          <div key={s.label} className="stat">
            <div className="label-caps">{s.label}</div>
            <div className="text-data-xl mt-2 text-navy">
              <span>{s.val}</span>
              <span className="text-[14px] text-muted font-normal">
                {" "}/ {s.target}{s.unit || ""}
              </span>
            </div>
            <div className="progress-track mt-2.5">
              <div className="progress-fill" style={{ width: `${Math.min(100, (s.val / s.target) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Funnel Snapshot · compact pill row */}
      <h2 className="section-title">Pipeline Health</h2>
      <Link href="/trajectory" className="block bg-surface border border-border rounded-xl p-5 hover:border-accent hover:shadow-md transition-all mb-4 group">
        <div className="grid grid-cols-5 gap-3">
          {funnel.map((f, i) => (
            <div key={f.id} className={`relative ${i < funnel.length - 1 ? "border-r border-border pr-3" : ""}`}>
              <div className="flex items-baseline gap-2">
                <div className={`text-data-lg ${f.health === "good" ? "text-good" : f.health === "warn" ? "text-warn" : "text-hot"}`}>
                  {f.count}
                </div>
                <div className="text-[10px] text-muted">/{f.target[0]}–{f.target[1]}</div>
              </div>
              <div className="text-[11px] text-text-dim mt-1.5 leading-tight font-medium">{f.icon} {f.name.split(" · ")[1] || f.name}</div>
              <div className={`text-[9px] uppercase tracking-wider mt-1 font-semibold ${f.health === "good" ? "text-good" : f.health === "warn" ? "text-warn" : "text-hot"}`}>
                {f.health === "good" ? "On target" : f.health === "warn" ? "Heavy" : `Need ${f.target[0] - f.count}`}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-accent mt-4 opacity-0 group-hover:opacity-100 transition font-semibold">Open Trajectory Density →</div>
      </Link>

      {/* Rocket Ranker · cross-company standardised leaderboard */}
      <Link href="/rocket-ranker" className="block bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/40 rounded-xl p-5 hover:border-accent hover:shadow-md transition-all mb-6 group">
        <div className="flex items-center gap-4">
          <span className="text-3xl flex-shrink-0">🚀</span>
          <div className="flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[14px] font-bold text-navy">Rocket Ranker</span>
              <span className="text-[10px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded">V1</span>
              <span className="text-[10px] font-semibold text-text-dim">Cross-company leaderboard</span>
            </div>
            <p className="text-[12px] text-text-dim mt-1 leading-snug">
              Six-Dimension Evaluator × Role-Shape Fit · tiered P1/P2/Watchlist/Jettison · APAC gate applied · sortable + filterable
            </p>
          </div>
          <span className="text-accent text-sm font-semibold opacity-0 group-hover:opacity-100 transition flex-shrink-0">Open Ranker →</span>
        </div>
      </Link>
    </div>
  );
}
