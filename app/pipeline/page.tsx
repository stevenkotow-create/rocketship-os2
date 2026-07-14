"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/lib/storage";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import { STAGES } from "@/lib/constants";
import { Orbit } from "@/components/icons";
import type { Stage, Opportunity } from "@/lib/types";
import { computeStakeholderHealth, missingRequiredRoles } from "@/lib/star-map";
import { EmptyState } from "@/components/EmptyState";

type ViewMode = "list" | "kanban";

type ListGroup =
  | "interview"
  | "today"
  | "this-week"
  | "awaiting"
  | "targeting"
  | "done";

interface GroupDef {
  id: ListGroup;
  label: string;
  description: string;
  accentClass: string;
}

const GROUPS: GroupDef[] = [
  {
    id: "interview",
    label: "🔥 Active interview",
    description: "Live process · prep, follow-ups, panel rounds",
    accentClass: "text-good border-good/40",
  },
  {
    id: "today",
    label: "📍 Action today",
    description: "Urgent · P1 needs movement now",
    accentClass: "text-accent border-accent/40",
  },
  {
    id: "this-week",
    label: "📅 Action this week",
    description: "Queued · P1/P2 with defined next step",
    accentClass: "text-cool border-cool/40",
  },
  {
    id: "awaiting",
    label: "⏳ Awaiting reply",
    description: "Applied + contacted · waiting for the other side",
    accentClass: "text-warn border-warn/40",
  },
  {
    id: "targeting",
    label: "🔭 Targeting",
    description: "Scouting · pre-application research and threading",
    accentClass: "text-muted border-border",
  },
  {
    id: "done",
    label: "📕 Closed / accepted",
    description: "Out of pipeline · kept for case-study reference",
    accentClass: "text-text-dim border-border",
  },
];

function groupOpp(o: Opportunity): ListGroup {
  if (o.stage === "accepted" || o.stage === "closed") return "done";
  if (o.stage === "early" || o.stage === "late" || o.stage === "offer") return "interview";
  if (o.stage === "targeting") return "targeting";
  // applied or contacted stages
  if (o.action && (o.priority === "P1" || o.live)) {
    const days = o.daysInStage ?? 0;
    if (days >= 5) return "today";
    return "this-week";
  }
  return "awaiting";
}

