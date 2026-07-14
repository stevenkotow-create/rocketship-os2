"use client";

import type { ReactNode } from "react";

/**
 * Full-fat refresh · the shared page header that gives every screen the
 * Mission-Control glow-up: a small orbiting emblem, a mono eyebrow, an
 * editorial serif title with a soft glow, the retro stripe, and an optional
 * actions slot + coordinate marker. Entrance-animated.
 */

function OrbitalGlyph() {
  // Compact 2-ring emblem · slow orbit · echoes the Mission Control hero.
  return (
    <div aria-hidden className="relative h-12 w-12 shrink-0" style={{ marginTop: 2 }}>
      {[30, 46].map((s, i) => (
        <div
          key={s}
          className="absolute left-1/2 top-1/2 rounded-full border"
          style={{
            width: s,
            height: s,
            marginLeft: -s / 2,
            marginTop: -s / 2,
            borderColor: "rgb(var(--c-border-strong) / 0.45)",
          }}
        />
      ))}
      {[
        { s: 30, dur: 14, rev: false, col: "var(--c-gold)", dot: 4 },
        { s: 46, dur: 22, rev: true, col: "var(--c-accent)", dot: 5 },
      ].map((r) => (
        <div
          key={r.s}
          className="absolute left-1/2 top-1/2"
          style={{
            width: r.s,
            height: r.s,
            marginLeft: -r.s / 2,
            marginTop: -r.s / 2,
            animation: `${r.rev ? "rs-orbit-rev" : "rs-orbit"} ${r.dur}s linear infinite`,
          }}
        >
          <span
            className="absolute left-1/2 top-0 rounded-full"
            style={{
              width: r.dot,
              height: r.dot,
              marginLeft: -r.dot / 2,
              marginTop: -r.dot / 2,
              background: `rgb(${r.col})`,
              boxShadow: `0 0 8px 1px rgb(${r.col} / 0.6)`,
            }}
          />
        </div>
      ))}
      <div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: 12,
          height: 12,
          marginLeft: -6,
          marginTop: -6,
          background:
            "radial-gradient(circle at 38% 34%, rgb(var(--c-accent-2)) 0%, rgb(var(--c-accent)) 50%, rgb(var(--c-cool)) 100%)",
          boxShadow: "0 0 12px 2px rgb(var(--c-accent) / 0.5)",
          animation: "rs-pulse 4.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  marker,
  actions,
  glyph = true,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  marker?: string;
  actions?: ReactNode;
  glyph?: boolean;
  className?: string;
}) {
  return (
    <header className={`animate-in mb-8 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {glyph && <OrbitalGlyph />}
          <div>
            {eyebrow && (
              <div className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[2px] text-accent">
                {eyebrow}
              </div>
            )}
            <h1 className="display text-glow m-0 text-[34px] leading-[1.08] text-navy">{title}</h1>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-dim">{subtitle}</p>
            )}
          </div>
        </div>
        {(actions || marker) && (
          <div className="flex items-center gap-3">
            {actions}
            {marker && <span className="font-mono text-[10px] lowercase text-muted">{marker}</span>}
          </div>
        )}
      </div>
      <div className="retro-band mt-4">
        <span />
        <span />
      </div>
    </header>
  );
}
