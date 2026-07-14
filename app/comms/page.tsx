"use client";

import { useState, useMemo } from "react";
import { PATTERNS } from "@/lib/data/patterns";
import { STANDING_RULES, RULE_CATEGORIES, type RuleCategory } from "@/lib/data/rules";
import { PageHero } from "@/components/PageHero";

export default function CommsBay() {
  const [openPattern, setOpenPattern] = useState<string | null>(null);
  const [openRule, setOpenRule] = useState<string | null>(null);
  const [category, setCategory] = useState<RuleCategory | "All">("All");
  const [query, setQuery] = useState("");

  const filteredRules = useMemo(() => {
    const q = query.toLowerCase().trim();
    return STANDING_RULES.filter((r) => {
      if (category !== "All" && r.category !== category) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.one_liner.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q) ||
        r.apply_when.toLowerCase().includes(q) ||
        (r.examples || []).some((ex) => ex.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  const ruleCount = STANDING_RULES.length;

  return (
    <div>
      <PageHero eyebrow="Playbook" title="Comms Bay" subtitle="Standing rules library + cover letter pattern + Loom template + outreach sequence. The operator brain." marker="CB.01" />

      {/* STANDING RULES LIBRARY · the new headline */}
      <div className="mb-7">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h2 className="text-xl font-semibold">📚 Standing Rules Library</h2>
          <span className="text-xs text-muted">{ruleCount} rules · searchable</span>
        </div>

        <div className="flex flex-col md:flex-row gap-2 mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rules by keyword (e.g. 'scroll-stop' or 'subject')"
            className="flex-1 bg-surface-2 border border-border rounded-md p-2.5 text-sm focus:outline-none focus:border-accent"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as RuleCategory | "All")}
            className="bg-surface-2 border border-border rounded-md p-2.5 text-sm focus:outline-none focus:border-accent"
          >
            <option value="All">All categories</option>
            {RULE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {filteredRules.length === 0 ? (
          <p className="text-sm text-muted py-4">No rules match. Try a different keyword or clear the filter.</p>
        ) : (
          <div className="space-y-2">
            {filteredRules.map((r) => {
              const open = openRule === r.id;
              return (
                <div key={r.id} className="bg-surface border border-border rounded-lg overflow-hidden">
                  <div
                    onClick={() => setOpenRule(open ? null : r.id)}
                    className="flex justify-between items-start gap-3 p-3.5 cursor-pointer hover:bg-surface-2"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{r.icon}</span>
                        <span className="text-sm font-semibold">{r.title}</span>
                        <span className="text-[10px] text-muted bg-surface-3 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {r.category}
                        </span>
                      </div>
                      <p className="text-xs text-text-dim">{r.one_liner}</p>
                    </div>
                    <span className={`text-muted transition-transform mt-1 ${open ? "rotate-90" : ""}`}>▶</span>
                  </div>

                  {open && (
                    <div className="px-3.5 pb-3.5 border-t border-border pt-3 bg-surface-2">
                      <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Body</div>
                      <p className="text-[13px] text-text-dim leading-relaxed mb-3">{r.body}</p>

                      <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Apply when</div>
                      <p className="text-[13px] text-text-dim leading-relaxed mb-3">{r.apply_when}</p>

                      {r.examples && r.examples.length > 0 && (
                        <>
                          <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Examples</div>
                          <ul className="text-[13px] text-text-dim leading-relaxed list-disc pl-5 space-y-1">
                            {r.examples.map((ex, i) => (
                              <li key={i}>{ex}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COVER LETTER PATTERN LIBRARY */}
      <h2 className="text-xl font-semibold mb-4">Cover Letter Pattern Library</h2>
      {PATTERNS.map((p) => (
        <div key={p.letter} className="bg-surface border border-border rounded-lg mb-2.5 overflow-hidden">
          <div
            onClick={() => setOpenPattern(openPattern === p.letter ? null : p.letter)}
            className="flex justify-between items-center p-4 cursor-pointer hover:bg-surface-2"
          >
            <div>
              <strong>Pattern {p.letter}</strong> · {p.name}
            </div>
            <span className={`text-muted transition-transform ${openPattern === p.letter ? "rotate-90" : ""}`}>▶</span>
          </div>
          {openPattern === p.letter && (
            <div className="px-4 pb-4 text-[13px] text-text-dim leading-relaxed">
              <p>{p.desc}</p>
              <p className="mt-2">
                <strong>Use on:</strong> {p.when}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* LOOM TEMPLATE */}
      <h2 className="text-xl font-semibold mt-7 mb-4">Loom Script Template (5-part, 75-85 sec)</h2>
      <div className="card">
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li><strong>Hook (10 sec)</strong> — name, role, why THIS company (one researched detail)</li>
          <li><strong>Credibility (15-20 sec)</strong> — your most relevant 1-2 wins, quantified</li>
          <li><strong>Differentiator (20-25 sec)</strong> — what makes you 10x</li>
          <li><strong>Honest friction (10 sec)</strong> — name the gap, frame as &quot;AI-native operator who learns fast&quot;</li>
          <li><strong>Soft CTA (15 sec)</strong> — Who/When/Length/Agenda</li>
        </ol>
      </div>

      {/* OUTREACH SEQUENCE */}
      <h2 className="text-xl font-semibold mt-7 mb-4">Outreach Sequence (Mentor Framework)</h2>
      <div className="card text-sm space-y-3">
        <div>
          <h3 className="font-semibold">Step 1 · Silent connect</h3>
          <p className="text-text-dim mt-1">LinkedIn connection request with no message.</p>
        </div>
        <div>
          <h3 className="font-semibold">Step 2 · Engagement-before-DM</h3>
          <p className="text-text-dim mt-1">Like + comment on 2-3 recent posts.</p>
        </div>
        <div>
          <h3 className="font-semibold">Step 3 · First DM (scroll-stop opener)</h3>
          <p className="text-text-dim mt-1">
            Thesis / reframe / specific observation as first line. Then quick context + Loom + soft CTA.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Step 4 · Day 1 follow-up</h3>
          <p className="text-text-dim mt-1">Confirm receipt. Reiterate Loom.</p>
        </div>
        <div>
          <h3 className="font-semibold">Step 5 · Day 5 follow-up</h3>
          <p className="text-text-dim mt-1">Add new value: insight, prep work, question.</p>
        </div>
        <div>
          <h3 className="font-semibold">Step 6 · Day 14 final</h3>
          <p className="text-text-dim mt-1">Final follow-up. &quot;Will be moving on but leaving door open.&quot;</p>
        </div>
      </div>
    </div>
  );
}
