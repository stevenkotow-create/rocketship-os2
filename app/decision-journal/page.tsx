"use client";

// V3.0 · Decision Journal · the empirical accuracy loop
// Per Mission Compass Methods doc · Section 05 · the killer feature.
// User logs decision + predicted alignment + reviews at 30/90 days.
// Over time, the user's mean accuracy delta becomes their personal calibration score.
// Voice: calm, honest, on-your-side. No gamified anxiety. Privacy-first.

import { useState } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/storage";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import type { MissionCompassDecisionEntry } from "@/lib/types";

export default function DecisionJournalPage() {
  const [state, update] = useAppState();
  const ALL_OPPS = [...OPPORTUNITIES, ...(state.customOpps || [])];
  const entries = state.decisionJournal || [];
  const [showNew, setShowNew] = useState(false);

  // Sort entries · review-due first, then most recent
  const now = Date.now();
  const reviewDue = entries.filter(
    (e) => !e.reviewedAt && new Date(e.reviewDueAt).getTime() <= now,
  );
  const upcoming = entries.filter(
    (e) => !e.reviewedAt && new Date(e.reviewDueAt).getTime() > now,
  );
  const completed = entries.filter((e) => e.reviewedAt);

  // Accuracy stats
  const reviewed = completed.filter((e) => e.accuracyDelta !== undefined);
  const meanAccuracy =
    reviewed.length > 0
      ? reviewed.reduce((s, e) => s + Math.abs(e.accuracyDelta || 0), 0) / reviewed.length
      : null;

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-accent" style={{ display: "inline-flex" }}>
              <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round">
                <path d="M3 5 L12 7 L21 5 L21 19 L12 21 L3 19 Z" />
                <line x1="12" y1="7" x2="12" y2="21" />
                <path d="M16 13 L16.5 14.5 L18 15 L16.5 15.5 L16 17 L15.5 15.5 L14 15 L15.5 14.5 Z" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <h1 className="display text-glow text-[34px] leading-[1.1] text-text m-0">Decision Journal</h1>
          </div>
          <p className="text-[14px] text-text-dim m-0 max-w-3xl">The empirical loop · log predicted alignment, review at 30 or 90 days. Your accuracy delta is the truest signal.</p>
        </div>
        <span className="font-mono text-[10px] text-muted lowercase">DJ.01</span>
      </div>

      <div className="retro-band mb-6"><span /><span /></div>

      {/* Stats strip */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="stat">
            <div className="text-data-lg text-navy">{entries.length}</div>
            <div className="label-caps mt-1">Total decisions</div>
          </div>
          <div className="stat">
            <div className="text-data-lg text-hot">{reviewDue.length}</div>
            <div className="label-caps mt-1">Review due now</div>
          </div>
          <div className="stat">
            <div className="text-data-lg text-cool">{upcoming.length}</div>
            <div className="label-caps mt-1">Upcoming reviews</div>
          </div>
          <div className="stat">
            <div className="text-data-lg text-good">
              {meanAccuracy !== null ? `±${meanAccuracy.toFixed(0)}` : "—"}
            </div>
            <div className="label-caps mt-1">Mean accuracy delta</div>
          </div>
        </div>
      )}

      {/* Log new decision · always available */}
      <div className="mb-6">
        {!showNew && (
          <button
            onClick={() => setShowNew(true)}
            className="px-5 py-2.5 bg-accent text-white rounded-md text-sm font-semibold hover:bg-accent-2"
          >
            + Log a new decision
          </button>
        )}
        {showNew && (
          <NewDecisionForm
            onCancel={() => setShowNew(false)}
            onSave={(entry) => {
              update((s) => ({
                ...s,
                decisionJournal: [...(s.decisionJournal || []), entry],
              }));
              setShowNew(false);
            }}
          />
        )}
      </div>

      {/* Empty state */}
      {entries.length === 0 && !showNew && (
        <div className="card-elevated text-center py-12">
          <div className="text-4xl mb-3">🧭</div>
          <h2 className="text-lg font-semibold text-navy mb-2">No decisions logged yet</h2>
          <p className="text-text-dim text-[13px] max-w-md mx-auto mb-4">
            Use the Decision Journal for the choices that actually matter · which roles to pursue, which offer to take, stay or go. Log the predicted alignment, review at 30 and 90 days. Over time, your accuracy compounds into a personal calibration score.
          </p>
          <Link
            href="/mission-compass"
            className="inline-block px-4 py-2 bg-surface border border-border text-navy rounded text-sm hover:border-accent"
          >
            Read about Mission Compass first →
          </Link>
        </div>
      )}

      {/* Review due · most urgent */}
      {reviewDue.length > 0 && (
        <div className="mb-6">
          <h2 className="section-title">⏰ Review due · {reviewDue.length}</h2>
          <div className="space-y-3">
            {reviewDue.map((entry) => (
              <ReviewableEntry key={entry.id} entry={entry} state={state} update={update} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming reviews */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="section-title">📅 Upcoming reviews · {upcoming.length}</h2>
          <div className="space-y-3">
            {upcoming.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* Completed · review log */}
      {completed.length > 0 && (
        <div className="mb-6">
          <h2 className="section-title">✓ Reviewed · {completed.length}</h2>
          <div className="space-y-3">
            {completed.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ────── New decision form ──────

function NewDecisionForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (entry: MissionCompassDecisionEntry) => void;
}) {
  const [state] = useAppState();
  const ALL_OPPS = [...OPPORTUNITIES, ...(state.customOpps || [])];
  const [question, setQuestion] = useState("");
  const [chosen, setChosen] = useState("");
  const [predictedAlignment, setPredictedAlignment] = useState(70);
  const [reasoning, setReasoning] = useState("");
  const [oppId, setOppId] = useState<string>("");
  const [reviewWindow, setReviewWindow] = useState<30 | 90>(30);

  function handleSave() {
    if (!question.trim() || !chosen.trim() || !reasoning.trim()) return;
    const now = new Date();
    const reviewDue = new Date(now);
    reviewDue.setDate(now.getDate() + reviewWindow);
    const entry: MissionCompassDecisionEntry = {
      id: `dec-${Date.now()}`,
      oppId: oppId || undefined,
      question: question.trim(),
      chosen: chosen.trim(),
      predictedAlignment,
      reasoning: reasoning.trim(),
      reviewDueAt: reviewDue.toISOString(),
      createdAt: now.toISOString(),
    };
    onSave(entry);
  }

  const canSave = question.trim().length > 0 && chosen.trim().length > 0 && reasoning.trim().length > 0;

  return (
    <div className="card-elevated space-y-4">
      <h2 className="text-[18px] font-semibold text-navy">Log a decision</h2>
      <p className="text-[12px] text-text-dim">
        Be honest with future-you. What was the question? What did you choose? What did you predict would happen?
      </p>

      <div>
        <label className="block label-caps mb-2">The question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Should I pursue the BDE seat at Example Corp?"
          className="w-full text-[14px] p-2.5 border border-border rounded bg-surface"
        />
      </div>

      <div>
        <label className="block label-caps mb-2">What you chose</label>
        <input
          type="text"
          value={chosen}
          onChange={(e) => setChosen(e.target.value)}
          placeholder="e.g. Yes · pursue · application shipped 29 June"
          className="w-full text-[14px] p-2.5 border border-border rounded bg-surface"
        />
      </div>

      <div>
        <label className="block label-caps mb-2">
          Predicted alignment · {predictedAlignment}/100
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={predictedAlignment}
          onChange={(e) => setPredictedAlignment(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-[11px] text-muted mt-1">
          How aligned do you think this choice will be with your values? Be honest · this is the prediction we&apos;ll review.
        </p>
      </div>

      <div>
        <label className="block label-caps mb-2">Why you chose this</label>
        <textarea
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          placeholder="e.g. Mission Compass scored 78/100 · the role plays to a genuine strength · the comp shape is rocket-aligned · I want to test the hunter motion in a market that means something to me"
          className="w-full text-[13px] p-3 border border-border rounded bg-surface min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block label-caps mb-2">Linked opp (optional)</label>
          <select
            value={oppId}
            onChange={(e) => setOppId(e.target.value)}
            className="w-full text-[13px] p-2 border border-border rounded bg-surface"
          >
            <option value="">— No specific opp —</option>
            {ALL_OPPS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.company} · {o.position}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block label-caps mb-2">Review window</label>
          <div className="flex gap-2">
            <button
              onClick={() => setReviewWindow(30)}
              className={`flex-1 py-2 rounded border text-[13px] ${
                reviewWindow === 30
                  ? "border-accent bg-accent/5 text-navy font-semibold"
                  : "border-border text-text-dim hover:border-accent/50"
              }`}
            >
              30 days
            </button>
            <button
              onClick={() => setReviewWindow(90)}
              className={`flex-1 py-2 rounded border text-[13px] ${
                reviewWindow === 90
                  ? "border-accent bg-accent/5 text-navy font-semibold"
                  : "border-border text-text-dim hover:border-accent/50"
              }`}
            >
              90 days
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-5 py-2.5 bg-accent text-white rounded-md text-sm font-semibold hover:bg-accent-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save decision
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-text-dim hover:text-navy text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ────── Reviewable entry · for entries past their review date ──────

function ReviewableEntry({
  entry,
  state,
  update,
}: {
  entry: MissionCompassDecisionEntry;
  state: ReturnType<typeof useAppState>[0];
  update: ReturnType<typeof useAppState>[1];
}) {
  const [reviewing, setReviewing] = useState(false);
  const [outcome, setOutcome] = useState<MissionCompassDecisionEntry["outcome"]>("matched-prediction");
  const [outcomeNote, setOutcomeNote] = useState("");
  const [actualAlignment, setActualAlignment] = useState(entry.predictedAlignment);

  function handleReviewSave() {
    const accuracyDelta = actualAlignment - entry.predictedAlignment;
    update((s) => ({
      ...s,
      decisionJournal: (s.decisionJournal || []).map((e) =>
        e.id === entry.id
          ? {
              ...e,
              reviewedAt: new Date().toISOString(),
              outcome,
              outcomeNote: outcomeNote.trim() || undefined,
              accuracyDelta,
            }
          : e,
      ),
    }));
    setReviewing(false);
  }

  const daysOverdue = Math.floor(
    (Date.now() - new Date(entry.reviewDueAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="card-elevated border-l-4 border-hot">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div>
          <div className="font-semibold text-navy text-[14px]">{entry.question}</div>
          <div className="text-[12px] text-text-dim mt-0.5">
            Chose · {entry.chosen} · predicted {entry.predictedAlignment}/100 alignment
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider bg-hot/15 text-hot px-2 py-0.5 rounded font-semibold whitespace-nowrap">
          {daysOverdue >= 0 ? `${daysOverdue}d overdue` : "Due today"}
        </span>
      </div>
      <p className="text-[12px] text-text-dim italic mb-3">&ldquo;{entry.reasoning}&rdquo;</p>

      {!reviewing && (
        <button
          onClick={() => setReviewing(true)}
          className="text-[12px] px-3 py-1.5 bg-accent text-white rounded font-semibold hover:bg-accent-2"
        >
          Review now →
        </button>
      )}

      {reviewing && (
        <div className="space-y-3 mt-3 pt-3 border-t border-border">
          <div>
            <label className="block label-caps mb-2">Actual alignment · {actualAlignment}/100</label>
            <input
              type="range"
              min="0"
              max="100"
              value={actualAlignment}
              onChange={(e) => setActualAlignment(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-[11px] text-muted mt-1">
              How aligned did it actually turn out to be? Honest read.
            </p>
          </div>

          <div>
            <label className="block label-caps mb-2">Outcome</label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { v: "matched-prediction" as const, l: "Matched prediction" },
                  { v: "exceeded-prediction" as const, l: "Exceeded prediction" },
                  { v: "fell-short" as const, l: "Fell short" },
                  { v: "ambiguous" as const, l: "Ambiguous · too early" },
                ]
              ).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setOutcome(opt.v)}
                  className={`p-2 rounded border text-[12px] ${
                    outcome === opt.v
                      ? "border-accent bg-accent/5 text-navy font-semibold"
                      : "border-border text-text-dim hover:border-accent/50"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block label-caps mb-2">Note (optional)</label>
            <textarea
              value={outcomeNote}
              onChange={(e) => setOutcomeNote(e.target.value)}
              placeholder="What did you learn? What would you do differently?"
              className="w-full text-[12px] p-2 border border-border rounded bg-surface min-h-[60px]"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={handleReviewSave} className="px-4 py-1.5 bg-accent text-white rounded text-[12px] font-semibold">
              Save review
            </button>
            <button onClick={() => setReviewing(false)} className="px-3 py-1.5 text-muted text-[12px]">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ────── Entry card · for upcoming + completed ──────

function EntryCard({ entry }: { entry: MissionCompassDecisionEntry }) {
  const reviewDate = new Date(entry.reviewDueAt);
  const isReviewed = !!entry.reviewedAt;
  const accuracyClass = entry.accuracyDelta !== undefined
    ? Math.abs(entry.accuracyDelta) <= 10
      ? "text-good"
      : Math.abs(entry.accuracyDelta) <= 25
      ? "text-warn"
      : "text-hot"
    : "text-text-dim";

  return (
    <div className={`card ${isReviewed ? "opacity-80" : ""}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div>
          <div className="font-semibold text-navy text-[14px]">{entry.question}</div>
          <div className="text-[12px] text-text-dim mt-0.5">
            Chose · {entry.chosen} · predicted {entry.predictedAlignment}/100
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {isReviewed ? (
            <>
              <span className="text-[10px] uppercase tracking-wider bg-good/15 text-good px-2 py-0.5 rounded font-semibold">
                Reviewed
              </span>
              {entry.accuracyDelta !== undefined && (
                <div className={`text-[12px] font-bold mt-1 ${accuracyClass}`}>
                  Δ {entry.accuracyDelta > 0 ? "+" : ""}{entry.accuracyDelta}
                </div>
              )}
            </>
          ) : (
            <span className="text-[11px] text-muted">
              Review · {reviewDate.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <p className="text-[12px] text-text-dim italic mb-2">&ldquo;{entry.reasoning}&rdquo;</p>
      {entry.outcomeNote && (
        <div className="mt-2 pt-2 border-t border-border text-[12px]">
          <span className="label-caps mr-2">After-review note</span>
          <span className="text-text-dim">{entry.outcomeNote}</span>
        </div>
      )}
    </div>
  );
}
