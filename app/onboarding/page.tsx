"use client";

// V3.5 · Onboarding wizard · the front door of ORS
// Walks new user through Discovery phase: Why Now → Mission Compass handoff →
// Career Hypothesis → Resume Audit → Logistics + Dealbreakers → Network Seed → Probe Config Launch
// Each step saves to AppState as user moves through. "Skip for now" available on non-critical steps.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/storage";
import { StepWhyNow } from "@/components/onboarding/StepWhyNow";
import { StepCareerHypothesis } from "@/components/onboarding/StepCareerHypothesis";
import { StepResumeAudit } from "@/components/onboarding/StepResumeAudit";
import { StepLogisticsDealbreakers } from "@/components/onboarding/StepLogisticsDealbreakers";
import { StepNetworkSeed } from "@/components/onboarding/StepNetworkSeed";
import { StepProbeConfig } from "@/components/onboarding/StepProbeConfig";
import { Sparkle, RocketShip, CompassRose, Probe } from "@/components/icons";

type StepId =
  | "welcome"
  | "whyNow"
  | "missionCompass"
  | "careerHypothesis"
  | "resumeAudit"
  | "logistics"
  | "networkSeed"
  | "probeConfig"
  | "complete";

const STEPS: { id: StepId; label: string; icon: string; durationMin: string; required: boolean }[] = [
  { id: "welcome", label: "Welcome", icon: "🚀", durationMin: "1 min", required: true },
  { id: "whyNow", label: "Why now?", icon: "🎯", durationMin: "1 min", required: true },
  { id: "missionCompass", label: "Mission Compass", icon: "🧭", durationMin: "10 min", required: true },
  { id: "careerHypothesis", label: "Career Hypothesis", icon: "📈", durationMin: "3 min", required: true },
  { id: "resumeAudit", label: "Resume Audit", icon: "📄", durationMin: "2 min", required: false },
  { id: "logistics", label: "Logistics + Dealbreakers", icon: "⚖️", durationMin: "3 min", required: true },
  { id: "networkSeed", label: "Network seed", icon: "🌌", durationMin: "2 min", required: false },
  { id: "probeConfig", label: "Probe Configuration", icon: "🛰", durationMin: "1 min", required: true },
];

