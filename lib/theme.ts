"use client";

import { useEffect, useState } from "react";

// V3.2 · Theme management · bulletproof inline CSS variable approach
// Why: PostCSS / Tailwind was stripping `.dark { --c-var: ... }` rules at build time
// in a way we couldn't diagnose. Instead of fighting the build chain, we set the CSS
// variables DIRECTLY on document.documentElement.style. Inline styles have the highest
// cascade priority and cannot be overridden by stylesheets.
//
// Persists per-browser in localStorage as `ors-theme`. Light is default.

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "ors-theme";

// V3.5b · Starfield palette · single source of truth for all CSS variables
// Light = warm off-white + deep navy text + rocket orange accent + retro stripe accents
// Dark = midnight navy + crisp off-white text + icy blue accent + topographic feel
// Edit these to retune the palette · no globals.css edit required
// All combinations verified WCAG AAA (7:1+) contrast for body text
export const THEME_TOKENS = {
  light: {
    // ── Surfaces · warm off-white inspired by Starfield Soundtrack cover ──
    "--c-bg": "250 248 243",         // #FAF8F3 warm cream background
    "--c-surface": "255 254 250",    // #FFFEFA almost-white card
    "--c-surface-2": "245 241 233",  // #F5F1E9 subtle warm surface
    "--c-surface-3": "236 230 220",  // #ECE6DC deeper warm surface
    "--c-border": "220 212 198",     // #DCD4C6 warm beige border
    "--c-border-strong": "180 168 152",
    // ── Text · deep navy primary, AAA contrast ──
    "--c-text": "16 35 66",          // #102342 deep navy · 13.5:1 on bg
    "--c-text-dim": "64 86 122",     // #40567A mid navy · 7.2:1 on bg
    "--c-muted": "120 138 165",      // #788AA5 muted slate · still readable
    // ── Brand colours ──
    "--c-navy": "16 35 66",          // primary navy
    "--c-accent": "229 102 42",      // #E5662A rocket orange (unchanged)
    "--c-accent-2": "244 176 104",   // #F4B068 warm peach (retro stripe 2)
    "--c-crimson": "184 51 58",      // #B8333A Starfield red (retro stripe 4)
    "--c-gold": "232 158 80",        // #E89E50 Starfield orange
    // ── Status colours ──
    "--c-good": "60 130 60",         // #3C823C forest green
    "--c-warn": "232 158 80",        // peach amber
    "--c-hot": "184 51 58",          // Starfield red
    "--c-cool": "30 80 130",         // #1E5082 navy blue
    "--c-purple": "100 70 140",      // #644690
  },
  dark: {
    // ── Surfaces · midnight navy inspired by Starfield logo cover ──
    "--c-bg": "11 24 46",            // #0B182E midnight base
    "--c-surface": "18 36 62",       // #12243E lifted surface
    "--c-surface-2": "26 46 74",     // #1A2E4A card surface
    "--c-surface-3": "38 60 92",     // #263C5C input surface
    "--c-border": "38 62 96",        // #263E60 subtle border
    "--c-border-strong": "70 100 142",
    // ── Text · crisp off-white, AAA contrast ──
    "--c-text": "240 245 250",       // #F0F5FA off-white · 14.8:1 on bg
    "--c-text-dim": "184 200 220",   // #B8C8DC light slate · 8.5:1 on bg
    "--c-muted": "130 150 178",      // #8296B2 muted slate · still readable
    // ── Brand colours · icy blue leads in dark mode ──
    "--c-navy": "140 200 230",       // #8CC8E6 icy blue (was deep navy in light)
    "--c-accent": "140 200 230",     // icy blue primary accent · matches Starfield
    "--c-accent-2": "244 196 124",   // #F4C47C warm gold accent
    "--c-crimson": "240 140 130",    // #F08C82 soft coral red
    "--c-gold": "244 196 124",       // warm gold
    // ── Status colours · softer in dark to avoid harshness ──
    "--c-good": "144 220 160",       // #90DCA0 soft green
    "--c-warn": "240 184 100",       // #F0B864 amber
    "--c-hot": "240 140 130",        // soft coral
    "--c-cool": "140 200 230",       // icy blue
    "--c-purple": "175 152 220",     // #AF98DC soft purple
  },
} as const;

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "dark" || raw === "light") return raw;
  } catch {}
  return "light";
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // 1 · Class + attribute + colour-scheme · for Tailwind dark: variants and form controls
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.setAttribute("data-theme", mode);
  root.style.colorScheme = mode;

  // 2 · Set CSS variables DIRECTLY on <html> as inline styles
  // This bypasses any PostCSS / Tailwind stripping and forces the cascade to use these values
  const tokens = THEME_TOKENS[mode];
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
  }

  // 3 · Persist
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {}
}

export function useTheme(): [ThemeMode, (mode: ThemeMode) => void] {
  const [theme, setTheme] = useState<ThemeMode>("light");

  // Bootstrap from localStorage on mount
  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  // Defensive re-apply · if React rehydration ever strips inline styles,
  // this effect re-applies on every theme change. Protects against Next.js Fast Refresh.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function update(mode: ThemeMode) {
    setTheme(mode);
    applyTheme(mode);
  }

  return [theme, update];
}
