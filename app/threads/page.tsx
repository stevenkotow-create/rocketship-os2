"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/lib/storage";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import { SolarSystem } from "@/components/SolarSystem";
import { Constellation as ConstellationIcon } from "@/components/icons";
import type { Contact, ContactStatus, ContactRole, Opportunity } from "@/lib/types";
import {
  computeStakeholderHealth,
  missingRequiredRoles,
  healthLabel,
} from "@/lib/star-map";

const ROLE_LABELS: Record<ContactRole, string> = {
  APAC_AE: "APAC AE / Sales Lead",
  GTM_RECRUITER: "GTM Recruiter / TA",
  PEER: "Peer in role",
  FOUNDER: "Founder",
  HM: "Hiring Manager",
  OTHER: "Other",
};

const ROLE_PRIORITY: ContactRole[] = ["APAC_AE", "GTM_RECRUITER", "HM", "PEER", "FOUNDER", "OTHER"];

const STATUS_PILL: Record<ContactStatus, string> = {
  identified: "bg-muted/20 text-muted",
  silent: "bg-navy/15 text-navy",
  dm: "bg-accent/15 text-accent",
  replied: "bg-good/20 text-good",
  advanced: "bg-good/25 text-good",
  cold: "bg-hot/15 text-hot",
};

const STATUS_LABEL: Record<ContactStatus, string> = {
  identified: "Identified",
  silent: "Silent",
  dm: "DM sent",
  replied: "Replied",
  advanced: "Advanced",
  cold: "Cold",
};

type ViewMode = "galaxy" | "deep";

