"use client";

import { useState } from "react";
import { SENIOR_AE_COMP_JUNE_2026, PIPELINE_MATCHES, AI_NATIVE_EXTRAPOLATED } from "@/lib/data/comp";

export default function CompBenchmarks() {
  const [aud, setAud] = useState(false); // toggle USD → AUD rough conversion
  const exchangeRate = 0.66; // USD per AUD

  function display(usd: number): string {
    if (!aud) return `$${usd}K`;
    const audVal = Math.round(usd / exchangeRate);
    return `A$${audVal}K`;
  }

  const data = [...SENIOR_AE_COMP_JUNE_2026].sort((a, b) => b.ote - a.ote);
  const meanBase = Math.round(data.reduce((s, c) => s + c.base, 0) / data.length);
  const meanOte = Math.round(data.reduce((s, c) => s + c.ote, 0) / data.length);
  const meanTop = Math.round(data.reduce((s, c) => s + c.topPerformer, 0) / data.length);

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight mb-1.5">Comp Benchmarks 💰</h1>
      <p className="text-muted text-sm mb-6">
        Senior Tech AE comp packages · June 2026 · 17 major US tech companies. Use as anchor in every recruiter/HM comp conversation.
      </p>

      {/* Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-muted">Currency:</span>
        <button
          onClick={() => setAud(false)}
          className={`text-xs px-3 py-1.5 rounded ${!aud ? "bg-accent text-white" : "bg-surface-2 text-muted hover:text-text"}`}
        >
          USD
        </button>
        <button
          onClick={() => setAud(true)}
          className={`text-xs px-3 py-1.5 rounded ${aud ? "bg-accent text-white" : "bg-surface-2 text-muted hover:text-text"}`}
        >
          AUD (rough at 0.66)
        </button>
        {aud && (
          <span className="text-[11px] text-muted ml-2">
            ⚠️ AU equivalent typically 25-40% lower than US (market structure) · these AUD figures are rough US-to-AUD conversion, NOT the AU senior tech AE band
          </span>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat">
          <div className="text-[11px] text-muted uppercase tracking-wider">Mean base</div>
          <div className="text-2xl font-bold text-navy mt-1">{display(meanBase)}</div>
        </div>
        <div className="stat">
          <div className="text-[11px] text-muted uppercase tracking-wider">Mean OTE</div>
          <div className="text-2xl font-bold text-accent mt-1">{display(meanOte)}</div>
        </div>
        <div className="stat">
          <div className="text-[11px] text-muted uppercase tracking-wider">Mean top performer</div>
          <div className="text-2xl font-bold text-good mt-1">{display(meanTop)}</div>
        </div>
      </div>

      {/* Main table */}
      <h2 className="text-xl font-semibold mb-3">Full table · sorted by OTE</h2>
      <div className="bg-surface border border-border rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 border-b border-border">
            <tr>
              <th className="text-left py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted font-semibold">Company</th>
              <th className="text-left py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted font-semibold">Category</th>
              <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted font-semibold">Base</th>
              <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted font-semibold">OTE</th>
              <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted font-semibold">Top performer</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c, i) => {
              const isPipelineMatch = PIPELINE_MATCHES.some((m) => m.company === c.company);
              return (
                <tr key={c.company} className={`border-b border-border last:border-0 ${isPipelineMatch ? "bg-accent/5" : i % 2 ? "bg-surface-2/40" : ""}`}>
                  <td className="py-2.5 px-3 font-semibold">
                    {c.company}
                    {isPipelineMatch && <span className="ml-2 text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded uppercase tracking-wider">In pipeline</span>}
                  </td>
                  <td className="py-2.5 px-3 text-[12px] text-text-dim">{c.category}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{display(c.base)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-accent">{display(c.ote)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-good">{display(c.topPerformer)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AI-native extrapolated */}
      <h2 className="text-xl font-semibold mt-7 mb-3">Adjacent AI-native rockets (extrapolated bands)</h2>
      <p className="text-xs text-muted mb-3">Based on the closest true AI-native comparable (~$325K USD OTE) in the verified dataset.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
        {AI_NATIVE_EXTRAPOLATED.map((c) => (
          <div key={c.company} className="bg-surface border border-border rounded-lg p-3">
            <div className="flex justify-between items-start gap-2">
              <div className="font-semibold text-sm">{c.company}</div>
              <div className="text-sm font-mono text-accent font-bold">{c.oteEstimate}</div>
            </div>
            <div className="text-[11px] text-text-dim mt-1">{c.reason}</div>
          </div>
        ))}
      </div>

      {/* AU conversion guidance */}
      <h2 className="text-xl font-semibold mt-7 mb-3">AU conversion guidance</h2>
      <div className="card !border-warn bg-warn/5">
        <ul className="text-sm text-text-dim list-disc pl-5 space-y-1.5">
          <li>USD $330K OTE ≈ <strong>AUD $500K OTE</strong> at ~0.66 exchange</li>
          <li>AU equivalent of US senior tech AE typically lands <strong>25-40% lower</strong> due to market structure</li>
          <li>Reasonable AU senior tech AE expectation: <strong>$300K-$400K AUD OTE</strong></li>
          <li>Published AU AE bands from growth-stage AI companies (~A$385K-A$465K) match the lower end of this AU range</li>
          <li>For Senior SDR / Founding BDR / Strategist: use 0.5-0.7x AE band as floor (~$160K-$230K USD OTE / ~$240K-$350K AUD)</li>
          <li>For top-performer trajectory: cite the $1M+ ceilings as the asymmetric upside argument when negotiating equity vs base</li>
        </ul>
      </div>

      {/* Negotiation talking points */}
      <h2 className="text-xl font-semibold mt-7 mb-3">Negotiation talking points</h2>
      <div className="card">
        <ul className="text-sm text-text-dim list-disc pl-5 space-y-1.5">
          <li><strong>Anchor high but defensible</strong>: cite this dataset directly. <em>&quot;The June 2026 senior tech AE band runs $320K-$355K OTE across leading enterprise software companies...&quot;</em></li>
          <li><strong>Mean OTE is $330K USD</strong> · use as the &quot;market clearing&quot; reference</li>
          <li><strong>Top-performer ceiling</strong>: cite as the asymmetric upside in equity-vs-base trade-offs</li>
          <li><strong>Cybersecurity heavy in this list</strong>: security AE comp is consistently $320K+ OTE with $1M+ ceilings</li>
          <li><strong>OTE compression note</strong>: 80% of the list sits in a tight $320K-$345K OTE band. The differentiator is the top-performer ceiling, which varies up to 2x across companies</li>
        </ul>
      </div>

      <p className="text-xs text-muted mt-6 italic">
        Source: industry comp data, USD denominated. Use as a reference anchor for comp negotiations.
      </p>
    </div>
  );
}
