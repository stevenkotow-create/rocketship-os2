// V3.0 · The "Today" action engine
// Computes the live priority action feed from app state.
// Each action has: stable ID, title, priority (1-5, 1=highest), context, deep-link or CTA.
// Completion state stored in AppState.tasks under key "today-{actionId}-{YYYY-MM-DD}".
// Completed actions auto-clear at midnight (because the date key changes).
//
// Source-of-truth philosophy: actions are DERIVED from state, never stored.
// The system surfaces "what needs to happen now" given the current pipeline shape.

import type { AppState, Opportunity, Contact } from "./types";
import { OPPORTUNITIES } from "./data/opportunities";

export type ActionCategory =
  | "follow-up" // silent connect contacted X days ago, follow-up window open
  | "fire-connect" // verified stakeholder, ready to silent connect
  | "triage" // pending probe in inbox
  | "build-pack" // approved probe needs application pack
  | "interview-prep" // recruiter screen / HM interview booked soon
  | "verify-star-map" // opp has TBD stakeholders blocking outreach
  | "stale-nudge" // opp hasn't moved in 14+ days, needs decision
  | "send-reply"; // someone replied, response window open

export interface TodayAction {
  id: string; // stable across renders, used for completion key
  category: ActionCategory;
  priority: number; // 1 = highest (today only), 2 = today/tomorrow, 3 = this week, 4-5 = lower
  title: string; // single line, scannable
  context: string; // 1-2 sentences, which opp, why it matters
  oppId?: string; // for deep-link to mission profile
  oppCompany?: string; // for display
  cta?: { label: string; action: "open-mission" | "copy-to-clipboard" | "open-linkedin"; payload?: string };
  dueBy?: string; // ISO date · when this becomes urgent
}

