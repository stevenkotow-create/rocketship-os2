"use client";

import { useState } from "react";

// Reusable keyless generator: build a prompt, copy it, open Claude.ai, paste the
// result back, save it to the mission. Powers the Mission Cadence hub (research
// pack + cover letter) with one shared, tested surface.
export function GeneratorCard({
  title,
  description,
  buttonLabel,
  buildPrompt,
  value,
  onSave,
  placeholder,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  buildPrompt: () => string;
  value?: string;
  onSave: (v: string) => void;
  placeholder?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [saved, setSaved] = useState(false);

  function generate() {
    navigator.clipboard?.writeText(buildPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.open("https://claude.ai/new", "_blank", "noopener,noreferrer");
  }

  return (
    <div className="card">
      <div className="label-caps mb-1">{title}</div>
      <p className="mb-3 text-[13px] leading-relaxed text-text-dim">{description}</p>
      <button
        onClick={generate}
        className="glow-accent rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 dark:text-bg"
      >
        {copied ? "Copied → opening Claude.ai…" : buttonLabel}
      </button>
      <details className="mt-3" open={!!value}>
        <summary className="label-caps cursor-pointer select-none">
          {value ? "Saved ✓ · edit" : "Paste the result back"}
        </summary>
        <div className="mt-2">
          <textarea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setSaved(false);
            }}
            placeholder={placeholder || "Paste Claude's output here to save it on this mission…"}
            className="h-40 w-full resize-y rounded-lg border border-border bg-bg p-3 text-[12px] text-text outline-none focus:border-accent"
          />
          <button
            onClick={() => {
              onSave(draft);
              setSaved(true);
            }}
            disabled={!draft.trim()}
            className="mt-2 rounded-lg border border-accent bg-accent/10 px-3 py-1.5 text-[12px] font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-50"
          >
            {saved ? "Saved ✓" : "Save to mission"}
          </button>
        </div>
      </details>
    </div>
  );
}
