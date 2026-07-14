"use client";

// Mission Control dashboard · Starfield aesthetic
// Hero stats row · weekly targets · funnel bars · weekly progress chart · interview readiness · quick-jump cards
// Big numbers tiny labels · subtle borders not shadows · 2-accent palette · breathing whitespace

import { useMemo } from "react";
import Link from "next/link";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import { STAGES } from "@/lib/constants";
import { NavIcon } from "@/components/icons";
import type { AppState, Opportunity, Contact } from "@/lib/types";

const STAGE_LABELS: Record<string, string> = {
  targeting: "Targeting",
  contacted: "Contacted",
  applied: "Applied",
  early: "Early",
  late: "Late",
  offer: "Offer",
  accepted: "Accepted",
};

const WEEKLY_TARGETS = { apps: 12, outreach: 20, followups: 8 };

function startOfWeek(d = new Date()): Date {
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function isoDay(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function MissionControlV4({ state }: { state: AppState; update?: (fn: (s: AppState) => AppState) => void }) {
  // ── Merge seed + state ──
  const allOpps: Opportunity[] = useMemo(
    () => OPPORTUNITIES.map((o) => ({ ...o, ...(state.opps[o.id] || {}) }) as Opportunity),
    [state.opps],
  );

  // ── Readiness score · Discovery + Compass + Resume completion ──
  const readiness = useMemo(() => {
    let score = 0;
    let max = 0;
    max += 30;
    if (state.valuesProfile) score += 30;
    max += 20;
    if (state.careerHypothesis) score += 20;
    max += 20;
    if (state.resumeAudit) score += 20;
    max += 15;
    if (state.logistics) score += 15;
    max += 15;
    if (state.dealbreakers) score += 15;
    return Math.round((score / max) * 100);
  }, [state]);

  // ── Funnel + weekly + streak ──
  const stats = useMemo(() => {
    const active = allOpps.filter((o) => !["closed", "accepted"].includes(o.stage));
    const activeCount = active.length;

    const ws = startOfWeek();
    let apps = 0;
    let outreach = 0;
    let followups = 0;
    const weekly: { day: string; count: number; label: string }[] = [];
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(ws);
      d.setDate(ws.getDate() + i);
      const k = isoDay(d);
      const r = state.ritual?.[k] || { apps: 0, outreach: 0, followups: 0, practice: 0 };
      apps += r.apps || 0;
      outreach += r.outreach || 0;
      followups += r.followups || 0;
      const total = (r.apps || 0) + (r.outreach || 0) + (r.followups || 0);
      weekly.push({ day: dayLabels[i], count: total, label: k });
    }

    // Streak · consecutive days with any ritual activity, ending today or yesterday
    const ritualDays = Object.entries(state.ritual || {})
      .filter(([, r]) => (r.apps || 0) + (r.outreach || 0) + (r.followups || 0) > 0)
      .map(([d]) => d)
      .sort((a, b) => b.localeCompare(a));
    let streak = 0;
    if (ritualDays.length) {
      const today = isoDay(new Date());
      const yesterday = isoDay(new Date(Date.now() - 86400000));
      let cursor = ritualDays[0] === today || ritualDays[0] === yesterday ? new Date(ritualDays[0]) : null;
      if (cursor) {
        for (const d of ritualDays) {
          if (isoDay(cursor) === d) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // Funnel by stage
    const funnel = STAGES.map((s) => ({
      id: s.id,
      label: STAGE_LABELS[s.id] || s.label,
      count: allOpps.filter((o) => o.stage === s.id).length,
    }));
    const maxStageCount = Math.max(...funnel.map((f) => f.count), 1);

    return { activeCount, apps, outreach, followups, weekly, streak, funnel, maxStageCount };
  }, [allOpps, state.ritual]);

  // ── Imminent interviews · next 72h ──
  const imminent = useMemo(() => {
    const now = Date.now();
    const horizon = now + 72 * 60 * 60 * 1000;
    const slots: { opp: Opportunity; contact: Contact; when: Date }[] = [];
    for (const opp of allOpps) {
      for (const c of opp.contacts || []) {
        if (!c.meetingBookedFor) continue;
        const when = new Date(c.meetingBookedFor);
        if (when.getTime() < now - 4 * 60 * 60 * 1000) continue;
        if (when.getTime() > horizon) continue;
        slots.push({ opp, contact: c, when });
      }
    }
    return slots.sort((a, b) => a.when.getTime() - b.when.getTime());
  }, [allOpps]);

  // ── Phase % ──
  const phasePct = useMemo(() => {
    const totalActive = stats.activeCount;
    const advanced = allOpps.filter((o) => ["early", "late", "offer"].includes(o.stage)).length;
    if (totalActive === 0) return 0;
    return Math.round((advanced / totalActive) * 100);
  }, [stats.activeCount, allOpps]);

  const discoveryComplete = !!state.discoveryProgress?.completedAt;

  return (
    <div className="mb-8">
      {/* ── HERO STAT ROW · big numbers tiny labels ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Link href="/onboarding" className="bg-surface border border-border rounded-lg p-5 hover:border-accent/50 transition group relative">
          <div className="text-[10px] uppercase tracking-[2px] text-muted font-semibold mb-2">Readiness</div>
          <div className="font-mono text-[40px] font-bold leading-none text-text mb-1.5">{readiness}</div>
          <div className="text-[11px] text-text-dim leading-tight">
            {readiness < 30 ? "build foundation" : readiness < 70 ? "filling gaps" : readiness < 100 ? "near complete" : "fully calibrated"}
          </div>
          <span className="absolute top-3 right-3 font-mono text-[10px] text-muted/60 lowercase">mc.01</span>
        </Link>

        <Link href="/pipeline" className="bg-surface border border-border rounded-lg p-5 hover:border-accent/50 transition group relative">
          <div className="text-[10px] uppercase tracking-[2px] text-muted font-semibold mb-2">Active opps</div>
          <div className="font-mono text-[40px] font-bold leading-none text-text mb-1.5">{stats.activeCount}</div>
          <div className="text-[11px] text-text-dim leading-tight">in pipeline now</div>
          <span className="absolute top-3 right-3 font-mono text-[10px] text-muted/60 lowercase">mc.02</span>
        </Link>

        <div className="bg-surface border border-border rounded-lg p-5 relative">
          <div className="text-[10px] uppercase tracking-[2px] text-muted font-semibold mb-2 flex items-center gap-1.5">
            Streak
            {stats.streak > 0 && <span className="live-pulse" />}
          </div>
          <div className="font-mono text-[40px] font-bold leading-none text-text mb-1.5">{stats.streak}<span className="text-[24px] text-text-dim">d</span></div>
          <div className="text-[11px] text-text-dim leading-tight">{stats.streak === 0 ? "log today to start" : "execution streak"}</div>
          <span className="absolute top-3 right-3 font-mono text-[10px] text-muted/60 lowercase">mc.03</span>
        </div>

        <Link href="/interview-day" className="bg-surface border border-border rounded-lg p-5 hover:border-accent/50 transition group relative">
          <div className="text-[10px] uppercase tracking-[2px] text-muted font-semibold mb-2 flex items-center gap-1.5">
            Imminent
            {imminent.length > 0 && <span className="live-pulse" />}
          </div>
          <div className="font-mono text-[40px] font-bold leading-none text-text mb-1.5">{imminent.length}</div>
          <div className="text-[11px] text-text-dim leading-tight">interviews next 72h</div>
          <span className="absolute top-3 right-3 font-mono text-[10px] text-muted/60 lowercase">mc.04</span>
        </Link>
      </div>

      {/* ── RETRO STRIPE ACCENT ── */}
      <div className="retro-band mb-6"><span /><span /></div>

      {/* ── WEEKLY TARGETS ── */}
      <div className="bg-surface border border-border rounded-lg p-5 mb-4 relative">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-[14px] font-semibold text-text m-0">Weekly Targets</h3>
          <span className="text-[10px] uppercase tracking-[1.5px] text-muted font-mono">mon-sun · resets weekly</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <WeeklyTargetTile label="Applications" value={stats.apps} target={WEEKLY_TARGETS.apps} />
          <WeeklyTargetTile label="Outreach" value={stats.outreach} target={WEEKLY_TARGETS.outreach} />
          <WeeklyTargetTile label="Follow-ups" value={stats.followups} target={WEEKLY_TARGETS.followups} />
        </div>
        <span className="absolute top-3 right-3 font-mono text-[10px] text-muted/60 lowercase">mc.05</span>
      </div>

      {/* ── FUNNEL BARS + WEEKLY PROGRESS · side-by-side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Job Tracker Funnel */}
        <div className="bg-surface border border-border rounded-lg p-5 relative">
          <h3 className="text-[14px] font-semibold text-text mb-4">Job Tracker Funnel</h3>
          <div className="space-y-2.5">
            {stats.funnel.map((f) => {
              const widthPct = Math.max((f.count / stats.maxStageCount) * 100, f.count > 0 ? 8 : 2);
              return (
                <div key={f.id} className="flex items-center gap-3">
                  <span className="text-[11px] text-text-dim w-[72px] flex-shrink-0">{f.label}</span>
                  <div className="flex-1 bg-surface-2 rounded h-6 relative overflow-hidden">
                    <div
                      className="h-full bg-accent rounded transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                    <span className="absolute inset-0 flex items-center px-2 font-mono text-[12px] font-bold text-text">
                      {f.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <span className="absolute top-3 right-3 font-mono text-[10px] text-muted/60 lowercase">mc.06</span>
        </div>

        {/* Weekly Progress mini chart */}
        <div className="bg-surface border border-border rounded-lg p-5 relative">
          <div className="flex items-baseline justify-between mb-4 flex-wrap">
            <h3 className="text-[14px] font-semibold text-text m-0">Weekly Progress</h3>
            <span className="text-[10px] uppercase tracking-[1.5px] text-muted font-mono">total · {stats.apps + stats.outreach + stats.followups}</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {stats.weekly.map((d) => {
              const max = Math.max(...stats.weekly.map((w) => w.count), 1);
              const heightPct = (d.count / max) * 100;
              const isToday = d.label === isoDay(new Date());
              return (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className={`w-full rounded-sm transition-all ${isToday ? "bg-accent" : "bg-cool/40"}`}
                      style={{ height: `${Math.max(heightPct, d.count > 0 ? 5 : 2)}%` }}
                      title={`${d.day} · ${d.count} actions`}
                    />
                  </div>
                  <span className={`font-mono text-[10px] ${isToday ? "text-accent font-bold" : "text-muted"}`}>{d.day}</span>
                </div>
              );
            })}
          </div>
          <span className="absolute top-3 right-3 font-mono text-[10px] text-muted/60 lowercase">mc.07</span>
        </div>
      </div>

      {/* ── INTERVIEW READINESS · invitation-to-action ── */}
      {imminent.length > 0 ? (
        <Link
          href="/interview-day"
          className="block bg-accent/8 border border-accent/30 rounded-lg p-5 mb-4 hover:border-accent transition group"
        >
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="text-[10px] uppercase tracking-[2px] text-accent font-bold mb-2">Interview imminent</div>
              <h3 className="text-[18px] font-semibold text-text m-0 mb-1.5">
                {imminent.length === 1
                  ? `${imminent[0].opp.company} · ${imminent[0].when.toLocaleTimeString("en-AU", { weekday: "short", hour: "numeric", minute: "2-digit" })}`
                  : `${imminent.length} screens scheduled in next 72 hours`}
              </h3>
              <p className="text-[13px] text-text-dim m-0 leading-relaxed">
                Open Interview Day for pre-call checklists, in-call cheat sheets, and post-call thank-you templates.
              </p>
            </div>
            <span className="px-4 py-2.5 bg-accent text-white rounded-md font-bold text-[13px] whitespace-nowrap group-hover:bg-accent-2 transition self-center">
              Open Interview Day →
            </span>
          </div>
        </Link>
      ) : !state.valuesProfile ? (
        <Link
          href="/onboarding"
          className="block bg-accent/8 border border-accent/30 rounded-lg p-5 mb-4 hover:border-accent transition group"
        >
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="text-[10px] uppercase tracking-[2px] text-accent font-bold mb-2">Start here</div>
              <h3 className="text-[18px] font-semibold text-text m-0 mb-1.5">Run Discovery to wake the platform up</h3>
              <p className="text-[13px] text-text-dim m-0 leading-relaxed">
                Mission Compass · Career Hypothesis · Resume Audit · Logistics · Dealbreakers · Network Seed · roughly 20 minutes.
              </p>
            </div>
            <span className="px-4 py-2.5 bg-accent text-white rounded-md font-bold text-[13px] whitespace-nowrap group-hover:bg-accent-2 transition self-center">
              Begin Discovery →
            </span>
          </div>
        </Link>
      ) : null}

      {/* ── QUICK-JUMP CARDS · bottom navigation ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <QuickJumpCard
          href={discoveryComplete ? "/probes" : "/onboarding"}
          iconName={discoveryComplete ? "Probe" : "Sparkle"}
          label={discoveryComplete ? "Probes Inbox" : "Discovery"}
          meta={discoveryComplete ? "triage queue" : "front door"}
        />
        <QuickJumpCard href="/pipeline" iconName="Orbit" label="Pipeline" meta={`${stats.activeCount} active`} />
        <QuickJumpCard href="/interview-day" iconName="Reticle" label="Interview Day" meta={`${imminent.length} imminent`} />
        <QuickJumpCard href="/decision-journal" iconName="FieldJournal" label="Decision Journal" meta="empirical loop" />
      </div>

      {/* ── CURRENT PHASE strip · subtle, no shadow ── */}
      <div className="bg-surface-2 border border-border rounded-lg p-4 flex items-center justify-between gap-3 flex-wrap mb-2">
        <div className="flex items-center gap-3 flex-wrap min-w-[200px]">
          <span className="text-[10px] uppercase tracking-[2px] text-muted font-semibold">Pipeline depth</span>
          <span className="text-[14px] font-semibold text-text">{phasePct}% in late-stage motion</span>
        </div>
        <div className="flex-1 max-w-[260px] min-w-[140px]">
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${phasePct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Subcomponents ──

function WeeklyTargetTile({ label, value, target }: { label: string; value: number; target: number }) {
  const pct = Math.min(Math.round((value / target) * 100), 100);
  const onTrack = pct >= 50;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[2px] text-muted font-semibold mb-2">{label}</div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-mono text-[34px] font-bold leading-none text-text">{value}</span>
        <span className="font-mono text-[14px] text-muted">/ {target}</span>
      </div>
      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full rounded-full transition-all duration-500 ${onTrack ? "bg-good" : "bg-warn"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="font-mono text-[10px] text-text-dim">{pct}% of weekly target</div>
    </div>
  );
}

function QuickJumpCard({ href, iconName, label, meta }: { href: string; iconName: string; label: string; meta: string }) {
  return (
    <Link
      href={href}
      className="bg-surface border border-border rounded-lg p-4 hover:border-accent/50 transition group"
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="text-accent">
          <NavIcon name={iconName} size={18} strokeWidth={1.75} />
        </span>
        <span className="text-[13px] font-semibold text-text">{label}</span>
      </div>
      <div className="font-mono text-[11px] text-muted">{meta} →</div>
    </Link>
  );
}
