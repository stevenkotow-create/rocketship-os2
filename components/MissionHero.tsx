// Starfield-style cinematic hero for Mission Control.
// A dark planet with the sun cresting its limb, a slow camera drift, and a
// thin ring emblem + letter-spaced wordmark centred. Restrained, atmospheric.
// Motion is gated globally by prefers-reduced-motion / the reduce-motion toggle.

function RingEmblem() {
  return (
    <svg width="78" height="78" viewBox="0 0 100 100" aria-hidden className="text-navy">
      {/* thin ring with a small notch at the top, Starfield-style */}
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

export function MissionHero({ subtitle }: { subtitle?: string }) {
  return (
    <section
      className="relative mb-8 overflow-hidden rounded-2xl border border-border/60"
      style={{
        height: 420,
        background:
          "radial-gradient(130% 100% at 88% 118%, rgb(var(--c-navy) / 0.30), rgb(var(--c-bg)) 66%)",
      }}
    >
      {/* the planet · fills the lower-right, dark with a lit crescent toward the sun */}
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
      {/* atmosphere rim-light along the sun-facing edge */}
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
      {/* the sun cresting the limb · bloom */}
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
      {/* faint lens flare streak */}
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

      {/* centre · emblem + wordmark */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <RingEmblem />
        <h1 className="display text-glow mt-5 text-[34px] leading-none text-navy">Mission Control</h1>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[3.5px] text-muted">RocketShip OS</div>
        {subtitle && <p className="mt-3 max-w-md text-[13px] text-text-dim">{subtitle}</p>}
      </div>
    </section>
  );
}
