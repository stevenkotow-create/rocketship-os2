"use client";

// V3.5 · Discovery step · Network Seed · 3-5 warm contacts to seed Solar System
// Future-state · these become seed nodes in the constellation graph

import { useState } from "react";
import { Constellation } from "@/components/icons";
import type { NetworkSeedContact } from "@/lib/types";

const RELATIONSHIP_TYPES: NetworkSeedContact["relationshipType"][] = [
  "ex-colleague",
  "school",
  "friend",
  "industry",
  "client",
  "mentor",
  "other",
];

function emptyContact(): NetworkSeedContact {
  return {
    id: `seed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    relationshipType: "ex-colleague",
    capturedAt: new Date().toISOString(),
  };
}

export function StepNetworkSeed({
  initial,
  onSave,
  onSkip,
}: {
  initial?: NetworkSeedContact[];
  onSave: (contacts: NetworkSeedContact[]) => void;
  onSkip: () => void;
}) {
  const [contacts, setContacts] = useState<NetworkSeedContact[]>(
    initial && initial.length > 0 ? initial : [emptyContact(), emptyContact(), emptyContact()],
  );

  function updateContact(idx: number, patch: Partial<NetworkSeedContact>) {
    setContacts((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  function addContact() {
    if (contacts.length >= 5) return;
    setContacts((prev) => [...prev, emptyContact()]);
  }

  function removeContact(idx: number) {
    setContacts((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    const valid = contacts.filter((c) => c.name.trim().length > 1);
    onSave(valid);
  }

  const validCount = contacts.filter((c) => c.name.trim().length > 1).length;

  return (
    <div>
      <div className="text-accent mb-3"><Constellation size={28} strokeWidth={1.5} /></div>
      <h2 className="text-[22px] font-bold text-text mb-2 tracking-tight">Network Seed</h2>
      <p className="text-[13px] text-text-dim mb-2 max-w-2xl leading-relaxed">
        Name 3-5 people from your existing network who could be warm contacts. Ex-colleagues, mentors, industry friends, ex-clients. These become the seed nodes of your Solar System.
      </p>
      <p className="text-[13px] text-text-dim mb-5 max-w-2xl leading-relaxed">
        Even rough detail is fine · we&apos;ll enrich over time. The point right now is mapping who&apos;s already in your orbit.
      </p>

      <div className="space-y-3 mb-5">
        {contacts.map((c, idx) => (
          <div key={c.id} className="card mb-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-[1.4px] text-muted font-semibold">
                Contact #{idx + 1}
              </span>
              {contacts.length > 1 && (
                <button
                  onClick={() => removeContact(idx)}
                  className="text-[11px] text-hot hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block label-caps mb-1.5">Name</label>
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => updateContact(idx, { name: e.target.value })}
                  placeholder="Their full name"
                  className="w-full text-[13px] p-2.5 border border-border rounded-md bg-surface"
                />
              </div>
              <div>
                <label className="block label-caps mb-1.5">Relationship</label>
                <select
                  value={c.relationshipType}
                  onChange={(e) => updateContact(idx, { relationshipType: e.target.value as NetworkSeedContact["relationshipType"] })}
                  className="w-full text-[13px] p-2.5 border border-border rounded-md bg-surface capitalize"
                >
                  {RELATIONSHIP_TYPES.map((rt) => (
                    <option key={rt} value={rt}>{rt.replace("-", " ")}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block label-caps mb-1.5">Company (optional)</label>
                <input
                  type="text"
                  value={c.company || ""}
                  onChange={(e) => updateContact(idx, { company: e.target.value })}
                  placeholder="Their current company"
                  className="w-full text-[13px] p-2.5 border border-border rounded-md bg-surface"
                />
              </div>
              <div>
                <label className="block label-caps mb-1.5">Role (optional)</label>
                <input
                  type="text"
                  value={c.role || ""}
                  onChange={(e) => updateContact(idx, { role: e.target.value })}
                  placeholder="Their title or function"
                  className="w-full text-[13px] p-2.5 border border-border rounded-md bg-surface"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block label-caps mb-1.5">LinkedIn URL (optional)</label>
                <input
                  type="url"
                  value={c.linkedin || ""}
                  onChange={(e) => updateContact(idx, { linkedin: e.target.value })}
                  placeholder="linkedin.com/in/..."
                  className="w-full text-[13px] p-2.5 border border-border rounded-md bg-surface"
                />
              </div>
              <div>
                <label className="block label-caps mb-1.5">Last contact</label>
                <input
                  type="text"
                  value={c.lastContactDate || ""}
                  onChange={(e) => updateContact(idx, { lastContactDate: e.target.value })}
                  placeholder="e.g. 3 months ago"
                  className="w-full text-[13px] p-2.5 border border-border rounded-md bg-surface"
                />
              </div>
            </div>

            <div>
              <label className="block label-caps mb-1.5">Notes · texture of the relationship</label>
              <input
                type="text"
                value={c.notes || ""}
                onChange={(e) => updateContact(idx, { notes: e.target.value })}
                placeholder="e.g. Built a company together · introduced me to their CTO friend"
                className="w-full text-[13px] p-2.5 border border-border rounded-md bg-surface"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {contacts.length < 5 && (
          <button
            onClick={addContact}
            className="text-[12px] px-3 py-1.5 border border-dashed border-border rounded-md text-muted hover:text-navy hover:border-navy transition"
          >
            + Add another
          </button>
        )}
        <span className="text-[11px] text-muted">{validCount} valid contact{validCount === 1 ? "" : "s"} · 3-5 recommended</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSave}
          disabled={validCount === 0}
          className="px-5 py-2.5 bg-accent text-white rounded-md font-bold text-[13px] hover:bg-accent-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save and continue →
        </button>
        <button onClick={onSkip} className="px-5 py-2.5 text-text-dim hover:text-navy text-[13px] underline">
          Skip for now
        </button>
      </div>
    </div>
  );
}
