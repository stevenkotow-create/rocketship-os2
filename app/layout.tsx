import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { WindDownLock } from "@/components/WindDownLock";
import { WelcomeModal } from "@/components/WelcomeModal";
import { AuthGate } from "@/components/AuthGate";
import { AdminBanner } from "@/components/AdminBanner";
import { Starfield } from "@/components/Starfield";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// V4 · Geometric mono for all numerical readouts · the scientific-instrument feel
// JetBrains Mono · clean, balanced, slightly humanist · pairs well with Inter
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

// Craft pass · editorial serif for display headlines (paired with mono numerals)
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "RocketShip OS · AI-Native Job Search",
  description: "Run your job search like a mission. Pipeline, frameworks, mission drills.",
};

// V3.2 · Inline theme bootstrap script · runs BEFORE React hydrates
// Sets BOTH the .dark class AND the CSS variables directly as inline styles on <html>
// Inline styles win the cascade against anything PostCSS or Tailwind might strip.
// This is the bulletproof path · the rendered DOM has the right values before any CSS loads.
const themeBootstrapScript = `
(function() {
  try {
    var stored = localStorage.getItem('ors-theme');
    var mode = stored === 'dark' ? 'dark' : 'light';
    var root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    }
    root.setAttribute('data-theme', mode);
    root.style.colorScheme = mode;
    var tokens = mode === 'dark' ? {
      '--c-bg':'11 24 46','--c-surface':'18 36 62','--c-surface-2':'26 46 74','--c-surface-3':'38 60 92',
      '--c-border':'38 62 96','--c-border-strong':'70 100 142','--c-text':'240 245 250','--c-text-dim':'184 200 220',
      '--c-muted':'130 150 178','--c-navy':'140 200 230','--c-accent':'140 200 230','--c-accent-2':'244 196 124',
      '--c-crimson':'240 140 130','--c-gold':'244 196 124','--c-good':'144 220 160','--c-warn':'240 184 100',
      '--c-hot':'240 140 130','--c-cool':'140 200 230','--c-purple':'175 152 220'
    } : {
      '--c-bg':'250 248 243','--c-surface':'255 254 250','--c-surface-2':'245 241 233','--c-surface-3':'236 230 220',
      '--c-border':'220 212 198','--c-border-strong':'180 168 152','--c-text':'16 35 66','--c-text-dim':'64 86 122',
      '--c-muted':'120 138 165','--c-navy':'16 35 66','--c-accent':'229 102 42','--c-accent-2':'244 176 104',
      '--c-crimson':'184 51 58','--c-gold':'232 158 80','--c-good':'60 130 60','--c-warn':'232 158 80',
      '--c-hot':'184 51 58','--c-cool':'30 80 130','--c-purple':'100 70 140'
    };
    for (var k in tokens) { root.style.setProperty(k, tokens[k]); }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        {/* V3.0 · Theme bootstrap · MUST run before React + before CSS paints
            Without this, every page load flashes light mode for 100-300ms before useTheme hydrates */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="bg-bg text-text min-h-screen overflow-hidden antialiased" suppressHydrationWarning>
        <Starfield />
        <AuthGate>
          <AdminBanner />
          <div className="relative z-10 flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-transparent">
              <div className="max-w-[1400px] mx-auto px-12 py-10 animate-in">{children}</div>
            </main>
          </div>
          <WindDownLock />
          <WelcomeModal />
        </AuthGate>
      </body>
    </html>
  );
}
