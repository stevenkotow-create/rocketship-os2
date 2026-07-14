// Star Map V2 · the engagement engine of the operator playbook
// 3-stakeholder framework (HM + Recruiter + Peer) · a consultative-sales stakeholder-mapping approach
// Pre-touch engagement cadence (3-5 day pre-touch before silent connect) from memory
// Always-on threading (multi-thread rockets even without live role) from memory

import type {
  Contact,
  ContactRole,
  ContactStatus,
  StakeholderHealth,
} from "./types";

/**
 * The 3 required stakeholder roles per operator playbook. The Star Map must have at least one
 * of each before any application ships.
 */
export const REQUIRED_ROLES: ContactRole[] = ["HM", "GTM_RECRUITER", "PEER"];

/**
 * Statuses that count as "actively engaged" · everything beyond silent or identified.
 */
const ENGAGED_STATUSES: ContactStatus[] = ["dm", "replied", "advanced"];

export function isEngaged(contact: Contact): boolean {
  return ENGAGED_STATUSES.includes(contact.status);
}

/**
 * Compute stakeholder health for an opportunity given its contacts array.
 * Returns one of 4 states used for multi-thread alerting on Mission Control.
 */
export function computeStakeholderHealth(contacts?: Contact[]): StakeholderHealth {
  if (!contacts || contacts.length === 0) return "unthreaded";

  const engaged = contacts.filter(isEngaged);
  const engagedRoles = new Set<ContactRole>(engaged.map((c) => c.role));

  // Treat APAC_AE as fillable for HM in some companies (e.g. country manager == HM)
  const hasHmEquivalent = engagedRoles.has("HM") || engagedRoles.has("APAC_AE") || engagedRoles.has("FOUNDER");
  const hasRecruiter = engagedRoles.has("GTM_RECRUITER");
  const hasPeer = engagedRoles.has("PEER");

  const requiredCovered = [hasHmEquivalent, hasRecruiter, hasPeer].filter(Boolean).length;

  if (requiredCovered === 3) return "complete";
  if (requiredCovered === 2) return "partial";
  if (requiredCovered === 1 || engaged.length === 1) return "single-thread";
  return "unthreaded";
}

/**
 * Identify which required roles are missing from a Star Map.
 * Returns the role labels that need filling.
 */
export function missingRequiredRoles(contacts?: Contact[]): {
  role: ContactRole;
  label: string;
}[] {
  if (!contacts) {
    return [
      { role: "HM", label: "Hiring Manager" },
      { role: "GTM_RECRUITER", label: "Recruiter / Talent Partner" },
      { role: "PEER", label: "Peer in seat" },
    ];
  }

  const engagedRoles = new Set<ContactRole>(contacts.filter(isEngaged).map((c) => c.role));
  const missing: { role: ContactRole; label: string }[] = [];

  if (!engagedRoles.has("HM") && !engagedRoles.has("APAC_AE") && !engagedRoles.has("FOUNDER")) {
    missing.push({ role: "HM", label: "Hiring Manager" });
  }
  if (!engagedRoles.has("GTM_RECRUITER")) {
    missing.push({ role: "GTM_RECRUITER", label: "Recruiter / Talent Partner" });
  }
  if (!engagedRoles.has("PEER")) {
    missing.push({ role: "PEER", label: "Peer in seat" });
  }
  return missing;
}

/**
 * Compute days since last touch with a contact. Used to flag cold threads.
 */
export function daysSinceLastTouch(contact: Contact): number | null {
  const lastDate = contact.lastTouchAt || contact.contactedAt;
  if (!lastDate) return null;
  const diff = Date.now() - new Date(lastDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if a contact has gone cold per follow-up cadence rules.
 * Default: 5 days after DM with no reply = follow-up due.
 *          14 days after DM with no reply = cold.
 */
export function isFollowUpDue(contact: Contact): boolean {
  if (contact.status !== "dm") return false;
  const days = daysSinceLastTouch(contact);
  return days !== null && days >= 5;
}

export function isCold(contact: Contact): boolean {
  if (contact.status !== "dm") return false;
  const days = daysSinceLastTouch(contact);
  return days !== null && days >= 14;
}

/**
 * Status colour for UI rendering. Returns Tailwind class hint.
 */
export function healthColour(health: StakeholderHealth): string {
  switch (health) {
    case "complete":
      return "good";
    case "partial":
      return "accent";
    case "single-thread":
      return "warning";
    case "unthreaded":
      return "hot";
  }
}

export function healthLabel(health: StakeholderHealth): string {
  switch (health) {
    case "complete":
      return "Fully threaded";
    case "partial":
      return "Partial · 2 of 3 roles";
    case "single-thread":
      return "Single thread · risk";
    case "unthreaded":
      return "Unthreaded · build star map";
  }
}
