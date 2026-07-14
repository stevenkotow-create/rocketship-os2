"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { useTheme } from "@/lib/theme";
import { NavIcon } from "@/components/icons";

interface Command {
  id: string;
  label: string;
  group: string;
  icon?: string;
  keywords?: string;
  run: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const [, setTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = NAV_ITEMS.map((n) => ({
      id: `nav-${n.href}`,
      label: n.label,
      group: n.section,
      icon: n.icon,
      run: () => router.push(n.href),
    }));
    const actions: Command[] = [
      {
        id: "act-scan",
        label: "Scan live roles",
        group: "ACTIONS",
        icon: "Antenna",
        keywords: "jobs source greenhouse lever ashby",
        run: () => router.push("/roles"),
      },
      {
        id: "act-add-company",
        label: "Add a company by careers URL",
        group: "ACTIONS",
        icon: "Antenna",
        keywords: "job board url",
        run: () => router.push("/roles"),
      },
      {
        id: "act-onboard",
        label: "Paste LinkedIn · build my board",
        group: "ACTIONS",
        icon: "Sparkle",
        keywords: "onboarding discovery import",
        run: () => router.push("/onboarding"),
      },
      {
        id: "act-dark",
        label: "Switch to dark mode",
        group: "ACTIONS",
        icon: "Portal",
        run: () => setTheme("dark"),
      },
      {
        id: "act-light",
        label: "Switch to light mode",
        group: "ACTIONS",
        icon: "Sparkle",
        run: () => setTheme("light"),
      },
    ];
    return [...actions, ...nav];
  }, [router, setTheme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.group} ${c.keywords || ""}`.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Global hotkey
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    const openEvt = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("ors:open-command", openEvt);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ors:open-command", openEvt);
    };
  }, []);

  // Reset on open + focus
  useEffect(() => {
    if (open) {
      setQuery("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => setSel(0), [query]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[sel];
      if (cmd) {
        cmd.run();
        setOpen(false);
      }
    }
  }

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${sel}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  if (!open) return null;

  let lastGroup = "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-navy/50 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-border-strong/60 bg-surface/90 shadow-2xl backdrop-blur-xl animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <span className="text-muted">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages and actions…"
            className="w-full bg-transparent py-3.5 text-[15px] text-text outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">esc</kbd>
        </div>
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-[13px] text-muted">No matches.</div>
          ) : (
            filtered.map((c, i) => {
              const showGroup = c.group !== lastGroup;
              lastGroup = c.group;
              return (
                <div key={c.id}>
                  {showGroup && (
                    <div className="px-3 pb-1 pt-3 font-mono text-[9px] font-bold uppercase tracking-[2px] text-muted">
                      {c.group}
                    </div>
                  )}
                  <button
                    data-idx={i}
                    onMouseEnter={() => setSel(i)}
                    onClick={() => {
                      c.run();
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] transition-colors ${
                      i === sel ? "bg-accent/15 text-accent" : "text-text-dim hover:bg-surface-2"
                    }`}
                  >
                    {c.icon && (
                      <span className="flex h-4 w-4 items-center justify-center opacity-80">
                        <NavIcon name={c.icon} size={15} strokeWidth={1.75} />
                      </span>
                    )}
                    <span className="flex-1">{c.label}</span>
                    {i === sel && <span className="font-mono text-[10px] text-muted">↵</span>}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
