"use client";

import { useEffect, useState } from "react";
import { useAppState, today } from "@/lib/storage";

const LOCKOUT_HOUR = 18; // 6pm
const LOCKOUT_MINUTE = 30;

// V2.5 · only enforce the lockout in local development
// Public deploy visitors are in arbitrary timezones · locking them out breaks the demo
// Running npm run dev locally = NODE_ENV development = lock fires per discipline rule
// Vercel deploy = NODE_ENV production = lock never shows, demo always accessible
const IS_DEV = process.env.NODE_ENV === "development";

interface LockState {
  dismissedAt: string;
  date: string;
}

export function WindDownLock() {
  const [state] = useAppState();
  const [now, setNow] = useState(new Date());
  const [dismissed, setDismissed] = useState(false);

  // V2.5 fix · short-circuit out of the component entirely in production
  // Prevents any timezone-based lockout from triggering on the public demo URL
  if (!IS_DEV) return null;

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("ors-winddown-dismissed");
      if (raw) {
        const parsed: LockState = JSON.parse(raw);
        if (parsed.date === today()) setDismissed(true);
      }
    } catch {}
  }, []);

  const isAfterHours = now.getHours() > LOCKOUT_HOUR || (now.getHours() === LOCKOUT_HOUR && now.getMinutes() >= LOCKOUT_MINUTE);
  const isBefore6am = now.getHours() < 6;
  const showLock = (isAfterHours || isBefore6am) && !dismissed;

  function dismiss() {
    localStorage.setItem("ors-winddown-dismissed", JSON.stringify({ dismissedAt: now.toISOString(), date: today() }));
    setDismissed(true);
  }

  if (!showLock) return null;

  const timeStr = now.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
  const todayKey = today();
  const ritualToday = state.ritual[todayKey] || { apps: 0, outreach: 0, followups: 0, practice: 0 };
  const logToday = state.log[todayKey] || {};
  const podDone = !!logToday.pod;
  const drillsDone = (ritualToday.apps >= 2 ? 1 : 0) + (ritualToday.outreach >= 4 ? 1 : 0) + (ritualToday.followups >= 2 ? 1 : 0) + (ritualToday.practice >= 15 ? 1 : 0);

  return (
    <div className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-surface border border-accent rounded-2xl p-8 max-w-[600px] w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🌙</div>
          <h2 className="text-2xl font-bold text-navy mb-2">Mission Day Complete</h2>
          <p className="text-text-dim text-sm">It&apos;s {timeStr} · the platform is in wind-down mode</p>
        </div>

        <div className="bg-surface-2 border border-border rounded-lg p-5 mb-5">
          <h3 className="text-sm font-semibold text-navy mb-3">Today&apos;s shape</h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-[10px] text-muted uppercase tracking-wider">Apps</div>
              <div className={`text-2xl font-bold ${ritualToday.apps >= 2 ? "text-good" : "text-text-dim"}`}>{ritualToday.apps}<span className="text-xs text-muted">/2</span></div>
            </div>
            <div>
              <div className="text-[10px] text-muted uppercase tracking-wider">Outreach</div>
              <div className={`text-2xl font-bold ${ritualToday.outreach >= 4 ? "text-good" : "text-text-dim"}`}>{ritualToday.outreach}<span className="text-xs text-muted">/4</span></div>
            </div>
            <div>
              <div className="text-[10px] text-muted uppercase tracking-wider">Follow-ups</div>
              <div className={`text-2xl font-bold ${ritualToday.followups >= 2 ? "text-good" : "text-text-dim"}`}>{ritualToday.followups}<span className="text-xs text-muted">/2</span></div>
            </div>
            <div>
              <div className="text-[10px] text-muted uppercase tracking-wider">Practice</div>
              <div className={`text-2xl font-bold ${ritualToday.practice >= 15 ? "text-good" : "text-text-dim"}`}>{ritualToday.practice}<span className="text-xs text-muted">m</span></div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className="text-xs text-muted">
              {drillsDone === 4 ? "🎉 Full ritual day · streak +1" : drillsDone >= 2 ? `✓ Day counts (${drillsDone}/4 hit)` : "Partial day · the bar drops to 2/4 to count"}
            </span>
          </div>
        </div>

        {!podDone && (
          <div className="bg-warn/10 border border-warn rounded-lg p-4 mb-5">
            <p className="text-sm text-text">
              <strong className="text-warn">🙏 POD not logged.</strong> Take 60 seconds before you close. Mission Log → Win, Lesson, Observation, POD. The POD is what makes tomorrow start with momentum, not desperation.
            </p>
          </div>
        )}

        <div className="bg-navy/5 border border-navy/30 rounded-lg p-4 mb-5">
          <h3 className="text-sm font-semibold text-navy mb-2">Tonight&apos;s recovery options</h3>
          <p className="text-xs text-text-dim mb-3">Recovery IS execution. Pick one and actually do it.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
            <div className="text-xs"><div className="text-xl mb-1">🚶</div>Walk</div>
            <div className="text-xs"><div className="text-xl mb-1">💪</div>Workout</div>
            <div className="text-xs"><div className="text-xl mb-1">👥</div>See someone</div>
            <div className="text-xs"><div className="text-xl mb-1">😴</div>Sleep early</div>
          </div>
        </div>

        <div className="text-center text-sm text-text mb-5 italic">
          The pipeline will still be there tomorrow. The work doesn&apos;t suffer for one good night off.
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={dismiss}
            className="px-5 py-2.5 bg-accent text-white dark:text-bg rounded-md text-sm font-semibold hover:bg-accent-2"
          >
            Acknowledge · close laptop
          </button>
          <button
            onClick={dismiss}
            className="px-5 py-2.5 bg-transparent border border-border text-text-dim rounded-md text-sm hover:bg-surface-2"
          >
            Override · 5 more min only
          </button>
        </div>
        <p className="text-center text-[10px] text-muted mt-3">
          Lockout returns at 6:30pm tomorrow. The system has your back.
        </p>
      </div>
    </div>
  );
}
