"use client";

import { useEffect, useRef, useState } from "react";
import { useAppState } from "@/lib/storage";
import type { Opportunity, CareerHypothesis, ResumeAudit } from "@/lib/types";

interface OnboardResult {
  fullName: string;
  candidateSummary: string;
  careerHypothesis: Omit<CareerHypothesis, "capturedAt">;
  resumeAudit: Pick<
    ResumeAudit,
    "strengths" | "gaps" | "roleShapeFit" | "recommendedSeatLevels" | "overallReadiness" | "summary"
  >;
  targetCompanies: { company: string; position: string; location: string; note: string }[];
}

const BUILD_STEPS = [
  "Reading your profile",
  "Building your candidate summary",
  "Auditing your resume fit",
  "Seeding your target companies",
  "Setting up your board",
];

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "opp-" + Math.random().toString(36).slice(2);
}

export function StepImportLinkedIn({ onComplete }: { onComplete?: () => void }) {
  const [, update] = useAppState();
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"input" | "building" | "done" | "error">("input");
  const [visible, setVisible] = useState(0); // how many steps are shown
  const [result, setResult] = useState<OnboardResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const persist = (r: OnboardResult) => {
    const now = new Date().toISOString();
    const probes: Opportunity[] = (r.targetCompanies || []).map((t) => ({
      id: uid(),
      company: t.company,
      position: t.position,
      type: "role",
      location: t.location || "Remote",
      stage: "targeting",
      note: t.note,
    }));
    const audit: ResumeAudit = {
      strengths: r.resumeAudit.strengths || [],
      gaps: r.resumeAudit.gaps || [],
      roleShapeFit: r.resumeAudit.roleShapeFit || { BDR: 0, SDR: 0, AE: 0, AM: 0, CSM: 0, Manager: 0 },
      keywordDensity: [],
      missingKeywords: [],
      atsScore: 0,
      narrativeCoherence: 0,
      recommendedSeatLevels: r.resumeAudit.recommendedSeatLevels || [],
      overallReadiness: r.resumeAudit.overallReadiness || "tighten-first",
      summary: r.resumeAudit.summary || r.candidateSummary || "",
      auditedAt: now,
    };
    update((s) => ({
      ...s,
      careerHypothesis: { ...r.careerHypothesis, capturedAt: now },
      resumeAudit: audit,
      customOpps: [...(s.customOpps || []), ...probes],
      discoveryProgress: {
        ...(s.discoveryProgress || { startedAt: now, stepsCompleted: [] as string[] }),
        importedLinkedIn: true,
      },
    }));
  };

  const run = async () => {
    if (text.trim().length < 40) {
      setError("Paste a bit more of your profile (headline, About and Experience).");
      return;
    }
    setError(null);
    setPhase("building");
    setVisible(1);
    // Walk the checklist forward on a timer while the request runs.
    timer.current = setInterval(() => {
      setVisible((v) => (v < BUILD_STEPS.length - 1 ? v + 1 : v));
    }, 1100);

    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinText: text }),
      });
      const data = await res.json();
      if (timer.current) clearInterval(timer.current);
      if (!res.ok) {
        setError(data.message || data.error || "Something went wrong reading your profile.");
        setPhase("error");
        return;
      }
      setResult(data as OnboardResult);
      persist(data as OnboardResult);
      setVisible(BUILD_STEPS.length);
      setPhase("done");
    } catch (e) {
      if (timer.current) clearInterval(timer.current);
      setError((e as Error).message || "Network error.");
      setPhase("error");
    }
  };

  // ---- INPUT ----
  if (phase === "input" || phase === "error") {
    return (
      <div className="mx-auto max-w-[640px]">
        <h1 className="text-[34px] font-bold leading-tight tracking-tight text-text">
          Paste your LinkedIn.<br />Watch your board build itself.
        </h1>
        <p className="mt-3 text-[15px] text-text-dim">
          Open your LinkedIn profile, select all and copy your headline, About and Experience, then paste it
          below. We&apos;ll read it and set up your candidate profile, resume read and a starting list of target
          companies in seconds.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your LinkedIn headline, About, and Experience here…"
          className="mt-5 h-52 w-full resize-y rounded-xl border border-border bg-bg p-4 text-[14px] text-text outline-none focus:border-accent"
        />
        {error && <p className="mt-2 text-[13px] text-crimson">{error}</p>}
        <button
          onClick={run}
          className="mt-4 w-full rounded-xl bg-accent px-4 py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          Build my board →
        </button>
        <p className="mt-3 text-center text-[12px] text-muted">
          Prefer to do it manually? You can skip this and fill things in yourself.
        </p>
        {onComplete && (
          <button onClick={onComplete} className="mt-1 block w-full text-center text-[12px] text-text-dim underline">
            Skip for now
          </button>
        )}
      </div>
    );
  }

  // ---- BUILDING / DONE (animated checklist) ----
  return (
    <div className="mx-auto max-w-[560px] text-center">
      <div className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-accent">
        {phase === "done" ? "Board ready" : "Designing your workflow"}
      </div>
      <h1 className="text-[30px] font-bold leading-tight tracking-tight text-text">
        {phase === "done" ? "You're all set." : "Building your board…"}
      </h1>

      <div className="mt-8 space-y-3 text-left">
        {BUILD_STEPS.map((label, i) => {
          const shown = i < visible;
          const doneStep = i < visible - 1 || phase === "done";
          const active = i === visible - 1 && phase !== "done";
          return (
            <div
              key={label}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-500 ${
                shown ? "border-border bg-surface opacity-100" : "border-transparent opacity-30"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[13px] ${
                  doneStep ? "bg-accent text-white" : "bg-surface-2 text-text-dim"
                }`}
              >
                {doneStep ? "✓" : active ? <Spinner /> : ""}
              </span>
              <span className={`text-[14px] ${doneStep ? "text-text" : "text-text-dim"}`}>{label}</span>
            </div>
          );
        })}
      </div>

      {phase === "done" && result && (
        <div className="mt-8 rounded-xl border border-border bg-surface p-5 text-left">
          <p className="text-[14px] text-text">{result.candidateSummary}</p>
          <p className="mt-3 text-[13px] text-text-dim">
            Seeded <span className="font-semibold text-text">{result.targetCompanies?.length || 0}</span> target
            companies onto your board. Best-fit seats:{" "}
            <span className="text-text">{(result.resumeAudit?.recommendedSeatLevels || []).join(", ")}</span>.
          </p>
          <button
            onClick={onComplete}
            className="mt-5 w-full rounded-xl bg-accent px-4 py-3 text-[15px] font-semibold text-white hover:opacity-90"
          >
            Go to my board →
          </button>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-text-dim border-t-transparent" />
  );
}
