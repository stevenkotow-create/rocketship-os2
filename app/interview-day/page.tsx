"use client";

// V3.5 · Interview Day · the command center for any day with imminent interviews
// Auto-detects opps with meetingBookedFor in next 72hrs · groups by date · shows full pre/during/post per call
// Designed to be opened the morning of an interview day and worked top-to-bottom

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/storage";
import { PageHero } from "@/components/PageHero";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import type { Opportunity, Contact } from "@/lib/types";

interface InterviewSlot {
  opp: Opportunity;
  contact: Contact;
  when: Date;
}

function parseAction(action?: string) {
  // Crude parse of the action field for pre/during/post hints
  if (!action) return { pre: "", during: "", post: "" };
  const preMatch = action.match(/PRE-CALL[^:]*:([^.]+\.?[^.]*\.?)/i);
  const duringMatch = action.match(/CALL:([^.]+\.?[^.]*\.?[^.]*\.?[^.]*\.?[^.]*\.?[^.]*\.?[^.]*\.?[^.]*\.?)/i);
  const postMatch = action.match(/POST-CALL[^:]*:([^.]+\.?[^.]*\.?[^.]*\.?)/i);
  return {
    pre: preMatch?.[1]?.trim() || "",
    during: duringMatch?.[1]?.trim() || "",
    post: postMatch?.[1]?.trim() || "",
  };
}

function relativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 0) {
    const ago = Math.abs(diffMin);
    if (ago < 60) return `${ago} min ago`;
    if (ago < 1440) return `${Math.floor(ago / 60)}h ago`;
    return `${Math.floor(ago / 1440)}d ago`;
  }
  if (diffMin < 60) return `in ${diffMin} min`;
  if (diffMin < 1440) return `in ${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
  return `in ${Math.floor(diffMin / 1440)}d`;
}

export default function InterviewDayPage() {
  const [state, update] = useAppState();
  const ALL_OPPS = [...OPPORTUNITIES, ...(state.customOpps || [])];
  const [postCallLogs, setPostCallLogs] = useState<Record<string, { impressions: string; nextSteps: string }>>({});

  // Merge seed opps with state overrides
  const allOpps: Opportunity[] = useMemo(
    () => ALL_OPPS.map((o) => ({ ...o, ...(state.opps[o.id] || {}) }) as Opportunity),
    [state.opps, state.customOpps],
  );

  // Find all interviews with meetingBookedFor in the next 72 hours
  const upcomingInterviews = useMemo<InterviewSlot[]>(() => {
    const now = Date.now();
    const horizon = now + 72 * 60 * 60 * 1000;
    const slots: InterviewSlot[] = [];
    for (const opp of allOpps) {
      for (const c of opp.contacts || []) {
        if (!c.meetingBookedFor) continue;
        const when = new Date(c.meetingBookedFor);
        if (when.getTime() < now - 4 * 60 * 60 * 1000) continue; // skip more than 4hrs in past
        if (when.getTime() > horizon) continue;
        slots.push({ opp, contact: c, when });
      }
    }
    return slots.sort((a, b) => a.when.getTime() - b.when.getTime());
  }, [allOpps]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, InterviewSlot[]>();
    for (const slot of upcomingInterviews) {
      const dateKey = slot.when.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(slot);
    }
    return Array.from(map.entries());
  }, [upcomingInterviews]);

  function logCall(oppId: string, contactName: string, impressions: string, nextSteps: string) {
    update((s) => {
      const opp = s.opps[oppId] || {};
      const timestamps = opp.timestamps || [];
      return {
        ...s,
        opps: {
          ...s.opps,
          [oppId]: {
            ...opp,
            timestamps: [
              ...timestamps,
              {
                event: `Interview call with ${contactName}`,
                date: new Date().toISOString(),
                note: `Impressions: ${impressions} · Next steps: ${nextSteps}`,
              },
            ],
          },
        },
      };
    });
    setPostCallLogs((p) => ({ ...p, [`${oppId}-${contactName}`]: { impressions: "", nextSteps: "" } }));
  }

  return (
    <div>
      <PageHero eyebrow="Command Center" title="Interview Day" subtitle="All interviews scheduled in the next 72 hours, grouped by day. Open this the morning of an interview day and work it top to bottom · pre-call checklist, in-call cheat sheet, post-call log." marker="ID.01" />

      {upcomingInterviews.length === 0 && (
        <div className="card-elevated text-center py-12">
          <div className="text-[48px] mb-3">🛌</div>
          <h2 className="text-[20px] font-bold text-navy mb-2">No interviews in the next 72 hours</h2>
          <p className="text-[13px] text-text-dim max-w-md mx-auto leading-relaxed">
            When an opp&apos;s contact has a meetingBookedFor date within 72 hours, it shows up here automatically. Set one on any Mission Profile to test.
          </p>
          <Link
            href="/pipeline"
            className="inline-block mt-4 px-5 py-2 bg-accent text-white rounded-md font-semibold text-[13px] hover:bg-accent-2 transition"
          >
            Open Pipeline →
          </Link>
        </div>
      )}

      {groupedByDate.map(([dateLabel, slots]) => {
        // Calculate gaps between interviews on this day
        const gaps: { fromIdx: number; gapMinutes: number }[] = [];
        for (let i = 1; i < slots.length; i++) {
          const gap = (slots[i].when.getTime() - slots[i - 1].when.getTime()) / 60000;
          if (gap > 0) gaps.push({ fromIdx: i - 1, gapMinutes: gap });
        }

        return (
          <div key={dateLabel} className="mb-8">
            <div className="flex items-baseline justify-between gap-2 flex-wrap mb-3">
              <h2 className="section-title m-0">{dateLabel}</h2>
              <span className="text-[12px] text-muted">
                {slots.length} interview{slots.length === 1 ? "" : "s"}
              </span>
            </div>

            {slots.map((slot, idx) => {
              const key = `${slot.opp.id}-${slot.contact.name}`;
              const log = postCallLogs[key] || { impressions: "", nextSteps: "" };
              const parsed = parseAction(slot.opp.action);
              const isPast = slot.when.getTime() < Date.now();
              const minutesUntil = Math.round((slot.when.getTime() - Date.now()) / 60000);
              const inPreCallWindow = minutesUntil <= 30 && minutesUntil >= 0;
              const inProgress = minutesUntil < 0 && minutesUntil >= -90;

              const stageColor = isPast
                ? "border-muted/30 bg-muted/5"
                : inProgress
                ? "border-warn bg-warn/5"
                : inPreCallWindow
                ? "border-accent bg-accent/5"
                : "border-border bg-surface";

              return (
                <div key={key}>
                  <div className={`card-elevated border-2 ${stageColor} mb-3`}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                          <h3 className="text-[20px] font-bold text-navy m-0">{slot.opp.company}</h3>
                          {slot.opp.priority && (
                            <span className="badge bg-accent/20 text-accent">{slot.opp.priority}</span>
                          )}
                          {isPast && <span className="badge bg-muted/15 text-muted">Done</span>}
                          {inProgress && <span className="badge bg-warn/20 text-warn">In progress</span>}
                          {inPreCallWindow && <span className="badge bg-accent/20 text-accent">🔥 Pre-call window</span>}
                        </div>
                        <p className="text-[13px] text-text-dim m-0">{slot.opp.position}</p>
                        <p className="text-[12px] text-muted mt-1">
                          With <strong className="text-navy">{slot.contact.name}</strong>
                          {slot.contact.title && <span> · {slot.contact.title}</span>}
                          {slot.contact.role && <span> · {slot.contact.role}</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-[22px] font-bold text-navy leading-tight">
                          {slot.when.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}
                        </div>
                        <div className="text-[11px] text-muted">AEST · {relativeTime(slot.when)}</div>
                      </div>
                    </div>

                    {/* Pre-call */}
                    <div className="bg-surface-2 border border-border rounded-lg p-4 mb-3">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-[14px]">⏱</span>
                        <strong className="text-[13px] text-navy">Pre-call · 30 min before</strong>
                      </div>
                      <ul className="text-[12px] text-text-dim space-y-1.5 list-none ml-0">
                        <li className="pl-3 border-l-2 border-accent/40">Calendar confirmed · Zoom link tested · headphones charged</li>
                        <li className="pl-3 border-l-2 border-accent/40">Water + snack ready · phone silenced · door closed</li>
                        <li className="pl-3 border-l-2 border-accent/40">Prep doc open in adjacent tab · key questions glanced</li>
                        <li className="pl-3 border-l-2 border-accent/40">90-sec opener rehearsed once aloud</li>
                        {parsed.pre && (
                          <li className="pl-3 border-l-2 border-accent text-navy mt-2">
                            <strong>Opp-specific:</strong> {parsed.pre}
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* During-call */}
                    <div className="bg-surface-2 border border-border rounded-lg p-4 mb-3">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-[14px]">🎙</span>
                        <strong className="text-[13px] text-navy">During the call · glance cheat sheet</strong>
                      </div>
                      <ul className="text-[12px] text-text-dim space-y-1.5">
                        <li className="pl-3 border-l-2 border-good/40"><strong>Open:</strong> 90-sec narrative in your own voice · who you are, why this role</li>
                        <li className="pl-3 border-l-2 border-good/40"><strong>Use their name twice</strong> · feels personal, not scripted</li>
                        <li className="pl-3 border-l-2 border-good/40"><strong>Ask 3-4 questions</strong> from your prep · listen for 2x duration of your answer</li>
                        <li className="pl-3 border-l-2 border-good/40"><strong>Accountability line ready:</strong> &ldquo;Great question · let me get back to you in 24 hrs with a sharper answer.&rdquo;</li>
                        <li className="pl-3 border-l-2 border-good/40"><strong>Closing move:</strong> close with a clear next-step ask · &ldquo;What&apos;s the next stage look like? When should I expect to hear back?&rdquo;</li>
                        {parsed.during && (
                          <li className="pl-3 border-l-2 border-good text-navy mt-2">
                            <strong>Opp-specific:</strong> {parsed.during}
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Post-call */}
                    <div className="bg-surface-2 border border-border rounded-lg p-4 mb-3">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-[14px]">📝</span>
                        <strong className="text-[13px] text-navy">Post-call · within 4 hours</strong>
                      </div>
                      <ul className="text-[12px] text-text-dim space-y-1.5 mb-3">
                        <li className="pl-3 border-l-2 border-warn/40">Thank-you DM sent · reference one specific thing they said</li>
                        <li className="pl-3 border-l-2 border-warn/40">Log to Mission Profile · impressions, energy read, next steps</li>
                        <li className="pl-3 border-l-2 border-warn/40">Close any &ldquo;I&apos;ll come back to you&rdquo; loops within 24 hrs</li>
                        {parsed.post && (
                          <li className="pl-3 border-l-2 border-warn text-navy mt-2">
                            <strong>Opp-specific:</strong> {parsed.post}
                          </li>
                        )}
                      </ul>

                      {/* Quick-log form */}
                      <div className="border-t border-border pt-3 mt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                          <input
                            type="text"
                            value={log.impressions}
                            onChange={(e) => setPostCallLogs((p) => ({ ...p, [key]: { ...log, impressions: e.target.value } }))}
                            placeholder="Impressions · energy · vibe"
                            className="text-[12px] p-2 border border-border rounded-md bg-surface"
                          />
                          <input
                            type="text"
                            value={log.nextSteps}
                            onChange={(e) => setPostCallLogs((p) => ({ ...p, [key]: { ...log, nextSteps: e.target.value } }))}
                            placeholder="Next steps · timeline"
                            className="text-[12px] p-2 border border-border rounded-md bg-surface"
                          />
                        </div>
                        <button
                          onClick={() => logCall(slot.opp.id, slot.contact.name, log.impressions, log.nextSteps)}
                          disabled={!log.impressions.trim() && !log.nextSteps.trim()}
                          className="text-[11px] px-3 py-1.5 bg-accent text-white rounded-md font-bold hover:bg-accent-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Log to Mission Profile
                        </button>
                      </div>
                    </div>

                    {/* Footer · link to Mission Profile */}
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <Link href={`/mission/${slot.opp.id}`} className="text-accent hover:underline font-semibold">
                        Open Mission Profile →
                      </Link>
                      {slot.contact.linkedin && (
                        <a href={slot.contact.linkedin} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                          LinkedIn →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Gap card between interviews */}
                  {gaps.find((g) => g.fromIdx === idx) && (
                    <div className="card mb-3 bg-cool/5 border-cool/30">
                      <div className="flex items-center gap-3">
                        <div className="text-[24px]">⏸</div>
                        <div>
                          <strong className="block text-[14px] text-cool mb-0.5">
                            {Math.round(gaps.find((g) => g.fromIdx === idx)!.gapMinutes / 60 * 10) / 10}-hour gap to next interview
                          </strong>
                          <p className="text-[12px] text-text-dim m-0">
                            Eat · walk · hydrate · review next prep doc · 5-min mental reset before the next pre-call window
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
