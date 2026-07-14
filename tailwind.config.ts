import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // V2.5 · CSS-variable-driven palette · light + dark theme via :root + .dark in globals.css
        // RGB format with <alpha-value> supports Tailwind opacity modifiers (e.g. bg-accent/20)
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        "surface-2": "rgb(var(--c-surface-2) / <alpha-value>)",
        "surface-3": "rgb(var(--c-surface-3) / <alpha-value>)",
        border: "rgb(var(--c-border) / <alpha-value>)",
        "border-strong": "rgb(var(--c-border-strong) / <alpha-value>)",
        text: "rgb(var(--c-text) / <alpha-value>)",
        "text-dim": "rgb(var(--c-text-dim) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",

        // BRAND COLORS · swap between light + dark via CSS variables
        navy: "rgb(var(--c-navy) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        "accent-2": "rgb(var(--c-accent-2) / <alpha-value>)",
        crimson: "rgb(var(--c-crimson) / <alpha-value>)",
        gold: "rgb(var(--c-gold) / <alpha-value>)",

        // STATUS COLORS · refit to brand
        good: "rgb(var(--c-good) / <alpha-value>)",
        warn: "rgb(var(--c-warn) / <alpha-value>)",
        hot: "rgb(var(--c-hot) / <alpha-value>)",
        cool: "rgb(var(--c-cool) / <alpha-value>)",
        purple: "rgb(var(--c-purple) / <alpha-value>)",
      },
      fontFamily: {
        // V4 · Inter for prose, JetBrains Mono for ALL numerical readouts + coordinate markers
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SF Mono", "Monaco", "monospace"],
      },
      backgroundImage: {
        "starfield-gradient": "linear-gradient(180deg, rgb(var(--c-navy)) 0%, rgb(var(--c-text)) 100%)",
        "rocket-flame": "linear-gradient(180deg, rgb(var(--c-gold)) 0%, rgb(var(--c-accent)) 50%, rgb(var(--c-crimson)) 100%)",
        // V2.5 · subtle topographic contour pattern overlay for dark mode background
        "topographic": "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'><g fill='none' stroke='%23ffffff' stroke-width='0.5' stroke-opacity='0.05'><path d='M0,100 Q300,50 600,150 T1200,100'/><path d='M0,200 Q300,150 600,250 T1200,200'/><path d='M0,300 Q300,250 600,350 T1200,300'/><path d='M0,400 Q300,350 600,450 T1200,400'/><path d='M0,500 Q300,450 600,550 T1200,500'/><path d='M0,600 Q300,550 600,650 T1200,600'/><path d='M0,700 Q300,650 600,750 T1200,700'/><circle cx='150' cy='180' r='35'/><circle cx='420' cy='320' r='55'/><circle cx='780' cy='220' r='42'/><circle cx='1020' cy='560' r='65'/></g></svg>\")",
      },
    },
  },
  plugins: [],
};

export default config;
