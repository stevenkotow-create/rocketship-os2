"use client";

// V5 · Outreach Bay
// Three-feature unified surface:
// · F19 · Character counter on connection notes (300 char hard cap)
// · F20 · "Never Ask for the Job" lint check · the asymmetric differentiator
// · F18 · 10-item Pre-Send Checklist Gate before send is enabled
// Implements the Core Rule of the outreach strategy:
// "You never ask for the job. You express conviction. The goal is for them to say 'you should apply.'"

import { useMemo, useState } from "react";
import { lintOutreach, PRE_SEND_CHECKLIST } from "@/lib/outreach-lint";
import { NavIcon } from "@/components/icons";

const MESSAGE_TYPES = [
  { id: "connection", label: "Connection Note", limit: 300, desc: "LinkedIn connection request · 300 char hard cap" },
  { id: "followup", label: "Follow-up DM", limit: 1000, desc: "Post-connection LinkedIn DM · concise" },
  { id: "email", label: "Email", limit: 2000, desc: "Direct email · full structure ok" },
  { id: "loom", label: "Loom Intro Script", limit: 1500, desc: "75-85 sec spoken script · time-budget aware" },
] as const;

export default function OutreachBay() {
  const [type, setType] = useState<typeof MESSAGE_TYPES[number]["id"]>("connection");
  const [text, setText] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState(false);

  const messageType = MESSAGE_TYPES.find((t) => t.id === type)!;
  const lint = useMemo(() => lintOutreach(text, { charLimit: messageType.limit }), [text, messageType.limit]);
  const checkedCount = Object.values(checks).filter(Boolean).length;
  const allChecked = checkedCount === PRE_SEND_CHECKLIST.length;
  const canSend = lint.canSend && allChecked && text.trim().length > 20;

  const blockIssues = lint.issues.filter((i) => i.severity === "block");
  const warnIssues = lint.issues.filter((i) => i.severity === "warn");

  function reset() {
    setText("");
    setChecks({});
    setSent(false);
  }

  function handleSend() {
    // Logs the send to localStorage build log (future enhancement)
    setSent(true);
    setTimeout(() => {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `outreach-${type}-${new Date().toISOString().split("T")[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }, 200);
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      {/* ── HEADER ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-accent"><NavIcon name="Antenna" size={28} strokeWidth={1.5} /></span>
          <h1 className="text-[28px] font-bold text-text leading-tight m-0">Outreach Bay</h1>
          <span className="font-mono text-[10px] font-bold text-purple bg-purple/15 px-2 py-0.5 rounded uppercase tracking-[1.8px]">V5 · NEW</span>
        </div>
        <div className="retro-band mb-3"><span /><span /></div>
        <p className="text-[13px] text-text-dim leading-relaxed max-w-[700px]">
          <strong className="text-text">The preparation is the message, before the message is even sent.</strong> Draft outreach · the platform lints for the &quot;never ask for the job&quot; rule, counts characters, and gates send behind the 10-item pre-send checklist. The Core Rule: <em>you express conviction · they offer the seat.</em>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* ── LEFT COLUMN · DRAFTER ── */}
        <div className="space-y-4">
          {/* MESSAGE TYPE PICKER */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="font-mono text-[10px] font-bold text-muted uppercase tracking-[1.8px] mb-3">Message type</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MESSAGE_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`text-left px-3 py-2.5 rounded-lg border text-[12px] transition ${
                    type === t.id
                      ? "bg-accent/10 border-accent text-accent font-semibold"
                      : "bg-surface-2 border-border text-text-dim hover:border-accent/40"
                  }`}
                >
                  <div className="font-semibold">{t.label}</div>
                  <div className="text-[10px] font-mono text-muted mt-0.5">{t.limit} chars max</div>
                </button>
              ))}
            </div>
          </div>

          {/* TEXTAREA + CHAR COUNTER (F19) */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-baseline justify-between mb-2">
              <label className="font-mono text-[10px] font-bold text-muted uppercase tracking-[1.8px]">Your draft</label>
              <div className={`font-mono text-[11px] font-bold tabular-nums ${
                lint.charsOverLimit > 0
                  ? "text-hot"
                  : lint.charCount > messageType.limit * 0.93
                    ? "text-warn"
                    : "text-text-dim"
              }`}>
                {lint.charCount}<span className="text-muted">/{messageType.limit}</span>
                {lint.charsOverLimit > 0 && <span className="text-hot ml-1">· over by {lint.charsOverLimit}</span>}
              </div>
            </div>
            <textarea
              className="w-full min-h-[180px] bg-bg border border-border rounded-lg p-3 text-[13px] text-text font-sans leading-relaxed focus:outline-none focus:border-accent resize-none"
              placeholder={
                type === "connection"
                  ? "Hi [name] · saw your post on [specific thing]. The angle on [specific reframe] landed for me because [concrete reason]. Following the work."
                  : type === "followup"
                    ? "Thanks for connecting [name]. Wanted to share what pulled me to [company] specifically · [conviction not request]."
                    : "Write your draft here. Lead with conviction about the company · not a request about the role."
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={messageType.limit + 200}
              disabled={sent}
            />
            {/* Live quality score */}
            <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[9px] font-bold text-muted uppercase tracking-[1.6px]">Quality score</span>
                <span className={`text-[20px] font-bold tabular-nums ${
                  lint.score >= 80 ? "text-good" : lint.score >= 50 ? "text-warn" : "text-hot"
                }`}>{lint.score}<span className="text-[12px] text-muted">/100</span></span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                {blockIssues.length > 0 && (
                  <span className="text-hot font-mono font-bold">{blockIssues.length} block</span>
                )}
                {warnIssues.length > 0 && (
                  <span className="text-warn font-mono font-bold">{warnIssues.length} warn</span>
                )}
                {blockIssues.length === 0 && warnIssues.length === 0 && text.length > 20 && (
                  <span className="text-good font-mono font-bold">no issues · ready</span>
                )}
              </div>
            </div>
          </div>

          {/* LINT ISSUES (F20) */}
          {(blockIssues.length > 0 || warnIssues.length > 0) && (
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="font-mono text-[10px] font-bold text-muted uppercase tracking-[1.8px] mb-3">
                Lint findings · the platform&apos;s honest read
              </div>
              <div className="space-y-2.5">
                {blockIssues.map((issue, i) => (
                  <div key={`b-${i}`} className="bg-hot/5 border-l-4 border-hot rounded-r-lg px-3 py-2.5">
                    <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[9px] font-bold text-hot uppercase tracking-[1.4px] bg-hot/15 px-1.5 py-0.5 rounded">BLOCK</span>
                      <span className="text-[12px] font-bold text-text">&ldquo;{issue.pattern}&rdquo;</span>
                      <span className="text-[10px] text-muted font-mono uppercase tracking-[1.2px]">{issue.category}</span>
                    </div>
                    <div className="text-[11.5px] text-text-dim leading-relaxed">{issue.reframe}</div>
                    <div className="text-[10px] text-muted italic mt-1">Rule: {issue.rule}</div>
                  </div>
                ))}
                {warnIssues.map((issue, i) => (
                  <div key={`w-${i}`} className="bg-warn/5 border-l-4 border-warn rounded-r-lg px-3 py-2.5">
                    <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[9px] font-bold text-warn uppercase tracking-[1.4px] bg-warn/15 px-1.5 py-0.5 rounded">WARN</span>
                      <span className="text-[12px] font-bold text-text">&ldquo;{issue.pattern}&rdquo;</span>
                      <span className="text-[10px] text-muted font-mono uppercase tracking-[1.2px]">{issue.category}</span>
                    </div>
                    <div className="text-[11.5px] text-text-dim leading-relaxed">{issue.reframe}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEND GATE */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-mono text-[10px] font-bold text-muted uppercase tracking-[1.8px] mb-1">Send gate</div>
                <div className="text-[13px] text-text-dim">
                  Requires: no blocking lint · checklist {checkedCount}/{PRE_SEND_CHECKLIST.length} · &gt;20 chars in draft
                </div>
              </div>
              {sent ? (
                <button
                  onClick={reset}
                  className="px-5 py-2.5 bg-good text-white rounded-lg font-bold text-[13px]"
                >
                  ✓ Cleared · draft another
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className={`px-6 py-2.5 rounded-lg font-bold text-[13px] transition ${
                    canSend
                      ? "bg-accent text-white dark:text-bg hover:bg-accent/90 cursor-pointer"
                      : "bg-surface-2 text-muted cursor-not-allowed"
                  }`}
                >
                  {canSend ? "Copy + download draft →" : "Resolve gate to send"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN · CHECKLIST (F18) ── */}
        <div className="bg-surface border border-border rounded-xl p-5 h-fit lg:sticky lg:top-6">
          <div className="flex items-baseline justify-between mb-3">
            <div className="font-mono text-[10px] font-bold text-muted uppercase tracking-[1.8px]">Pre-send checklist</div>
            <div className="font-mono text-[11px] font-bold tabular-nums">
              <span className={checkedCount === PRE_SEND_CHECKLIST.length ? "text-good" : "text-text-dim"}>
                {checkedCount}
              </span>
              <span className="text-muted">/{PRE_SEND_CHECKLIST.length}</span>
            </div>
          </div>
          <p className="text-[11px] text-text-dim italic mb-4 leading-relaxed">
            Every item is gate, not suggestion. Tick deliberately · this protects you when you&apos;re tired.
          </p>
          <div className="space-y-2">
            {PRE_SEND_CHECKLIST.map((item) => (
              <label
                key={item.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition border ${
                  checks[item.id]
                    ? "bg-good/5 border-good/30"
                    : "bg-surface-2 border-border hover:border-accent/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checks[item.id]}
                  onChange={(e) => setChecks((c) => ({ ...c, [item.id]: e.target.checked }))}
                  className="mt-0.5 flex-shrink-0 accent-good w-4 h-4"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5 mb-0.5">
                    <span className="text-[12px] font-semibold text-text leading-tight">{item.label}</span>
                  </div>
                  <div className="text-[10px] font-mono text-muted uppercase tracking-[1.2px] mb-1">{item.category}</div>
                  <div className="text-[10.5px] text-text-dim leading-snug">{item.detail}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER · the philosophy ── */}
      <div className="mt-10 pt-6 border-t border-border text-center">
        <p className="text-[11px] text-muted italic max-w-[600px] mx-auto leading-relaxed">
          The preparation is the message, before the message is even sent. 99% of outreach asks for the job. Yours doesn&apos;t.
        </p>
      </div>
    </div>
  );
}
