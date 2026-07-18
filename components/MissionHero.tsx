"use client";

// Theme-aware cinematic hero for Mission Control.
// Dark mode: a dark planet with the sun cresting its limb (Starfield night).
// Light mode: an editorial poster — solar-system chart, retro stripe, instrument
// gauge and coordinate stamps on cream paper (Starfield day). Both restrained.
// Motion is gated globally by prefers-reduced-motion / the reduce-motion toggle.

import { useEffect, useState } from "react";

function RingEmblem() {
  return (
    <svg width="78" height="78" viewBox="0 0 100 100" aria-hidden className="text-navy">
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeOpacity="0.85"
        strokeLinecap="round"
        strokeDasharray="256 20"
        transform="rotate(-96 50 50)"
        style={{ filter: "drop-shadow(0 0 6px rgb(var(--c-accent) / 0.5))" }}
      />
      <circle cx="50" cy="6" r="1.6" fill="currentColor" />
    </svg>
  );
}

function Diamond() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <rect x="2.5" y="2.5" width="11" height="11" transform="rotate(45 8 8)" fill="none" stroke="#20406e" strokeWidth="2" />
      <rect x="5.5" y="5.5" width="5" height="5" transform="rotate(45 8 8)" fill="#e07a2e" />
    </svg>
  );
}

function isDarkNow() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