export default function Pipeline() {
  const [state, update] = useAppState();
  const [view, setView] = useState<ViewMode>("list");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({ done: true });

  const allOpps: Opportunity[] = [...OPPORTUNITIES, ...state.customOpps].map(
    (o) => ({ ...o, ...(state.opps[o.id] || {}) } as Opportunity)
  );

  function moveOpp(id: string, stage: Stage) {
    update((s) => ({
      ...s,
      opps: { ...s.opps, [id]: { ...(s.opps[id] || {}), stage, daysInStage: 0 } },
    }));
  }

  function toggleExpand(id: string) {
    update((s) => ({
      ...s,
      expandedOpps: { ...s.expandedOpps, [id]: !s.expandedOpps[id] },
    }));
  }

  function toggleGroup(id: ListGroup) {
    setCollapsedGroups((c) => ({ ...c, [id]: !c[id] }));
  }

  // Group opps for list view
  const groupedOpps: Record<ListGroup, Opportunity[]> = {
    interview: [],
    today: [],
    "this-week": [],
    awaiting: [],
    targeting: [],
    done: [],
  };
  allOpps.forEach((o) => {
    groupedOpps[groupOpp(o)].push(o);
  });

  // Craft pass · first-run manifest reads as ready, not broken.
  if (allOpps.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-accent"><Orbit size={20} strokeWidth={1.5} /></span>
            <h1 className="display text-glow text-[38px] leading-[1.08] text-text m-0">Launch Manifest</h1>
          </div>
          <p className="text-[14px] text-text-dim m-0 max-w-2xl">
            Every company you&apos;re pursuing, grouped by what needs doing next.
          </p>
        </div>
        <div className="retro-band mb-8"><span /><span /></div>
        <EmptyState
          icon={<Orbit size={44} strokeWidth={1.25} />}
          title="No missions on the manifest yet."
          body="Add the companies you're targeting and they flow through every stage here — from first probe to offer."
          action={
            <Link
              href="/onboarding"
              className="rounded-xl bg-accent px-5 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 dark:text-bg"
            >
              Paste LinkedIn → build my board →
            </Link>
          }
          hint="Already know your targets? Add them manually and they appear across every screen."
        />
      </div>
    );
  }

  return (
    <div>
      {/* V4 · Header */}
      <div className="flex items-end justify-between gap-3 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-accent"><Orbit size={20} strokeWidth={1.5} /></span>
            <h1 className="display text-glow text-[34px] leading-[1.1] text-text m-0">Launch Manifest</h1>
          </div>
          <p className="text-[14px] text-text-dim m-0 max-w-3xl">
            {view === "list"
              ? "All missions grouped by action priority. The work in front, the work waiting, the work done."
              : "Stage flow view. Drag-equivalent buttons to move between phases."}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-surface-2 border border-border rounded-md p-0.5 flex-shrink-0">
            <button
              onClick={() => setView("list")}
              className={`font-mono text-[11px] uppercase tracking-[1.5px] px-3 py-1.5 rounded transition ${
                view === "list" ? "bg-accent text-white" : "text-muted hover:text-text"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`font-mono text-[11px] uppercase tracking-[1.5px] px-3 py-1.5 rounded transition ${
                view === "kanban" ? "bg-accent text-white" : "text-muted hover:text-text"
              }`}
            >
              Kanban
            </button>
          </div>
          <span className="font-mono text-[10px] text-muted lowercase">PL.01</span>
        </div>
      </div>

      <div className="retro-band mb-4"><span /><span /></div>

      {/* Answer-first · lead with the read, then the tools */}
      <p className="mb-6 text-[14px] text-text-dim">
        {groupedOpps.today.length + groupedOpps.interview.length > 0 ? (
          <>
            <span className="font-semibold text-text">{groupedOpps.today.length + groupedOpps.interview.length}</span> need action now
            {groupedOpps.awaiting.length > 0 && (
              <> · <span className="font-semibold text-text">{groupedOpps.awaiting.length}</span> waiting on a reply</>
            )}
            .
          </>
        ) : (
          <>
            Nothing urgent right now · <span className="font-semibold text-text">{groupedOpps.targeting.length}</span> compan
            {groupedOpps.targeting.length === 1 ? "y" : "ies"} in your sights.
          </>
        )}
      </p>

      {/* V4 · Stage totals · mono numbers, no emoji */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-6">
        {STAGES.slice(0, 7).map((s) => {
          const count = allOpps.filter((o) => o.stage === s.id).length;
          return (
            <div key={s.id} className="bg-surface border border-border rounded-md p-3 text-center">
              <div className="font-mono text-[10px] text-muted uppercase tracking-[1.8px] font-semibold mb-1.5">{s.label}</div>
              <div className="font-mono text-[26px] font-bold leading-none text-text">{count}</div>
            </div>
          );
        })}
      </div>

      {/* LIST VIEW · default · grouped by action priority */}
      {view === "list" && (
        <div className="space-y-4">
          {GROUPS.map((g) => {
            const opps = groupedOpps[g.id];
            if (opps.length === 0) return null;
            const collapsed = collapsedGroups[g.id];
            return (
              <div key={g.id} className={`bg-surface border ${g.accentClass} rounded-xl overflow-hidden`}>
                <button
                  onClick={() => toggleGroup(g.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-surface-2 transition text-left"
                >
                  <div>
                    <div className={`text-[15px] font-bold ${g.accentClass.split(" ")[0]}`}>
                      {g.label} <span className="text-text-dim ml-2 font-normal">{opps.length}</span>
                    </div>
                    <div className="text-[11px] text-muted mt-0.5">{g.description}</div>
                  </div>
                  <div className="text-muted text-sm">{collapsed ? "▶" : "▼"}</div>
                </button>
                {!collapsed && (
                  <div className="divide-y divide-border">
                    {opps.map((o) => {
                      const health = computeStakeholderHealth(o.contacts);
                      const missing = missingRequiredRoles(o.contacts);
                      const stage = STAGES.find((s) => s.id === o.stage);
                      const healthCls =
                        health === "complete" ? "bg-good/20 text-good" :
                        health === "partial" ? "bg-accent/20 text-accent" :
                        health === "single-thread" ? "bg-warn/20 text-warn" :
                        "bg-hot/20 text-hot";
                      const healthLabel =
                        health === "complete" ? "★ 3/3" :
                        health === "partial" ? "★ 2/3" :
                        health === "single-thread" ? "★ 1/3" :
                        "★ 0/3";

                      return (
                        <Link
                          key={o.id}
                          href={`/mission/${o.id}`}
                          className="block p-4 hover:bg-surface-2 transition group"
                        >
                          <div className="flex items-start gap-4 flex-wrap">
                            {/* Stage icon */}
                            <div className="text-2xl flex-shrink-0 mt-0.5" title={stage?.label}>
                              {stage?.icon}
                            </div>
                            {/* Main column */}
                            <div className="flex-1 min-w-[200px]">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <h3 className="text-[15px] font-bold text-navy group-hover:text-accent transition">
                                  {o.company}
                                </h3>
                                <span className={`badge ${healthCls}`} title={`Star Map · ${health}`}>
                                  {healthLabel}
                                </span>
                                {o.priority === "P1" && (
                                  <span className="badge bg-accent/20 text-accent">P1</span>
                                )}
                                {o.pattern && (
                                  <span className="badge bg-navy/15 text-navy">P{o.pattern}</span>
                                )}
                                {o.loom && (
                                  <span className="badge bg-purple/20 text-purple">Loom</span>
                                )}
                                {o.hoursSpent !== undefined && o.hoursSpent > 0 && (
                                  <span
                                    className={`badge ${
                                      o.hoursSpent <= 2
                                        ? "bg-good/15 text-good"
                                        : o.hoursSpent <= 5
                                        ? "bg-warn/15 text-warn"
                                        : "bg-hot/15 text-hot"
                                    }`}
                                  >
                                    ⏱ {o.hoursSpent}h
                                  </span>
                                )}
                              </div>
                              <p className="text-[12px] text-text-dim mt-0.5">{o.position}</p>
                              {o.action && (
                                <div className="text-[12px] text-accent mt-2">▶ {o.action}</div>
                              )}
                              {missing.length > 0 && health !== "complete" && (
                                <div className="text-[11px] text-warn mt-1.5">
                                  Star Map needs: {missing.map((m) => m.label.split(" ")[0]).join(" + ")}
                                </div>
                              )}
                            </div>
                            {/* Right column · stage + days */}
                            <div className="text-right flex-shrink-0">
                              <div className="text-[11px] text-muted uppercase tracking-wider">{stage?.label}</div>
                              {o.daysInStage !== undefined && (
                                <div className="text-[12px] text-text-dim mt-0.5">{o.daysInStage}d</div>
                              )}
                              <div className="text-[10px] text-accent opacity-0 group-hover:opacity-100 transition mt-1">
                                Open →
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* KANBAN VIEW · legacy stage-flow */}
      {view === "kanban" && (
        <div className="flex gap-3 overflow-x-auto pb-5">
          {STAGES.map((s) => {
            const stageOpps = allOpps.filter((o) => o.stage === s.id);
            return (
              <div key={s.id} className="flex-shrink-0 w-[280px] bg-surface border border-border rounded-[10px] p-3 max-h-[calc(100vh-280px)] flex flex-col">
                <div className="flex justify-between items-center pb-3 border-b border-border mb-2.5">
                  <span className="text-[13px] font-semibold flex items-center gap-1.5">
                    <span className="text-base">{s.icon}</span>
                    {s.label}
                  </span>
                  <span className="bg-surface-3 text-muted px-2 py-0.5 rounded-[10px] text-[11px]">{stageOpps.length}</span>
                </div>
                <div className="overflow-y-auto flex-1 pr-1">
                  {stageOpps.length === 0 ? (
                    <p className="text-center py-5 text-muted text-xs">Empty</p>
                  ) : (
                    stageOpps.map((o) => {
                      const expanded = state.expandedOpps[o.id];
                      const closed = o.stage === "closed";
                      const h = computeStakeholderHealth(o.contacts);
                      const cls =
                        h === "complete" ? "bg-good/20 text-good" :
                        h === "partial" ? "bg-accent/20 text-accent" :
                        h === "single-thread" ? "bg-warn/20 text-warn" :
                        "bg-hot/20 text-hot";
                      const label =
                        h === "complete" ? "★ 3/3" :
                        h === "partial" ? "★ 2/3" :
                        h === "single-thread" ? "★ 1/3" :
                        "★ 0/3";

                      return (
                        <div
                          key={o.id}
                          onClick={() => toggleExpand(o.id)}
                          className={`relative bg-surface-2 border rounded-lg p-3 mb-2 cursor-pointer transition-all hover:-translate-y-0.5 ${expanded ? "border-accent bg-surface-3" : "border-border hover:border-border-strong"} ${closed ? "opacity-60" : ""}`}
                        >
                          {o.hoursSpent !== undefined && o.hoursSpent > 0 && (
                            <span
                              className={`absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                                o.hoursSpent <= 2
                                  ? "bg-good/15 text-good"
                                  : o.hoursSpent <= 5
                                  ? "bg-warn/15 text-warn"
                                  : "bg-hot/15 text-hot"
                              }`}
                              title={`${o.hoursSpent} hrs invested · ${o.patternType === "first" ? "first-of-pattern" : o.patternType === "reuse" ? "framework reuse" : "tracked"}`}
                            >
                              ⏱ {o.hoursSpent}h
                            </span>
                          )}
                          <div className="font-semibold text-sm mb-1 pr-12">{o.company}</div>
                          <div className="text-xs text-text-dim mb-2">{o.position}</div>
                          <div className="flex gap-1.5 flex-wrap mb-1">
                            <span className="badge bg-good/20 text-good">{o.type}</span>
                            {o.pattern && <span className="badge bg-accent/20 text-accent">P{o.pattern}</span>}
                            {o.loom && <span className="badge bg-purple/20 text-purple">Loom</span>}
                            {o.priority === "P1" && <span className="badge bg-good/20 text-good">P1</span>}
                            <span className={`badge ${cls}`} title={`Star Map · ${h}`}>{label}</span>
                          </div>
                          {o.daysInStage !== undefined && <div className="text-xs text-muted">{o.daysInStage}d in stage</div>}
                          {o.action && <div className="text-[11px] text-accent bg-accent/15 rounded px-2 py-1 mt-1.5 inline-block">▶ {o.action}</div>}

                          {expanded && (
                            <div className="mt-3 pt-3 border-t border-border text-xs" onClick={(e) => e.stopPropagation()}>
                              {o.score && (
                                <>
                                  <div className="text-[10px] text-muted uppercase tracking-wider mt-2">V2 5-Dim Score</div>
                                  <div className="text-xs">V {o.score.v}/25 · L {o.score.l}/4 · R {o.score.r}/10 · C {o.score.c}/5 · {o.score.eq}</div>
                                </>
                              )}
                              {o.hm && (
                                <>
                                  <div className="text-[10px] text-muted uppercase tracking-wider mt-2">Hiring Manager / Multi-thread</div>
                                  <div className="text-xs">{o.hm}</div>
                                </>
                              )}
                              {o.url && (
                                <>
                                  <div className="text-[10px] text-muted uppercase tracking-wider mt-2">URL</div>
                                  <a href={o.url} target="_blank" rel="noreferrer" className="text-cool text-xs break-all hover:underline">{o.url.slice(0, 60)}...</a>
                                </>
                              )}
                              {o.note && (
                                <>
                                  <div className="text-[10px] text-muted uppercase tracking-wider mt-2">Notes</div>
                                  <div className="text-[11px] text-text-dim bg-surface-3 p-2 rounded mt-1">{o.note}</div>
                                </>
                              )}
                              <div className="flex gap-1.5 flex-wrap mt-3">
                                {STAGES.filter((st) => st.id !== o.stage).map((st) => (
                                  <button
                                    key={st.id}
                                    onClick={() => moveOpp(o.id, st.id as Stage)}
                                    className="text-[11px] px-2 py-1 bg-surface border border-border rounded hover:border-accent hover:bg-surface-3"
                                  >
                                    → {st.label}
                                  </button>
                                ))}
                              </div>
                              <Link
                                href={`/mission/${o.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="block text-center mt-3 px-3 py-2 bg-accent text-white rounded font-semibold text-[11px] hover:bg-accent/90"
                              >
                                🚀 Open Mission Profile
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
