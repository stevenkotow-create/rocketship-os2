"use client";

// V3.0 · Mission Compass · the values calibration surface
// Calm, honest, on-your-side. No gamified urgency.
// Builds the user's Values Profile via guided self-reflection.
// Source-of-truth science: Schwartz values · SDT needs · self-concordance · RIASEC · Direction Vows.

import { useState } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/storage";
import { CompassRose } from "@/components/icons";
import {
  SCHWARTZ_VALUES_DEFS,
  SDT_NEEDS_DEFS,
  RIASEC_DEFS,
  CALLING_DEFS,
  emptyValuesProfile,
  isCalibrated,
  type SchwartzValue,
  type SDTNeed,
  type RiasecType,
  type SelfConcordanceTendency,
  type CallingOrientation,
  type LifeDomain,
  type ValuesProfile,
} from "@/lib/mission-compass";
import type { MissionCompassValuesProfile } from "@/lib/types";

type Step = "intro" | "values" | "needs" | "concordance" | "calling" | "riasec" | "vows" | "retrodiction" | "review";

const STEP_ORDER: Step[] = ["intro", "values", "needs", "concordance", "calling", "riasec", "vows", "retrodiction", "review"];

const STEP_LABELS: Record<Step, string> = {
  intro: "What this is",
  values: "Top values",
  needs: "Psychological needs",
  concordance: "Self-concordance",
  calling: "Calling orientation",
  riasec: "Vocational fit",
  vows: "Direction vows",
  retrodiction: "Past decisions",
  review: "Review + save",
};

