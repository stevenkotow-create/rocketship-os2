"use client";

// Interview Prep Module · per-opp prep card on Mission Profile
// 5-stage interview framework + Operating Principles decoder + Sources audit + 90-sec opener + accountability lines

import { useState } from "react";
import type { AppState, Opportunity, InterviewPrep, InterviewStage, InterviewStageCheck, OperatingPrinciple, InterviewSource } from "@/lib/types";

const STAGES: { id: InterviewStage; label: string; icon: string }[] = [
  { id: "recruiter-screen", label: "Recruiter screen", icon: "📞" },
  { id: "hm-screen", label: "HM screen", icon: "🎯" },
  { id: "peer-round", label: "Peer round", icon: "👥" },
  { id: "exec-round", label: "Exec round", icon: "👔" },
  { id: "offer-stage", label: "Offer stage", icon: "💰" },
];

const DEFAULT_ACCOUNTABILITY_LINES = [
  "Great question · let me get back to you in 24 hrs with a sharper answer.",
  "Honest answer · I don't know yet, but I'll come back to you with my read tomorrow.",
  "Let me think on that and follow up · I want to give you a real answer, not a polished one.",
  "I want to do that justice rather than wing it · can I come back to you by EOD tomorrow?",
];

const DEFAULT_KEY_QUESTIONS = [
  "What does the first 90 days look like for someone successful in this seat?",
  "What's the hardest part of this role nobody warns candidates about?",
  "How does the team measure success at 6 and 12 months?",
  "What's the biggest thing changing for the company in the next 6 months?",
];

