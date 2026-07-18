"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-fat visual refresh · animated starfield atmosphere.
 * Fixed canvas behind all content, dark-mode only. Cheap: ~140 stars,
 * one rAF loop, twinkle + slow drift. Honours prefers-reduced-motion
 * (renders a static field). Pointer-events: none so it never intercepts.
 */

type Star = {
  x: number;
  y: number;
  r: number;
  base: number; // base alpha
  tw: number; // twinkle speed
  ph: number; // phase
  vx: number; // drift
  vy: number;
  hue: "white" | "cool" | "gold";
};

function isDarkNow() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dark, setDark] = useState(false);

  // Track theme changes (toggle flips the .dark class on <html>).
  useEffect(() => {
    setDark(isDarkNow());
    const obs = new MutationObserver(() => setDark(isDarkNow()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!dark) return;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    const el: HTMLCanvasElement = canvasEl;
    const g: CanvasRenderingContext2D = context;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars: Star[] = [];
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    const COLORS = {
      white: "255,255,255",
      cool: "150,205,235", // icy blue accent
      gold: "244,205,140", // warm gold accent
    };

    // Starfield-inspired atmosphere: soft two-accent light columns + flowing
    // scientific-instrument contour lines, drawn on the same canvas (dark only).
    const COLS = [
      { xf: 0.36, w: 180, rgb: "150,205,235", a: 0.1 }, // cool beam
      { xf: 0.55, w: 120, rgb: "244,205,140", a: 0.085 }, // gold beam
      { xf: 0.47, w: 320, rgb: "120,150,220", a: 0.045 }, // faint blue wash
    ];
    const CONTOURS = 6;

    function build() {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.floor(w * dpr);
      el.height = Math.floor(h * dpr);
      el.style.width = w + "px";
      el.style.height = h + "px";
      g.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((w * h) / 9000); // density scales with area
      stars = new Array(Math.max(90, Math.min(220, count))).fill(0).map(() => {
        const roll = Math.random();
        const hue: Star["hue"] = roll > 0.94 ? "gold" : roll > 0.84 ? "cool" : "white";
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.1 + 0.3,
          base: Math.random() * 0.5 + 0.25,
          tw: Math.random() * 0.0016 + 0.0004,
          ph: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.02,
          vy: Math.random() * 0.035 + 0.006, // gentle downward drift
          hue,
        };
      });
    }

    function draw(t: number) {
      g.clearRect(0, 0, w, h);

      // Light columns · soft vertical beams (the two-accent glow)
      for (let i = 0; i < COLS.length; i++) {
        const c = COLS[i];
        const cx = c.xf * w + (reduce ? 0 : Math.sin(t * 0.00012 + i * 1.7) * 22);
        const grad = g.createLinearGradient(cx - c.w / 2, 0, cx + c.w / 2, 0);
        grad.addColorStop(0, `rgba(${c.rgb},0)`);
        grad.addColorStop(0.5, `rgba(${c.rgb},${c.a})`);
        grad.addColorStop(1, `rgba(${c.rgb},0)`);
        g.fillStyle = grad;
        g.fillRect(cx - c.w / 2, 0, c.w, h);
      }

      // Flowing contour lines · the scientific-instrument motif
      for (let i = 0; i < CONTOURS; i++) {
        const baseY = h * (0.12 + i * 0.15);
        const amp = 26 + i * 8;
        const phase = reduce ? i : t * 0.00006 + i * 0.9;
        g.beginPath();
        for (let x = -20; x <= w + 20; x += 26) {
          const y = baseY + Math.sin((x / w) * 6.283 + phase) * amp;
          if (x === -20) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.strokeStyle = i % 2 ? "rgba(244,205,140,0.05)" : "rgba(150,205,235,0.06)";
        g.lineWidth = 1;
        g.stroke();
      }

      for (const s of stars) {
        const flicker = reduce ? s.base : s.base + Math.sin(t * s.tw + s.ph) * 0.35;
        const a = Math.max(0, Math.min(1, flicker));
        g.beginPath();
        g.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        g.fillStyle = `rgba(${COLORS[s.hue]},${a})`;
        g.fill();
        if (s.r > 1 || s.hue !== "white") {
          // soft halo for the brighter / coloured stars
          g.beginPath();
          g.arc(s.x, s.y, s.r * 2.6, 0, Math.PI * 2);
          g.fillStyle = `rgba(${COLORS[s.hue]},${a * 0.08})`;
          g.fill();
        }
        if (!reduce) {
          s.x += s.vx;
          s.y += s.vy;
          if (s.y > h + 2) {
            s.y = -2;
            s.x = Math.random() * w;
          }
          if (s.x < -2) s.x = w + 2;
          else if (s.x > w + 2) s.x = -2;
        }
      }
      raf = requestAnimationFrame(draw);
    }

    build();
    if (reduce) {
      draw(0);
    } else {
      raf = requestAnimationFrame(draw);
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, [dark]);

  if (!dark) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, mixBlendMode: "screen" }}
    />
  );
}
