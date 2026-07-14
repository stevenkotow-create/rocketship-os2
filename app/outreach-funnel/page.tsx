"use client";

// V5 · Outreach Funnel
// The marketing-funnel view of every outreach thread across every opp.
// Top: Today + This Week + Stale + Total active.
// Middle: Today's Touchlist · who needs follow-up TODAY in chronological order.
// Bottom: 6-stage funnel kanban grouped by ContactStatus.
// Click any contact card to log a touch / advance stage / add a note.
// Solves the "tracking who we are reaching out to and when we need to follow up" gap.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppState, today } from "@/lib/storage";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import { NavIcon } from "@/components/icons";
import type { AppState, Opportunity, Contact, ContactStatus } from "@/lib/types";

// ── Funnel stage configuration ──
// textClass + countClass kept as static strings so Tailwind JIT picks them up
const FUNNEL_STAGES: Array<{
  status: ContactStatus;
  label: string;
  description: string;
  textClass: string;
  countClass: string;
  badge: string;
}> = [
  { status: "identified", label: "Identified", description: "Researched · not contacted", textClass: "text-muted", countClass: "text-muted", badge: "01" },
  { status: "silent", label: "Pre-touch / Connect", description: "Engagement cadence or silent connect sent", textClass: "text-cool", countClass: "text-cool", badge: "02" },
  { status: "dm", label: "DM Sent", description: "Post-connect follow-up sent", textClass: "text-warn", countClass: "text-warn", badge: "03" },
  { status: "replied", label: "In Conversation", description: "They replied · live thread", textClass: "text-accent", countClass: "text-accent", badge: "04" },
  { status: "advanced", label: "Advanced", description: "Meeting booked or referral made", textClass: "text-good", countClass: "text-good", badge: "05" },
  { status: "cold", label: "Cold / Stalled", description: "No reply or thread died", textClass: "text-hot", countClass: "text-hot", badge: "06" },
];

// Metric tone → text class · static for Tailwind JIT
const METRIC_TONE_CLASS: Record<string, string> = {
  hot: "text-hot",
  warn: "text-warn",
  accent: "text-accent",
  good: "text-good",
  muted: "text-muted",
};

// ── Per-status follow-up cadence (days until next touch needed) ──
const FOLLOWUP_CADENCE: Record<ContactStatus, number> = {
  identified: 2,    // research → silent connect within 2 days
  silent: 6,        // silent connect → DM at day 5-7
  dm: 7,            // DM → followup at day 7
  replied: 1,       // reply → respond within 24 hrs
  advanced: 14,     // post-meeting → check-in at 2 weeks
  cold: 30,         // cold → re-warm at 30 days
};

interface TrackedContact extends Contact {
  oppId: string;
  oppCompany: string;
  oppPosition: string;
  daysSinceTouch: number;
  daysUntilNextTouch: number; // negative = overdue
  nextActionLabel: string;
  isOverdue: boolean;
  isToday: boolean;
  isThisWeek: boolean;
}

