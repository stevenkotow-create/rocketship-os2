"use client";

// V3.5 · Discovery step · Logistics + Dealbreakers (combined)
// Logistics = nice-to-haves that shape scoring · Dealbreakers = hard constraints that disqualify

import { useState } from "react";
import { CompassRose } from "@/components/icons";
import type { Logistics, Dealbreakers } from "@/lib/types";

const LOCATIONS = [
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Perth",
  "Adelaide",
  "Remote-AU",
  "Remote-APAC",
  "Auckland",
  "Singapore",
  "Hong Kong",
  "Tokyo",
];

const ROLE_LEVELS = ["BDR", "SDR", "AM", "CSM", "AE", "Manager", "Director"];

const INDUSTRIES_FOR_EXCLUSION = [
  "Defence",
  "Gambling",
  "Tobacco",
  "Alcohol",
  "Crypto",
  "Adult",
  "MLM",
  "Healthcare",
  "Mining",
  "Politics",
];

export function StepLogisticsDealbreakers({
  initialLogistics,
  initialDealbreakers,
  onSave,
  onSkip,
}: {
  initialLogistics?: Logistics;
  initialDealbreakers?: Dealbreakers;
  onSave: (logistics: Logistics, dealbreakers: Dealbreakers) => void;
  onSkip: () => void;
}) {
  // Logistics state
  const [salaryFloor, setSalaryFloor] = useState(initialLogistics?.salaryFloor || 130000);
  const [salaryTarget, setSalaryTarget] = useState(initialLogistics?.salaryTarget || 170000);
  const [salaryCurrency, setSalaryCurrency] = useState<Logistics["salaryCurrency"]>(initialLogistics?.salaryCurrency || "AUD");
  const [hybridPreference, setHybridPreference] = useState<Logistics["hybridPreference"]>(
    initialLogistics?.hybridPreference || "hybrid",
  );
  const [geography, setGeography] = useState<string[]>(initialLogistics?.geography || ["Sydney", "Remote-AU"]);
  const [roleLevels, setRoleLevels] = useState<string[]>(initialLogistics?.roleLevels || ["BDR", "SDR", "AM"]);
  const [progressionSpeed, setProgressionSpeed] = useState<Logistics["progressionSpeed"]>(
    initialLogistics?.progressionSpeed || "fast",
  );
  const [equityVsCash, setEquityVsCash] = useState(initialLogistics?.equityVsCash ?? 35);

  // Dealbreakers state
  const [excludedIndustries, setExcludedIndustries] = useState<string[]>(initialDealbreakers?.excludedIndustries || []);
  const [excludedLocations, setExcludedLocations] = useState<string[]>(initialDealbreakers?.excludedLocations || ["US-only", "EMEA-only"]);
  const [excludedRoleTypes, setExcludedRoleTypes] = useState<string[]>(initialDealbreakers?.excludedRoleTypes || []);
  const [dealbreakerNotes, setDealbreakerNotes] = useState(initialDealbreakers?.notes || "");

  function toggle<T extends string>(setter: (v: T[]) => void, current: T[], item: T) {
    setter(current.includes(item) ? current.filter((c) => c !== item) : [...current, item]);
  }

  function handleSave() {
    const now = new Date().toISOString();
    const logistics: Logistics = {
      salaryFloor,
      salaryTarget,
      salaryCurrency,
      hybridPreference,
      geography,
      roleLevels,
      progressionSpeed,
      equityVsCash,
      capturedAt: now,
    };
    const dealbreakers: Dealbreakers = {
      excludedIndustries,
      excludedLocations,
      excludedRoleTypes,
      notes: dealbreakerNotes.trim() || undefined,
      capturedAt: now,
    };
    onSave(logistics, dealbreakers);
  }

  return (
    <div>
      <div className="text-accent mb-3"><CompassRose size={28} strokeWidth={1.5} /></div>
      <h2 className="text-[22px] font-bold text-text mb-2 tracking-tight">Logistics + Dealbreakers</h2>
      <p className="text-[13px] text-text-dim mb-6 max-w-2xl leading-relaxed">
        Logistics are nice-to-haves that shape scoring. Dealbreakers are hard constraints that disqualify a role from ever surfacing. Both feed the Probe Config.
      </p>

      {/* ─── LOGISTICS ─── */}
      <div className="mb-8">
        <h3 className="text-[16px] font-semibold text-navy mb-3 tracking-tight">Logistics · the nice-to-haves</h3>

        {/* Salary range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div>
            <label className="block label-caps mb-1.5">Currency</label>
            <select
              value={salaryCurrency}
              onChange={(e) => setSalaryCurrency(e.target.value as Logistics["salaryCurrency"])}
              className="w-full text-[13px] p-2.5 border border-border rounded-md bg-surface"
            >
              <option value="AUD">AUD</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className="block label-caps mb-1.5">Salary floor (OTE)</label>
            <input
              type="number"
              value={salaryFloor}
              onChange={(e) => setSalaryFloor(Number(e.target.value))}
              step={5000}
              className="w-full text-[13px] p-2.5 border border-border rounded-md bg-surface"
            />
          </div>
          <div>
            <label className="block label-caps mb-1.5">Salary target (OTE)</label>
            <input
              type="number"
              value={salaryTarget}
              onChange={(e) => setSalaryTarget(Number(e.target.value))}
              step={5000}
              className="w-full text-[13px] p-2.5 border border-border rounded-md bg-surface"
            />
          </div>
        </div>

        {/* Hybrid preference */}
        <div className="mb-5">
          <label className="block label-caps mb-2">Hybrid preference</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(["remote", "hybrid", "in-office", "flexible"] as Logistics["hybridPreference"][]).map((opt) => (
              <button
                key={opt}
                onClick={() => setHybridPreference(opt)}
                className={`text-[12px] py-2 px-3 rounded-md border transition capitalize ${
                  hybridPreference === opt
                    ? "bg-accent/10 border-accent text-accent font-semibold"
                    : "bg-surface border-border text-muted hover:bg-surface-2"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Geography */}
        <div className="mb-5">
          <label className="block label-caps mb-2">Geography · which locations work</label>
          <div className="flex flex-wrap gap-1.5">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => toggle(setGeography, geography, loc)}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition ${
                  geography.includes(loc)
                    ? "bg-accent text-white border-accent"
                    : "bg-surface text-muted border-border hover:bg-surface-2"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Role levels */}
        <div className="mb-5">
          <label className="block label-caps mb-2">Role levels · open seat types</label>
          <div className="flex flex-wrap gap-1.5">
            {ROLE_LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => toggle(setRoleLevels, roleLevels, lvl)}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition ${
                  roleLevels.includes(lvl)
                    ? "bg-accent text-white border-accent"
                    : "bg-surface text-muted border-border hover:bg-surface-2"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Progression speed */}
        <div className="mb-5">
          <label className="block label-caps mb-2">Expected progression speed</label>
          <div className="grid grid-cols-3 gap-2">
            {(["fast", "steady", "stable"] as Logistics["progressionSpeed"][]).map((opt) => (
              <button
                key={opt}
                onClick={() => setProgressionSpeed(opt)}
                className={`text-[12px] py-2 px-3 rounded-md border transition capitalize ${
                  progressionSpeed === opt
                    ? "bg-accent/10 border-accent text-accent font-semibold"
                    : "bg-surface border-border text-muted hover:bg-surface-2"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Equity vs cash slider */}
        <div className="mb-2">
          <label className="block label-caps mb-2">
            Equity vs cash preference · {equityVsCash}% equity weighted
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={equityVsCash}
            onChange={(e) => setEquityVsCash(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted mt-1">
            <span>All cash · stable comp</span>
            <span>Balanced</span>
            <span>All equity · upside</span>
          </div>
        </div>
      </div>

      {/* ─── DEALBREAKERS ─── */}
      <div className="mb-8 border-t border-border pt-6">
        <h3 className="text-[16px] font-semibold text-hot mb-1 tracking-tight">Dealbreakers · the hard nos</h3>
        <p className="text-[12px] text-text-dim mb-4">
          Anything checked here removes roles from your scrape entirely. Be honest · saves triage time later.
        </p>

        <div className="mb-5">
          <label className="block label-caps mb-2">Industries to exclude</label>
          <div className="flex flex-wrap gap-1.5">
            {INDUSTRIES_FOR_EXCLUSION.map((ind) => (
              <button
                key={ind}
                onClick={() => toggle(setExcludedIndustries, excludedIndustries, ind)}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition ${
                  excludedIndustries.includes(ind)
                    ? "bg-hot text-white border-hot"
                    : "bg-surface text-muted border-border hover:bg-surface-2"
                }`}
              >
                {excludedIndustries.includes(ind) ? "✗" : "+"} {ind}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block label-caps mb-2">Locations that won&apos;t work</label>
          <div className="flex flex-wrap gap-1.5">
            {["US-only", "EMEA-only", "EU-only", "Remote-USA", "Remote-EMEA", "Hybrid-Sydney-CBD-5d"].map((loc) => (
              <button
                key={loc}
                onClick={() => toggle(setExcludedLocations, excludedLocations, loc)}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition ${
                  excludedLocations.includes(loc)
                    ? "bg-hot text-white border-hot"
                    : "bg-surface text-muted border-border hover:bg-surface-2"
                }`}
              >
                {excludedLocations.includes(loc) ? "✗" : "+"} {loc}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block label-caps mb-2">Role types that won&apos;t work</label>
          <div className="flex flex-wrap gap-1.5">
            {["Field AE", "Manager", "Director", "Outbound-only SDR", "Inbound-only", "Account Director"].map((rt) => (
              <button
                key={rt}
                onClick={() => toggle(setExcludedRoleTypes, excludedRoleTypes, rt)}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition ${
                  excludedRoleTypes.includes(rt)
                    ? "bg-hot text-white border-hot"
                    : "bg-surface text-muted border-border hover:bg-surface-2"
                }`}
              >
                {excludedRoleTypes.includes(rt) ? "✗" : "+"} {rt}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-2">
          <label className="block label-caps mb-2">Other hard nos · free text</label>
          <textarea
            value={dealbreakerNotes}
            onChange={(e) => setDealbreakerNotes(e.target.value)}
            placeholder="e.g. No roles requiring 5d in-office · no roles selling into healthcare · no early-stage with <12mo runway"
            className="w-full text-[13px] p-3 border border-border rounded-md bg-surface min-h-[60px]"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-accent text-white rounded-md font-bold text-[13px] hover:bg-accent-2 transition"
        >
          Save and continue →
        </button>
        <button onClick={onSkip} className="px-5 py-2.5 text-text-dim hover:text-navy text-[13px] underline">
          Skip for now
        </button>
      </div>
    </div>
  );
}
