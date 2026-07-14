"use client";

// V3.1 · Theme debug widget · floating indicator in bottom-right
// Shows live state of:
//   · localStorage value
//   · .dark class on <html>
//   · data-theme attribute on <html>
//   · current body background color (computed)
// Uses MutationObserver to update in real-time as the theme changes.
//
// Purpose: instantly diagnose dark mode failures without devtools.
// If "DARK CLASS: yes" but body bg is still light, we know CSS variables aren't switching.
// If "DARK CLASS: no" but localStorage says dark, we know React is stripping the class.
//
// Remove this component once dark mode is verified working end-to-end.

import { useEffect, useState } from "react";

interface ThemeState {
  storage: string | null;
  hasDarkClass: boolean;
  dataTheme: string | null;
  bodyBg: string;
}

export function ThemeDebug() {
  const [state, setState] = useState<ThemeState>({
    storage: null,
    hasDarkClass: false,
    dataTheme: null,
    bodyBg: "—",
  });
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function snapshot(): ThemeState {
      const root = document.documentElement;
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      return {
        storage: localStorage.getItem("ors-theme"),
        hasDarkClass: root.classList.contains("dark"),
        dataTheme: root.getAttribute("data-theme"),
        bodyBg,
      };
    }

    setState(snapshot());

    const observer = new MutationObserver(() => setState(snapshot()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    const handleStorage = () => setState(snapshot());
    window.addEventListener("storage", handleStorage);

    const interval = setInterval(() => setState(snapshot()), 1000);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  if (hidden) return null;

  // Detect if the body bg is "dark" (rough heuristic: rgb summed < 300)
  const bgIsDark = (() => {
    const m = state.bodyBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return false;
    const sum = Number(m[1]) + Number(m[2]) + Number(m[3]);
    return sum < 300;
  })();

  const verdict = state.hasDarkClass && bgIsDark
    ? { label: "DARK · WORKING", color: "#10b981" }
    : state.hasDarkClass && !bgIsDark
    ? { label: "CLASS ON · BG STILL LIGHT", color: "#f59e0b" }
    : !state.hasDarkClass && state.storage === "dark"
    ? { label: "STORAGE DARK · CLASS STRIPPED", color: "#ef4444" }
    : { label: "LIGHT MODE", color: "#6b7280" };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        background: "#000",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 8,
        fontFamily: "monospace",
        fontSize: 11,
        lineHeight: 1.5,
        minWidth: 240,
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        border: `2px solid ${verdict.color}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <strong style={{ color: verdict.color, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" }}>
          {verdict.label}
        </strong>
        <button
          onClick={() => setHidden(true)}
          style={{
            background: "transparent",
            border: "1px solid #444",
            color: "#999",
            cursor: "pointer",
            padding: "1px 6px",
            borderRadius: 3,
            fontSize: 10,
          }}
          title="Hide debug widget"
        >
          ×
        </button>
      </div>
      <div>storage · <span style={{ color: state.storage === "dark" ? "#7DB9D6" : "#fbbf24" }}>{state.storage ?? "(empty)"}</span></div>
      <div>.dark class · <span style={{ color: state.hasDarkClass ? "#10b981" : "#ef4444" }}>{state.hasDarkClass ? "yes" : "no"}</span></div>
      <div>data-theme · <span style={{ color: state.dataTheme === "dark" ? "#7DB9D6" : "#fbbf24" }}>{state.dataTheme ?? "(none)"}</span></div>
      <div>body bg · <span style={{ color: bgIsDark ? "#10b981" : "#fbbf24" }}>{state.bodyBg}</span></div>
    </div>
  );
}