function daysBetween(iso: string | undefined, ref: Date = new Date()): number {
  if (!iso) return Infinity;
  const d = new Date(iso);
  return Math.floor((ref.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function computeNextAction(status: ContactStatus): string {
  switch (status) {
    case "identified": return "Start pre-touch engagement or silent connect";
    case "silent": return "Send post-connect DM (Day 5-7 window)";
    case "dm": return "Follow-up DM if no reply";
    case "replied": return "Respond within 24 hours";
    case "advanced": return "Check-in / nurture";
    case "cold": return "Re-warm with a value drop";
  }
}

export default function OutreachFunnel() {
  const [state, update] = useAppState();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Merge seed + state contacts
  const tracked: TrackedContact[] = useMemo(() => {
    const allOpps: Opportunity[] = OPPORTUNITIES.map((o) => {
      const override = state.opps[o.id] as Partial<Opportunity> | undefined;
      return { ...o, ...override, contacts: override?.contacts ?? o.contacts };
    });

    const out: TrackedContact[] = [];
    for (const opp of allOpps) {
      if (!opp.contacts) continue;
      // Skip closed-out missions
      if (opp.stage === "closed" || opp.stage === "accepted") continue;
      for (const c of opp.contacts) {
        const status = c.status;
        const lastTouch = c.lastTouchAt || c.contactedAt;
        const daysSinceTouch = lastTouch ? daysBetween(lastTouch) : Infinity;
        const cadence = FOLLOWUP_CADENCE[status];
        const daysUntilNextTouch = cadence - daysSinceTouch;
        out.push({
          ...c,
          oppId: opp.id,
          oppCompany: opp.company,
          oppPosition: opp.position,
          daysSinceTouch,
          daysUntilNextTouch,
          nextActionLabel: computeNextAction(status),
          isOverdue: daysUntilNextTouch < 0,
          isToday: daysUntilNextTouch <= 0 && daysUntilNextTouch > -1,
          isThisWeek: daysUntilNextTouch <= 7 && daysUntilNextTouch > 0,
        });
      }
    }
    return out;
  }, [state]);

  // ── Aggregate metrics ──
  const metrics = useMemo(() => {
    const todayCount = tracked.filter((c) => c.daysUntilNextTouch <= 0 && c.status !== "cold").length;
    const weekCount = tracked.filter((c) => c.daysUntilNextTouch > 0 && c.daysUntilNextTouch <= 7).length;
    const staleCount = tracked.filter((c) => c.daysSinceTouch > 14 && c.status !== "cold" && c.status !== "identified").length;
    const totalActive = tracked.filter((c) => c.status !== "cold").length;
    return { todayCount, weekCount, staleCount, totalActive };
  }, [tracked]);

  // ── Today's touchlist · sorted by most overdue first ──
  const todayList = useMemo(() => {
    return tracked
      .filter((c) => c.daysUntilNextTouch <= 0 && c.status !== "cold")
      .sort((a, b) => a.daysUntilNextTouch - b.daysUntilNextTouch);
  }, [tracked]);

  // ── Funnel grouping ──
  const funnelGroups = useMemo(() => {
    const groups: Record<ContactStatus, TrackedContact[]> = {
      identified: [], silent: [], dm: [], replied: [], advanced: [], cold: [],
    };
    for (const c of tracked) groups[c.status].push(c);
    // Within each group, sort by overdue first
    for (const key of Object.keys(groups) as ContactStatus[]) {
      groups[key].sort((a, b) => a.daysUntilNextTouch - b.daysUntilNextTouch);
    }
    return groups;
  }, [tracked]);

  // ── Mutation: log a touch event ──
  function logTouch(oppId: string, contactName: string) {
    update((s: AppState) => {
      const overrideOpp = s.opps[oppId] || {};
      const seedOpp = OPPORTUNITIES.find((o) => o.id === oppId);
      const baseContacts = (overrideOpp.contacts || seedOpp?.contacts || []) as Contact[];
      const updated = baseContacts.map((c) =>
        c.name === contactName ? { ...c, lastTouchAt: new Date().toISOString() } : c
      );
      return { ...s, opps: { ...s.opps, [oppId]: { ...overrideOpp, contacts: updated } } };
    });
  }

  // ── Mutation: advance stage (status) ──
  function advanceStage(oppId: string, contactName: string, newStatus: ContactStatus) {
    update((s: AppState) => {
      const overrideOpp = s.opps[oppId] || {};
      const seedOpp = OPPORTUNITIES.find((o) => o.id === oppId);
      const baseContacts = (overrideOpp.contacts || seedOpp?.contacts || []) as Contact[];
      const updated = baseContacts.map((c) =>
        c.name === contactName
          ? { ...c, status: newStatus, lastTouchAt: new Date().toISOString(), contactedAt: c.contactedAt || today() }
          : c
      );
      return { ...s, opps: { ...s.opps, [oppId]: { ...overrideOpp, contacts: updated } } };
    });
  }

  function makeKey(c: TrackedContact) { return `${c.oppId}:${c.name}`; }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      {/* ── HEADER ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-accent"><NavIcon name="Constellation" size={28} strokeWidth={1.5} /></span>
          <h1 className="text-[28px] font-bold text-text leading-tight m-0">Outreach Funnel</h1>
          <span className="font-mono text-[10px] font-bold text-purple bg-purple/15 px-2 py-0.5 rounded uppercase tracking-[1.8px]">V5 · NEW</span>
        </div>
        <div className="retro-band mb-3"><span /><span /></div>
        <p className="text-[13px] text-text-dim leading-relaxed max-w-[760px]">
          Every contact across every active opp · grouped by funnel stage · with next-touch cadence computed automatically. The marketing-funnel view of your job search · who needs attention today, who&apos;s gone cold, who&apos;s in active conversation. <strong className="text-text">Sequencing discipline is what separates multithreading from carpet-bombing.</strong>
        </p>
      </div>

      {/* ── HERO METRICS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <MetricCard label="Touch today" value={metrics.todayCount} tone={metrics.todayCount > 0 ? "hot" : "muted"} sub="includes overdue" />
        <MetricCard label="This week" value={metrics.weekCount} tone="warn" sub="next 7 days" />
        <MetricCard label="Stale" value={metrics.staleCount} tone="hot" sub=">14 days no touch" />
        <MetricCard label="Active total" value={metrics.totalActive} tone="accent" sub="across all opps" />
      </div>

      {/* ── TODAY'S TOUCHLIST ── */}
      <section className="bg-surface border border-border rounded-xl p-5 mb-6">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="font-mono text-[10px] font-bold text-muted uppercase tracking-[1.8px] mb-1">Today&apos;s touchlist</div>
            <div className="text-[14px] font-bold text-text">{todayList.length === 0 ? "No follow-ups due today · breathe" : `${todayList.length} contact${todayList.length === 1 ? "" : "s"} need attention`}</div>
          </div>
          <div className="text-[11px] text-muted italic">Sorted by most overdue first</div>
        </div>
        {todayList.length === 0 ? (
          <div className="text-center py-6 text-[12px] text-muted italic">All caught up. Use the funnel below to log new outreach.</div>
        ) : (
          <div className="space-y-2">
            {todayList.map((c) => (
              <TouchRow key={makeKey(c)} contact={c} onLogTouch={() => logTouch(c.oppId, c.name)} onExpand={() => setExpandedId(expandedId === makeKey(c) ? null : makeKey(c))} expanded={expandedId === makeKey(c)} onAdvance={(s) => advanceStage(c.oppId, c.name, s)} />
            ))}
          </div>
        )}
      </section>

      {/* ── FUNNEL KANBAN ── */}
      <section>
        <div className="mb-4">
          <div className="font-mono text-[10px] font-bold text-muted uppercase tracking-[1.8px] mb-1">The funnel · 6 stages</div>
          <div className="text-[13px] text-text-dim">Every contact across every active mission · grouped by status. Click any card to log a touch or advance the stage.</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {FUNNEL_STAGES.map((stage) => {
            const group = funnelGroups[stage.status];
            return (
              <div key={stage.status} className={`bg-surface border border-border rounded-xl p-3 flex flex-col min-h-[200px]`}>
                <div className="flex items-baseline justify-between mb-2 pb-2 border-b border-border">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`font-mono text-[9px] font-bold uppercase tracking-[1.4px] ${stage.textClass}`}>{stage.badge}</span>
                      <span className="font-bold text-[12px] text-text">{stage.label}</span>
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">{stage.description}</div>
                  </div>
                  <div className={`font-mono text-[14px] font-bold tabular-nums ${stage.countClass}`}>{group.length}</div>
                </div>
                <div className="space-y-2 flex-1">
                  {group.length === 0 ? (
                    <div className="text-[10px] text-muted italic text-center py-3">empty</div>
                  ) : (
                    group.map((c) => (
                      <FunnelCard key={makeKey(c)} contact={c} onLogTouch={() => logTouch(c.oppId, c.name)} onExpand={() => setExpandedId(expandedId === makeKey(c) ? null : makeKey(c))} expanded={expandedId === makeKey(c)} onAdvance={(s) => advanceStage(c.oppId, c.name, s)} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FOOTER · the operating rule ── */}
      <div className="mt-10 pt-6 border-t border-border text-center">
        <p className="text-[11px] text-muted italic max-w-[640px] mx-auto leading-relaxed">
          The discipline · let warm threads activate before escalating to exec · 5-7 days between layers · parallel tracks fine, leapfrogging not.
        </p>
      </div>
    </div>
  );
}

// ── COMPONENTS ──

function MetricCard({ label, value, tone, sub }: { label: string; value: number; tone: string; sub: string }) {
  const toneClass = METRIC_TONE_CLASS[tone] || "text-text";
  return (
    <div className={`bg-surface border border-border rounded-xl p-4`}>
      <div className="font-mono text-[9px] font-bold text-muted uppercase tracking-[1.6px] mb-1">{label}</div>
      <div className={`text-[36px] font-bold ${toneClass} tabular-nums leading-none`}>{value}</div>
      <div className="text-[10px] text-muted mt-1.5">{sub}</div>
    </div>
  );
}

function TouchRow({ contact, onLogTouch, onExpand, expanded, onAdvance }: {
  contact: TrackedContact; onLogTouch: () => void; onExpand: () => void; expanded: boolean; onAdvance: (s: ContactStatus) => void;
}) {
  return (
    <div className={`border rounded-lg transition ${expanded ? "border-accent bg-accent/5" : "border-border bg-surface-2 hover:border-accent/40"}`}>
      <button onClick={onExpand} className="w-full text-left p-3 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[13px] font-bold text-text">{contact.name}</span>
            <span className="text-[10px] font-mono text-muted uppercase tracking-[1.2px]">{contact.role}</span>
            {contact.verified && <span className="text-[9px] font-mono text-good">✓ verified</span>}
          </div>
          <div className="text-[11px] text-text-dim mt-0.5">
            {contact.oppCompany} · {contact.oppPosition}
          </div>
        </div>
        <div className="text-right min-w-[140px]">
          <div className={`text-[11px] font-mono font-bold ${contact.daysUntilNextTouch <= -3 ? "text-hot" : contact.daysUntilNextTouch < 0 ? "text-warn" : "text-text-dim"}`}>
            {contact.daysUntilNextTouch < 0 ? `${Math.abs(contact.daysUntilNextTouch)}d overdue` : contact.daysUntilNextTouch === 0 ? "due today" : `in ${contact.daysUntilNextTouch}d`}
          </div>
          <div className="text-[10px] text-muted mt-0.5">{contact.nextActionLabel}</div>
        </div>
      </button>
      {expanded && <ExpandedActions contact={contact} onLogTouch={onLogTouch} onAdvance={onAdvance} />}
    </div>
  );
}

function FunnelCard({ contact, onLogTouch, onExpand, expanded, onAdvance }: {
  contact: TrackedContact; onLogTouch: () => void; onExpand: () => void; expanded: boolean; onAdvance: (s: ContactStatus) => void;
}) {
  return (
    <div className={`border rounded-md transition ${expanded ? "border-accent bg-accent/5" : "border-border bg-surface-2 hover:border-accent/40"}`}>
      <button onClick={onExpand} className="w-full text-left p-2.5">
        <div className="flex items-baseline justify-between mb-0.5 gap-1">
          <span className="text-[12px] font-bold text-text leading-tight truncate">{contact.name}</span>
          {contact.daysUntilNextTouch <= 0 && contact.status !== "cold" && <span className="text-[8px] font-mono font-bold text-hot uppercase">!</span>}
        </div>
        <div className="text-[10px] text-text-dim leading-tight truncate">{contact.oppCompany}</div>
        <div className="flex items-baseline justify-between mt-1.5">
          <span className="text-[9px] font-mono text-muted uppercase tracking-[1px]">{contact.role}</span>
          <span className={`text-[10px] font-mono ${contact.daysUntilNextTouch < 0 ? "text-hot" : "text-muted"}`}>
            {contact.daysSinceTouch === Infinity ? "—" : `${contact.daysSinceTouch}d`}
          </span>
        </div>
      </button>
      {expanded && <ExpandedActions contact={contact} onLogTouch={onLogTouch} onAdvance={onAdvance} />}
    </div>
  );
}

function ExpandedActions({ contact, onLogTouch, onAdvance }: {
  contact: TrackedContact; onLogTouch: () => void; onAdvance: (s: ContactStatus) => void;
}) {
  return (
    <div className="border-t border-border p-3 space-y-2 bg-bg/40 rounded-b-md">
      <div className="grid grid-cols-2 gap-1.5">
        <button onClick={onLogTouch} className="px-2 py-1.5 bg-good text-white text-[11px] font-bold rounded hover:bg-good/90">
          Log touch · today
        </button>
        <Link href={`/mission/${contact.oppId}`} className="px-2 py-1.5 bg-surface border border-border text-text text-[11px] font-semibold rounded hover:border-accent text-center">
          Open Mission →
        </Link>
      </div>
      <div>
        <div className="font-mono text-[9px] font-bold text-muted uppercase tracking-[1.2px] mb-1">Advance stage</div>
        <div className="grid grid-cols-3 gap-1">
          {FUNNEL_STAGES.map((s) => (
            <button
              key={s.status}
              onClick={() => onAdvance(s.status)}
              disabled={s.status === contact.status}
              className={`px-1.5 py-1 text-[10px] font-mono uppercase tracking-[1px] rounded border transition ${
                s.status === contact.status
                  ? "bg-accent/15 border-accent text-accent font-bold cursor-default"
                  : "bg-surface border-border text-text-dim hover:border-accent/40"
              }`}
            >
              {s.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
      {contact.linkedin && (
        <a href={contact.linkedin} target="_blank" rel="noreferrer" className="block text-[10px] font-mono text-accent hover:underline truncate">
          LinkedIn ↗
        </a>
      )}
      <div className="text-[10px] text-text-dim italic leading-snug">
        Last touch · {contact.daysSinceTouch === Infinity ? "never" : `${contact.daysSinceTouch} day${contact.daysSinceTouch === 1 ? "" : "s"} ago`} · {contact.nextActionLabel}
      </div>
    </div>
  );
}
