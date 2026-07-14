"use client";

// V3.5 · Discovery step · Probe Configuration preview + launch
// Auto-derives scrape criteria from all upstream Discovery inputs
// Shows the user what we'll be looking for · they can edit before launching

import { useState, useMemo } from "react";
import { Probe } from "@/components/icons";
import type { AppState, ProbeConfig } from "@/lib/types";

export function StepProbeConfig({
  state,
  onLaunch,
}: {
  state: AppState;
  onLaunch: (config: ProbeConfig) => void;
}) {
  // Auto-derive a starting config from all the upstream inputs
  const initial = useMemo<ProbeConfig>(() => {
    const now = new Date().toISOString();
    return {
      geographyFilter: state.logistics?.geography || ["Sydney", "Remote-AU"],
      roleTypeFilter: state.logistics?.roleLevels || ["BDR", "SDR", "AM"],
      salaryFloor: state.logistics?.salaryFloor || 130000,
      excludedIndustries: state.dealbreakers?.excludedIndustries || [],
      excludedLocations: state.dealbreakers?.excludedLocations || ["US-only", "EMEA-only"],
      freshnessGate: 90,
      topValues: state.valuesProfile?.topValues || [],
      industryPreference: state.careerHypothesis?.industryPreference || [],
      growthPaceTarget: state.careerHypothesis?.growthPace || "rocket",
      callingOrientation: state.valuesProfile?.callingOrientation,
      resumeKeywords: state.resumeAudit?.keywordDensity?.slice(0, 8).map((k) => k.keyword),
      targetSeatLevels: state.resumeAudit?.recommendedSeatLevels,
      configuredAt: now,
      active: true,
      cadence: "daily",
    };
  }, [state]);

  const [config, setConfig] = useState<ProbeConfig>(initial);

  // Detect which Discovery steps are missing · used to flag gaps
  const missing: string[] = [];
  if (!state.valuesProfile) missing.push("Mission Compass");
  if (!state.careerHypothesis) missing.push("Career Hypothesis");
  if (!state.resumeAudit) missing.push("Resume Audit");
  if (!state.logistics) missing.push("Logistics");
  if (!state.dealbreakers) missing.push("Dealbreakers");
  if (!state.networkSeed?.length) missing.push("Network Seed");

  function handleLaunch() {
    onLaunch({ ...config, configuredAt: new Date().toISOString(), active: true });
  }

  return (
    <div>
      <div className="text-accent mb-3"><Probe size={28} strokeWidth={1.5} /></div>
      <h2 className="text-[22px] font-bold text-text mb-2 tracking-tight">Probe Configuration</h2>
      <p className="text-[13px] text-text-dim mb-5 max-w-2xl leading-relaxed">
        Auto-derived from everything you&apos;ve set up. Hit launch and the scrape engine starts populating your Probes Inbox. Probes refine themselves over time based on which roles you approve vs jettison.
      </p>

      {missing.length > 0 && (
        <div className="bg-warn/10 border border-warn/30 rounded-lg p-4 mb-5">
          <strong className="block text-warn mb-1 text-[13px]">{missing.length} step{missing.length === 1 ? "" : "s"} skipped</strong>
          <p className="text-[12px] text-text-dim mb-1">Probes will still fire, but accuracy will be lower without:</p>
          <p className="text-[12px] text-warn font-semibold">{missing.join(" · ")}</p>
          <p className="text-[11px] text-muted mt-1 italic">You can come back to /onboarding anytime to fill these in.</p>
        </div>
      )}

      {/* Derived config preview */}
      <div className="card mb-4">
        <h3 className="text-[15px] font-semibold text-navy mb-3">Probe summary</h3>
        <p className="text-[13px] text-text-dim leading-relaxed">
          Show me roles that are: <strong className="text-navy">{config.geographyFilter.join(" / ")}</strong>{" "}
          · <strong className="text-navy">{config.roleTypeFilter.join(", ")}</strong> seats{" "}
          · <strong className="text-navy">${config.salaryFloor.toLocaleString()}+</strong> OTE floor{" "}
          · posted within <strong className="text-navy">{config.freshnessGate} days</strong>
          {config.excludedIndustries.length > 0 && (
            <> · NOT in <strong className="text-hot">{config.excludedIndustries.join(", ")}</strong></>
          )}
          {config.industryPreference.length > 0 && (
            <> · prefer <strong className="text-accent">{config.industryPreference.join(" / ")}</strong></>
          )}
          {config.topValues.length > 0 && (
            <> · values aligning with <strong className="text-accent">{config.topValues.slice(0, 3).join(", ")}</strong></>
          )}
          {" "}· growth pace <strong className="text-navy">{config.growthPaceTarget}</strong>
        </p>
      </div>

      {/* Hard filters */}
      <div className="card mb-4">
        <h3 className="text-[15px] font-semibold text-navy mb-2">Hard filters</h3>
        <p className="text-[11px] text-muted mb-3 italic">These remove roles from the scrape entirely</p>
        <div className="space-y-2 text-[12px]">
          <div className="flex justify-between gap-2 flex-wrap">
            <span className="text-text-dim">Geography</span>
            <span className="text-navy font-semibold">{config.geographyFilter.join(", ")}</span>
          </div>
          <div className="flex justify-between gap-2 flex-wrap">
            <span className="text-text-dim">Role types</span>
            <span className="text-navy font-semibold">{config.roleTypeFilter.join(", ")}</span>
          </div>
          <div className="flex justify-between gap-2 flex-wrap">
            <span className="text-text-dim">Salary floor</span>
            <span className="text-navy font-semibold">${config.salaryFloor.toLocaleString()}+ OTE</span>
          </div>
          <div className="flex justify-between gap-2 flex-wrap">
            <span className="text-text-dim">Freshness</span>
            <span className="text-navy font-semibold">Posted within {config.freshnessGate} days</span>
          </div>
          <div className="flex justify-between gap-2 flex-wrap">
            <span className="text-text-dim">Excluded industries</span>
            <span className="text-hot font-semibold">{config.excludedIndustries.length ? config.excludedIndustries.join(", ") : "none"}</span>
          </div>
          <div className="flex justify-between gap-2 flex-wrap">
            <span className="text-text-dim">Excluded locations</span>
            <span className="text-hot font-semibold">{config.excludedLocations.length ? config.excludedLocations.join(", ") : "none"}</span>
          </div>
        </div>
      </div>

      {/* Soft scoring */}
      <div className="card mb-4">
        <h3 className="text-[15px] font-semibold text-accent mb-2">Soft scoring inputs</h3>
        <p className="text-[11px] text-muted mb-3 italic">These rank and score roles · don&apos;t remove them</p>
        <div className="space-y-2 text-[12px]">
          <div className="flex justify-between gap-2 flex-wrap">
            <span className="text-text-dim">Top values</span>
            <span className="text-accent font-semibold">{config.topValues.length ? config.topValues.slice(0, 3).join(", ") : "Set Mission Compass to populate"}</span>
          </div>
          <div className="flex justify-between gap-2 flex-wrap">
            <span className="text-text-dim">Industry preference</span>
            <span className="text-accent font-semibold">{config.industryPreference.length ? config.industryPreference.join(", ") : "Any"}</span>
          </div>
          <div className="flex justify-between gap-2 flex-wrap">
            <span className="text-text-dim">Growth pace target</span>
            <span className="text-accent font-semibold">{config.growthPaceTarget}</span>
          </div>
          {config.callingOrientation && (
            <div className="flex justify-between gap-2 flex-wrap">
              <span className="text-text-dim">Calling orientation</span>
              <span className="text-accent font-semibold">{config.callingOrientation}</span>
            </div>
          )}
          {config.targetSeatLevels && config.targetSeatLevels.length > 0 && (
            <div className="flex justify-between gap-2 flex-wrap">
              <span className="text-text-dim">Target seats (from CV)</span>
              <span className="text-accent font-semibold">{config.targetSeatLevels.slice(0, 3).join(" / ")}</span>
            </div>
          )}
          {config.resumeKeywords && config.resumeKeywords.length > 0 && (
            <div className="flex justify-between gap-2 flex-wrap">
              <span className="text-text-dim">Resume keywords</span>
              <span className="text-accent font-semibold">{config.resumeKeywords.slice(0, 4).join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cadence */}
      <div className="card mb-5">
        <h3 className="text-[15px] font-semibold text-navy mb-3">Probe cadence</h3>
        <div className="grid grid-cols-3 gap-2">
          {(["daily", "twice-daily", "weekly"] as ProbeConfig["cadence"][]).map((c) => (
            <button
              key={c}
              onClick={() => setConfig({ ...config, cadence: c })}
              className={`text-[12px] py-2 px-3 rounded-md border transition capitalize ${
                config.cadence === c
                  ? "bg-accent/10 border-accent text-accent font-semibold"
                  : "bg-surface border-border text-muted hover:bg-surface-2"
              }`}
            >
              {c.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Launch */}
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-5 mb-3">
        <h3 className="text-[16px] font-bold text-accent mb-1">Ready to launch</h3>
        <p className="text-[13px] text-text-dim mb-4">
          On launch, the first scrape runs and Probes Inbox starts filling. Each role gets scored against your Mission Compass + Logistics + Resume + Career Hypothesis. You triage from there.
        </p>
        <button
          onClick={handleLaunch}
          className="px-6 py-3 bg-accent text-white rounded-md font-bold text-[14px] hover:bg-accent-2 transition"
        >
          🚀 Launch probes →
        </button>
      </div>
    </div>
  );
}
