"use client";

import type { Contact, ContactStatus, ContactRole } from "@/lib/types";
import { useTheme } from "@/lib/theme";

interface SolarSystemProps {
  company: string;
  contacts: Contact[];
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

const ORBIT_RADIUS: Record<ContactRole, number> = {
  APAC_AE: 70, // Inner orbit · primary
  HM: 70,
  GTM_RECRUITER: 110, // Middle orbit · gatekeeper
  FOUNDER: 110,
  PEER: 150, // Outer orbit · peer
  OTHER: 150,
};

const ROLE_LABEL: Record<ContactRole, string> = {
  APAC_AE: "APAC AE",
  HM: "HM",
  GTM_RECRUITER: "TA / Recruiter",
  FOUNDER: "Founder",
  PEER: "Peer",
  OTHER: "Other",
};

interface PlanetStyle {
  fill: string;
  opacity: number;
  glow: boolean;
  size: number;
  strokeWidth?: number;
  strokeColor?: string;
}

// V2.5 · theme-aware palette for the solar system SVG
// Light mode = original palette · Dark mode = brighter / cooler tones that read against deep navy
interface SystemPalette {
  silent: string;     // contacted but no reply
  cold: string;       // gone cold
  bgStar: string;     // background scatter stars
  orbitRing: string;  // orbital path stroke
  nameLabel: string;  // first-name text under planet
  roleLabel: string;  // small role text
  planetStroke: string; // outer stroke on advanced-stage planets
}

function paletteForTheme(theme: "light" | "dark"): SystemPalette {
  if (theme === "dark") {
    return {
      silent: "#7DB9D6",        // icy blue · readable against deep navy
      cold: "#E07B7B",          // coral · softer than light-mode crimson
      bgStar: "#A9B5C5",        // cool grey twinkles instead of invisible navy
      orbitRing: "#325073",     // muted blue-navy · visible but recessive
      nameLabel: "#F5F7FA",     // soft white
      roleLabel: "#A9B5C5",     // cool grey
      planetStroke: "#F5F7FA",  // soft white outer stroke
    };
  }
  return {
    silent: "#2C4A7C",
    cold: "#C41E3A",
    bgStar: "#2C4A7C",
    orbitRing: "#C0C0C8",
    nameLabel: "#1A2540",
    roleLabel: "#8090A8",
    planetStroke: "#FFFFFF",
  };
}

function planetStyleForStatus(status: ContactStatus, palette: SystemPalette): PlanetStyle {
  switch (status) {
    case "identified":
      return { fill: "#C0C0C8", opacity: 0.5, glow: false, size: 14 };
    case "silent":
      return { fill: palette.silent, opacity: 0.85, glow: false, size: 16 };
    case "dm":
      return { fill: "#E5662A", opacity: 1, glow: true, size: 18 };
    case "replied":
      return { fill: "#56D364", opacity: 1, glow: true, size: 20, strokeWidth: 2, strokeColor: "#56D364" };
    case "advanced":
      return { fill: "#56D364", opacity: 1, glow: true, size: 22, strokeWidth: 3, strokeColor: palette.planetStroke };
    case "cold":
      return { fill: palette.cold, opacity: 0.6, glow: false, size: 14 };
  }
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SolarSystem({ company, contacts, size = "md", showLabels = true }: SolarSystemProps) {
  const [theme] = useTheme();
  const palette = paletteForTheme(theme);
  const viewBox = size === "sm" ? 360 : size === "lg" ? 440 : 400;
  const center = viewBox / 2;
  const sortedContacts = [...contacts].sort((a, b) => {
    const order: ContactRole[] = ["APAC_AE", "HM", "GTM_RECRUITER", "FOUNDER", "PEER", "OTHER"];
    return order.indexOf(a.role) - order.indexOf(b.role);
  });

  // Distribute contacts evenly around their orbit, accounting for multiple contacts at same orbit
  const orbitGroups: Record<number, Contact[]> = {};
  sortedContacts.forEach((c) => {
    const r = ORBIT_RADIUS[c.role];
    if (!orbitGroups[r]) orbitGroups[r] = [];
    orbitGroups[r].push(c);
  });

  return (
    <div className="w-full" style={{ maxWidth: "500px", margin: "0 auto" }}>
      <svg viewBox={`0 0 ${viewBox} ${viewBox}`} className="w-full">
        <defs>
          <radialGradient id={`sun-glow-${company.replace(/\s/g, "")}`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FFB74D" />
            <stop offset="50%" stopColor="#E5662A" />
            <stop offset="100%" stopColor="#C41E3A" />
          </radialGradient>
          <radialGradient id={`sun-corona-${company.replace(/\s/g, "")}`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#E5662A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E5662A" stopOpacity="0" />
          </radialGradient>
          <filter id={`glow-${company.replace(/\s/g, "")}`}>
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Background stars */}
        {Array.from({ length: 30 }).map((_, i) => {
          const cx = ((i * 137) % viewBox);
          const cy = ((i * 89) % viewBox);
          const r = (i % 3) * 0.5 + 0.5;
          return <circle key={i} cx={cx} cy={cy} r={r} fill={palette.bgStar} opacity="0.2" />;
        })}

        {/* Orbital paths */}
        {[70, 110, 150].map((r) => (
          <circle
            key={r}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={palette.orbitRing}
            strokeWidth="0.5"
            strokeDasharray="2 4"
            opacity="0.6"
          />
        ))}

        {/* Sun corona (company glow) */}
        <circle cx={center} cy={center} r="55" fill={`url(#sun-corona-${company.replace(/\s/g, "")})`} />
        <circle cx={center} cy={center} r="42" fill="#E5662A" opacity="0.2" />

        {/* Sun (company) */}
        <circle cx={center} cy={center} r="32" fill={`url(#sun-glow-${company.replace(/\s/g, "")})`} />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontWeight="700"
          fontSize="11"
          style={{ pointerEvents: "none" }}
        >
          {company.length > 10 ? company.slice(0, 9) + "…" : company}
        </text>

        {/* Planets (contacts) */}
        {Object.entries(orbitGroups).map(([orbitStr, group]) => {
          const orbit = Number(orbitStr);
          return group.map((c, i) => {
            const angleStart = orbit === 70 ? -Math.PI / 2 : orbit === 110 ? Math.PI / 6 : Math.PI / 3;
            const step = group.length > 1 ? (Math.PI * 2) / group.length : 0;
            const angle = angleStart + i * step;
            const x = center + Math.cos(angle) * orbit;
            const y = center + Math.sin(angle) * orbit;
            const planet = planetStyleForStatus(c.status, palette);

            return (
              <g key={c.name}>
                {/* Orbital trail line */}
                <line
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke={planet.fill}
                  strokeWidth={c.status === "identified" ? "0.5" : "1"}
                  strokeDasharray={c.status === "identified" ? "3 3" : "0"}
                  opacity="0.3"
                />
                {/* Planet glow */}
                {planet.glow && (
                  <circle cx={x} cy={y} r={planet.size + 4} fill={planet.fill} opacity="0.25" />
                )}
                {/* Planet */}
                <circle
                  cx={x}
                  cy={y}
                  r={planet.size}
                  fill={planet.fill}
                  opacity={planet.opacity}
                  stroke={planet.strokeColor || palette.planetStroke}
                  strokeWidth={planet.strokeWidth || 1.5}
                />
                {/* Initials */}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="9"
                  fontWeight="700"
                  style={{ pointerEvents: "none" }}
                >
                  {initials(c.name)}
                </text>
                {/* Name label */}
                {showLabels && (
                  <>
                    <text
                      x={x}
                      y={y + planet.size + 14}
                      textAnchor="middle"
                      fill={palette.nameLabel}
                      fontSize="10"
                      fontWeight="600"
                      style={{ pointerEvents: "none" }}
                    >
                      {c.name.split(" ")[0]}
                    </text>
                    <text
                      x={x}
                      y={y + planet.size + 26}
                      textAnchor="middle"
                      fill={palette.roleLabel}
                      fontSize="8"
                      style={{ pointerEvents: "none" }}
                    >
                      {ROLE_LABEL[c.role]}
                    </text>
                  </>
                )}
              </g>
            );
          });
        })}
      </svg>
    </div>
  );
}
