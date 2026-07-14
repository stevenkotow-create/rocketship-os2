"use client";

// V4.2 · Custom line-emblem icon system · scientific-instrument minimalism
// One simple, distinct geometric silhouette per icon so no two blur together in the sidebar.
// Each: viewBox 0 0 24 24, fill none, currentColor stroke, round caps/joins, strokeWidth prop.
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

/** 4-point spark · a clean concave four-point star · use for Discovery / new things */
export function Sparkle({ size = 16, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 C12.5 8 16 11.5 22 12 C16 12.5 12.5 16 12 22 C11.5 16 8 12.5 2 12 C8 11.5 11.5 8 12 2 Z" />
    </svg>
  );
}

/** Mission Portal · concentric doorway rings · use for Mission Control */
export function Portal({ size = 16, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Probe · beam scanning down onto a point · use for Probes Inbox */
export function Probe({ size = 16, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="1.6" fill="currentColor" stroke="none" />
      <path d="M12 6 L7 17" />
      <path d="M12 6 L17 17" />
      <path d="M7 17 Q12 20 17 17" />
      <circle cx="12" cy="18.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Reticle · square targeting brackets with center mark · use for Interview Day, Evaluator */
export function Reticle({ size = 16, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8 L3 3 L8 3" />
      <path d="M16 3 L21 3 L21 8" />
      <path d="M21 16 L21 21 L16 21" />
      <path d="M8 21 L3 21 L3 16" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Compass Rose · compass ring with a filled North pointer diamond · use for Mission Compass */
export function CompassRose({ size = 16, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 5 L15 12 L12 19 L9 12 Z" />
      <path d="M12 5 L15 12 L9 12 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Constellation · a 4-star asterism joined by lines · use for Star Map */
export function Constellation({ size = 16, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 6 L12 13 L19 7" />
      <path d="M12 13 L14 20" />
      <circle cx="5" cy="6" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="19" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="14" cy="20" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Orbit · tilted ellipse with a planet riding the path · use for Pipeline */
export function Orbit({ size = 16, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-25 12 12)" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="7.4" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Beacon · broadcast tower with a lit top and radiating waves · use for Mentor Update */
export function Beacon({ size = 16, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 21 L11 10 L13 10 L14.5 21 Z" />
      <circle cx="12" cy="7.5" r="1.6" fill="currentColor" stroke="none" />
      <path d="M8 3.5 Q5.5 7 8 10.5" />
      <path d="M16 3.5 Q18.5 7 16 10.5" />
    </svg>
  );
}

/** Antenna · satellite dish with concentric signal arcs · use for Comms Bay */
export function Antenna({ size = 16, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11 A7 7 0 0 0 13 20 Z" />
      <path d="M9 15 L12.5 11.5" />
      <path d="M16 13 A6 6 0 0 0 10 7" />
      <path d="M20 10 A10 10 0 0 0 10 0" />
    </svg>
  );
}

/** Star Chart · framed map grid with a star marker · use for Flight Manual */
export function StarChart({ size = 16, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 10 H21" />
      <path d="M10 3 V21" />
      <path d="M15.5 12 C15.7 13.9 16.1 14.3 18 14.5 C16.1 14.7 15.7 15.1 15.5 17 C15.3 15.1 14.9 14.7 13 14.5 C14.9 14.3 15.3 13.9 15.5 12 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Field Journal · open book with center spine · use for Decision Journal */
export function FieldJournal({ size = 16, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6 C10 4.5 6.5 4.5 3.5 5.5 L3.5 18 C6.5 17 10 17 12 18.5 C14 17 17.5 17 20.5 18 L20.5 5.5 C17.5 4.5 14 4.5 12 6 Z" />
      <path d="M12 6 L12 18.5" />
    </svg>
  );
}

/** Rocket · clean rocket silhouette with fins and exhaust · use for /rocket or accent */
export function RocketShip({ size = 16, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round">
      <path d="M12 2 C15 5 16 9 16 13 C16 16 14.5 18 12 19.5 C9.5 18 8 16 8 13 C8 9 9 5 12 2 Z" />
      <circle cx="12" cy="10" r="1.8" />
      <path d="M8 14 L5 18 L8 17.5" />
      <path d="M16 14 L19 18 L16 17.5" />
      <path d="M10.5 19.5 L12 22.5 L13.5 19.5" />
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
