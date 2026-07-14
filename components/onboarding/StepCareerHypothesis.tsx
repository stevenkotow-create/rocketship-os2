"use client";

// V3.5 · Discovery step · Career Hypothesis · 5-year trajectory
// Without this, the platform optimises for next-job fit but not 5-year fit

import { useState } from "react";
import { Orbit } from "@/components/icons";
import type { CareerHypothesis, ManagementAppetite, GrowthPace } from "@/lib/types";

const INDUSTRY_CHIPS = [
  "AI / ML",
  "DevTools",
  "Cyber",
  "FinTech (embedded)",
  "Climate / Energy",
  "Healthcare",
  "Education",
  "Logistics",
  "Music / Creator",
  "Hospitality",
  "Manufacturing",
  "Defence",
];

export function StepCareerHypothesis({
  initial,
  onSave,
  onSkip,
}: {
  initial?: CareerHypothesis;
  onSave: (hypothesis: CareerHypothesis) => void;
  onSkip: () => void;
}) {
  const [fiveYearVision, setFiveYearVision] = useState(initial?.fiveYearVision || "");
  const [managementAppetite, setManagementAppetite] = useState<ManagementAppetite | undefined>(initial?.managementAppetite);
  const [industryPreference, setIndustryPreference] = useState<string[]>(initial?.industryPreference || []);
  const [growthPace, setGrowthPace] = useState<GrowthPace | undefined>(initial?.growthPace);
  const [whatWinningLooksLike, setWhatWinningLooksLike] = useState(initial?.whatWinningLooksLike || "");

  function toggleIndustry(ind: string) {
    setIndustryPreference((prev) =>
      prev.includes(ind) ? prev.filter((p) => p !== ind) : [...prev, ind],
    );
  }

  function canSave() {
    return fiveYearVision.trim().length > 5 && managementAppetite && growthPace;
  }

  function handleSave() {
    if (!canSave()) return;
    onSave({
      fiveYearVision: fiveYearVision.trim(),
      managementAppetite: managementAppetite!,
      industryPreference,
      growthPace: growthPace!,
      whatWinningLooksLike: whatWinningLooksLike.trim(),
      capturedAt: new Date().toISOString(),
    });
  }

  return (
    <div>
      <div className="text-accent mb-3"><Orbit size={28} strokeWidth={1.5} /></div>
      <h2 className="text-[22px] font-bold text-text mb-2 tracking-tight">Career Hypothesis</h2>
      <p className="text-[13px] text-text-dim mb-6 max-w-2xl leading-relaxed">
        Mission Compass tells us your values. This tells us your trajectory. Same Mission Compass profile maps to wildly different roles depending on where you want to be in 5 years. 5 questions · 3 minutes.
      </p>

      {/* Q1 · 5-year vision */}
      <div className="mb-6">
        <label className="block label-caps mb-2">1 · Where do you see yourself in 5 years?</label>
        <textarea
          value={fiveYearVision}
          onChange={(e) => setFiveYearVision(e.target.value)}
          placeholder="e.g. CRO at a Series C company, or Senior IC at a rocket, or running my own agency · be specific"
          className="w-full text-[13px] p-3 border border-border rounded-md bg-surface min-h-[80px]"
        />
      </div>

      {/* Q2 · Management appetite */}
      <div className="mb-6">
        <label className="block label-caps mb-2">2 · Management appetite</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {([
            { id: "love-it", label: "Love it · want to manage", desc: "Building teams energises me" },
            { id: "open", label: "Open to it", desc: "Right team, right time, sure" },
            { id: "avoid", label: "Avoid · want to stay IC", desc: "Senior individual contributor lane" },
          ] as { id: ManagementAppetite; label: string; desc: string }[]).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setManagementAppetite(opt.id)}
              className={`text-left p-3 rounded-md border transition ${
                managementAppetite === opt.id
                  ? "bg-accent/10 border-accent"
                  : "bg-surface border-border hover:bg-surface-2"
              }`}
            >
              <div className={`text-[13px] font-semibold mb-1 ${managementAppetite === opt.id ? "text-accent" : "text-navy"}`}>
                {opt.label}
              </div>
              <div className="text-[11px] text-text-dim">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Q3 · Industry preference */}
      <div className="mb-6">
        <label className="block label-caps mb-2">3 · Industry preference · pick any number, leave blank for &ldquo;any&rdquo;</label>
        <div className="flex flex-wrap gap-2">
          {INDUSTRY_CHIPS.map((ind) => (
            <button
              key={ind}
              onClick={() => toggleIndustry(ind)}
              className={`text-[11px] px-3 py-1.5 rounded-md border transition ${
                industryPreference.includes(ind)
                  ? "bg-accent text-white border-accent"
                  : "bg-surface text-muted border-border hover:bg-surface-2"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Q4 · Growth pace */}
      <div className="mb-6">
        <label className="block label-caps mb-2">4 · Growth pace</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {([
            { id: "rocket", label: "Rocket · fast", desc: "Series A-C, hair on fire, learn-everything mode" },
            { id: "steady", label: "Steady · sustainable", desc: "Established company, real systems, learn and earn" },
            { id: "sustainable", label: "Stable · lifestyle", desc: "Predictable hours, optimise for life balance" },
          ] as { id: GrowthPace; label: string; desc: string }[]).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setGrowthPace(opt.id)}
              className={`text-left p-3 rounded-md border transition ${
                growthPace === opt.id
                  ? "bg-accent/10 border-accent"
                  : "bg-surface border-border hover:bg-surface-2"
              }`}
            >
              <div className={`text-[13px] font-semibold mb-1 ${growthPace === opt.id ? "text-accent" : "text-navy"}`}>
                {opt.label}
              </div>
              <div className="text-[11px] text-text-dim">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Q5 · What winning looks like */}
      <div className="mb-6">
        <label className="block label-caps mb-2">5 · What does winning look like in 5 years?</label>
        <textarea
          value={whatWinningLooksLike}
          onChange={(e) => setWhatWinningLooksLike(e.target.value)}
          placeholder="e.g. Equity worth $1M+ vested · partnered with a great team · still excited Monday morning"
          className="w-full text-[13px] p-3 border border-border rounded-md bg-surface min-h-[60px]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSave}
          disabled={!canSave()}
          className="px-5 py-2.5 bg-accent text-white rounded-md font-bold text-[13px] hover:bg-accent-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
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
