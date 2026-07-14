"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hasSeenWelcome, dismissWelcome } from "@/lib/storage";
import { CompassRose, Sparkle, FieldJournal } from "@/components/icons";

// V2.5 · Welcome modal · shown on first visit · explains what the platform is + how to try it
export function WelcomeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Defer to client-side check to avoid SSR flash
    if (!hasSeenWelcome()) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    dismissWelcome();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={dismiss}>
      <div
        className="bg-surface border border-border rounded-2xl p-8 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="text-accent"><CompassRose size={28} strokeWidth={1.5} /></span>
          <h2 className="display text-[28px] text-text leading-[1.05] m-0">RocketShip OS</h2>
          <span className="font-mono text-[10px] font-bold text-purple bg-purple/15 px-2 py-0.5 rounded uppercase tracking-[1.8px]">V5</span>
        </div>
        <div className="retro-band mb-4"><span /><span /></div>
        {/* V5 · Philosophy line · the soul of the platform from the Multithread Pre-Work doc */}
        <p className="text-[15px] text-text mb-3 leading-relaxed font-medium italic">
          &ldquo;The preparation is the message, before the message is even sent.&rdquo;
        </p>
        <p className="text-[14px] text-text-dim mb-5 leading-relaxed">
          The AI-native operator&apos;s job-search platform. Not a job board. A <strong className="text-text">job ASSESSOR</strong> that profiles who you actually are (twelve peer-reviewed psychology frameworks), then assesses every opportunity against your values. Honest reads, no flattery, on your side.
        </p>

        <div className="space-y-3 mb-6">
          <div className="bg-surface-2 border border-border rounded-lg p-4 flex gap-3 items-start">
            <span className="text-accent flex-shrink-0 mt-0.5"><Sparkle size={20} strokeWidth={1.5} /></span>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-mono text-[10px] font-bold tracking-[1.8px] text-accent uppercase">Start here</span>
                <span className="text-[14px] font-semibold text-text">Paste your LinkedIn · board builds itself</span>
              </div>
              <p className="text-[12px] text-text-dim leading-relaxed m-0">
                Paste your LinkedIn and we read it in seconds: candidate profile, resume fit, and a starting list of target companies. Then the Discovery wizard fine-tunes the rest.
              </p>
            </div>
          </div>

          <div className="bg-surface-2 border border-border rounded-lg p-4 flex gap-3 items-start">
            <span className="text-cool flex-shrink-0 mt-0.5"><CompassRose size={20} strokeWidth={1.5} /></span>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-mono text-[10px] font-bold tracking-[1.8px] text-cool uppercase">Explore</span>
                <span className="text-[14px] font-semibold text-text">Your live pipeline as showcase</span>
              </div>
              <p className="text-[12px] text-text-dim leading-relaxed m-0">
                Your job search in motion. Mission Control · Probes Inbox · Pipeline · Star Maps · Interview Day.
              </p>
            </div>
          </div>

          <div className="bg-surface-2 border border-border rounded-lg p-4 flex gap-3 items-start">
            <span className="text-good flex-shrink-0 mt-0.5"><FieldJournal size={20} strokeWidth={1.5} /></span>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-mono text-[10px] font-bold tracking-[1.8px] text-good uppercase">Empirical loop</span>
                <span className="text-[14px] font-semibold text-text">Decision Journal · accuracy compounds</span>
              </div>
              <p className="text-[12px] text-text-dim leading-relaxed m-0">
                Log a decision · predict alignment · review at 30 or 90 days. Your prediction accuracy becomes the most honest signal of whether the platform is helping you choose well.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] text-muted italic">
            Your profile stays on your device · never sold, never shared.
          </p>
          <div className="flex gap-2">
            <button
              onClick={dismiss}
              className="px-4 py-2 bg-surface-2 hover:bg-surface-3 border border-border text-navy rounded-lg font-semibold text-[13px] transition"
            >
              Skip · explore as-is
            </button>
            <Link
              href="/onboarding"
              onClick={dismiss}
              className="px-5 py-2 bg-accent text-white dark:text-bg rounded-lg font-bold text-[13px] hover:bg-accent/90 transition"
            >
              Paste LinkedIn → build my board
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