export function InterviewPrepCard({
  opp,
  state,
  update,
}: {
  opp: Opportunity;
  state: AppState;
  update: (updater: (s: AppState) => AppState) => void;
}) {
  const prep: InterviewPrep = opp.interviewPrep || { stages: [] };
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [newSource, setNewSource] = useState<Partial<InterviewSource>>({});
  const [newPrinciple, setNewPrinciple] = useState<Partial<OperatingPrinciple>>({});

  function savePrep(patch: Partial<InterviewPrep>) {
    update((s) => ({
      ...s,
      opps: {
        ...s.opps,
        [opp.id]: {
          ...s.opps[opp.id],
          interviewPrep: {
            ...prep,
            ...patch,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    }));
  }

  function toggleStage(stageId: InterviewStage) {
    const existing = prep.stages.find((st) => st.stage === stageId);
    const newStages: InterviewStageCheck[] = existing
      ? prep.stages.map((st) =>
          st.stage === stageId
            ? { ...st, completed: !st.completed, completedAt: !st.completed ? new Date().toISOString() : undefined }
            : st,
        )
      : [...prep.stages, { stage: stageId, completed: true, completedAt: new Date().toISOString() }];
    savePrep({ stages: newStages });
  }

  function addSource() {
    if (!newSource.claim?.trim() || !newSource.source?.trim()) return;
    const sources = [...(prep.sources || []), {
      claim: newSource.claim!.trim(),
      source: newSource.source!.trim(),
      date: new Date().toISOString(),
      verified: false,
    }];
    savePrep({ sources });
    setNewSource({});
  }

  function removeSource(idx: number) {
    const sources = (prep.sources || []).filter((_, i) => i !== idx);
    savePrep({ sources });
  }

  function verifySource(idx: number) {
    const sources = (prep.sources || []).map((s, i) => i === idx ? { ...s, verified: !s.verified } : s);
    savePrep({ sources });
  }

  function addPrinciple() {
    if (!newPrinciple.principle?.trim() || !newPrinciple.source?.trim()) return;
    const operatingPrinciples = [...(prep.operatingPrinciples || []), {
      principle: newPrinciple.principle!.trim(),
      source: newPrinciple.source!.trim(),
      decode: newPrinciple.decode?.trim() || "",
      exampleAnswer: newPrinciple.exampleAnswer?.trim(),
    }];
    savePrep({ operatingPrinciples });
    setNewPrinciple({});
  }

  function removePrinciple(idx: number) {
    const operatingPrinciples = (prep.operatingPrinciples || []).filter((_, i) => i !== idx);
    savePrep({ operatingPrinciples });
  }

  const stagesComplete = prep.stages.filter((s) => s.completed).length;
  const sourceCount = prep.sources?.length || 0;
  const unverifiedCount = (prep.sources || []).filter((s) => !s.verified).length;

  function section(id: string, title: string, badge: string, color: string, children: React.ReactNode) {
    const isExpanded = expandedSection === id;
    return (
      <div className="border-t border-border first:border-t-0">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className="w-full text-left flex items-center justify-between py-3 px-1 hover:bg-surface-2 transition"
        >
          <div className="flex items-baseline gap-2 flex-wrap">
            <strong className="text-[14px] text-navy">{title}</strong>
            <span className={`text-[10px] uppercase tracking-[1.4px] px-2 py-0.5 rounded font-bold ${color}`}>
              {badge}
            </span>
          </div>
          <span className="text-muted text-sm">{isExpanded ? "▼" : "▶"}</span>
        </button>
        {isExpanded && <div className="pb-4 pt-1">{children}</div>}
      </div>
    );
  }

  return (
    <div className="card-elevated mb-4">
      <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
        <h2 className="text-[18px] font-bold text-navy m-0">
          Interview Prep <span className="text-[14px] font-normal text-muted">· {opp.company}</span>
        </h2>
        <span className="text-[10px] uppercase tracking-[1.4px] font-bold text-purple bg-purple/15 px-2 py-0.5 rounded">
          V3.5
        </span>
      </div>
      <p className="text-[12px] text-text-dim mb-4 leading-relaxed">
        Per-opp structured prep · 5-stage interview framework + Operating Principles + Sources audit + 90-sec opener.
      </p>

      {/* Stage tracker */}
      <div className="bg-surface-2 border border-border rounded-lg p-3 mb-3">
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <strong className="text-[13px] text-navy">Stage tracker</strong>
          <span className="text-[11px] text-muted">{stagesComplete} of 5 complete</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {STAGES.map((s) => {
            const stage = prep.stages.find((st) => st.stage === s.id);
            const done = stage?.completed;
            return (
              <button
                key={s.id}
                onClick={() => toggleStage(s.id)}
                className={`text-center p-2 rounded-md border transition ${
                  done
                    ? "bg-good/15 border-good text-good"
                    : "bg-surface border-border text-muted hover:bg-surface-3"
                }`}
              >
                <div className="text-[16px] mb-1">{s.icon}</div>
                <div className="text-[10px] uppercase tracking-[1px] font-semibold leading-tight">{s.label}</div>
                {done && <div className="text-[10px] mt-1">✓</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sections */}
      {section(
        "principles",
        "Operating Principles decoder",
        `${prep.operatingPrinciples?.length || 0} logged`,
        "text-accent bg-accent/15",
        <div>
          {prep.operatingPrinciples?.length === 0 || !prep.operatingPrinciples ? (
            <p className="text-[12px] text-muted italic mb-3">
              Add company-specific Operating Principles. Decode what they actually mean. Prepare an example answer per principle.
            </p>
          ) : (
            <div className="space-y-2 mb-3">
              {prep.operatingPrinciples.map((p, i) => (
                <div key={i} className="bg-surface-2 border border-border rounded-md p-3 text-[12px]">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <strong className="text-navy">{p.principle}</strong>
                    <button onClick={() => removePrinciple(i)} className="text-hot text-[11px] hover:underline">Remove</button>
                  </div>
                  <p className="text-text-dim italic mb-1">Decode: {p.decode || "—"}</p>
                  {p.exampleAnswer && <p className="text-cool"><strong>Example answer:</strong> {p.exampleAnswer}</p>}
                  <p className="text-[10px] text-muted mt-1">Source: {p.source}</p>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              value={newPrinciple.principle || ""}
              onChange={(e) => setNewPrinciple({ ...newPrinciple, principle: e.target.value })}
              placeholder="Principle · e.g. 'Move with urgency'"
              className="text-[12px] p-2 border border-border rounded-md bg-surface"
            />
            <input
              type="text"
              value={newPrinciple.source || ""}
              onChange={(e) => setNewPrinciple({ ...newPrinciple, source: e.target.value })}
              placeholder="Source · URL or doc"
              className="text-[12px] p-2 border border-border rounded-md bg-surface"
            />
          </div>
          <input
            type="text"
            value={newPrinciple.decode || ""}
            onChange={(e) => setNewPrinciple({ ...newPrinciple, decode: e.target.value })}
            placeholder="Your decode · what they really mean"
            className="w-full text-[12px] p-2 border border-border rounded-md bg-surface mb-2"
          />
          <input
            type="text"
            value={newPrinciple.exampleAnswer || ""}
            onChange={(e) => setNewPrinciple({ ...newPrinciple, exampleAnswer: e.target.value })}
            placeholder="Example answer (optional)"
            className="w-full text-[12px] p-2 border border-border rounded-md bg-surface mb-2"
          />
          <button
            onClick={addPrinciple}
            disabled={!newPrinciple.principle || !newPrinciple.source}
            className="text-[11px] px-3 py-1.5 bg-accent text-white rounded-md font-bold hover:bg-accent-2 transition disabled:opacity-40"
          >
            + Add principle
          </button>
        </div>,
      )}

      {section(
        "sources",
        "Sources audit",
        `${sourceCount} sources · ${unverifiedCount} unverified`,
        unverifiedCount > 0 ? "text-warn bg-warn/15" : "text-good bg-good/15",
        <div>
          <p className="text-[12px] text-muted italic mb-2">
            Non-negotiable · every claim used in prep must have a source. Verify before going into the room.
          </p>
          {prep.sources?.length ? (
            <div className="space-y-1.5 mb-3">
              {prep.sources.map((src, i) => (
                <div key={i} className="flex items-start gap-2 bg-surface-2 border border-border rounded-md p-2.5 text-[12px]">
                  <button
                    onClick={() => verifySource(i)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition mt-0.5 ${
                      src.verified ? "bg-good border-good text-white" : "border-border hover:border-good"
                    }`}
                    title={src.verified ? "Verified" : "Click to verify"}
                  >
                    {src.verified && <span className="text-[10px]">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy m-0"><strong>Claim:</strong> {src.claim}</p>
                    <p className="text-text-dim m-0 text-[11px] break-all">Source: {src.source}</p>
                  </div>
                  <button onClick={() => removeSource(i)} className="text-hot text-[11px] hover:underline flex-shrink-0">×</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-muted mb-3">No sources logged yet.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              value={newSource.claim || ""}
              onChange={(e) => setNewSource({ ...newSource, claim: e.target.value })}
              placeholder="Claim · e.g. 'Company X leads its category with 70% market share'"
              className="text-[12px] p-2 border border-border rounded-md bg-surface"
            />
            <input
              type="text"
              value={newSource.source || ""}
              onChange={(e) => setNewSource({ ...newSource, source: e.target.value })}
              placeholder="Source · URL, doc, person"
              className="text-[12px] p-2 border border-border rounded-md bg-surface"
            />
          </div>
          <button
            onClick={addSource}
            disabled={!newSource.claim || !newSource.source}
            className="text-[11px] px-3 py-1.5 bg-accent text-white rounded-md font-bold hover:bg-accent-2 transition disabled:opacity-40"
          >
            + Add source
          </button>
        </div>,
      )}

      {section(
        "opener",
        "90-sec opener",
        prep.ninetySecOpener ? "Locked" : "Not set",
        prep.ninetySecOpener ? "text-good bg-good/15" : "text-muted bg-muted/15",
        <textarea
          value={prep.ninetySecOpener || ""}
          onChange={(e) => savePrep({ ninetySecOpener: e.target.value })}
          placeholder="90-second narrative in your own voice · who you are, why this role, what you'd bring · pre-rehearse out loud"
          className="w-full text-[12px] p-3 border border-border rounded-md bg-surface min-h-[140px]"
        />,
      )}

      {section(
        "accountability",
        "Accountability lines",
        `${prep.accountabilityLines?.length || DEFAULT_ACCOUNTABILITY_LINES.length} ready`,
        "text-cool bg-cool/15",
        <div>
          <p className="text-[12px] text-muted italic mb-2">
            Pre-rehearsed &ldquo;I don&apos;t know but I&apos;ll get back to you&rdquo; variants.
          </p>
          <textarea
            value={(prep.accountabilityLines || DEFAULT_ACCOUNTABILITY_LINES).join("\n")}
            onChange={(e) => savePrep({ accountabilityLines: e.target.value.split("\n").filter((l) => l.trim()) })}
            placeholder="One line per row"
            className="w-full text-[12px] p-3 border border-border rounded-md bg-surface min-h-[120px]"
          />
        </div>,
      )}

      {section(
        "questions",
        "Key questions to ask",
        `${prep.keyQuestions?.length || DEFAULT_KEY_QUESTIONS.length} ready`,
        "text-purple bg-purple/15",
        <div>
          <p className="text-[12px] text-muted italic mb-2">
            3-4 questions per round · the questions you ask reveal more than the answers you give.
          </p>
          <textarea
            value={(prep.keyQuestions || DEFAULT_KEY_QUESTIONS).join("\n")}
            onChange={(e) => savePrep({ keyQuestions: e.target.value.split("\n").filter((l) => l.trim()) })}
            placeholder="One question per row"
            className="w-full text-[12px] p-3 border border-border rounded-md bg-surface min-h-[120px]"
          />
        </div>,
      )}

      {section(
        "thankyou",
        "Thank-you DM template",
        prep.thankYouDmTemplate ? "Drafted" : "Not set",
        prep.thankYouDmTemplate ? "text-good bg-good/15" : "text-muted bg-muted/15",
        <div>
          <p className="text-[12px] text-muted italic mb-2">
            Pre-drafted thank-you DM with placeholders · send within 4 hrs of every interview.
          </p>
          <textarea
            value={prep.thankYouDmTemplate || ""}
            onChange={(e) => savePrep({ thankYouDmTemplate: e.target.value })}
            placeholder="Hey [NAME], thanks for the time today · really enjoyed the [SPECIFIC THING THEY SAID] · happy to dig deeper into [TOPIC YOU PROMISED]. Looking forward to next steps."
            className="w-full text-[12px] p-3 border border-border rounded-md bg-surface min-h-[100px]"
          />
        </div>,
      )}
    </div>
  );
}