// Helper · days since an ISO date
function daysSince(iso?: string): number {
  if (!iso) return Infinity;
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

// Helper · is a meeting within N days from now?
function meetingWithinDays(iso?: string, n: number = 3): boolean {
  if (!iso) return false;
  const when = new Date(iso).getTime();
  const now = Date.now();
  const diffDays = (when - now) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= n;
}

// Helper · stable action ID from category + opp + contact
function actionId(category: ActionCategory, oppId?: string, contactName?: string): string {
  return [category, oppId || "global", contactName?.replace(/\s+/g, "-").toLowerCase() || ""].filter(Boolean).join("·");
}

export function computeTodaysActions(state: AppState): TodayAction[] {
  // Merge seed opps with stateful overrides (same pattern as Mission Control)
  const allOpps: Opportunity[] = OPPORTUNITIES.map(
    (o) => ({ ...o, ...(state.opps[o.id] || {}) }) as Opportunity,
  );

  const actions: TodayAction[] = [];

  for (const opp of allOpps) {
    // SKIP closed / accepted opps · they're done
    if (opp.stage === "closed" || opp.stage === "accepted") continue;

    // 1. INTERVIEW PREP · meeting within 3 days
    for (const c of opp.contacts || []) {
      if (c.meetingBookedFor && meetingWithinDays(c.meetingBookedFor, 3)) {
        const daysUntil = Math.ceil(
          (new Date(c.meetingBookedFor).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        const when = daysUntil === 0 ? "TODAY" : daysUntil === 1 ? "TOMORROW" : `in ${daysUntil} days`;
        actions.push({
          id: actionId("interview-prep", opp.id, c.name),
          category: "interview-prep",
          priority: daysUntil <= 1 ? 1 : 2,
          title: `Interview prep · ${opp.company} · ${when}`,
          context: `${c.name} (${c.title || c.role}) · review prep pack + warmup checklist 30 min before`,
          oppId: opp.id,
          oppCompany: opp.company,
          cta: { label: "Open mission", action: "open-mission" },
          dueBy: c.meetingBookedFor,
        });
      }
    }

    // 2. FOLLOW-UP DM · silent connect was sent 4-7 days ago, no reply, no advancement
    for (const c of opp.contacts || []) {
      if (c.status === "silent" && c.contactedAt) {
        const days = daysSince(c.contactedAt);
        if (days >= 4 && days <= 9) {
          actions.push({
            id: actionId("follow-up", opp.id, c.name),
            category: "follow-up",
            priority: days >= 5 ? 2 : 3,
            title: `Day ${days} follow-up · ${c.name} at ${opp.company}`,
            context: `Silent connect sent ${days} days ago · follow-up DM is in the seed (Mission Profile · Launch Pack)`,
            oppId: opp.id,
            oppCompany: opp.company,
            cta: { label: "Open follow-up DM", action: "open-mission" },
          });
        }
      }
    }

    // 3. FIRE CONNECT · verified stakeholder, status = identified, has connect note ready
    for (const c of opp.contacts || []) {
      if (c.verified && c.status === "identified" && c.connectNote && c.linkedin) {
        actions.push({
          id: actionId("fire-connect", opp.id, c.name),
          category: "fire-connect",
          priority: 2,
          title: `Fire silent connect · ${c.name} at ${opp.company}`,
          context: `Verified stakeholder · ${c.role === "HM" ? "Hiring Manager" : c.role === "GTM_RECRUITER" ? "Recruiter" : "Peer"} · connect note ready to paste`,
          oppId: opp.id,
          oppCompany: opp.company,
          cta: { label: "Copy connect note", action: "copy-to-clipboard", payload: c.connectNote },
        });
      }
    }

    // 4. VERIFY STAR MAP · opp is active but has TBD stakeholders blocking outreach
    if (["applied", "early", "contacted"].includes(opp.stage)) {
      const unverified = (opp.contacts || []).filter(
        (c) => !c.verified && (c.name.toLowerCase().includes("tbd") || c.name.toLowerCase().includes("(tbd)")),
      );
      if (unverified.length > 0 && (opp.contacts || []).length > 0) {
        actions.push({
          id: actionId("verify-star-map", opp.id),
          category: "verify-star-map",
          priority: 3,
          title: `Verify Star Map · ${opp.company}`,
          context: `${unverified.length} unverified stakeholder${unverified.length > 1 ? "s" : ""} · run LinkedIn search recipe, drop verified URL back`,
          oppId: opp.id,
          oppCompany: opp.company,
          cta: { label: "Open mission", action: "open-mission" },
        });
      }
    }

    // 5. STALE NUDGE · opp hasn't moved in 14+ days, in early/late stage
    if (["early", "late", "applied"].includes(opp.stage) && opp.daysInStage !== undefined && opp.daysInStage >= 14) {
      actions.push({
        id: actionId("stale-nudge", opp.id),
        category: "stale-nudge",
        priority: 4,
        title: `Stale ${opp.daysInStage} days · ${opp.company}`,
        context: `${opp.position} hasn't moved in ${opp.daysInStage} days · nudge stakeholder, close out, or jettison`,
        oppId: opp.id,
        oppCompany: opp.company,
        cta: { label: "Open mission", action: "open-mission" },
      });
    }

    // 6. BUILD PACK · approved probe needs application pack built
    if (opp.triage?.status === "approved" && opp.stage === "targeting") {
      actions.push({
        id: actionId("build-pack", opp.id),
        category: "build-pack",
        priority: 2,
        title: `Build application pack · ${opp.company}`,
        context: `Probe approved · cover letter + ATS answers + DMs + Star Map ready to assemble`,
        oppId: opp.id,
        oppCompany: opp.company,
        cta: { label: "Open mission", action: "open-mission" },
      });
    }
  }

  // 7. TRIAGE PROBES · pending probes in the inbox (global, not per-opp)
  function getTriageStatus(oppId: string): string | undefined {
    const stateTriage = state.opps[oppId]?.triage;
    const seedTriage = OPPORTUNITIES.find((o) => o.id === oppId)?.triage;
    return (stateTriage || seedTriage)?.status;
  }
  const pendingProbes = allOpps.filter((o) => getTriageStatus(o.id) === "pending");
  if (pendingProbes.length > 0) {
    actions.push({
      id: actionId("triage", undefined, `pending-${pendingProbes.length}`),
      category: "triage",
      priority: 2,
      title: `Triage ${pendingProbes.length} pending probe${pendingProbes.length > 1 ? "s" : ""} in Inbox`,
      context: `New rocket candidates surfaced by Daily Rocket Scanner · approve · later · jettison`,
      cta: { label: "Open Probes Inbox", action: "open-mission", payload: "/probes" },
    });
  }

  // Sort by priority ascending (1 is most urgent), then by stable ID for deterministic order
  actions.sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));

  return actions;
}

// V3.0 · Action completion state · key is "today-{actionId}-{YYYY-MM-DD}"
// Auto-resets at midnight because the date suffix changes
export function todayCompletionKey(actionId: string): string {
  const dateStr = new Date().toISOString().split("T")[0];
  return `today·${actionId}·${dateStr}`;
}

export function isActionCompleted(state: AppState, actionId: string): boolean {
  return !!state.tasks[todayCompletionKey(actionId)];
}

export function categoryIcon(category: ActionCategory): string {
  const icons: Record<ActionCategory, string> = {
    "follow-up": "📩",
    "fire-connect": "🔗",
    "triage": "🛰",
    "build-pack": "📦",
    "interview-prep": "🎯",
    "verify-star-map": "🔍",
    "stale-nudge": "⏰",
    "send-reply": "💬",
  };
  return icons[category] || "•";
}

export function categoryColor(category: ActionCategory): string {
  const colors: Record<ActionCategory, string> = {
    "interview-prep": "accent", // orange · highest urgency
    "follow-up": "warn", // gold · time-sensitive
    "fire-connect": "good", // green · action-ready
    "triage": "cool", // navy · decision pending
    "build-pack": "accent-2", // gold · execution-ready
    "verify-star-map": "purple", // blocker
    "stale-nudge": "hot", // red · attention needed
    "send-reply": "good",
  };
  return colors[category] || "muted";
}
