"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS, NAV_SECTIONS, getVisibleNavItems, isDemoMode } from "@/lib/constants";
import { useAppState } from "@/lib/storage";
import { useTheme } from "@/lib/theme";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import { NavIcon } from "@/components/icons";
import type { TriageStatus } from "@/lib/types";

export function Sidebar() {
  const pathname = usePathname();
  const [state] = useAppState();
  const [theme, setTheme] = useTheme();

  // V9 · Demo mode detection · hydration-safe
  const [demoMode, setDemoMode] = useState(false);
  useEffect(() => {
    setDemoMode(isDemoMode());
  }, [pathname]);
  const visibleNavItems = getVisibleNavItems(demoMode);

  // V2.2 · live pending-probe count for the Probes Inbox notification badge
  function getTriageStatus(oppId: string): TriageStatus | undefined {
    const stateTriage = state.opps[oppId]?.triage;
    const seedTriage = OPPORTUNITIES.find((o) => o.id === oppId)?.triage;
    return (stateTriage || seedTriage)?.status;
  }
  const pendingCount = OPPORTUNITIES.filter((o) => o.triage && getTriageStatus(o.id) === "pending").length;
  const approvedCount = OPPORTUNITIES.filter((o) => o.triage && getTriageStatus(o.id) === "approved").length;
  const watchlistCount = OPPORTUNITIES.filter((o) => o.triage && getTriageStatus(o.id) === "watchlist").length;

  return (
    <aside className="w-[244px] flex-shrink-0 bg-surface border-r border-border flex flex-col py-6 overflow-y-auto h-screen sticky top-0">
      <div className="px-5 pb-5 border-b border-border mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="brand-mark w-10 h-10 flex-shrink-0" />
          <div>
            <span className="block text-[15px] font-bold leading-tight text-navy tracking-tight">Operation</span>
            <span className="block text-[15px] font-bold leading-tight text-accent tracking-tight">Rocket Ship</span>
          </div>
        </div>
        {/* V4 · retro stripe under brand mark · signature element */}
        <div className="retro-band mb-2"><span /><span /></div>
        <span className="block font-mono text-[9px] text-muted uppercase tracking-[1.8px] font-semibold">V5 · prep is the message</span>
        {/* V9 · Demo mode indicator · shows when platform is running in mentor/team demo mode */}
        {demoMode && (
          <div className="mt-3 px-2 py-1.5 bg-accent/10 border border-accent/30 rounded font-mono text-[9px] text-accent uppercase tracking-[1.5px] font-bold text-center">
            ▲ Demo Mode
          </div>
        )}
      </div>
      <nav className="flex-1 px-3">
        {NAV_SECTIONS.map((section) => {
          const sectionItems = visibleNavItems.filter((item) => item.section === section);
          // V9 · If demo mode hid all items in a section, skip the section header entirely
          if (sectionItems.length === 0) return null;
          return (
            <div key={section} className="mb-5">
              <div className="px-3 pb-2 font-mono text-[9px] font-bold text-muted uppercase tracking-[2px]">
                {section}
              </div>
              {sectionItems.map((item) => {
                const active = pathname === item.href;
                const isProbes = item.href === "/probes";
                const showProbeBadge = isProbes && (pendingCount > 0 || approvedCount > 0 || watchlistCount > 0);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md text-[13px] mb-0.5 transition-colors duration-150 relative ${
                      active
                        ? "bg-accent/10 text-accent font-semibold"
                        : "text-text-dim hover:bg-surface-2 hover:text-navy"
                    }`}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0 relative inline-flex items-center justify-center w-4 h-4 opacity-80">
                        <NavIcon name={item.icon} size={15} strokeWidth={1.75} />
                        {/* V4 · pulsing dot on Probes Inbox when pending count > 0 */}
                        {showProbeBadge && pendingCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-hot ring-2 ring-surface animate-pulse" />
                        )}
                      </span>
                    )}
                    <span className="leading-tight flex-1">{item.label}</span>
                    {showProbeBadge ? (
                      <span className="flex gap-1">
                        {pendingCount > 0 && (
                          <span className="font-mono text-[10px] font-bold tracking-wider text-hot bg-hot/15 px-1.5 py-0.5 rounded">
                            {pendingCount}
                          </span>
                        )}
                        {approvedCount > 0 && (
                          <span className="font-mono text-[10px] font-bold tracking-wider text-good bg-good/15 px-1.5 py-0.5 rounded">
                            {approvedCount}
                          </span>
                        )}
                        {watchlistCount > 0 && (
                          <span className="font-mono text-[10px] font-bold tracking-wider text-cool bg-cool/15 px-1.5 py-0.5 rounded">
                            {watchlistCount}
                          </span>
                        )}
                      </span>
                    ) : (
                      item.badge && (
                        <span className="font-mono text-[9px] font-bold tracking-widest text-accent bg-accent/10 px-1.5 py-0.5 rounded uppercase">
                          {item.badge}
                        </span>
                      )
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div className="px-5 pt-4 mt-2 border-t border-border space-y-1.5">
        {/* V3.0 · Theme toggle · light ↔ dark · persists in localStorage
            Visible state · button colour changes distinctively per theme so you can confirm the toggle actually fires
            Pure Tailwind dark: variant on the inner pill · proves whether Tailwind dark mode is wired correctly */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`w-full flex items-center justify-between text-[11px] mb-2 group rounded-md px-2.5 py-2 transition-all ${
            theme === "dark"
              ? "bg-navy text-accent hover:bg-navy/80"
              : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-text"
          }`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <span className="flex items-center gap-2">
            <span className="text-[13px]">{theme === "dark" ? "🌙" : "☀️"}</span>
            <span className="font-semibold uppercase tracking-[1.2px] text-[10px]">{theme === "dark" ? "Dark mode" : "Light mode"}</span>
          </span>
          <span className="text-[10px] opacity-60 group-hover:opacity-100">⇄</span>
        </button>
      </div>
    </aside>
  );
}