export default function MultithreadGalaxy() {
  const [state] = useAppState();
  const ALL_OPPS = [...OPPORTUNITIES, ...(state.customOpps || [])];
  const [view, setView] = useState<ViewMode>("galaxy");

  const allOpps: Opportunity[] = ALL_OPPS.map((o) => ({ ...o, ...(state.opps[o.id] || {}) } as Opportunity));
  const active = allOpps.filter((o) => o.contacts && o.contacts.length && !["closed", "accepted"].includes(o.stage));

  // Galaxy stats
  const totalThreads = active.reduce((sum, o) => sum + (o.contacts?.length || 0), 0);
  const sentThreads = active.reduce((sum, o) => sum + (o.contacts?.filter((c) => ["dm", "replied", "advanced"].includes(c.status)).length || 0), 0);
  const repliedThreads = active.reduce((sum, o) => sum + (o.contacts?.filter((c) => ["replied", "advanced"].includes(c.status)).length || 0), 0);

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-accent"><ConstellationIcon size={20} strokeWidth={1.5} /></span>
            <h1 className="text-[32px] font-bold tracking-tight text-text m-0">Star Map</h1>
          </div>
          <p className="text-[14px] text-text-dim m-0 max-w-3xl">
            Per-opp stakeholder threading · HM + Recruiter + Peer for every active mission. The 3-stakeholder framework live.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-surface-2 border border-border rounded-md p-0.5">
            <button
              onClick={() => setView("galaxy")}
              className={`font-mono text-[11px] uppercase tracking-[1.5px] px-3 py-1.5 rounded transition ${view === "galaxy" ? "bg-accent text-white" : "text-muted hover:text-text"}`}
            >
              Galaxy
            </button>
            <button
              onClick={() => setView("deep")}
              className={`font-mono text-[11px] uppercase tracking-[1.5px] px-3 py-1.5 rounded transition ${view === "deep" ? "bg-accent text-white" : "text-muted hover:text-text"}`}
            >
              Deep
            </button>
          </div>
          <span className="font-mono text-[10px] text-muted lowercase">SM.01</span>
        </div>
      </div>

      <div className="retro-band mb-6"><span /><span /></div>

      {/* V2 · Stakeholder Health summary · operator playbook signals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="stat border-good/30">
          <div className="text-[10px] text-muted uppercase tracking-wider">Fully threaded</div>
          <div className="text-2xl font-bold mt-0.5 text-good">
            {active.filter((o) => computeStakeholderHealth(o.contacts) === "complete").length}
          </div>
          <div className="text-[10px] text-text-dim mt-0.5">HM + Recruiter + Peer all engaged</div>
        </div>
        <div className="stat border-accent/30">
          <div className="text-[10px] text-muted uppercase tracking-wider">Partial · 2 of 3</div>
          <div className="text-2xl font-bold mt-0.5 text-accent">
            {active.filter((o) => computeStakeholderHealth(o.contacts) === "partial").length}
          </div>
          <div className="text-[10px] text-text-dim mt-0.5">Missing one required role</div>
        </div>
        <div className="stat border-warn/30">
          <div className="text-[10px] text-muted uppercase tracking-wider">Single thread</div>
          <div className="text-2xl font-bold mt-0.5 text-warn">
            {active.filter((o) => computeStakeholderHealth(o.contacts) === "single-thread").length}
          </div>
          <div className="text-[10px] text-text-dim mt-0.5">Risk · single point of failure</div>
        </div>
        <div className="stat border-hot/30">
          <div className="text-[10px] text-muted uppercase tracking-wider">Unthreaded</div>
          <div className="text-2xl font-bold mt-0.5 text-hot">
            {active.filter((o) => computeStakeholderHealth(o.contacts) === "unthreaded").length}
          </div>
          <div className="text-[10px] text-text-dim mt-0.5">Build the star map first</div>
        </div>
      </div>

      {/* Legacy galaxy stats · activity volume */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat">
          <div className="text-[10px] text-muted uppercase tracking-wider">Active systems</div>
          <div className="text-2xl font-bold mt-0.5">{active.length}</div>
        </div>
        <div className="stat">
          <div className="text-[10px] text-muted uppercase tracking-wider">DMs sent</div>
          <div className="text-2xl font-bold mt-0.5 text-accent">{sentThreads}</div>
        </div>
        <div className="stat">
          <div className="text-[10px] text-muted uppercase tracking-wider">Replies</div>
          <div className="text-2xl font-bold mt-0.5 text-good">{repliedThreads}</div>
        </div>
      </div>

      {active.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3 opacity-30">🌌</div>
          <p className="text-sm text-text-dim">No multi-threaded missions yet. Build solar systems by adding contacts in Mission Profiles.</p>
        </div>
      ) : view === "galaxy" ? (
        /* GALAXY VIEW · All systems in a grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {active.map((opp) => {
            const contacts = (opp.contacts || []).slice().sort((a, b) => ROLE_PRIORITY.indexOf(a.role) - ROLE_PRIORITY.indexOf(b.role));
            const sent = contacts.filter((c) => ["dm", "replied", "advanced"].includes(c.status)).length;
            const total = contacts.length;
            const replied = contacts.filter((c) => ["replied", "advanced"].includes(c.status)).length;
            // V2 · 3-stakeholder framework signals
            const health = computeStakeholderHealth(contacts);
            const missing = missingRequiredRoles(contacts);
            const healthBg =
              health === "complete" ? "bg-good/15 text-good border-good/30" :
              health === "partial" ? "bg-accent/15 text-accent border-accent/30" :
              health === "single-thread" ? "bg-warn/15 text-warn border-warn/30" :
              "bg-hot/15 text-hot border-hot/30";

            return (
              <Link
                key={opp.id}
                href={`/mission/${opp.id}`}
                className="card bg-gradient-to-br from-surface to-navy/5 hover:border-accent transition cursor-pointer group"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-navy truncate group-hover:text-accent">{opp.company}</h3>
                    <p className="text-[11px] text-text-dim truncate">{opp.position}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-accent">{sent}/{total}</div>
                    {replied > 0 && <div className="text-[10px] text-good">{replied} replied</div>}
                  </div>
                </div>
                {/* V2 · Health pill */}
                <div className={`text-[10px] font-semibold px-2 py-1 rounded border mb-2 ${healthBg}`}>
                  {healthLabel(health)}
                  {missing.length > 0 && (
                    <span className="ml-1 opacity-80">
                      · need {missing.map((m) => m.label.split(" ")[0]).join(" + ")}
                    </span>
                  )}
                </div>
                <div className="bg-surface-2 rounded-lg p-2 mb-2 border border-border">
                  <SolarSystem company={opp.company} contacts={contacts} size="sm" showLabels={false} />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {contacts.slice(0, 4).map((c) => (
                    <span key={c.name} className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_PILL[c.status]}`}>
                      {c.name.split(" ")[0]}
                    </span>
                  ))}
                  {contacts.length > 4 && <span className="text-[10px] px-1.5 py-0.5 text-muted">+{contacts.length - 4}</span>}
                </div>
                <div className="text-[10px] text-accent mt-2 opacity-0 group-hover:opacity-100 transition">Open Mission Profile →</div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* DEEP VIEW · Larger systems, more detail */
        <div className="space-y-4">
          {active.map((opp) => {
            const contacts = (opp.contacts || []).slice().sort((a, b) => ROLE_PRIORITY.indexOf(a.role) - ROLE_PRIORITY.indexOf(b.role));
            const sent = contacts.filter((c) => ["dm", "replied", "advanced"].includes(c.status)).length;
            const total = contacts.length;
            const healthPct = total > 0 ? Math.round((sent / total) * 100) : 0;
            const healthColor = healthPct >= 67 ? "text-good" : healthPct >= 34 ? "text-warn" : "text-hot";

            return (
              <div key={opp.id} className="card">
                {/* Header */}
                <div className="flex justify-between items-start gap-4 flex-wrap mb-4">
                  <div className="flex-1 min-w-[260px]">
                    <Link href={`/mission/${opp.id}`} className="group">
                      <h2 className="text-xl font-bold text-navy group-hover:text-accent transition">{opp.company} →</h2>
                    </Link>
                    <p className="text-sm text-text-dim mt-1">{opp.position}</p>
                    <div className="flex gap-2 mt-2">
                      {opp.priority === "P1" && <span className="badge bg-accent/20 text-accent">P1</span>}
                      {opp.pattern && <span className="badge bg-navy/15 text-navy">Pattern {opp.pattern}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${healthColor}`}>{sent}/{total}</div>
                    <div className="text-[11px] text-muted uppercase tracking-wider">threads active</div>
                    <div className="text-[10px] text-text-dim mt-1">{healthPct}% reached</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Solar System */}
                  <div className="bg-surface-2 border border-border rounded-lg p-3">
                    <SolarSystem company={opp.company} contacts={contacts} size="md" showLabels={true} />
                  </div>
                  {/* Contact list */}
                  <div className="space-y-2">
                    {contacts.map((c) => (
                      <div key={c.name} className="flex items-center gap-2 p-2.5 bg-surface-2 border border-border rounded">
                        <div className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${STATUS_PILL[c.status]}`}>
                          {STATUS_LABEL[c.status]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold truncate">{c.name}</div>
                          <div className="text-[10px] text-muted">{ROLE_LABELS[c.role]}</div>
                        </div>
                        {c.linkedin && (
                          <a href={c.linkedin} target="_blank" rel="noreferrer" className="text-[10px] text-navy hover:underline">
                            ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  <Link href={`/mission/${opp.id}`} className="text-xs text-accent hover:underline font-semibold">
                    Open full Mission Profile →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status legend */}
      <div className="card mt-6">
        <h3 className="text-sm font-semibold mb-2 text-navy">Solar system legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-accent" /><strong>Sun</strong> · Company</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border-2 border-muted/40 bg-transparent" /><strong>Inner orbit</strong> · APAC AE / HM</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border-2 border-navy/40 bg-transparent" /><strong>Middle orbit</strong> · Recruiter</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border-2 border-accent/40 bg-transparent" /><strong>Outer orbit</strong> · Peer</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-muted opacity-50" />Dim = identified only</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-good shadow-lg" />Glowing = replied / advanced</span>
        </div>
      </div>
    </div>
  );
}
