"use client";

// V3.0 · The "Today" surface · Mission Control hero component
// Live action feed · checkbox-driven · completed items slide out, next priority slides up
// Solves friction points 1 + 3 + 5 + 9 from the V3 audit
// "Platform is a display" → "Platform is an operating tool"

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/lib/storage";
import {
  computeTodaysActions,
  todayCompletionKey,
  isActionCompleted,
  categoryIcon,
  categoryColor,
} from "@/lib/today-actions";
import { getTodaysQuote } from "@/lib/data/resilience";

export function TodayActions() {
  const [state, update] = useAppState();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const allActions = computeTodaysActions(state);
  const visibleActions = allActions.filter((a) => !isActionCompleted(state, a.id));
  const completedCount = allActions.length - visibleActions.length;
  const visible = visibleActions.slice(0, 6); // cap at 6 to avoid overwhelm

  function toggleComplete(actionId: string) {
    const key = todayCompletionKey(actionId);
    update((s) => ({
      ...s,
      tasks: { ...s.tasks, [key]: !s.tasks[key] },
    }));
  }

  function copyToClipboard(payload: string, actionId: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(payload).then(() => {
      setCopiedId(actionId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const allClear = visibleActions.length === 0;
  const quote = getTodaysQuote();

  return (
    <div className="mb-6 bg-gradient-to-br from-navy via-navy to-accent/20 text-white rounded-2xl p-6 shadow-lg">
      {/* Header · the framing */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[2px] opacity-70 font-semibold mb-1">
            Today · live action feed
          </div>
          <h2 className="text-[24px] font-bold leading-tight tracking-tight">
            {allClear ? "All clear · deep work mode" : "Do these now"}
          </h2>
        </div>
        {!allClear && (
          <div className="text-right">
            <div className="text-[28px] font-bold leading-none tracking-tight">{visibleActions.length}</div>
            <div className="text-[10px] uppercase tracking-[1.5px] opacity-70 font-semibold">
              action{visibleActions.length === 1 ? "" : "s"} pending
            </div>
            {completedCount > 0 && (
              <div className="text-[11px] mt-1 opacity-80">
                ✓ {completedCount} done today
              </div>
            )}
          </div>
        )}
      </div>

      {/* All clear state · quote + encouragement */}
      {allClear && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="text-[40px] mb-2">🛰</div>
          <p className="text-[14px] leading-relaxed opacity-90 max-w-md mx-auto mb-3">
            No action items in the priority feed. Use this window for deep work · strategy, scouting, or rest.
          </p>
          {quote && (
            <p className="text-[12px] italic opacity-70 max-w-md mx-auto">
              &ldquo;{quote.quote}&rdquo; &mdash; {quote.author}
            </p>
          )}
        </div>
      )}

      {/* Action feed · cards */}
      {!allClear && (
        <div className="space-y-2">
          {visible.map((action) => {
            const isCopied = copiedId === action.id;
            const color = categoryColor(action.category);
            return (
              <div
                key={action.id}
                className="group bg-white/8 hover:bg-white/12 backdrop-blur-sm rounded-xl p-4 flex items-start gap-3 transition-all"
              >
                {/* Checkbox · the action engine */}
                <button
                  onClick={() => toggleComplete(action.id)}
                  className="flex-shrink-0 w-6 h-6 rounded-md border-2 border-white/40 hover:border-white hover:bg-white/20 flex items-center justify-center transition-all mt-0.5"
                  aria-label={`Mark complete: ${action.title}`}
                >
                  <span className="text-[14px] opacity-0 group-hover:opacity-50 transition-opacity">✓</span>
                </button>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap mb-1">
                    <span className="text-[16px] flex-shrink-0">{categoryIcon(action.category)}</span>
                    <span className="text-[14px] font-semibold leading-tight">{action.title}</span>
                    {action.priority === 1 && (
                      <span className="text-[9px] uppercase tracking-[1.4px] bg-accent text-white px-1.5 py-0.5 rounded font-bold">
                        Now
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] opacity-75 leading-relaxed">{action.context}</p>
                </div>

                {/* CTA · action button */}
                {action.cta && (
                  <div className="flex-shrink-0">
                    {action.cta.action === "open-mission" && action.oppId && (
                      <Link
                        href={`/mission/${action.oppId}`}
                        className="inline-flex items-center text-[11px] uppercase tracking-[1px] font-bold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded transition"
                      >
                        {action.cta.label} →
                      </Link>
                    )}
                    {action.cta.action === "open-mission" && action.cta.payload && !action.oppId && (
                      <Link
                        href={action.cta.payload}
                        className="inline-flex items-center text-[11px] uppercase tracking-[1px] font-bold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded transition"
                      >
                        {action.cta.label} →
                      </Link>
                    )}
                    {action.cta.action === "copy-to-clipboard" && action.cta.payload && (
                      <button
                        onClick={() => copyToClipboard(action.cta!.payload!, action.id)}
                        className={`inline-flex items-center text-[11px] uppercase tracking-[1px] font-bold px-3 py-1.5 rounded transition ${
                          isCopied
                            ? "bg-good text-white"
                            : "bg-white/15 hover:bg-white/25"
                        }`}
                      >
                        {isCopied ? "✓ Copied" : action.cta.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Show-more nudge if more than 6 actions */}
          {visibleActions.length > 6 && (
            <p className="text-[11px] opacity-60 text-center pt-2">
              + {visibleActions.length - 6} more action{visibleActions.length - 6 > 1 ? "s" : ""} below the fold · prioritising top 6
            </p>
          )}
        </div>
      )}

      {/* Footer · context line about the system */}
      <div className="mt-4 pt-4 border-t border-white/10 text-[10px] uppercase tracking-[1.5px] opacity-50 font-semibold">
        Live · auto-refreshes from pipeline state · checkboxes reset at midnight
      </div>
    </div>
  );
}
