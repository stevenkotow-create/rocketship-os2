"use client";

import { RANKS, ACHIEVEMENTS, XP_RULES } from "./constants";
import type { AppState, Opportunity } from "./types";
import { OPPORTUNITIES } from "./data/opportunities";
import { PHASE_TASKS } from "./data/phases";
import { SECTORS } from "./data/sectors";

export function calculateXP(state: AppState): number {
  let xp = 0;

  // XP from Mission Drill ticks (each unit = 10 XP)
  Object.values(state.ritual).forEach((r) => {
    xp += (r.apps + r.outreach + r.followups) * XP_RULES.TICK_RITUAL;
    xp += Math.floor(r.practice / 15) * XP_RULES.TICK_RITUAL; // 15-min blocks
  });

  // XP from completed phase tasks
  const defaultTasksDone = PHASE_TASKS.filter((t) => t.done).length;
  const customTasksDone = Object.values(state.tasks || {}).filter(Boolean).length;
  // Use whichever is higher (state overrides default if set)
  const tasksDoneCount = Object.keys(state.tasks || {}).length > 0 ? customTasksDone : defaultTasksDone;
  xp += tasksDoneCount * XP_RULES.COMPLETE_PHASE_TASK;

  // XP from Mission Log entries
  Object.values(state.log || {}).forEach((entry) => {
    if (entry.win || entry.lesson || entry.obs || entry.pod) xp += XP_RULES.LOG_ENTRY;
  });

  // XP from Energy check-ins
  xp += Object.keys(state.energy || {}).length * XP_RULES.ENERGY_CHECKIN;

  // XP from opp stage progressions (any opp moved past targeting)
  Object.values(state.opps || {}).forEach((opp) => {
    if (opp.stage && opp.stage !== "targeting") xp += XP_RULES.MOVE_OPP_FORWARD;
  });

  // Weekly target bonuses
  Object.values(state.ritual).forEach((r) => {
    // Approximate weekly bonus per day of full drill (since storage is daily)
    const fullDay = (r.apps >= 2 && r.outreach >= 4 && r.followups >= 2 && r.practice >= 15);
    if (fullDay) xp += 20;
  });

  return xp;
}

export function getRank(xp: number) {
  let currentRank = RANKS[0];
  let nextRank = RANKS[1];
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXP) {
      currentRank = RANKS[i];
      nextRank = RANKS[i + 1] || RANKS[i];
    }
  }
  const progressInLevel = xp - currentRank.minXP;
  const totalInLevel = (nextRank.minXP || currentRank.minXP + 1000) - currentRank.minXP;
  const progressPct = nextRank === currentRank ? 100 : Math.round((progressInLevel / totalInLevel) * 100);
  return { currentRank, nextRank, progressPct, progressInLevel, totalInLevel };
}

export function buildAchievementSnapshot(state: AppState) {
  const allOpps: Opportunity[] = OPPORTUNITIES.map((o) => ({ ...o, ...(state.opps[o.id] || {}) } as Opportunity));

  const oppsByStage: Record<string, number> = {};
  allOpps.forEach((o) => {
    oppsByStage[o.stage] = (oppsByStage[o.stage] || 0) + 1;
  });

  let totalApps = 0;
  let totalOutreach = 0;
  let totalFollowups = 0;
  let totalPractice = 0;
  let daysFullDrill = 0;

  Object.values(state.ritual || {}).forEach((r) => {
    totalApps += r.apps;
    totalOutreach += r.outreach;
    totalFollowups += r.followups;
    totalPractice += r.practice;
    if (r.apps >= 2 && r.outreach >= 4 && r.followups >= 2 && r.practice >= 15) daysFullDrill++;
  });

  const daysLogged = Object.values(state.log || {}).filter((e) => e.win || e.lesson || e.obs || e.pod).length;
  const loomsSent = allOpps.filter((o) => o.loom).length;
  const multiThreadedOpps = allOpps.filter((o) => o.contacts && o.contacts.length >= 3).length;
  const interviewsLanded = (oppsByStage.early || 0) + (oppsByStage.late || 0);
  const offersLanded = (oppsByStage.offer || 0) + (oppsByStage.accepted || 0);

  const sectorsActive = SECTORS.filter((s) =>
    s.pipelineIds.some((id) => {
      const opp = allOpps.find((o) => o.id === id);
      return opp && !["closed", "accepted"].includes(opp.stage);
    })
  ).length;

  return {
    oppsByStage,
    totalApplications: totalApps,
    totalOutreach,
    totalFollowups,
    totalPractice,
    daysLogged,
    daysFullDrill,
    loomsSent,
    multiThreadedOpps,
    interviewsLanded,
    offersLanded,
    sectorsActive,
  };
}

export function getEarnedAchievements(state: AppState) {
  const snapshot = buildAchievementSnapshot(state);
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    earned: a.check(snapshot),
  }));
}