export default function OnboardingPage() {
  const [state, update] = useAppState();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepId>("welcome");

  // Restore progress if user has been here before
  useEffect(() => {
    if (state.discoveryProgress?.currentStep) {
      setCurrentStep(state.discoveryProgress.currentStep as StepId);
    } else if (state.discoveryProgress?.completedAt) {
      // Already finished onboarding · let them navigate freely
      setCurrentStep("complete");
    } else if (!state.discoveryProgress) {
      // First visit · mark started
      update((s) => ({
        ...s,
        discoveryProgress: {
          startedAt: new Date().toISOString(),
          stepsCompleted: [],
          currentStep: "welcome",
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function recordStepComplete(stepId: StepId, nextStep: StepId) {
    setCurrentStep(nextStep);
    update((s) => ({
      ...s,
      discoveryProgress: {
        ...(s.discoveryProgress || { startedAt: new Date().toISOString(), stepsCompleted: [] }),
        stepsCompleted: Array.from(new Set([...(s.discoveryProgress?.stepsCompleted || []), stepId])),
        currentStep: nextStep,
      },
    }));
  }

  function skipStep(stepId: StepId, nextStep: StepId) {
    setCurrentStep(nextStep);
    update((s) => ({
      ...s,
      discoveryProgress: {
        ...(s.discoveryProgress || { startedAt: new Date().toISOString(), stepsCompleted: [] }),
        skippedSteps: Array.from(new Set([...(s.discoveryProgress?.skippedSteps || []), stepId])),
        currentStep: nextStep,
      },
    }));
  }

  function completeOnboarding() {
    update((s) => ({
      ...s,
      discoveryProgress: {
        ...(s.discoveryProgress || { startedAt: new Date().toISOString(), stepsCompleted: [] }),
        completedAt: new Date().toISOString(),
        currentStep: undefined,
      },
    }));
    router.push("/probes");
  }

  // Progress bar · steps completed / total required
  const requiredSteps = STEPS.filter((s) => s.required);
  const completedRequired = requiredSteps.filter((s) =>
    state.discoveryProgress?.stepsCompleted?.includes(s.id),
  );
  const progressPct = Math.round((completedRequired.length / requiredSteps.length) * 100);

  const stepIdx = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="max-w-4xl mx-auto">
      {/* V4 · Progress header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-accent"><Sparkle size={20} strokeWidth={1.5} /></span>
              <h1 className="text-[32px] font-bold tracking-tight text-text m-0">Discovery</h1>
            </div>
            <p className="text-[13px] text-text-dim m-0">
              The front door · {requiredSteps.length} required steps · roughly 20 minutes total
            </p>
          </div>
          <div className="text-right">
            <div className="font-mono text-[28px] font-bold text-accent leading-none">{progressPct}<span className="text-[16px] text-muted">%</span></div>
            <div className="font-mono text-[10px] uppercase tracking-[1.8px] text-muted font-semibold mt-1">Complete</div>
          </div>
        </div>
        <div className="retro-band mb-4"><span /><span /></div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        {/* Step pills · clickable to jump back */}
        <div className="flex flex-wrap gap-2 mt-4">
          {STEPS.map((s, i) => {
            const isCompleted = state.discoveryProgress?.stepsCompleted?.includes(s.id);
            const isSkipped = state.discoveryProgress?.skippedSteps?.includes(s.id);
            const isCurrent = s.id === currentStep;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                disabled={i > stepIdx + 1 && !isCompleted}
                className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-md font-medium transition ${
                  isCurrent
                    ? "bg-accent text-white"
                    : isCompleted
                    ? "bg-good/15 text-good hover:bg-good/25"
                    : isSkipped
                    ? "bg-warn/15 text-warn hover:bg-warn/25"
                    : "bg-surface-2 text-muted hover:bg-surface-3"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
                {isCompleted && <span className="text-[9px]">✓</span>}
                {isSkipped && <span className="text-[9px]">⤴</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step body */}
      <div className="card-elevated">
        {currentStep === "welcome" && (
          <StepWelcome onNext={() => recordStepComplete("welcome", "whyNow")} />
        )}
        {currentStep === "whyNow" && (
          <StepWhyNow
            initial={state.whyNow}
            onSave={(whyNow) => {
              update((s) => ({ ...s, whyNow }));
              recordStepComplete("whyNow", "missionCompass");
            }}
            onSkip={() => skipStep("whyNow", "missionCompass")}
          />
        )}
        {currentStep === "missionCompass" && (
          <StepMissionCompassHandoff
            calibrated={!!state.valuesProfile}
            onComplete={() => recordStepComplete("missionCompass", "careerHypothesis")}
            onSkip={() => skipStep("missionCompass", "careerHypothesis")}
          />
        )}
        {currentStep === "careerHypothesis" && (
          <StepCareerHypothesis
            initial={state.careerHypothesis}
            onSave={(careerHypothesis) => {
              update((s) => ({ ...s, careerHypothesis }));
              recordStepComplete("careerHypothesis", "resumeAudit");
            }}
            onSkip={() => skipStep("careerHypothesis", "resumeAudit")}
          />
        )}
        {currentStep === "resumeAudit" && (
          <StepResumeAudit
            initial={state.resumeAudit}
            onSave={(resumeAudit) => {
              update((s) => ({ ...s, resumeAudit }));
              recordStepComplete("resumeAudit", "logistics");
            }}
            onSkip={() => skipStep("resumeAudit", "logistics")}
          />
        )}
        {currentStep === "logistics" && (
          <StepLogisticsDealbreakers
            initialLogistics={state.logistics}
            initialDealbreakers={state.dealbreakers}
            onSave={(logistics, dealbreakers) => {
              update((s) => ({ ...s, logistics, dealbreakers }));
              recordStepComplete("logistics", "networkSeed");
            }}
            onSkip={() => skipStep("logistics", "networkSeed")}
          />
        )}
        {currentStep === "networkSeed" && (
          <StepNetworkSeed
            initial={state.networkSeed}
            onSave={(networkSeed) => {
              update((s) => ({ ...s, networkSeed }));
              recordStepComplete("networkSeed", "probeConfig");
            }}
            onSkip={() => skipStep("networkSeed", "probeConfig")}
          />
        )}
        {currentStep === "probeConfig" && (
          <StepProbeConfig
            state={state}
            onLaunch={(probeConfig) => {
              update((s) => ({ ...s, probeConfig }));
              recordStepComplete("probeConfig", "complete");
              completeOnboarding();
            }}
          />
        )}
        {currentStep === "complete" && (
          <StepComplete onGoToProbes={completeOnboarding} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Inline step components (small ones · the big ones are in /components/onboarding)
// ─────────────────────────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <div className="text-accent mb-4"><RocketShip size={36} strokeWidth={1.5} /></div>
      <h2 className="text-[24px] font-bold text-text mb-3 tracking-tight">Welcome to RocketShip OS</h2>
      <p className="text-[14px] text-text-dim leading-relaxed mb-4 max-w-2xl">
        Most job platforms match you against listings using keywords. We do the opposite.
      </p>
      <p className="text-[14px] text-text-dim leading-relaxed mb-4 max-w-2xl">
        Before we surface a single role, we want to understand who you are · your values, your trajectory, where things sit financially and geographically, what you won&apos;t compromise on, and who&apos;s already in your network. Then we configure probes that match that profile and let the scrape engine do the boring work.
      </p>
      <p className="text-[14px] text-text-dim leading-relaxed mb-6 max-w-2xl">
        Roughly 20 minutes of setup. You can skip non-essential steps and come back. Your profile stays on this device.
      </p>
      <div className="bg-surface-2 border border-border rounded-lg p-4 mb-6">
        <div className="label-caps mb-2">What you&apos;ll cover</div>
        <ul className="text-[13px] text-text-dim space-y-1 list-disc list-inside">
          <li>Why you&apos;re searching right now</li>
          <li>Mission Compass · your values + needs + vocational fit</li>
          <li>Career Hypothesis · where you want to be in 5 years</li>
          <li>Resume Audit · strengths, gaps, role-shape fit</li>
          <li>Logistics + Dealbreakers · comp, geo, hybrid, hard nos</li>
          <li>Network seed · 3-5 warm contacts to start your Solar System</li>
          <li>Probe Configuration · auto-derived scrape criteria</li>
        </ul>
      </div>
      <button onClick={onNext} className="px-6 py-3 bg-accent text-white rounded-md font-bold text-[14px] hover:bg-accent-2 transition">
        Start Discovery →
      </button>
    </div>
  );
}

function StepMissionCompassHandoff({
  calibrated,
  onComplete,
  onSkip,
}: {
  calibrated: boolean;
  onComplete: () => void;
  onSkip: () => void;
}) {
  return (
    <div>
      <div className="text-accent mb-4"><CompassRose size={32} strokeWidth={1.5} /></div>
      <h2 className="text-[22px] font-bold text-text mb-3 tracking-tight">Mission Compass</h2>
      <p className="text-[14px] text-text-dim leading-relaxed mb-4 max-w-2xl">
        This is the longest single step · roughly 10 minutes. The Mission Compass is the values + needs + vocational fit calibration grounded in 12 peer-reviewed organisational psychology frameworks.
      </p>
      <p className="text-[14px] text-text-dim leading-relaxed mb-6 max-w-2xl">
        Without this, every other score in the platform is just keyword matching. With it, the platform genuinely assesses whether a role fits the person you actually are.
      </p>
      {calibrated ? (
        <div className="bg-good/10 border border-good/30 rounded-lg p-4 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[18px]">✓</span>
            <strong className="text-good">Already calibrated</strong>
          </div>
          <p className="text-[13px] text-text-dim">
            Your Mission Compass profile is on file. You can re-calibrate anytime from /mission-compass.
          </p>
        </div>
      ) : (
        <div className="bg-warn/10 border border-warn/30 rounded-lg p-4 mb-5">
          <strong className="text-warn block mb-1">Not yet calibrated</strong>
          <p className="text-[13px] text-text-dim">
            Hit the button below to run the calibration. Come back here when finished.
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/mission-compass"
          className="px-5 py-2.5 bg-accent text-white rounded-md font-bold text-[13px] hover:bg-accent-2 transition"
        >
          {calibrated ? "Re-calibrate" : "Open Mission Compass"} →
        </Link>
        <button
          onClick={onComplete}
          disabled={!calibrated}
          className="px-5 py-2.5 bg-good text-white rounded-md font-bold text-[13px] hover:bg-good/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Done · continue →
        </button>
        <button
          onClick={onSkip}
          className="px-5 py-2.5 text-text-dim hover:text-navy text-[13px] underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function StepComplete({ onGoToProbes }: { onGoToProbes: () => void }) {
  return (
    <div className="text-center py-6">
      <div className="inline-flex text-accent mb-4"><Probe size={56} strokeWidth={1.5} /></div>
      <h2 className="text-[26px] font-bold text-text mb-3 tracking-tight">Discovery complete</h2>
      <p className="text-[14px] text-text-dim leading-relaxed mb-6 max-w-xl mx-auto">
        The platform now knows who you are, what you want, where you&apos;ll go, and what won&apos;t work. Probes are configured. First scrape is queued.
      </p>
      <button
        onClick={onGoToProbes}
        className="px-6 py-3 bg-accent text-white rounded-md font-bold text-[14px] hover:bg-accent-2 transition"
      >
        Open Probes Inbox →
      </button>
    </div>
  );
}
