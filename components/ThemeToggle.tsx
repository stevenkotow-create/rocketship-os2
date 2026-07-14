"use client";

import { useTheme } from "@/lib/theme";

function Sun({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function Moon({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

// Segmented sun/moon toggle · clear, always-visible, with a sliding accent knob.
export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const dark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      title={`Switch to ${dark ? "light" : "dark"} mode`}
      className="relative flex h-8 w-[62px] items-center rounded-full border border-border bg-surface-2/80 p-1 backdrop-blur transition-colors hover:border-border-strong"
    >
      {/* sliding highlight */}
      <span
        className="absolute left-1 top-1 h-6 w-[26px] rounded-full bg-accent shadow-[0_0_12px_rgb(var(--c-accent)/0.55)] transition-transform duration-300 ease-[cubic-bezier(.2,.7,.3,1)]"
        style={{ transform: dark ? "translateX(26px)" : "translateX(0)" }}
      />
      <span className="relative z-10 flex flex-1 justify-center">
        <Sun className={dark ? "text-muted" : "text-white dark:text-bg"} />
      </span>
      <span className="relative z-10 flex flex-1 justify-center">
        <Moon className={dark ? "text-white dark:text-bg" : "text-muted"} />
      </span>
    </button>
  );
}
