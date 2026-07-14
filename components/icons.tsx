"use client";

// V4.1 · Custom space-themed icon system · Starfield-inspired mission patch aesthetic
// Inspired by Starfield logo references · 4-point sparkles, planet horizons,
// mission portals, constellation lines, crosshair reticles, compass rose, orbital paths
//
// All custom icons drawn with stroke-based line work, currentColor for theme integration.
// Utility icons (DollarSign, FileText, Wrench, Zap, BookOpen) still pull from lucide-react.

import {
  BookOpen,
  Zap,
  FileText,
  DollarSign,
  Wrench,
  type LucideIcon,
} from "lucide-react";

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM SPACE-THEMED ICONS · drawn in the Starfield mission-patch aesthetic
// ─────────────────────────────────────────────────────────────────────────────

/** 4-point asymmetric sparkle · the Starfield star · use for Discovery / new things */
export function Sparkle({ size = 16, className = "", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round">
      <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
    </svg>
  );
}

/** Mission Portal · planet with curved horizon · use for Mission Control */
export function Portal({ size = 16, className = "", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M3 14 Q12 9 21 14" />
      <circle cx="12" cy="6.5" r="0.9" fill="currentColor" />
      <circle cx="8" cy="9" r="0.5" fill="currentColor" />
      <circle cx="16" cy="9" r="0.5" fill="currentColor" />
    </svg>
  );
}

/** Probe signal · scanning arcs from a node · use for Probes Inbox */
export function Probe({ size = 16, className = "", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
      <circle cx="12" cy="18" r="1.8" fill="currentColor" />
      <path d="M7 15 Q12 11 17 15" />
      <path d="M4 12 Q12 5 20 12" strokeOpacity="0.7" />
      <path d="M2 9 Q12 0 22 9" strokeOpacity="0.4" />
    </svg>
  );
}

/** Reticle · crosshair inside circle · use for Interview Day, Evaluator */
export function Reticle({ size = 16, className = "", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

/** Compass Rose · geometric mission-patch compass · use for Mission Compass */
export function CompassRose({ size = 16, className = "", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 3 L14 12 L12 21 L10 12 Z" />
      <path d="M3 12 L12 14 L21 12 L12 10 Z" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Constellation · 4 dots connected with lines · use for Star Map */
export function Constellation({ size = 16, className = "", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
      <line x1="4" y1="6" x2="14" y2="9" strokeOpacity="0.6" />
      <line x1="14" y1="9" x2="20" y2="5" strokeOpacity="0.6" />
      <line x1="14" y1="9" x2="11" y2="18" strokeOpacity="0.6" />
      <line x1="11" y1="18" x2="20" y2="20" strokeOpacity="0.6" />
      <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="14" cy="9" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="20" cy="5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="11" cy="18" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="20" cy="20" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Orbit path · ellipse with center body · use for Pipeline */
export function Orbit({ size = 16, className = "", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-20 12 12)" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="20" cy="8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Beacon · signal tower with broadcast waves · use for Mentor Update */
export function Beacon({ size = 16, className = "", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M12 12 L12 22" />
      <path d="M9 22 L15 22" />
      <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none" />
      <path d="M7 8 Q5 4 7 1" />
      <path d="M17 8 Q19 4 17 1" />
      <path d="M5 10 Q2 5 4 -1" strokeOpacity="0.5" />
      <path d="M19 10 Q22 5 20 -1" strokeOpacity="0.5" />
    </svg>
  );
}

/** Antenna · transmission tower · use for Comms Bay */
export function Antenna({ size = 16, className = "", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M12 2 L12 22" />
      <path d="M8 22 L16 22" />
      <path d="M9 6 L12 2 L15 6" />
      <path d="M7 11 L12 6 L17 11" />
      <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Star Chart · gridded chart with star points · use for Flight Manual */
export function StarChart({ size = 16, className = "", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <line x1="3" y1="9" x2="21" y2="9" strokeOpacity="0.3" />
      <line x1="3" y1="15" x2="21" y2="15" strokeOpacity="0.3" />
      <line x1="9" y1="3" x2="9" y2="21" strokeOpacity="0.3" />
      <line x1="15" y1="3" x2="15" y2="21" strokeOpacity="0.3" />
      <circle cx="7" cy="7" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="13" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="17" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="17" cy="6" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Field Journal · open book with star overlay · use for Decision Journal */
export function FieldJournal({ size = 16, className = "", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round">
      <path d="M3 5 L12 7 L21 5 L21 19 L12 21 L3 19 Z" />
      <line x1="12" y1="7" x2="12" y2="21" />
      <path d="M16 13 L16.5 14.5 L18 15 L16.5 15.5 L16 17 L15.5 15.5 L14 15 L15.5 14.5 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Rocket · stylized mission-patch rocket · use for /rocket or accent */
export function RocketShip({ size = 16, className = "", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round">
      <path d="M12 2 Q16 6 16 13 L16 18 L12 22 L8 18 L8 13 Q8 6 12 2 Z" />
      <circle cx="12" cy="11" r="2" />
      <path d="M8 17 L5 21 M16 17 L19 21" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICON REGISTRY · maps string names to React components
// Used by NavIcon for dynamic name-based rendering
// ─────────────────────────────────────────────────────────────────────────────

type IconComponent = LucideIcon | ((p: IconProps) => JSX.Element);

const ICON_REGISTRY: Record<string, IconComponent> = {
  // Custom space-themed icons (the heroes)
  Sparkle,
  Portal,
  Probe,
  Reticle,
  CompassRose,
  Constellation,
  Orbit,
  Beacon,
  Antenna,
  StarChart,
  FieldJournal,
  RocketShip,
  // Lucide utility icons (the helpers)
  BookOpen,
  Zap,
  FileText,
  DollarSign,
  Wrench,
};

interface NavIconProps {
  name?: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function NavIcon({ name, size = 16, className = "", strokeWidth = 1.5 }: NavIconProps) {
  if (!name) return null;
  const Icon = ICON_REGISTRY[name];
  if (!Icon) return null;
  // Lucide icons accept slightly different prop shape · safe to pass through
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
}