export default function MissionCompassPage() {
  const [state, update] = useAppState();
  const existing = state.valuesProfile as MissionCompassValuesProfile | undefined;
  const [step, setStep] = useState<Step>(existing && isCalibrated(existing as unknown as ValuesProfile) ? "review" : "intro");

  // Working draft · only saved on completion
  const [draft, setDraft] = useState<ValuesProfile>(() => {
    if (existing) {
      return existing as unknown as ValuesProfile;
    }
    return emptyValuesProfile();
  });

  const stepIdx = STEP_ORDER.indexOf(step);
  const progressPct = (stepIdx / (STEP_ORDER.length - 1)) * 100;

  function goNext() {
    const next = STEP_ORDER[stepIdx + 1];
    if (next) setStep(next);
  }
  function goBack() {
    const prev = STEP_ORDER[stepIdx - 1];
    if (prev) setStep(prev);
  }

  function saveAndComplete() {
    const final: ValuesProfile = {
      ...draft,
      calibratedAt: new Date().toISOString(),
      version: (existing?.version || 0) + 1,
    };
    update((s) => ({
      ...s,
      valuesProfile: final as unknown as MissionCompassValuesProfile,
    }));
    setStep("review");
  }

  return (
    <div>
      {/* V4 · Header */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-accent"><CompassRose size={20} strokeWidth={1.5} /></span>
            <h1 className="text-[32px] font-bold tracking-tight text-text m-0">Mission Compass</h1>
          </div>
          <p className="text-[14px] text-text-dim m-0 max-w-3xl">
            ORS doesn&apos;t score opportunities · it assesses them against who you actually are. 10-15 minute calibration. The platform is on your side.
          </p>
        </div>
        <span className="font-mono text-[10px] text-muted lowercase">MC-V.01</span>
      </div>

      <div className="retro-band mb-6"><span /><span /></div>

      {/* V3.0 · Methods + science strip · transparency about what's behind the assessment */}
      <div className="mb-6 bg-purple/5 border border-purple/30 rounded-lg p-4">
        <div className="flex items-start gap-3 flex-wrap">
          <span className="text-2xl flex-shrink-0">📖</span>
          <div className="flex-1 min-w-[260px]">
            <div className="text-[12px] font-bold text-navy mb-1">
              Research-informed across 12 peer-reviewed frameworks
            </div>
            <p className="text-[12px] text-text-dim leading-relaxed">
              Schwartz Values · SDT · Self-Concordance · ACT Direction Vows · Holland RIASEC · JD-R · plus modern OB (Job Crafting, Calling Orientation, Person-Environment Fit, Meaningful Work, Psychological Safety, Areas of Worklife Survey). Your profile stays on your device. Never sold, never shared.
            </p>
          </div>
        </div>
      </div>

      {/* Progress strip */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[1.5px] text-text-dim font-semibold mb-2">
          <span>{STEP_LABELS[step]}</span>
          <span>Step {stepIdx + 1} of {STEP_ORDER.length}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="card-elevated">
        {step === "intro" && <StepIntro onNext={goNext} alreadyCalibrated={isCalibrated(existing as unknown as ValuesProfile)} />}
        {step === "values" && <StepValues draft={draft} setDraft={setDraft} onNext={goNext} onBack={goBack} />}
        {step === "needs" && <StepNeeds draft={draft} setDraft={setDraft} onNext={goNext} onBack={goBack} />}
        {step === "concordance" && <StepConcordance draft={draft} setDraft={setDraft} onNext={goNext} onBack={goBack} />}
        {step === "calling" && <StepCalling draft={draft} setDraft={setDraft} onNext={goNext} onBack={goBack} />}
        {step === "riasec" && <StepRiasec draft={draft} setDraft={setDraft} onNext={goNext} onBack={goBack} />}
        {step === "vows" && <StepVows draft={draft} setDraft={setDraft} onNext={goNext} onBack={goBack} />}
        {step === "retrodiction" && <StepRetrodiction draft={draft} setDraft={setDraft} onNext={saveAndComplete} onBack={goBack} />}
        {step === "review" && <StepReview profile={draft} onRecalibrate={() => setStep("values")} />}
      </div>
    </div>
  );
}

// ────── Step components ──────

function StepIntro({ onNext, alreadyCalibrated }: { onNext: () => void; alreadyCalibrated: boolean }) {
  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-semibold text-navy">Why this exists</h2>
      <p className="text-[14px] leading-relaxed text-text-dim">
        Most platforms keyword-match you against jobs. We do the opposite. We profile <strong>who you actually are</strong> · your values, your psychological needs, the kind of work that fits you · and score every opportunity against that.
      </p>
      <p className="text-[14px] leading-relaxed text-text-dim">
        That&apos;s how an honest read becomes &ldquo;this would deplete your autonomy&rdquo; instead of &ldquo;94% match.&rdquo; Useful beats flattering.
      </p>

      <div className="bg-bg border border-border rounded-lg p-4 my-4">
        <div className="label-caps mb-2">What you&apos;ll cover</div>
        <ul className="text-[13px] text-text-dim leading-relaxed list-disc ml-5">
          <li>Top values (Schwartz · what genuinely matters)</li>
          <li>Psychological needs (autonomy / competence / relatedness)</li>
          <li>Self-concordance (intrinsic vs external motivation)</li>
          <li>Vocational fit (RIASEC)</li>
          <li>Direction Vows (work / health / money / relationships)</li>
          <li>Behavioural retrodiction (what your past choices reveal)</li>
        </ul>
      </div>

      <p className="text-[12px] italic text-muted">
        Your values profile is yours. Stored on your device. Privacy is the posture.
      </p>

      <div className="flex gap-2 pt-2">
        <button onClick={onNext} className="px-5 py-2.5 bg-accent text-white rounded-md text-sm font-semibold hover:bg-accent-2">
          {alreadyCalibrated ? "Re-calibrate" : "Begin calibration"} →
        </button>
        {alreadyCalibrated && (
          <Link href="/" className="px-5 py-2.5 text-text-dim hover:text-navy text-sm">
            Cancel
          </Link>
        )}
      </div>
    </div>
  );
}

function StepValues({
  draft,
  setDraft,
  onNext,
  onBack,
}: {
  draft: ValuesProfile;
  setDraft: (d: ValuesProfile) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const allValues = Object.keys(SCHWARTZ_VALUES_DEFS) as SchwartzValue[];
  const top = draft.topValues;
  const canContinue = top.length >= 3 && top.length <= 5;

  function toggleValue(v: SchwartzValue) {
    if (top.includes(v)) {
      setDraft({ ...draft, topValues: top.filter((x) => x !== v) });
    } else if (top.length < 5) {
      setDraft({ ...draft, topValues: [...top, v] });
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-semibold text-navy">Your top values</h2>
      <p className="text-[14px] leading-relaxed text-text-dim">
        Pick the <strong>3 to 5 values that matter most</strong> to you in how you work. The honest ones, not the ones that sound good. The order doesn&apos;t matter yet · we&apos;ll refine.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-4">
        {allValues.map((v) => {
          const def = SCHWARTZ_VALUES_DEFS[v];
          const isSelected = top.includes(v);
          return (
            <button
              key={v}
              onClick={() => toggleValue(v)}
              className={`text-left p-3 border rounded-lg transition ${
                isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
              }`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[14px] font-bold text-navy">{def.name}</span>
                {isSelected && <span className="text-[10px] uppercase tracking-wider text-accent font-bold">Selected</span>}
              </div>
              <p className="text-[12px] text-text-dim leading-snug">{def.brief}</p>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-muted">{top.length} of 3-5 selected</p>

      <div className="flex gap-2 pt-2">
        <button onClick={onBack} className="px-4 py-2 text-text-dim hover:text-navy text-sm">← Back</button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="px-5 py-2.5 bg-accent text-white rounded-md text-sm font-semibold hover:bg-accent-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function StepNeeds({
  draft,
  setDraft,
  onNext,
  onBack,
}: {
  draft: ValuesProfile;
  setDraft: (d: ValuesProfile) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const needs = draft.needsPriorities as SDTNeed[];

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...needs];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setDraft({ ...draft, needsPriorities: next });
  }
  function moveDown(idx: number) {
    if (idx === needs.length - 1) return;
    const next = [...needs];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setDraft({ ...draft, needsPriorities: next });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-semibold text-navy">Psychological needs</h2>
      <p className="text-[14px] leading-relaxed text-text-dim">
        SDT says three needs drive every workplace experience. Rank them in order of how much YOU need each one. The top one is what you&apos;ll suffer most without.
      </p>

      <div className="space-y-2 my-4">
        {needs.map((n, idx) => {
          const def = SDT_NEEDS_DEFS[n];
          return (
            <div key={n} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-surface">
              <span className="text-[20px] font-bold text-accent w-6">{idx + 1}</span>
              <div className="flex-1">
                <div className="text-[14px] font-bold text-navy">{def.name}</div>
                <p className="text-[12px] text-text-dim">{def.brief}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="text-[12px] px-2 py-1 border border-border rounded disabled:opacity-30 hover:bg-bg"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === needs.length - 1}
                  className="text-[12px] px-2 py-1 border border-border rounded disabled:opacity-30 hover:bg-bg"
                >
                  ↓
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onBack} className="px-4 py-2 text-text-dim hover:text-navy text-sm">← Back</button>
        <button onClick={onNext} className="px-5 py-2.5 bg-accent text-white rounded-md text-sm font-semibold hover:bg-accent-2">
          Continue →
        </button>
      </div>
    </div>
  );
}

function StepConcordance({
  draft,
  setDraft,
  onNext,
  onBack,
}: {
  draft: ValuesProfile;
  setDraft: (d: ValuesProfile) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const options: { value: SelfConcordanceTendency; label: string; brief: string }[] = [
    { value: "intrinsic", label: "Intrinsic", brief: "I chase things because the work itself energises me" },
    { value: "identified", label: "Identified", brief: "I chase things that align with who I want to be" },
    { value: "introjected", label: "Introjected", brief: "I chase things because I&apos;d feel guilty or anxious not to" },
    { value: "external", label: "External", brief: "I chase things for money, status, or what others expect" },
    { value: "mixed", label: "Mixed", brief: "It depends on the context · I can&apos;t generalise" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-semibold text-navy">Self-concordance tendency</h2>
      <p className="text-[14px] leading-relaxed text-text-dim">
        When you look at past career choices, do you tend to chase things you identify with · or things you feel you <em>should</em> want? Be honest. The honest answer is what makes the platform useful.
      </p>

      <div className="space-y-2 my-4">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDraft({ ...draft, selfConcordance: opt.value })}
            className={`w-full text-left p-3 border rounded-lg transition ${
              draft.selfConcordance === opt.value ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
            }`}
          >
            <div className="text-[14px] font-bold text-navy mb-1">{opt.label}</div>
            <p className="text-[12px] text-text-dim" dangerouslySetInnerHTML={{ __html: opt.brief }} />
          </button>
        ))}
      </div>

      <div>
        <label className="block label-caps mb-2">Optional note · what context makes this true?</label>
        <textarea
          value={draft.selfConcordanceNote || ""}
          onChange={(e) => setDraft({ ...draft, selfConcordanceNote: e.target.value })}
          placeholder="e.g. I tend to introject when money is tight, identified when I&apos;m secure"
          className="w-full text-[13px] p-3 border border-border rounded-md bg-surface min-h-[80px]"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onBack} className="px-4 py-2 text-text-dim hover:text-navy text-sm">← Back</button>
        <button onClick={onNext} className="px-5 py-2.5 bg-accent text-white rounded-md text-sm font-semibold hover:bg-accent-2">
          Continue →
        </button>
      </div>
    </div>
  );
}

// V3.0 · Modern OB · Calling Orientation (Wrzesniewski et al. 1997)
// Three-way orientation distinction · job vs career vs calling · maps to self-concordance
function StepCalling({
  draft,
  setDraft,
  onNext,
  onBack,
}: {
  draft: ValuesProfile;
  setDraft: (d: ValuesProfile) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const options: CallingOrientation[] = ["job", "career", "calling", "mixed"];

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-semibold text-navy">Calling orientation</h2>
      <p className="text-[14px] leading-relaxed text-text-dim">
        Amy Wrzesniewski&apos;s 1997 research identified three ways people relate to work · <strong>job</strong> (means to financial stability), <strong>career</strong> (path of advancement + prestige), or <strong>calling</strong> (intrinsically meaningful). Pick the one that&apos;s most honestly true for you right now · not the answer that sounds good.
      </p>

      <div className="space-y-2 my-4">
        {options.map((opt) => {
          const def = CALLING_DEFS[opt];
          return (
            <button
              key={opt}
              onClick={() => setDraft({ ...draft, callingOrientation: opt })}
              className={`w-full text-left p-3 border rounded-lg transition ${
                draft.callingOrientation === opt ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
              }`}
            >
              <div className="text-[14px] font-bold text-navy mb-1">{def.name}</div>
              <p className="text-[12px] text-text-dim">{def.brief}</p>
            </button>
          );
        })}
      </div>

      <div>
        <label className="block label-caps mb-2">Optional note · what shifts your orientation?</label>
        <textarea
          value={draft.callingOrientationNote || ""}
          onChange={(e) => setDraft({ ...draft, callingOrientationNote: e.target.value })}
          placeholder="e.g. I'm calling-oriented for product work, career-oriented for sales"
          className="w-full text-[13px] p-3 border border-border rounded-md bg-surface min-h-[60px]"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onBack} className="px-4 py-2 text-text-dim hover:text-navy text-sm">← Back</button>
        <button
          onClick={onNext}
          disabled={!draft.callingOrientation}
          className="px-5 py-2.5 bg-accent text-white rounded-md text-sm font-semibold hover:bg-accent-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function StepRiasec({
  draft,
  setDraft,
  onNext,
  onBack,
}: {
  draft: ValuesProfile;
  setDraft: (d: ValuesProfile) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const allTypes = Object.keys(RIASEC_DEFS) as RiasecType[];
  const selected = draft.riasec;
  const canContinue = selected.length >= 1 && selected.length <= 3;

  function toggle(t: RiasecType) {
    if (selected.includes(t)) {
      setDraft({ ...draft, riasec: selected.filter((x) => x !== t) });
    } else if (selected.length < 3) {
      setDraft({ ...draft, riasec: [...selected, t] });
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-semibold text-navy">Vocational fit (RIASEC)</h2>
      <p className="text-[14px] leading-relaxed text-text-dim">
        Pick the <strong>1 to 3 types</strong> that describe how you most enjoy working. This is a sanity check, not destiny.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-4">
        {allTypes.map((t) => {
          const def = RIASEC_DEFS[t];
          const isSelected = selected.includes(t);
          return (
            <button
              key={t}
              onClick={() => toggle(t)}
              className={`text-left p-3 border rounded-lg transition ${
                isSelected ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
              }`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[14px] font-bold text-navy">{def.name}</span>
                {isSelected && <span className="text-[10px] uppercase tracking-wider text-accent font-bold">Selected</span>}
              </div>
              <p className="text-[12px] text-text-dim leading-snug">{def.brief}</p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onBack} className="px-4 py-2 text-text-dim hover:text-navy text-sm">← Back</button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="px-5 py-2.5 bg-accent text-white rounded-md text-sm font-semibold hover:bg-accent-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function StepVows({
  draft,
  setDraft,
  onNext,
  onBack,
}: {
  draft: ValuesProfile;
  setDraft: (d: ValuesProfile) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const domains: LifeDomain[] = ["work", "health", "money", "relationships"];
  const vows = draft.directionVows;

  function setVow(domain: LifeDomain, vow: string) {
    const existing = vows.findIndex((v) => v.domain === domain);
    if (existing >= 0) {
      const next = [...vows];
      next[existing] = { domain, vow };
      setDraft({ ...draft, directionVows: next });
    } else {
      setDraft({ ...draft, directionVows: [...vows, { domain, vow }] });
    }
  }
  function getVow(domain: LifeDomain): string {
    return vows.find((v) => v.domain === domain)?.vow || "";
  }

  const filledCount = vows.filter((v) => v.vow.trim().length > 0).length;
  const canContinue = filledCount >= 2;

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-semibold text-navy">Direction Vows</h2>
      <p className="text-[14px] leading-relaxed text-text-dim">
        Short verb-based statements per life domain. <strong>What you move TOWARD</strong>, not what you should do. Fill at least 2 to continue · all 4 ideal.
      </p>

      <div className="space-y-3 my-4">
        {domains.map((domain) => (
          <div key={domain} className="p-3 border border-border rounded-lg">
            <label className="label-caps block mb-2">{domain}</label>
            <input
              type="text"
              value={getVow(domain)}
              onChange={(e) => setVow(domain, e.target.value)}
              placeholder={
                domain === "work"
                  ? "e.g. I move toward building things customers actually love"
                  : domain === "health"
                  ? "e.g. I move toward strength + sleep + space"
                  : domain === "money"
                  ? "e.g. I move toward earning enough to build, not enough to flaunt"
                  : "e.g. I move toward depth over breadth in close relationships"
              }
              className="w-full text-[14px] p-2 border border-border rounded bg-surface"
            />
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted">{filledCount} of 4 filled (minimum 2)</p>

      <div className="flex gap-2 pt-2">
        <button onClick={onBack} className="px-4 py-2 text-text-dim hover:text-navy text-sm">← Back</button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="px-5 py-2.5 bg-accent text-white rounded-md text-sm font-semibold hover:bg-accent-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function StepRetrodiction({
  draft,
  setDraft,
  onNext,
  onBack,
}: {
  draft: ValuesProfile;
  setDraft: (d: ValuesProfile) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const retro = draft.retrodiction;
  const canContinue = retro.filter((r) => r.context.trim() && r.insight.trim()).length >= 2;

  function setEntry(i: number, key: "context" | "insight", value: string) {
    const next = [...retro];
    if (!next[i]) next[i] = { context: "", insight: "" };
    next[i] = { ...next[i], [key]: value };
    setDraft({ ...draft, retrodiction: next });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-semibold text-navy">Behavioural retrodiction</h2>
      <p className="text-[14px] leading-relaxed text-text-dim">
        Look back at <strong>2 to 5 real career decisions</strong> · what you chose, what you rejected, what you said yes/no to. Note what each reveals about your actual (vs aspirational) values. This is the layer that catches &ldquo;I didn&apos;t even want those jobs.&rdquo;
      </p>

      <div className="space-y-3 my-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3 border border-border rounded-lg">
            <label className="label-caps block mb-2">Decision {i + 1} {i < 2 ? "(required)" : "(optional)"}</label>
            <input
              type="text"
              value={retro[i]?.context || ""}
              onChange={(e) => setEntry(i, "context", e.target.value)}
              placeholder="What happened · e.g. Left a founder seat to take a BDR role at a startup"
              className="w-full text-[13px] p-2 border border-border rounded bg-surface mb-2"
            />
            <input
              type="text"
              value={retro[i]?.insight || ""}
              onChange={(e) => setEntry(i, "insight", e.target.value)}
              placeholder="What it revealed · e.g. I needed external structure to break out of solo-founder isolation"
              className="w-full text-[13px] p-2 border border-border rounded bg-surface"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onBack} className="px-4 py-2 text-text-dim hover:text-navy text-sm">← Back</button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="px-5 py-2.5 bg-accent text-white rounded-md text-sm font-semibold hover:bg-accent-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save profile →
        </button>
      </div>
    </div>
  );
}

function StepReview({ profile, onRecalibrate }: { profile: ValuesProfile; onRecalibrate: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-[20px] font-semibold text-navy">Your Mission Compass · saved</h2>
      <p className="text-[14px] leading-relaxed text-text-dim">
        This is your profile. Every opportunity on the platform now scores against it. Re-calibrate any time · your profile is yours.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
        <div className="bg-bg border border-border rounded-lg p-4">
          <div className="label-caps mb-2">Top values</div>
          <ul className="text-[13px] text-text-dim list-disc ml-5 space-y-1">
            {profile.topValues.map((v) => (
              <li key={v}>{SCHWARTZ_VALUES_DEFS[v as SchwartzValue].name}</li>
            ))}
          </ul>
        </div>

        <div className="bg-bg border border-border rounded-lg p-4">
          <div className="label-caps mb-2">Needs priority</div>
          <ol className="text-[13px] text-text-dim list-decimal ml-5 space-y-1">
            {profile.needsPriorities.map((n) => (
              <li key={n}>{SDT_NEEDS_DEFS[n as SDTNeed].name}</li>
            ))}
          </ol>
        </div>

        <div className="bg-bg border border-border rounded-lg p-4">
          <div className="label-caps mb-2">Self-concordance</div>
          <p className="text-[13px] text-text-dim capitalize">{profile.selfConcordance}</p>
          {profile.selfConcordanceNote && (
            <p className="text-[11px] italic text-muted mt-1">{profile.selfConcordanceNote}</p>
          )}
        </div>

        {profile.callingOrientation && (
          <div className="bg-bg border border-border rounded-lg p-4">
            <div className="label-caps mb-2">Calling orientation</div>
            <p className="text-[13px] text-text-dim">
              {CALLING_DEFS[profile.callingOrientation as CallingOrientation].name}
            </p>
            {profile.callingOrientationNote && (
              <p className="text-[11px] italic text-muted mt-1">{profile.callingOrientationNote}</p>
            )}
          </div>
        )}

        <div className="bg-bg border border-border rounded-lg p-4">
          <div className="label-caps mb-2">Vocational fit (RIASEC)</div>
          <ul className="text-[13px] text-text-dim list-disc ml-5">
            {profile.riasec.map((r) => (
              <li key={r}>{RIASEC_DEFS[r as RiasecType].name}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-bg border border-border rounded-lg p-4">
        <div className="label-caps mb-2">Direction Vows</div>
        <div className="space-y-2">
          {profile.directionVows.filter((v) => v.vow.trim()).map((v) => (
            <div key={v.domain} className="text-[13px]">
              <span className="text-muted uppercase text-[10px] tracking-wider mr-2">{v.domain}</span>
              <span className="text-navy">{v.vow}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-bg border border-border rounded-lg p-4">
        <div className="label-caps mb-2">Behavioural retrodiction</div>
        <div className="space-y-2">
          {profile.retrodiction.filter((r) => r.context.trim()).map((r, i) => (
            <div key={i} className="text-[13px]">
              <div className="text-navy">{r.context}</div>
              <div className="text-text-dim italic ml-3">→ {r.insight}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onRecalibrate} className="px-5 py-2.5 bg-surface border border-border rounded-md text-sm font-semibold hover:border-accent">
          Re-calibrate
        </button>
        <Link href="/" className="px-5 py-2.5 bg-accent text-white rounded-md text-sm font-semibold hover:bg-accent-2">
          Back to Mission Control →
        </Link>
      </div>
    </div>
  );
}
