"use client";

// Snippet Library · the personal-productivity layer of the outreach stack.
// Reusable, voice-consistent building blocks — connect notes, DMs, emails, Loom
// scripts, closes — you browse, copy, and personalise the brackets. Add your own
// proven lines and they persist to your board.

import { useMemo, useState } from "react";
import { useAppState } from "@/lib/storage";
import { PageHero } from "@/components/PageHero";
import { SEED_SNIPPETS, SNIPPET_CATEGORIES } from "@/lib/data/snippets";
import type { AppState, Snippet, SnippetCategory } from "@/lib/types";

const CAT_LABEL: Record<SnippetCategory, string> = {
  connect: "Connect note",
  dm: "Follow-up DM",
  email: "Email",
  loom: "Loom script",
  cta: "CTA / close",
};

export default function SnippetLibrary() {
  const [state, update] = useAppState();
  const [filter, setFilter] = useState<SnippetCategory | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draftCat, setDraftCat] = useState<SnippetCategory>("connect");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftBody, setDraftBody] = useState("");

  const custom = state.snippets || [];
  const all: Snippet[] = useMemo(() => [...custom, ...SEED_SNIPPETS], [custom]);
  const shown = filter === "all" ? all : all.filter((s) => s.category === filter);

  function copy(s: Snippet) {
    navigator.clipboard?.writeText(s.body);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function saveSnippet() {
    if (!draftBody.trim()) return;
    const snip: Snippet = {
      id: `custom-${Date.now()}`,
      category: draftCat,
      label: draftLabel.trim() || CAT_LABEL[draftCat],
      body: draftBody.trim(),
      custom: true,
    };
    update((s: AppState) => ({ ...s, snippets: [snip, ...(s.snippets || [])] }));
    setDraftLabel("");
    setDraftBody("");
    setShowForm(false);
  }

  function removeSnippet(id: string) {
    update((s: AppState) => ({ ...s, snippets: (s.snippets || []).filter((x) => x.id !== id) }));
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <PageHero
        eyebrow="Library"
        title="Snippet Library"
        marker="SL.01"
        actions={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="glow-accent rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white transition hover:opacity-90 dark:text-bg"
          >
            {showForm ? "Close" : "+ New snippet"}
          </button>
        }
        subtitle={
          <>
            Your proven lines, ready to pull. Every block is in the house voice: present-tense, human, no em dashes, and
            it never asks for the job. Personalise the <span className="font-mono text-text">[brackets]</span>, copy, send.{" "}
            <strong className="text-text">The reps who template the repeatable spend their energy on the personal.</strong>
          </>
        }
      />

      {/* Add-your-own */}
      {showForm && (
        <div className="mb-6 bg-surface border border-border rounded-xl p-5">
          <div className="font-mono text-[10px] font-bold text-muted uppercase tracking-[1.8px] mb-3">Add your own</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {SNIPPET_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setDraftCat(c.id)}
                className={`rounded-lg border px-3 py-1.5 text-[12px] transition ${
                  draftCat === c.id
                    ? "bg-accent/10 border-accent text-accent font-semibold"
                    : "bg-surface-2 border-border text-text-dim hover:border-accent/40"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <input
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            placeholder="Label (e.g. Post reaction)"
            className="mb-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-accent"
          />
          <textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            placeholder="Your reusable line. Use [brackets] for the parts you personalise each time."
            className="h-28 w-full resize-y rounded-lg border border-border bg-bg p-3 text-[13px] leading-relaxed text-text outline-none focus:border-accent"
          />
          <button
            onClick={saveSnippet}
            disabled={!draftBody.trim()}
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50 dark:text-bg"
          >
            Save snippet
          </button>
        </div>
      )}

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg border px-3 py-1.5 text-[12px] transition ${
            filter === "all"
              ? "bg-accent/10 border-accent text-accent font-semibold"
              : "bg-surface-2 border-border text-text-dim hover:border-accent/40"
          }`}
        >
          All <span className="font-mono text-muted">{all.length}</span>
        </button>
        {SNIPPET_CATEGORIES.map((c) => {
          const n = all.filter((s) => s.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`rounded-lg border px-3 py-1.5 text-[12px] transition ${
                filter === c.id
                  ? "bg-accent/10 border-accent text-accent font-semibold"
                  : "bg-surface-2 border-border text-text-dim hover:border-accent/40"
              }`}
              title={c.desc}
            >
              {c.label} <span className="font-mono text-muted">{n}</span>
            </button>
          );
        })}
      </div>

      {/* Snippets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {shown.map((s) => (
          <div key={s.id} className="flex flex-col bg-surface border border-border rounded-xl p-4">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[13px] font-bold text-text">{s.label}</span>
                <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted">{CAT_LABEL[s.category]}</span>
                {s.custom && <span className="font-mono text-[9px] font-bold text-good uppercase tracking-[1px]">yours</span>}
              </div>
            </div>
            <p className="flex-1 text-[13px] leading-relaxed text-text-dim whitespace-pre-wrap">{s.body}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => copy(s)}
                className="rounded-lg border border-accent bg-accent/10 px-3 py-1.5 text-[12px] font-semibold text-accent transition hover:bg-accent/20"
              >
                {copiedId === s.id ? "Copied ✓" : "Copy"}
              </button>
              {s.custom && (
                <button
                  onClick={() => removeSnippet(s.id)}
                  className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted transition hover:border-hot hover:text-hot"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-border text-center">
        <p className="text-[11px] text-muted italic max-w-[600px] mx-auto leading-relaxed">
          Template the repeatable. Personalise the top of every message. The bracket is where the human goes.
        </p>
      </div>
    </div>
  );
}