export function MissionHero({ subtitle }: { subtitle?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(isDarkNow());
    const obs = new MutationObserver(() => setDark(isDarkNow()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  if (!dark) return <LightHero subtitle={subtitle} />;

  return (
    <section
      className="relative mb-8 overflow-hidden rounded-2xl border border-border/60"
      style={{
        height: 420,
        background: "radial-gradient(130% 100% at 88% 118%, rgb(var(--c-navy) / 0.30), rgb(var(--c-bg)) 66%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-full"
        style={{
          right: "-14%",
          bottom: "-64%",
          width: 780,
          height: 780,
          background:
            "radial-gradient(circle at 30% 26%, rgb(var(--c-cool) / 0.55) 0%, rgb(var(--c-navy) / 0.35) 34%, #060d1c 70%)",
          boxShadow: "inset 46px -24px 90px rgba(0,0,0,0.65)",
          animation: "rs-planet-drift 46s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-full"
        style={{
          right: "-14%",
          bottom: "-64%",
          width: 780,
          height: 780,
          background: "transparent",
          boxShadow: "inset 0 8px 40px rgb(var(--c-accent-2) / 0.35)",
          animation: "rs-planet-drift 46s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-full"
        style={{
          right: "16%",
          bottom: "6%",
          width: 300,
          height: 300,
          background:
            "radial-gradient(circle, rgb(var(--c-accent-2)) 0%, rgb(var(--c-accent) / 0.35) 26%, transparent 60%)",
          filter: "blur(4px)",
          animation: "rs-sunrise 42s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          right: "8%",
          bottom: "18%",
          width: 520,
          height: 2,
          background: "linear-gradient(90deg, transparent, rgb(var(--c-accent-2) / 0.5), transparent)",
          animation: "rs-flare 42s ease-in-out infinite",
        }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
        <span className="absolute left-5 top-4 font-mono text-[10px] tracking-[2px] text-cool/70">LAT -33.87</span>
        <span className="absolute right-5 top-4 font-mono text-[10px] tracking-[2px] text-cool/70">LON 151.21</span>
        <span className="absolute left-5 bottom-4 font-mono text-[10px] tracking-[2px] text-gold/80">SYS · NOMINAL</span>
        <span className="absolute right-5 bottom-4 font-mono text-[10px] tracking-[2px] text-muted">THE HUNT · LIVE</span>
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <RingEmblem />
        <h1 className="display text-glow mt-5 text-[34px] leading-none text-navy">Mission Control</h1>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[3.5px] text-muted">RocketShip OS</div>
        {subtitle && <p className="mt-3 max-w-md text-[13px] text-text-dim">{subtitle}</p>}
      </div>
    </section>
  );
}

function LightHero({ subtitle }: { subtitle?: string }) {
  return (
    <section
      className="relative mb-8 overflow-hidden rounded-2xl border border-border"
      style={{ height: 420, background: "rgb(var(--c-bg))" }}
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1120 420"
        preserveAspectRatio="none"
      >
        <g fill="none" stroke="#16345c" strokeOpacity="0.09" strokeWidth="1">
          <path d="M-20,110 C240,70 460,150 720,115 C900,92 1020,140 1140,120" />
          <path d="M-20,200 C260,158 480,232 760,200 C940,180 1040,214 1140,206" />
          <path d="M-20,310 C240,278 520,342 800,320 C980,306 1060,332 1140,324" />
        </g>
        <g fill="none" strokeWidth="17">
          <path d="M870,420 A250,250 0 0 1 1120,170" stroke="#20406e" />
          <path d="M888,420 A232,232 0 0 1 1120,188" stroke="#e07a2e" />
          <path d="M906,420 A214,214 0 0 1 1120,206" stroke="#ebbb45" />
          <path d="M924,420 A196,196 0 0 1 1120,224" stroke="#c23a34" />
        </g>
        <g fill="none" stroke="#16345c" strokeOpacity="0.36" strokeWidth="0.9">
          <ellipse cx="740" cy="215" rx="44" ry="28" />
          <ellipse cx="740" cy="215" rx="80" ry="50" />
          <ellipse cx="740" cy="215" rx="118" ry="74" />
          <ellipse cx="740" cy="215" rx="156" ry="98" />
        </g>
        <circle cx="740" cy="215" r="13" fill="#f2c02e" />
        <circle cx="740" cy="215" r="19" fill="none" stroke="#f2c02e" strokeOpacity="0.4" strokeWidth="1" />
        <circle cx="784" cy="215" r="4.5" fill="#9aa7b5" />
        <circle cx="662" cy="221" r="6.5" fill="#8a5a3c" />
        <circle cx="800" cy="170" r="5" fill="#b0763f" />
        <circle cx="896" cy="215" r="10" fill="#c7a067" />
        <ellipse cx="896" cy="215" rx="21" ry="6" fill="none" stroke="#b28d53" strokeWidth="1.5" transform="rotate(-14 896 215)" />
        <g fill="#20406e">
          <path d="M700,288 l5,-11 l5,11 z" />
          <path d="M716,296 l5,-11 l5,11 z" />
        </g>
        <g stroke="#16345c" strokeOpacity="0.5" strokeWidth="1">
          <path d="M430,104 v14 M423,111 h14" />
          <path d="M986,150 v12 M980,156 h12" />
        </g>
        <g transform="translate(135,318)" stroke="#16345c" strokeOpacity="0.42" fill="none">
          <circle r="44" strokeWidth="1.2" />
          <circle r="33" strokeWidth="0.8" />
          <g strokeWidth="1">
            <path d="M0,-44 v7" />
            <path d="M0,44 v-7" />
            <path d="M-44,0 h7" />
            <path d="M44,0 h-7" />
            <path d="M31,-31 l5,-5" />
            <path d="M-31,-31 l-5,-5" />
          </g>
          <path d="M0,0 L0,-29" stroke="#c23a34" strokeOpacity="0.8" strokeWidth="1.6" />
          <circle r="2.5" fill="#16345c" fillOpacity="0.55" stroke="none" />
        </g>
        <text x="34" y="404" fontFamily="ui-monospace,monospace" fontSize="9" letterSpacing="2" fill="#16345c" fillOpacity="0.55">LAT -33.87</text>
        <text x="980" y="404" fontFamily="ui-monospace,monospace" fontSize="9" letterSpacing="2" fill="#c23a34" fillOpacity="0.7">SYS · NOMINAL</text>
      </svg>

      <div className="relative z-10 px-12 pt-11">
        <div className="flex items-center gap-3">
          <Diamond />
          <h1 className="display text-[42px] font-bold leading-none text-navy">Mission Control</h1>
          <Diamond />
        </div>
        <div className="mt-3 font-mono text-[10px] uppercase tracking-[3.5px] text-muted">THE HUNT · A NEW MISSION</div>
        {subtitle && <p className="mt-4 max-w-md text-[13px] text-text-dim">{subtitle}</p>}
      </div>
    </section>
  );
}
