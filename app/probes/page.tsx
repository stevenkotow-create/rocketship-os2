"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/lib/storage";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import { ProbeLearningCard } from "@/components/ProbeLearningCard";
import { Probe } from "@/components/icons";
import { EmptyState } from "@/components/EmptyState";
import type { TriageStatus, AvailableRole } from "@/lib/types";

type FilterMode = "all" | "pending" | "approved" | "watchlist" | "denied" | "later";

const SOURCE_LABEL: Record<string, string> = {
  "morning-probe": "7am probe",
  "midday-probe": "11am probe",
  "manual": "Manual entry",
  "watchlist-promotion": "Watchlist promotion",
};

// V2.3 · probes evaluate COMPANIES · approval branches into Watch (relationship-only)
// or Apply (pick a live role · triggers Interview Playbook draft pipeline)
export default function ProbesInbox() {
  const [state, update] = useAppState();
  const ALL_OPPS = [...OPPORTUNITIES, ...(state.customOpps || [])];
  const [filter, setFilter] = useState<FilterMode>("pending");
  const [rolePickerFor, setRolePickerFor] = useState<string | null>(null);

  const allOpps = ALL_OPPS.map((o) => ({ ...o, ...(state.opps[o.id] || {}) }));

  function getTriageStatus(oppId: string): TriageStatus | undefined {
    const stateTriage = state.opps[oppId]?.triage;
    const seedTriage = ALL_OPPS.find((o) => o.id === oppId)?.triage;
    return (stateTriage || seedTriage)?.status;
  }

  function getAvailableRoles(oppId: string): AvailableRole[] {
    const stateTriage = state.opps[oppId]?.triage;
    const seedTriage = ALL_OPPS.find((o) => o.id === oppId)?.triage;
    return (stateTriage?.availableRoles || seedTriage?.availableRoles || []);
  }

  function getCompanyEvaluation(oppId: string) {
    const stateTriage = state.opps[oppId]?.triage;
    const seedTriage = ALL_OPPS.find((o) => o.id === oppId)?.triage;
    return stateTriage?.companyEvaluation || seedTriage?.companyEvaluation;
  }

  const triagedOpps = allOpps.filter((o) => {
    const seedTriage = ALL_OPPS.find((x) => x.id === o.id)?.triage;
    return !!seedTriage;
  });

  const filtered = triagedOpps.filter((o) => {
    const s = getTriageStatus(o.id);
    if (filter === "all") return true;
    return s === filter;
  });

  function triageProbe(
    id: string,
    status: TriageStatus,
    extras?: { denialReason?: string; appliedToRoleUrl?: string }
  ) {
    const seedOpp = ALL_OPPS.find((o) => o.id === id);
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
              ...(extras?.denialReason ? { denialReason: extras.denialReason } : {}),
              ...(extras?.appliedToRoleUrl ? { appliedToRoleUrl: extras.appliedToRoleUrl } : {}),
              ...(status === "later"
                ? { laterUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
                : {}),
              ...(status === "watchlist"
                ? { watchUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
                : {}),
            },
          },
        },
      };
    });
  }

  function handleApply(id: string) {
    const roles = getAvailableRoles(id);
    if (roles.length === 0) {
      // No surfaced roles · just approve and prompt the user to paste a JD URL on Mission Profile
      triageProbe(id, "approved");
      return;
    }
    if (roles.length === 1) {
      // Auto-pick the single live role
      triageProbe(id, "approved", { appliedToRoleUrl: roles[0].url });
      return;
    }
    // Multiple roles · open the picker
    setRolePickerFor(id);
  }

  function pickRoleAndApply(id: string, url: string) {
    triageProbe(id, "approved", { appliedToRoleUrl: url });
    setRolePickerFor(null);
  }

  function copyPromptToClipboard(url: string) {
    const prompt = `Action this through the evaluator: ${url}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(prompt);
    }
  }

  const counts = {
    pending: triagedOpps.filter((o) => getTriageStatus(o.id) === "pending").length,
    approved: triagedOpps.filter((o) => getTriageStatus(o.id) === "approved").length,
    watchlist: triagedOpps.filter((o) => getTriageStatus(o.id) === "watchlist").length,
    denied: triagedOpps.filter((o) => getTriageStatus(o.id) === "denied").length,
    later: triagedOpps.filter((o) => getTriageStatus(o.id) === "later").length,
  };

  return (
    <div>
      {/* V4 · Header */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-accent"><Probe size={20} strokeWidth={1.5} /></span>
            <h1 className="display text-glow text-[34px] leading-[1.1] text-text m-0">Probes Inbox</h1>
          </div>
          <p className="text-[14px] text-text-dim m-0 max-w-3xl">
            Companies auto-evaluated at probe time with available APAC roles surfaced. Approve to Apply (pick a role → Interview Playbook drafts) or Watch (relationship build + 30-day re-probe).
          </p>
        </div>
        <span className="font-mono text-[10px] text-muted lowercase">PI.01</span>
      </div>

      <div className="retro-band mb-6"><span /><span /></div>

      {/* V3.5 · Probe learning card · pattern reveal from triage history */}
      <div>
        <ProbeLearningCard state={state} />
      </div>

      {/* V4 · Counts strip · 5 states · mono numbers + coordinate marker */}
      <div className="grid grid-cols-5 gap-3 mb-6 mt-4">
        <button
          onClick={() => setFilter("pending")}
          className={`bg-surface border rounded-lg p-4 text-left transition relative ${filter === "pending" ? "border-accent" : "border-border hover:border-accent/50"}`}
        >
          <div className="font-mono text-[10px] text-muted uppercase tracking-[1.8px] font-semibold mb-2">Pending</div>
          <div className="font-mono text-[28px] font-bold leading-none text-accent">{counts.pending}</div>
          <div className="text-[10px] text-text-dim mt-1.5">awaiting triage</div>
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`bg-surface border rounded-lg p-4 text-left transition relative ${filter === "approved" ? "border-good" : "border-border hover:border-good/50"}`}
        >
          <div className="font-mono text-[10px] text-muted uppercase tracking-[1.8px] font-semibold mb-2">Applying</div>
          <div className="font-mono text-[28px] font-bold leading-none text-good">{counts.approved}</div>
          <div className="text-[10px] text-text-dim mt-1.5">pack ready</div>
        </button>
        <button
          onClick={() => setFilter("watchlist")}
          className={`bg-surface border rounded-lg p-4 text-left transition relative ${filter === "watchlist" ? "border-cool" : "border-border hover:border-cool/50"}`}
        >
          <div className="font-mono text-[10px] text-muted uppercase tracking-[1.8px] font-semibold mb-2">Watchlist</div>
          <div className="font-mono text-[28px] font-bold leading-none text-cool">{counts.watchlist}</div>
          <div className="text-[10px] text-text-dim mt-1.5">30-day re-probe</div>
        </button>
        <button
          onClick={() => setFilter("later")}
          className={`bg-surface border rounded-lg p-4 text-left transition relative ${filter === "later" ? "border-warn" : "border-border hover:border-warn/50"}`}
        >
          <div className="font-mono text-[10px] text-muted uppercase tracking-[1.8px] font-semibold mb-2">Later</div>
          <div className="font-mono text-[28px] font-bold leading-none text-warn">{counts.later}</div>
          <div className="text-[10px] text-text-dim mt-1.5">resurface tomorrow</div>
        </button>
        <button
          onClick={() => setFilter("denied")}
          className={`bg-surface border rounded-lg p-4 text-left transition relative ${filter === "denied" ? "border-hot" : "border-border hover:border-hot/50"}`}
        >
          <div className="font-mono text-[10px] text-muted uppercase tracking-[1.8px] font-semibold mb-2">Denied</div>
          <div className="font-mono text-[28px] font-bold leading-none text-hot">{counts.denied}</div>
          <div className="text-[10px] text-text-dim mt-1.5">jettisoned</div>
        </button>
      </div>

      {/* Filter toggle · "all" + clear button */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-3 py-1.5 rounded ${filter === "all" ? "bg-accent text-white" : "bg-surface-2 text-muted hover:text-text"}`}
        >
          Show all probes
        </button>
        <div className="text-[11px] text-muted">
          Showing {filtered.length} {filter === "all" ? "" : filter} {filtered.length === 1 ? "probe" : "probes"}
        </div>
      </div>

      {filtered.length === 0 ? (
        allOpps.length === 0 ? (
          <EmptyState
            icon={<Probe size={44} strokeWidth={1.25} />}
            title="No probes on the board yet."
            body="Probes are companies RocketShip is watching for you. Paste your LinkedIn and it seeds a starting set of target companies in seconds."
            action={
              <Link
                href="/onboarding"
                className="rounded-xl bg-accent px-5 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 dark:text-bg"
              >
                Paste LinkedIn → build my board →
              </Link>
            }
            hint="Or add a company yourself from the Pipeline."
          />
        ) : (
          <EmptyState
            icon={<Probe size={44} strokeWidth={1.25} />}
            title="Nothing in this filter."
            body="No probes match right now. The morning probe run surfaces new companies at 7am AEST."
          />
        )
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const status = getTriageStatus(p.id);
            const seedTriage = ALL_OPPS.find((x) => x.id === p.id)?.triage;
            const stateTriage = state.opps[p.id]?.triage;
            const triage = { ...seedTriage, ...stateTriage };
            const sourceLabel = SOURCE_LABEL[triage.surfacedBy || ""] || triage.surfacedBy;
            const evaluation = getCompanyEvaluation(p.id);
            const availableRoles = getAvailableRoles(p.id);
            const liveRoles = availableRoles.filter((r) => r.apacFit && r.tierFit && r.freshnessOK);

            // PENDING card · full company eval + roles + 4-action triage
            if (status === "pending") {
              return (
                <div
                  key={p.id}
                  className="bg-gradient-to-br from-surface to-surface-2 border border-border rounded-xl p-5 hover:border-accent transition"
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="flex-1 min-w-[300px]">
                      <div className="flex items-baseline gap-2 flex-wrap mb-2">
                        <h3 className="text-lg font-bold text-navy">{p.company}</h3>
                        <span className="badge bg-muted/15 text-muted">{sourceLabel}</span>
                        {evaluation && (
                          <span
                            className={`badge font-bold ${
                              evaluation.verdict === "rocket"
                                ? "bg-good/20 text-good"
                                : evaluation.verdict === "watchlist"
                                ? "bg-cool/20 text-cool"
                                : "bg-hot/20 text-hot"
                            }`}
                          >
                            {evaluation.verdict.toUpperCase()} · {evaluation.totalScore}/30 · {evaluation.strongDimensions}/6 strong
                          </span>
                        )}
                      </div>
                      {triage.summary && (
                        <p className="text-[13px] text-navy leading-snug mb-3">{triage.summary}</p>
                      )}

                      {/* V2.3 · six-dim eval summary chips */}
                      {evaluation && (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-3 text-[10px]">
                          {[
                            { k: "Layer", v: evaluation.layerInStack },
                            { k: "Category", v: evaluation.categoryMaturity },
                            { k: "Stage", v: evaluation.stageOfGrowth },
                            { k: "GTM", v: evaluation.gtmMotion },
                            { k: "Health", v: evaluation.commercialHealth },
                            { k: "Must", v: evaluation.mustHave },
                          ].map((d) => (
                            <div
                              key={d.k}
                              className={`rounded px-1.5 py-1 text-center font-semibold ${
                                d.v >= 4 ? "bg-good/15 text-good" : d.v >= 3 ? "bg-warn/15 text-warn" : "bg-hot/15 text-hot"
                              }`}
                            >
                              <div className="opacity-70 text-[10px]">{d.k}</div>
                              <div>{d.v}/5</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* V2.3 · auto-discovered live roles at company */}
                      {availableRoles.length > 0 && (
                        <div className="bg-surface border border-border rounded-lg p-3 mt-2">
                          <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-2">
                            Live APAC roles at {p.company} · {liveRoles.length} fit · {availableRoles.length} total found
                          </div>
                          <div className="space-y-1.5">
                            {availableRoles.slice(0, 4).map((r, i) => (
                              <div key={i} className="flex items-baseline gap-2 text-[12px]">
                                <span
                                  className={`badge text-[10px] ${
                                    r.apacFit && r.tierFit && r.freshnessOK
                                      ? "bg-good/15 text-good"
                                      : "bg-muted/15 text-muted"
                                  }`}
                                >
                                  {r.type}
                                </span>
                                <span className="text-navy font-medium flex-1 min-w-0 truncate">{r.title}</span>
                                <span className="text-muted text-[10px] flex-shrink-0">{r.location}</span>
                                {r.source && (
                                  <span className="text-text-dim text-[10px] flex-shrink-0">· {r.source}</span>
                                )}
                              </div>
                            ))}
                            {availableRoles.length > 4 && (
                              <div className="text-[10px] text-text-dim italic">+ {availableRoles.length - 4} more</div>
                            )}
                          </div>
                        </div>
                      )}
                      {availableRoles.length === 0 && (
                        <div className="bg-warn/5 border border-warn/20 rounded-lg p-3 mt-2 text-[12px] text-warn">
                          No current APAC fit found. Watch path recommended · 30-day re-probe for new role posts.
                        </div>
                      )}
                    </div>

                    {/* 4-action triage column */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApply(p.id)}
                        disabled={liveRoles.length === 0}
                        title={
                          liveRoles.length === 0
                            ? "No fit roles to apply to · Watch instead"
                            : "Apply · pick a role → Interview Playbook drafts"
                        }
                        className={`px-3 py-2 rounded-lg border font-bold text-[12px] transition whitespace-nowrap ${
                          liveRoles.length > 0
                            ? "bg-good text-white border-good hover:bg-good/90"
                            : "bg-muted/15 text-muted border-muted/30 cursor-not-allowed opacity-50"
                        }`}
                      >
                        🚀 Apply{liveRoles.length > 1 ? ` (${liveRoles.length})` : ""}
                      </button>
                      <button
                        onClick={() => triageProbe(p.id, "watchlist")}
                        title="Watch · multi-thread + 30-day re-probe"
                        className="px-3 py-2 rounded-lg bg-cool/15 hover:bg-cool/30 text-cool border border-cool/30 font-bold text-[12px] transition whitespace-nowrap"
                      >
                        👁 Watch
                      </button>
                      <button
                        onClick={() => triageProbe(p.id, "later")}
                        title="Later · resurface tomorrow"
                        className="px-3 py-2 rounded-lg bg-warn/15 hover:bg-warn/30 text-warn border border-warn/30 font-bold text-[12px] transition whitespace-nowrap"
                      >
                        🕐 Later
                      </button>
                      <button
                        onClick={() => {
                          const reason = window.prompt("Why jettison? (one line for the registry)") || "No reason given";
                          triageProbe(p.id, "denied", { denialReason: reason });
                        }}
                        title="Deny · jettison"
                        className="px-3 py-2 rounded-lg bg-hot/15 hover:bg-hot/30 text-hot border border-hot/30 font-bold text-[12px] transition whitespace-nowrap"
                      >
                        ✕ Deny
                      </button>
                    </div>
                  </div>

                  {/* Role picker modal · only opens when multiple liveRoles */}
                  {rolePickerFor === p.id && (
                    <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setRolePickerFor(null)}>
                      <div className="bg-surface border border-border rounded-xl p-6 max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-navy mb-1">Pick a role to apply to</h3>
                        <p className="text-[12px] text-text-dim mb-4">
                          {p.company} has {liveRoles.length} live APAC fits. Choose one. Interview Playbook drafts will pre-populate using the company evaluation.
                        </p>
                        <div className="space-y-2">
                          {liveRoles.map((r, i) => (
                            <button
                              key={i}
                              onClick={() => pickRoleAndApply(p.id, r.url)}
                              className="w-full text-left bg-surface-2 hover:bg-good/10 hover:border-good border border-border rounded-lg p-3 transition"
                            >
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="badge bg-good/15 text-good text-[10px]">{r.type}</span>
                                <span className="text-[13px] font-bold text-navy">{r.title}</span>
                              </div>
                              <div className="text-[11px] text-text-dim">
                                {r.location} · {r.source}
                                {r.notes && <span className="text-cool"> · {r.notes}</span>}
                              </div>
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setRolePickerFor(null)}
                          className="mt-4 text-[12px] text-muted hover:text-text"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // APPROVED card · applying to picked role · Mission Profile + Interview Playbook
            if (status === "approved") {
              const appliedUrl = triage.appliedToRoleUrl || p.url;
              const appliedRole = availableRoles.find((r) => r.url === appliedUrl);
              return (
                <div key={p.id} className="bg-good/5 border-2 border-good/30 rounded-xl p-4 flex items-start gap-4 flex-wrap">
                  <div className="flex-1 min-w-[300px]">
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-bold text-navy">{p.company}</h3>
                      <span className="badge bg-good/20 text-good">APPLYING</span>
                      {evaluation && (
                        <span className="badge bg-good/15 text-good">
                          {evaluation.totalScore}/30 ROCKET
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-text-dim mb-2">
                      {appliedRole?.title || p.position}
                      {appliedRole && <span className="text-muted"> · {appliedRole.location}</span>}
                    </p>
                    {appliedUrl && (
                      <div className="bg-bg border border-border rounded px-2 py-1.5 mb-2 text-[11px] font-mono text-cool break-all">
                        {appliedUrl}
                      </div>
                    )}
                    <div className="text-[11px] text-good font-semibold">
                      → Interview Playbook drafts ready on Mission Profile
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link
                      href={`/mission/${p.id}`}
                      className="px-3 py-2 bg-good text-white rounded font-semibold text-[11px] hover:bg-good/90 transition text-center whitespace-nowrap"
                    >
                      Open Mission Profile →
                    </Link>
                    <button
                      onClick={() => copyPromptToClipboard(appliedUrl || "")}
                      title="Copy URL + prompt for Claude chat"
                      className="px-3 py-2 bg-surface-2 hover:bg-surface-3 text-navy rounded font-semibold text-[11px] transition whitespace-nowrap"
                    >
                      📋 Copy URL + prompt
                    </button>
                    <button
                      onClick={() => triageProbe(p.id, "pending")}
                      title="Move back to pending"
                      className="px-3 py-2 text-muted hover:text-text rounded text-[11px] transition whitespace-nowrap"
                    >
                      Undo
                    </button>
                  </div>
                </div>
              );
            }

            // WATCHLIST card · relationship-build mode + 30-day re-probe
            if (status === "watchlist") {
              const reProbeAt = triage.watchUntil
                ? new Date(triage.watchUntil).toLocaleDateString("en-AU", { day: "numeric", month: "short" })
                : "30 days";
              return (
                <div key={p.id} className="bg-cool/5 border border-cool/30 rounded-xl p-4 flex items-start gap-4 flex-wrap">
                  <div className="flex-1 min-w-[300px]">
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-bold text-navy">{p.company}</h3>
                      <span className="badge bg-cool/20 text-cool">WATCHLIST</span>
                      {evaluation && (
                        <span className="badge bg-cool/10 text-cool">
                          {evaluation.totalScore}/30
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-text-dim mb-2">
                      Multi-thread now, ship when a seat opens. Re-probe scheduled <strong className="text-cool">{reProbeAt}</strong>.
                    </p>
                    {triage.summary && (
                      <p className="text-[11px] text-text-dim italic">{triage.summary}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link
                      href={`/mission/${p.id}`}
                      className="px-3 py-2 bg-cool/15 hover:bg-cool/30 text-cool rounded font-semibold text-[11px] transition text-center whitespace-nowrap"
                    >
                      Build Star Map →
                    </Link>
                    <button
                      onClick={() => triageProbe(p.id, "pending")}
                      title="Promote back to triage"
                      className="px-3 py-2 text-muted hover:text-text rounded text-[11px] transition whitespace-nowrap"
                    >
                      Re-triage
                    </button>
                  </div>
                </div>
              );
            }

            // DENIED card · jettisoned, smaller
            if (status === "denied") {
              return (
                <div key={p.id} className="bg-hot/5 border border-hot/20 rounded-lg p-3 flex items-baseline gap-3 opacity-70">
                  <span className="badge bg-hot/15 text-hot">DENIED</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-navy">{p.company}</span>
                    <span className="text-xs text-text-dim ml-2">{p.position}</span>
                    {triage.denialReason && <span className="text-[11px] text-hot ml-2 italic">· {triage.denialReason}</span>}
                  </div>
                  <button
                    onClick={() => triageProbe(p.id, "pending")}
                    className="text-[10px] text-muted hover:text-text"
                  >
                    Undo
                  </button>
                </div>
              );
            }

            // LATER card · resurfacing tomorrow
            if (status === "later") {
              return (
                <div key={p.id} className="bg-warn/5 border border-warn/20 rounded-lg p-3 flex items-baseline gap-3">
                  <span className="badge bg-warn/15 text-warn">LATER</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-navy">{p.company}</span>
                    <span className="text-xs text-text-dim ml-2">{p.position}</span>
                    <span className="text-[11px] text-warn ml-2 italic">· resurfaces tomorrow</span>
                  </div>
                  <button
                    onClick={() => triageProbe(p.id, "pending")}
                    className="text-[10px] text-muted hover:text-text"
                  >
                    Surface now
                  </button>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}
