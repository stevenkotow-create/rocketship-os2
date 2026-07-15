"use client";

import { useState } from "react";
import type { AppState, Contact, ContactStatus } from "@/lib/types";
import { scaffoldContacts, SEQUENCE } from "@/lib/starmap-scaffold";

const ROLE_LABEL: Record<string, string> = {
  HM: "Hiring Manager",
  PEER: "Peer in seat",
  GTM_RECRUITER: "Recruiter",
  APAC_AE: "Account Exec",
  FOUNDER: "Founder",
  OTHER: "Contact",
};
const STATUSES: ContactStatus[] = ["identified", "silent", "dm", "replied", "advanced", "cold"];

export function StarMapBuilder({
  id,
  company,
  roleType,
  contacts,
  update,
}: {
  id: string;
  company: string;
  roleType: string;
  contacts: Contact[];
  update: (fn: (s: AppState) => AppState) => void;
}) {
  const [copied, setCopied] = useState<number | null>(null);

  function writeContacts(next: Contact[]) {
    update((s) => ({ ...s, opps: { ...s.opps, [id]: { ...(s.opps[id] || {}), contacts: next } } }));
  }
  function scaffold() {
    writeContacts([...contacts, ...scaffoldContacts(company, roleType)]);
  }
  function setSlot(i: number, patch: Partial<Contact>) {
    writeContacts(contacts.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  const hasScaffold = contacts.some((c) => c.tier);

  if (!hasScaffold) {
    return (
      <div className="card">
        <div className="label-caps mb-1">Auto star map</div>
        <p className="mb-3 text-[13px] leading-relaxed text-text-dim">
          Build the role-mapped star map for {company} in one click: the three people to reach (Hiring Manager,
          Peer, Recruiter), a backup, and a round-2 tier, each with a LinkedIn search recipe and the proven 14-day
          sequence. You fill the names and verify.
        </p>
        <button
          onClick={scaffold}
          className="glow-accent rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 dark:text-bg"
        >
          ✦ Build star map →
        </button>
        {contacts.length > 0 && (
          <p className="mt-2 text-[11px] text-muted">
            You have {contacts.length} contact{contacts.length === 1 ? "" : "s"} already; building adds the scaffold
            slots alongside them.
          </p>
        )}
      </div>
    );
  }

  const groups: { tier: "core" | "backup" | "round2"; label: string }[] = [
    { tier: "core", label: "First-touch trio" },
    { tier: "backup", label: "Backup" },
    { tier: "round2", label: "Round-2 · activate at interview stage" },
  ];

  return (
    <div className="space-y-4">
      {groups.map((g) => {
        const items = contacts.map((c, i) => ({ c, i })).filter((x) => x.c.tier === g.tier);
        if (!items.length) return null;
        const body = (
          <div className="space-y-2.5">
            {items.map(({ c, i }) => (
              <SlotCard
                key={i}
                c={c}
                onChange={(p) => setSlot(i, p)}
                copied={copied === i}
                onCopy={() => {
                  navigator.clipboard?.writeText(c.searchRecipe || "");
                  setCopied(i);
                  setTimeout(() => setCopied(null), 1500);
                }}
              />
            ))}
          </div>
        );
        if (g.tier === "round2") {
          return (
            <details key={g.tier} className="card">
              <summary className="label-caps cursor-pointer select-none">{g.label}</summary>
              <div className="mt-3">{body}</div>
            </details>
          );
        }
        return (
          <div key={g.tier} className="card">
            <div className="label-caps mb-2.5">{g.label}</div>
            {body}
          </div>
        );
      })}
      <details className="card">
        <summary className="label-caps cursor-pointer select-none">The 14-day sequence</summary>
        <div className="mt-3 space-y-1.5">
          {SEQUENCE.map((s) => (
            <div key={s.day} className="flex gap-3 text-[13px]">
              <span className="w-16 shrink-0 font-mono text-[11px] text-accent">{s.day}</span>
              <span className="text-text-dim">{s.step}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function SlotCard({
  c,
  onChange,
  copied,
  onCopy,
}: {
  c: Contact;
  onChange: (p: Partial<Contact>) => void;
  copied: boolean;
  onCopy: () => void;
}) {
  const filled = !!(c.name && c.name.trim());
  return (
    <div className="rounded-lg border border-border bg-surface-2/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[1.5px] text-accent">
            {ROLE_LABEL[c.role] || c.role}
          </span>
          <div className="text-[13px] font-semibold text-text">{c.title}</div>
        </div>
        {filled && (
          <select
            value={c.status}
            onChange={(e) => onChange({ status: e.target.value as ContactStatus })}
            className="rounded border border-border bg-bg px-2 py-1 text-[11px] text-text outline-none"
            aria-label="Contact status"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>
      {c.personalHook && <p className="mt-1 text-[11px] leading-snug text-muted">{c.personalHook}</p>}
      {!filled ? (
        <div className="mt-2.5 space-y-2">
          {c.searchRecipe && (
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-surface-3/60 px-2 py-1 font-mono text-[11px] text-text-dim">
                {c.searchRecipe}
              </code>
              <button
                onClick={onCopy}
                className="shrink-0 rounded border border-border px-2 py-1 text-[11px] text-text-dim transition hover:border-accent hover:text-text"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <input
              value={c.name || ""}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Name, once you find them"
              className="min-w-[140px] flex-1 rounded border border-border bg-bg px-2 py-1 text-[12px] text-text outline-none focus:border-accent"
            />
            <input
              value={c.linkedin || ""}
              onChange={(e) => onChange({ linkedin: e.target.value })}
              placeholder="LinkedIn URL"
              className="min-w-[140px] flex-1 rounded border border-border bg-bg px-2 py-1 text-[12px] text-text outline-none focus:border-accent"
            />
          </div>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
          <span className="font-semibold text-text">{c.name}</span>
          {c.linkedin && (
            <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="text-accent underline">
              LinkedIn
            </a>
          )}
          <button
            onClick={() => onChange({ verified: !c.verified, verifiedAt: new Date().toISOString() })}
            className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
              c.verified ? "bg-good/15 text-good" : "border border-border text-muted hover:text-text"
            }`}
          >
            {c.verified ? "✓ Verified" : "Mark verified"}
          </button>
        </div>
      )}
    </div>
  );
}
