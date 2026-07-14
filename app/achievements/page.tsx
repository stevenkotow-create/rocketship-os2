"use client";

import { useAppState } from "@/lib/storage";
import { calculateXP, getRank, getEarnedAchievements, buildAchievementSnapshot } from "@/lib/xp";
import { RANKS } from "@/lib/constants";

export default function Achievements() {
  const [state] = useAppState();
  const xp = calculateXP(state);
  const { currentRank, nextRank, progressPct, progressInLevel, totalInLevel } = getRank(xp);
  const achievements = getEarnedAchievements(state);
  const snapshot = buildAchievementSnapshot(state);

  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalAchievementXP = achievements.filter((a) => a.earned).reduce((sum, a) => sum + a.xp, 0);

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight mb-1.5">Mission Ranks 🏆</h1>
      <p className="text-muted text-sm mb-6">Your operator progression. Every drill, every move, every win compounds into XP and rank.</p>

      {/* Current Rank Hero */}
      <div className="card !border-accent bg-gradient-to-br from-surface to-surface-2 mb-5">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="text-7xl">{currentRank.icon}</div>
          <div className="flex-1 min-w-[200px]">
            <div className="text-[11px] text-muted uppercase tracking-wider">Current rank</div>
            <div className="text-3xl font-bold text-navy">Level {currentRank.level} · {currentRank.name}</div>
            <div className="text-sm text-text-dim mt-1">{xp.toLocaleString()} XP earned</div>
          </div>
          {nextRank !== currentRank && (
            <div className="text-right">
              <div className="text-[11px] text-muted uppercase tracking-wider">Next rank</div>
              <div className="text-base font-semibold text-accent">{nextRank.icon} {nextRank.name}</div>
              <div className="text-xs text-text-dim mt-1">{nextRank.minXP - xp} XP to go</div>
            </div>
          )}
        </div>
        {nextRank !== currentRank && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted mb-1.5">
              <span>{progressInLevel} XP</span>
              <span>{progressPct}%</span>
              <span>{totalInLevel} XP</span>
            </div>
            <div className="progress-track" style={{ height: "10px" }}>
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Snapshot Stats */}
      <h2 className="text-xl font-semibold mt-7 mb-3">By the numbers</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="stat text-center"><div className="text-2xl mb-1">📤</div><div className="text-[11px] text-muted uppercase">Total Apps</div><div className="text-2xl font-bold mt-1">{snapshot.totalApplications}</div></div>
        <div className="stat text-center"><div className="text-2xl mb-1">💬</div><div className="text-[11px] text-muted uppercase">Outreach Sent</div><div className="text-2xl font-bold mt-1">{snapshot.totalOutreach}</div></div>
        <div className="stat text-center"><div className="text-2xl mb-1">📞</div><div className="text-[11px] text-muted uppercase">Follow-ups</div><div className="text-2xl font-bold mt-1">{snapshot.totalFollowups}</div></div>
        <div className="stat text-center"><div className="text-2xl mb-1">🎯</div><div className="text-[11px] text-muted uppercase">Practice (min)</div><div className="text-2xl font-bold mt-1">{snapshot.totalPractice}</div></div>
        <div className="stat text-center"><div className="text-2xl mb-1">🕸</div><div className="text-[11px] text-muted uppercase">Multi-threaded</div><div className="text-2xl font-bold mt-1">{snapshot.multiThreadedOpps}</div></div>
        <div className="stat text-center"><div className="text-2xl mb-1">🔥</div><div className="text-[11px] text-muted uppercase">Interviews</div><div className="text-2xl font-bold mt-1">{snapshot.interviewsLanded}</div></div>
        <div className="stat text-center"><div className="text-2xl mb-1">🛰</div><div className="text-[11px] text-muted uppercase">Offers</div><div className="text-2xl font-bold mt-1 text-good">{snapshot.offersLanded}</div></div>
        <div className="stat text-center"><div className="text-2xl mb-1">📓</div><div className="text-[11px] text-muted uppercase">Log Days</div><div className="text-2xl font-bold mt-1">{snapshot.daysLogged}</div></div>
      </div>

      {/* Achievements Grid */}
      <h2 className="text-xl font-semibold mt-7 mb-3">
        Achievements · {earnedCount}/{achievements.length}
        <span className="text-sm font-normal text-muted ml-2">({totalAchievementXP} XP from achievements)</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`card text-center transition-all ${a.earned ? "!border-accent bg-gradient-to-br from-accent/5 to-surface" : "opacity-50 grayscale"}`}
          >
            <div className="text-5xl mb-3">{a.icon}</div>
            <h3 className={`text-sm font-bold mt-0 mb-1 ${a.earned ? "text-accent" : "text-text-dim"}`}>{a.name}</h3>
            <p className="text-xs text-text-dim mb-2">{a.desc}</p>
            <div className="text-[10px] text-muted uppercase tracking-wider">{a.earned ? "✓ Unlocked" : "Locked"} · {a.xp} XP</div>
          </div>
        ))}
      </div>

      {/* Rank Ladder */}
      <h2 className="text-xl font-semibold mt-7 mb-3">Rank ladder · the climb</h2>
      <div className="card">
        {RANKS.map((r) => {
          const active = r.level === currentRank.level;
          const passed = xp >= r.minXP;
          return (
            <div key={r.level} className={`flex items-center gap-4 py-2.5 border-b border-border last:border-b-0 ${active ? "bg-accent/5 -mx-4 px-4 rounded" : ""}`}>
              <div className={`text-2xl ${passed ? "" : "grayscale opacity-40"}`}>{r.icon}</div>
              <div className="flex-1">
                <div className={`text-sm font-semibold ${active ? "text-accent" : passed ? "text-navy" : "text-muted"}`}>
                  Level {r.level} · {r.name}
                </div>
                <div className="text-xs text-text-dim">{r.minXP.toLocaleString()} XP required</div>
              </div>
              {active && <span className="badge bg-accent/20 text-accent">YOU ARE HERE</span>}
              {passed && !active && <span className="badge bg-good/15 text-good">✓ Passed</span>}
              {!passed && <span className="text-xs text-muted">{(r.minXP - xp).toLocaleString()} XP to unlock</span>}
            </div>
          );
        })}
      </div>

      <div className="card mt-5 !border-accent">
        <h3 className="text-base font-semibold mt-0 mb-2 text-accent">How XP works</h3>
        <ul className="text-sm text-text-dim space-y-1 pl-5 list-disc">
          <li>Each Mission Drill tick (apps, outreach, follow-ups, practice block) = <strong>10 XP</strong></li>
          <li>Mission Log entry = <strong>20 XP</strong></li>
          <li>Energy check-in = <strong>5 XP</strong></li>
          <li>Move opp to next stage = <strong>25 XP</strong></li>
          <li>Complete a Phase Task = <strong>50 XP</strong></li>
          <li>Full daily ritual = <strong>+20 bonus XP</strong></li>
          <li>Unlock achievements = <strong>50-2000 XP</strong></li>
        </ul>
        <p className="text-sm text-text-dim mt-3">XP emerges from existing actions. No new behaviour required — just keep operating, the ranks compound.</p>
      </div>
    </div>
  );
}
