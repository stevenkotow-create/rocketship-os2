"use client";

import type { ReactNode } from "react";

/**
 * Full-fat refresh · signature orbital hero.
 * A glowing mission core at the centre, target companies orbiting as planets.
 * CSS-driven orbits (transform rotation) so it's smooth and cheap. Sits inside
 * the app-wide starfield. Negative animation-delay offsets each planet's start
 * angle around its ring.
 */

type PlanetColor = "accent" | "gold" | "coral" | "good" | "purple";

const COLOR: Record<PlanetColor, string> = {
  accent: "var(--c-accent)",
  gold: "var(--c-gold)",
  coral: "var(--c-crimson)",
  good: "var(--c-good)",
  purple: "var(--c-purple)",
};

type Planet = { color?: PlanetColor; label?: string };

// ring size (px) · duration (s) · direction · dot size
const RINGS = [
  { size: 150, dur: 24, rev: false, dot: 9 },
  { size: 228, dur: 38, rev: true, dot: 12 },
  { size: 310, dur: 58, rev: false, dot: 8 },
];

const DEFAULT_PLANETS: Planet[][] = [
  [{ color: "gold" }],
  [{ color: "accent" }, { color: "coral" }],
  [{ color: "good" }, { color: "accent" }, { color: "purple" }],
];

export function OrbitalHero({
  eyebrow,
  title,
  subtitle,
  children,
  planets,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  planets?: Planet[];
}) {
  // Distribute provided planets across the three rings; else use the default set.
  let rings: Planet[][] = DEFAULT_PLANETS;
  if (planets && planets.length) {
    rings = [[], [], []];
    planets.slice(0, 8).forEach((p, i) => rings[i % 3].push(p));
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface/30 backdrop-blur-md">
      {/* soft radial wash behind the system */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(520px 340px at 50% 34%, rgb(var(--c-accent) / 0.12), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center px-6 pb-10 pt-12 text-center">
        {/* ORBITAL SYSTEM */}
        <div className="relative mb-8 h-[320px] w-[320px] shrink-0">
          {/* rings */}
          {RINGS.map((r, i) => (
            <div
              key={`ring-${i}`}
              className="absolute left-1/2 top-1/2 rounded-full border"
              style={{
                width: r.size,
                height: r.size,
                marginLeft: -r.size / 2,
                marginTop: -r.size / 2,
                borderColor: "rgb(var(--c-border-strong) / 0.35)",
              }}
            />
          ))}

          {/* planet carriers */}
          {RINGS.map((r, i) =>
            (rings[i] || []).map((p, j, arr) => {
              const startAngle = (360 / Math.max(arr.length, 1)) * j;
              const delay = -(startAngle / 360) * r.dur;
              const col = COLOR[p.color || "accent"];
              return (
                <div
                  key={`carrier-${i}-${j}`}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: r.size,
                    height: r.size,
                    marginLeft: -r.size / 2,
                    marginTop: -r.size / 2,
                    animation: `${r.rev ? "rs-orbit-rev" : "rs-orbit"} ${r.dur}s linear infinite`,
                    animationDelay: `${delay}s`,
                  }}
                >
                  <span
                    className="absolute left-1/2 top-0 rounded-full"
                    style={{
                      width: r.dot,
                      height: r.dot,
                      marginLeft: -r.dot / 2,
                      marginTop: -r.dot / 2,
                      background: `rgb(${col})`,
                      boxShadow: `0 0 12px 1px rgb(${col} / 0.6)`,
                    }}
                  />
                </div>
              );
            })
          )}

          {/* mission core */}
          <div
            className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full"
            style={{
              marginLeft: -28,
              marginTop: -28,
              background:
                "radial-gradient(circle at 38% 34%, rgb(var(--c-accent-2)) 0%, rgb(var(--c-accent)) 46%, rgb(var(--c-cool)) 100%)",
              boxShadow:
                "0 0 30px 6px rgb(var(--c-accent) / 0.5), inset 0 0 12px rgb(255 255 255 / 0.4)",
              animation: "rs-pulse 4.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* COPY */}
        {eyebrow && (
          <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[2px] text-accent">
            {eyebrow}
          </div>
        )}
        <h1 className="display text-glow max-w-[520px] text-[34px] leading-[1.1] text-navy">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-[500px] text-[14px] leading-relaxed text-text-dim">{subtitle}</p>
        )}
        {children && <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div>}
      </div>
    </section>
  );
}
