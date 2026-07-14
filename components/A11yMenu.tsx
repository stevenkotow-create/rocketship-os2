"use client";

import { useEffect, useRef, useState } from "react";

// Accessibility settings · reduce motion + larger text, persisted per browser.
// Applies classes on <html> that globals.css responds to (.rm-force, .text-boost).

type Pref = "rm-force" | "text-boost";
const KEY = "ors-a11y";
const DEFAULTS: Record<Pref, boolean> = { "rm-force": false, "text-boost": false };

function readPrefs(): Record<Pref, boolean> {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) || "{}") as Partial<Record<Pref, boolean>>) };
  } catch {
    return { ...DEFAULTS };
  }
}

function applyPrefs(p: Record<Pref, boolean>) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("rm-force", !!p["rm-force"]);
  root.classList.toggle("text-boost", !!p["text-boost"]);
}

function AccessIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="6.5" r="1.15" fill="currentColor" stroke="none" />
      <path d="M5 9h14" />
      <path d="M12 9v5m0 0l-2.5 4m2.5-4l2.5 4" />
    </svg>
  );
}

function Row({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      role="menuitemcheckbox"
      aria-checked={on}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-[13px] text-text-dim transition hover:bg-surface-2 hover:text-text"
    >
      <span>{label}</span>
      <span
        className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${on ? "bg-accent" : "bg-surface-3"}`}
      >
        <span
          className="absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform"
          style={{ left: 2, transform: on ? "translateX(12px)" : "translateX(0)" }}
        />
      </span>
    </button>
  );
}

export function A11yMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Record<Pref, boolean>>({ ...DEFAULTS });
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const p = readPrefs();
    setPrefs(p);
    applyPrefs(p);
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onEsc);
    }
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  function toggle(k: Pref) {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    applyPrefs(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        aria-label="Accessibility settings"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2/60 text-text-dim transition hover:border-accent/50 hover:text-text"
      >
        <AccessIcon />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Accessibility settings"
          className="absolute bottom-full right-0 z-50 mb-2 w-56 rounded-xl border border-border bg-surface p-2 shadow-2xl backdrop-blur-xl"
        >
          <div className="px-2.5 pb-1 pt-1 font-mono text-[10px] font-bold uppercase tracking-[1.6px] text-muted">
            Accessibility
          </div>
          <Row label="Reduce motion" on={prefs["rm-force"]} onToggle={() => toggle("rm-force")} />
          <Row label="Larger text" on={prefs["text-boost"]} onToggle={() => toggle("text-boost")} />
        </div>
      )}
    </div>
  );
}
