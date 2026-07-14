"use client";

// Mentor Update Generator
// Auto-generates a shareable weekly progress post for your mentors or accountability group.
// Pulls from pipeline state · summarises this week's applications, interviews booked,
// follow-ups due, and lessons learned. Removes the manual "what should I share this week" friction.
// Voice: warm, concise, on your side.

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/storage";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import type { Opportunity } from "@/lib/types";

export default function MentorUpdatePage() {
  const [state] = useAppState();
  const ALL_OPPS = [...OPPORTUNITIES, ...(state.customOpps || [])];
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState("");

  // Merge seed opps with stateful overrides
  const allOpps: Opportunity[] = useMemo(
    () => ALL_OPPS.map((o) => ({ ...o, ...(state.opps[o.id] || {}) }) as Opportunity),
    [state.opps, state.customOpps],
  );

  // Compute this week's activity (last 7 days)
  const now = Date.now();
  const weekAgoIso = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const appliedThisWeek = allOpps.filter((o) => {
    const appliedTs = o.timestamps?.find((t) => t.event.toLowerCase().includes("submitted") || t.event.toLowerCase().includes("applied"));
    return appliedTs && appliedTs.date >= weekAgoIso;
  });

  const interviewsBooked = allOpps.flatMap((o) =>
    (o.contacts || [])
      .filter((c) => c.meetingBookedFor && c.meetingBookedFor >= weekAgoIso)
      .map((c) => ({ opp: o, contact: c })),
  );

  const advancedStage = allOpps.filter((o) => o.stage === "early" || o.stage === "late");

  const valuesProfile = state.valuesProfile;
  const assessmentsRun = Object.keys(state.missionCompassAssessments || {}).length;
  const decisionsLogged = (state.decisionJournal || []).length;
  const reviewsDone = (state.decisionJournal || []).filter((d) => d.reviewedAt).length;

  // Build the markdown update
  const update = useMemo(() => {
    const lines: string[] = [];
    const weekRange = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short" });
    lines.push(`# Weekly update · week of ${weekRange}`);
    lines.push("");
    lines.push(`Hey team, weekly check-in below. Anything stand out you'd push back on?`);
    lines.push("");

    if (appliedThisWeek.length > 0) {
      lines.push(`## Applications shipped (${appliedThisWeek.length})`);
      lines.push("");
      appliedThisWeek.forEach((o) => {
        lines.push(`- **${o.company}** · ${o.position} · ${o.location}`);
        if (o.score && o.score.eq) {
          lines.push(`  - Score · ${o.score.v}/25 values · ${o.score.eq} equity ceiling`);
        }
        if (o.priority) {
          lines.push(`  - Priority · ${o.priority}`);
        }
      });
      lines.push("");
    }

    if (interviewsBooked.length > 0) {
      lines.push(`## Interviews booked (${interviewsBooked.length})`);
      lines.push("");
      interviewsBooked.forEach(({ opp, contact }) => {
        const when = contact.meetingBookedFor ? new Date(contact.meetingBookedFor).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "TBC";
        lines.push(`- **${opp.company}** · ${when} · ${contact.name} (${contact.title || contact.role})`);
      });
      lines.push("");
    }

    if (advancedStage.length > 0) {
      lines.push(`## In flight (${advancedStage.length})`);
      lines.push("");
      advancedStage.forEach((o) => {
        lines.push(`- **${o.company}** · ${o.position} · stage: ${o.stage}`);
      });
      lines.push("");
    }

    if (valuesProfile && assessmentsRun > 0) {
      lines.push(`## Mission Compass`);
      lines.push("");
      lines.push(`- Calibrated · profile version ${valuesProfile.version}`);
      lines.push(`- Assessments run · ${assessmentsRun}`);
      lines.push(`- Decisions logged · ${decisionsLogged}`);
      lines.push(`- 30/90-day reviews completed · ${reviewsDone}`);
      lines.push("");
    }

    if (customNote.trim()) {
      lines.push(`## Note for the mentors`);
      lines.push("");
      lines.push(customNote.trim());
      lines.push("");
    }

    lines.push(`## What I'm working on next`);
    lines.push("");
    lines.push(`- [ ] [Add your own focus here]`);
    lines.push("");
    lines.push(`Thanks for the steady steer.`);

    return lines.join("\n");
  }, [appliedThisWeek, interviewsBooked, advancedStage, valuesProfile, assessmentsRun, decisionsLogged, reviewsDone, customNote]);

  function handleCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(update).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <div className="page-hero">
        <h1>Mentor Update <span className="text-accent">📡</span></h1>
        <p>
          Auto-generated weekly progress post for your mentors or accountability group. Pulls from this week&apos;s pipeline activity · applications shipped, interviews booked, Mission Compass usage. Copy to clipboard, paste into your community, hit post.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="stat">
          <div className="text-data-lg text-accent">{appliedThisWeek.length}</div>
          <div className="label-caps mt-1">Apps this week</div>
        </div>
        <div className="stat">
          <div className="text-data-lg text-good">{interviewsBooked.length}</div>
          <div className="label-caps mt-1">Interviews booked</div>
        </div>
        <div className="stat">
          <div className="text-data-lg text-cool">{assessmentsRun}</div>
          <div className="label-caps mt-1">Mission Compass assessments</div>
        </div>
        <div className="stat">
          <div className="text-data-lg text-purple">{decisionsLogged}</div>
          <div className="label-caps mt-1">Decisions logged</div>
        </div>
      </div>

      {/* Optional note */}
      <div className="card-elevated mb-6">
        <label className="block label-caps mb-2">Optional · what would you flag for the mentors this week?</label>
        <textarea
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
          placeholder="e.g. Two companies screened this week with interesting overlap in positioning. Want your read on how to play the next round."
          className="w-full text-[13px] p-3 border border-border rounded-md bg-surface min-h-[100px]"
        />
        <p className="text-[11px] text-muted mt-2 italic">
          This appears in the generated update. Keep it specific · the mentors will spot generic notes.
        </p>
      </div>

      {/* Generated update · preview + copy */}
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-[18px] font-semibold text-navy m-0">Generated update</h2>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-md text-[13px] font-bold transition ${
              copied ? "bg-good text-white" : "bg-accent text-white hover:bg-accent-2"
            }`}
          >
            {copied ? "✓ Copied to clipboard" : "Copy to clipboard"}
          </button>
        </div>
        <pre className="bg-bg border border-border rounded-md p-4 text-[12px] text-navy whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-[600px]">
          {update}
        </pre>
        <div className="mt-4 flex items-center gap-2 flex-wrap text-[12px] text-text-dim">
          <span>Copy the update above and paste it into your mentor or accountability community.</span>
        </div>
      </div>

      {/* Footer · context */}
      <div className="mt-6 text-[11px] text-muted leading-relaxed">
        <strong>How this works:</strong> The generator scans your pipeline state from the last 7 days · applications shipped, interviews booked, opps in advanced stages, Mission Compass usage. Updates regenerate live as the pipeline state changes. Manual notes are preserved. Voice: warm, concise, on your side.
        <br /><br />
        <Link href="/mission-compass" className="text-accent hover:underline">Mission Compass</Link>
        <span className="mx-2">·</span>
        <Link href="/decision-journal" className="text-accent hover:underline">Decision Journal</Link>
        <span className="mx-2">·</span>
        <Link href="/" className="text-accent hover:underline">Mission Control</Link>
      </div>
    </div>
  );
}
