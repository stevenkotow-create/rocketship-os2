export const STAGES = [
  { id: "targeting", label: "Scouting", icon: "🔭", color: "muted" },
  { id: "contacted", label: "Comms Open", icon: "📡", color: "cool" },
  { id: "applied", label: "Payload Sent", icon: "🚀", color: "accent" },
  { id: "early", label: "Ignition", icon: "🔥", color: "warn" },
  { id: "late", label: "Ascent", icon: "📈", color: "accent-2" },
  { id: "offer", label: "Orbit", icon: "🛰", color: "good" },
  { id: "accepted", label: "Docked", icon: "🎉", color: "good" },
  { id: "closed", label: "Recovered", icon: "📕", color: "muted" },
] as const;

export const PATTERN_ICONS: Record<string, string> = {
  A: "⚡",
  B: "🧭",
  C: "🏗",
  D: "🤝",
  E: "🎯",
};

// V2 NAVIGATION · 6-destination architecture
// The operator playbook engine sits at the top: Evaluator (gate) + Star Map (engagement engine).
// Generator + Academy are stubs until V2.1 ships their full build.
// Cut from nav 2026-06-27 · files preserved for archive: /identity /sectors /trajectory /references /resilience /log
// These pages still render if accessed directly · just removed from nav per V2 audit.
export type NavSection =
  | "DAILY"
  | "PLAYBOOK"
  | "BUILD"
  | "LEARN"
  | "REFERENCE"
  | "RECORDS";

export interface NavItem {
  href: string;
  label: string;
  section: NavSection;
  /** V4 · lucide-react icon name · maps to imports in components/icons.tsx */
  icon?: string;
  badge?: string;
  /** V9 · Demo mode filter · true = hidden when platform in demo-share mode (URL ?demo=1) */
  demoHidden?: boolean;
}

// V4.1 · Icon names map to custom Starfield-inspired SVGs in components/icons.tsx
// Custom space-themed icons for the heroes · lucide utilities for the supporting cast
// V9 · demoHidden flag added for items hidden in demo mode when sharing with mentors/team
export const NAV_ITEMS: NavItem[] = [
  // DAILY · the home
  { href: "/", label: "Mission Control", section: "DAILY", icon: "Portal" },
  { href: "/probes", label: "Probes Inbox", section: "DAILY", icon: "Probe" },
  { href: "/roles", label: "Live Roles", section: "DAILY", icon: "Antenna", badge: "NEW" },
  { href: "/outreach-funnel", label: "Outreach Funnel", section: "DAILY", icon: "Constellation", badge: "V5" },
  { href: "/interview-day", label: "Interview Day", section: "DAILY", icon: "Reticle", badge: "V3.5" },

  // PLAYBOOK · Discovery is the front door, then the values engine, then assessment surfaces
  { href: "/onboarding", label: "Discovery", section: "PLAYBOOK", icon: "Sparkle", badge: "V3.5" },
  { href: "/mission-compass", label: "Mission Compass", section: "PLAYBOOK", icon: "CompassRose", badge: "V3" },
  { href: "/decision-journal", label: "Decision Journal", section: "PLAYBOOK", icon: "FieldJournal", badge: "V3" },
  { href: "/evaluator", label: "Evaluator", section: "PLAYBOOK", icon: "Reticle", badge: "V2" },
  { href: "/pipeline", label: "Pipeline", section: "PLAYBOOK", icon: "Orbit" },
  { href: "/threads", label: "Star Map", section: "PLAYBOOK", icon: "Constellation" },
  { href: "/constellation", label: "Constellation", section: "PLAYBOOK", icon: "Orbit", badge: "SOON" },

  // BUILD · where outputs get made · HIDDEN in demo mode
  { href: "/briefing", label: "Generator", section: "BUILD", icon: "Zap", demoHidden: true },
  { href: "/outreach-bay", label: "Outreach Bay", section: "BUILD", icon: "Antenna", badge: "V5", demoHidden: true },
  { href: "/resume-lab", label: "Resume Lab", section: "BUILD", icon: "StarChart", badge: "V4.2", demoHidden: true },
  { href: "/brand-progress", label: "Brand Progress", section: "BUILD", icon: "Beacon", badge: "V4.2", demoHidden: true },
  { href: "/resume", label: "Resume Hub", section: "BUILD", icon: "FileText", demoHidden: true },
  { href: "/mentor-update", label: "Mentor Update", section: "BUILD", icon: "Beacon", badge: "V3", demoHidden: true },

  // LEARN · Flight Manual · HIDDEN in demo mode
  { href: "/manual", label: "Flight Manual", section: "LEARN", icon: "StarChart", demoHidden: true },

  // REFERENCE · standing rules + comp + comms patterns · HIDDEN in demo mode
  { href: "/comms", label: "Comms Bay", section: "REFERENCE", icon: "Antenna", demoHidden: true },
  { href: "/comp", label: "Comp Benchmarks", section: "REFERENCE", icon: "DollarSign", demoHidden: true },

  // RECORDS · the case-study artefact · HIDDEN in demo mode
  { href: "/build-log", label: "Build Log", section: "RECORDS", icon: "Wrench", demoHidden: true },
];

/**
 * V9 · Demo mode detection
 * Enabled when URL has ?demo=1 or localStorage has "ors-demo-mode" === "true"
 * Filters NAV_ITEMS to hide items marked demoHidden: true
 */
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("demo") === "1") return true;
    if (localStorage.getItem("ors-demo-mode") === "true") return true;
  } catch {}
  return false;
}

/**
 * V9 · Filtered nav items · returns full nav or demo-filtered depending on mode
 */
