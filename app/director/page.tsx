"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppState } from "@/lib/storage";
import { OPPORTUNITIES } from "@/lib/data/opportunities";

// The Director · a spatial navigation map in the Destiny mould.
// Mission Control is the hub (the Tower); the key surfaces orbit as destinations
// you fly into. Thin-line rings, letter-spaced labels, deep space, restraint.

type Tint = "accent" | "gold" | "coral" | "good" | "purple" | "cool";

const TINT: Record<Tint, string> = {
  accent: "var(--c-accent)",
  gold: "var(--c-gold)",
  coral: "var(--c-crimson)",
  good: "var(--c-good)",
  purple: "var(--c-purple)",
  cool: "var(--c-cool)",
};

interface Node {
  label: string;
  href: string;
  x: number; // percent
  y: number; // percent
  size: number; // px
  tint: Tint;
  countKey?: "pipeline" | "roles" | "probes";
}

const NODES: Node[] = [
  { label: "LIVE ROLES", href: "/roles", x: 21, y: 27, size: 74, tint: "gold", countKey: "roles" },
  { label: "OUTREACH", href: "/outreach-funnel", x: 43, y: 14, size: 40, tint: "purple" },
  { label: "PIPELINE", href: "/pipeline", x: 77, y: 29, size: 66, tint: "coral", countKey: "pipeline" },
  { label: "MISSION COMPASS", href: "/mission-compass", x: 85, y: 13, size: 34, tint: "cool" },
  { label: "STAR MAP", href: "/threads", x: 82, y: 62, size: 52, tint: "accent" },
  { label: "INTERVIEW DAY", href: "/interview-day", x: 55, y: 84, size: 58, tint: "good" },
  { label: "PROBES INBOX", href: "/probes", x: 26, y: 74, size: 60, tint: "cool", countKey: "probes" },
  { label: "DECISION JOURNAL", href: "/decision-journal", x: 13, y: 53, size: 40, tint: "purple" },
];

const HUB = { x: 50, y: 50 };

function Planet({ size, tint }: { size: number; tint: Tint }) {
  const c = TINT[tint];
  return (
    <span
      className="relative block shrink-0 rounded-full transition-transform duration-300 group-hover:scale-110"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 34% 30%, rgb(${c} / 0.95) 0%, rgb(${c} / 0.55) 42%, rgb(${c} / 0.12) 100%)`,
        boxShadow: `0 0 22px -4px rgb(${c} / 0.5), inset 0 0 14px rgb(255 255 255 / 0.12)`,
      }}
    >
      <span
        className="absolute inset-0 rounded-full opacity-70"
        style={{ border: `1px solid rgb(${c} / 0.35)` }}
      />
    </span>
  );
}

export default function Director() {
  const [state] = useAppState();

  const counts = useMemo(() => {
    const custom = state.customOpps || [];
    const merged = [...OPPORTUNITIES, ...custom].map((o) => ({ ...o, ...(state.opps[o.id] || {}) }));
    const pipeline = merged.filter((o) => !["closed", "accepted"].includes(o.stage)).length;
    const probes = merged.filter((o) => (state.opps[o.id]?.triage?.status || o.triage?.status) === "pending").length;
    return { pipeline, probes, roles: custom.length };
  }, [state]);

  function countFor(key?: Node["countKey"]): number | null {
    if (!key) return null;
    const v = counts[key];
    return v > 0 ? v : null;
  }

  return (
    <div>
      {/* HUD header · Destiny-style section label */}
      <div className="mb-2 flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[3px] text-accent">The Director</div>
          <h1 className="display text-glow text-[30px] leading-none text-navy">Solar System</h1>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[2px] text-muted">
            RocketShip OS · Local Cluster
          </div>
        </div>
        <div className="hidden font-mono text-[10px] lowercase text-muted sm:block">dr.01</div>
      </div>

      {/* STAGE */}
      <div className="relative mx-auto h-[74vh] min-h-[560px] w-full">
        {/* Line + ring layer */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <g stroke="rgb(var(--c-border-strong))" fill="none" vectorEffect="non-scaling-stroke">
            {/* concentric rings */}
            <ellipse cx="50" cy="50" rx="18" ry="24" strokeOpacity="0.35" style={{ vectorEffect: "non-scaling-stroke" }} />
            <ellipse cx="50" cy="50" rx="32" ry="40" strokeOpacity="0.22" style={{ vectorEffect: "non-scaling-stroke" }} />
            <ellipse cx="50" cy="50" rx="46" ry="52" strokeOpacity="0.12" style={{ vectorEffect: "non-scaling-stroke" }} />
            {/* crosshair */}
            <line x1="50" y1="4" x2="50" y2="96" strokeOpacity="0.1" style={{ vectorEffect: "non-scaling-stroke" }} />
            <line x1="3" y1="50" x2="97" y2="50" strokeOpacity="0.1" style={{ vectorEffect: "non-scaling-stroke" }} />
            {/* connectors hub -> node */}
            {NODES.map((n) => (
              <line
                key={n.label}
                x1={HUB.x}
                y1={HUB.y}
                x2={n.x}
                y2={n.y}
                stroke="rgb(var(--c-accent))"
                strokeOpacity="0.16"
                style={{ vectorEffect: "non-scaling-stroke" }}
              />
            ))}
          </g>
        </svg>

        {/* Hub · the Tower */}
        <Link
          href="/"
          className="group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: `${HUB.x}%`, top: `${HUB.y}%` }}
        >
          <span
            className="block h-[92px] w-[92px] rounded-full transition-transform duration-300 group-hover:scale-105"
            style={{
              background:
                "radial-gradient(circle at 38% 32%, #ffffff 0%, rgb(var(--c-accent) / 0.9) 45%, rgb(var(--c-cool) / 0.6) 100%)",
              boxShadow:
                "0 0 46px 6px rgb(var(--c-accent) / 0.5), inset 0 0 20px rgb(255 255 255 / 0.5)",
              animation: "rs-pulse 5s ease-in-out infinite",
            }}
          />
          <span className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[3px] text-text">
            Mission Control
          </span>
        </Link>

        {/* Destination nodes */}
        {NODES.map((n) => {
          const rightSide = n.x > 52;
          const count = countFor(n.countKey);
          return (
            <Link
              key={n.label}
              href={n.href}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <div className={`flex items-center gap-3 ${rightSide ? "flex-row-reverse" : ""}`}>
                <Planet size={n.size} tint={n.tint} />
                <div className={rightSide ? "text-right" : "text-left"}>
                  <div className="whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-[2.5px] text-text-dim transition-colors group-hover:text-text">
                    {n.label}
                  </div>
                  {count !== null && (
                    <div className="mt-0.5 font-mono text-[10px] tracking-wide text-muted">
                      {count} {n.countKey === "roles" ? "on board" : n.countKey === "probes" ? "pending" : "active"}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {/* corner glyphs · faint HUD detail */}
        <div className="pointer-events-none absolute left-0 top-0 font-mono text-[9px] tracking-[2px] text-muted/50">
          ◇ ◈ ◇
        </div>
        <div className="pointer-events-none absolute bottom-0 right-0 font-mono text-[9px] tracking-[2px] text-muted/50">
          ✦
        </div>
      </div>
    </div>
  );
}