export function getVisibleNavItems(demoMode: boolean): NavItem[] {
  if (!demoMode) return NAV_ITEMS;
  return NAV_ITEMS.filter((item) => !item.demoHidden);
}

// V1 routes archived from nav per V2 audit (2026-06-27)
// Pages preserved · accessible directly · just removed from sidebar:
// /identity · /sectors · /trajectory · /references · /resilience · /log
// Previously archived (2026-06-24): /phases · /plan · /cv · /drills · /brand · /coach · /achievements

export const NAV_SECTIONS: NavSection[] = [
  "DAILY",
  "PLAYBOOK",
  "BUILD",
  "LEARN",
  "REFERENCE",
  "RECORDS",
];

export const FUNNEL_STAGES = [
  { id: "targeting", name: "TOF · Scouting", icon: "🔭", stages: ["targeting"], target: [8, 12], desc: "Companies on the radar, scored, ICP-aligned. Active P1 count." },
  { id: "contacted", name: "MQL · Comms Open", icon: "📡", stages: ["contacted"], target: [6, 8], desc: "Silent connect + engagement done. HM aware." },
  { id: "applied", name: "SQL · Payload Sent", icon: "🚀", stages: ["applied"], target: [4, 6], desc: "Submitted via ATS + DM with Loom." },
  { id: "interview", name: "Interview · Ignition+Ascent", icon: "🔥", stages: ["early", "late"], target: [2, 3], desc: "In live interview cycles." },
  { id: "offer", name: "Close · Orbit", icon: "🛰", stages: ["offer"], target: [1, 2], desc: "Real offer on the table." },
] as const;

// MISSION RANKS · XP system
export interface Rank {
  level: number;
  name: string;
  icon: string;
  minXP: number;
}

export const RANKS: Rank[] = [
  { level: 1, name: "Rookie", icon: "🥚", minXP: 0 },
  { level: 2, name: "Cadet", icon: "🧑‍🚀", minXP: 200 },
  { level: 3, name: "Pilot", icon: "✈️", minXP: 500 },
  { level: 4, name: "Co-Pilot", icon: "🛩", minXP: 1000 },
  { level: 5, name: "Captain", icon: "👨‍✈️", minXP: 1750 },
  { level: 6, name: "Commander", icon: "🎖", minXP: 2750 },
  { level: 7, name: "Astronaut", icon: "🚀", minXP: 4000 },
  { level: 8, name: "Mission Specialist", icon: "🛰", minXP: 6000 },
  { level: 9, name: "Flight Director", icon: "🏆", minXP: 8500 },
  { level: 10, name: "Mission Commander", icon: "👑", minXP: 12000 },
];

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  desc: string;
  xp: number;
  check: (snapshot: AchievementSnapshot) => boolean;
}

export interface AchievementSnapshot {
  oppsByStage: Record<string, number>;
  totalApplications: number;
  totalOutreach: number;
  totalFollowups: number;
  totalPractice: number;
  daysLogged: number;
  daysFullDrill: number;
  loomsSent: number;
  multiThreadedOpps: number;
  interviewsLanded: number;
  offersLanded: number;
  sectorsActive: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-launch", name: "First Launch", icon: "🚀", desc: "Sent your first outreach DM", xp: 100, check: (s) => s.totalOutreach >= 1 },
  { id: "multi-thread", name: "Multi-Thread Operator", icon: "🕸", desc: "3+ contacts at a single company", xp: 150, check: (s) => s.multiThreadedOpps >= 1 },
  { id: "loom-master", name: "Loom Master", icon: "📹", desc: "5+ Looms sent across opps", xp: 200, check: (s) => s.loomsSent >= 5 },
  { id: "ignition", name: "Ignition", icon: "🔥", desc: "First interview landed", xp: 300, check: (s) => s.interviewsLanded >= 1 },
  { id: "ascent", name: "Ascent", icon: "📈", desc: "Reached late-stage interview", xp: 400, check: (s) => (s.oppsByStage.late || 0) >= 1 },
  { id: "orbit", name: "Orbit", icon: "🛰", desc: "First offer in hand", xp: 750, check: (s) => s.offersLanded >= 1 },
  { id: "docked", name: "Docked", icon: "🎉", desc: "Accepted an offer · mission complete", xp: 2000, check: (s) => (s.oppsByStage.accepted || 0) >= 1 },
  { id: "logger", name: "Logger", icon: "📓", desc: "7 days of Mission Log entries", xp: 150, check: (s) => s.daysLogged >= 7 },
  { id: "drill-streak", name: "Drill Master", icon: "💪", desc: "7-day full ritual streak", xp: 250, check: (s) => s.daysFullDrill >= 7 },
  { id: "multi-sector", name: "Constellation", icon: "🌟", desc: "Active opps in 3+ target sectors", xp: 100, check: (s) => s.sectorsActive >= 3 },
  { id: "speed-run", name: "Speed Run", icon: "⚡", desc: "5+ outreaches in a single day", xp: 50, check: (s) => false /* checked separately via ritual */ },
  { id: "cadence-week", name: "Weekly Wave", icon: "🌊", desc: "Hit weekly targets (12 apps, 20 outreach, 8 follow-ups)", xp: 500, check: () => false /* checked separately */ },
  { id: "compounding", name: "Compounding", icon: "📊", desc: "30+ days of platform use", xp: 500, check: (s) => s.daysLogged >= 30 },
];

// XP rewards per action
export const XP_RULES = {
  TICK_RITUAL: 10,
  MOVE_OPP_FORWARD: 25,
  COMPLETE_PHASE_TASK: 50,
  LOG_ENTRY: 20,
  ENERGY_CHECKIN: 5,
  HIT_WEEKLY_TARGET: 100,
};
