"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useAppState, today } from "@/lib/storage";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import { STAGES, PATTERN_ICONS } from "@/lib/constants";
import { SolarSystem } from "@/components/SolarSystem";
import { MissionCompassCard } from "@/components/MissionCompassCard";
import { InterviewPrepCard } from "@/components/InterviewPrepCard";
import { StarMapBuilder } from "@/components/StarMapBuilder";
import type { Stage, Opportunity, Contact, ContactStatus, MEDDPICC } from "@/lib/types";
import { computeStakeholderHealth, missingRequiredRoles, healthLabel } from "@/lib/star-map";

const MEDDPICC_FIELDS: { key: keyof MEDDPICC; label: string; letter: string; question: string }[] = [
  { key: "metrics", letter: "M", label: "Metrics", question: "Target role + comp range understood" },
  { key: "economicBuyer", letter: "E", label: "Economic Buyer", question: "Hiring Manager identified + intel" },
  { key: "decisionCriteria", letter: "D", label: "Decision Criteria", question: "How they actually hire" },
  { key: "decisionProcess", letter: "D", label: "Decision Process", question: "Interview sequence mapped" },
  { key: "identifyPain", letter: "I", label: "Identify Pain", question: "Why they're hiring right now" },
  { key: "champion", letter: "C", label: "Champion", question: "Your internal referrer" },
  { key: "competition", letter: "C", label: "Competition", question: "Other candidates in process" },
];

const STATUS_LABEL: Record<ContactStatus, string> = {
  identified: "Identified",
  silent: "Silent connect",
  dm: "DM sent",
  replied: "Replied",
  advanced: "Advanced",
  cold: "Gone cold",
};

const STATUS_COLOR: Record<ContactStatus, string> = {
  identified: "bg-muted/20 text-muted",
  silent: "bg-navy/15 text-navy",
  dm: "bg-accent/15 text-accent",
  replied: "bg-good/20 text-good",
  advanced: "bg-good/25 text-good",
  cold: "bg-hot/15 text-hot",
};

// 6-step Mission Cadence · a sales-cycle framework applied to the job search
const CADENCE_STEPS = [
  { id: "research", label: "Deep Research", icon: "🔬", desc: "Read S1/funding decks, listen to founder podcasts, map ICP + USP" },
  { id: "silent_connect", label: "Silent Connect (APAC AE)", icon: "📡", desc: "Connect with APAC AE / GTM Recruiter without message" },
  { id: "engagement", label: "Pre-touch Engagement", icon: "💬", desc: "Like/comment on their content for 3-5 days before DM" },
  { id: "dm_loom", label: "DM + Loom", icon: "📹", desc: "Pattern-tailored DM with Loom video attached" },
  { id: "application", label: "ATS Application", icon: "🚀", desc: "Submit via ATS with tailored cover letter mentioning the DM" },
  { id: "followup", label: "Follow-up", icon: "🔁", desc: "Day-3 nudge, Day-7 value-add, Day-14 graceful close" },
];

export default function MissionProfile() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [state, update] = useAppState();
  const [noteDraft, setNoteDraft] = useState<string>("");
  const [savedNote, setSavedNote] = useState<boolean>(false);

  // Find opp from seed data OR custom opps
  const seedOpp = OPPORTUNITIES.find((o) => o.id === id);
  const customOpp = state.customOpps.find((o) => o.id === id);
  const baseOpp = seedOpp || customOpp;

  if (!baseOpp) {
    return (
      <div>
        <div className="card">
          <h1 className="text-2xl font-bold mb-2">Mission not found</h1>
          <p className="text-sm text-text-dim mb-4">No opportunity with ID <code className="bg-surface-3 px-2 py-0.5 rounded">{id}</code> in scouting or custom missions.</p>
          <Link href="/pipeline" className="text-accent hover:underline">← Back to Launch Manifest</Link>
        </div>
      </div>
    );
  }

  const opp: Opportunity = { ...baseOpp, ...(state.opps[id] || {}) } as Opportunity;
  const contacts: Contact[] = opp.contacts || [];
  const stageDef = STAGES.find((s) => s.id === opp.stage);
  const oppCadence = state.cadence[id] || {};

  // Cadence completion
  const cadenceDone = CADENCE_STEPS.filter((s) => oppCadence[s.id]).length;
  const cadencePct = Math.round((cadenceDone / CADENCE_STEPS.length) * 100);

  // Thread health
  const threadsSent = contacts.filter((c) => ["dm", "replied", "advanced"].includes(c.status)).length;
  const threadsTotal = contacts.length;
  const threadPct = threadsTotal ? Math.round((threadsSent / threadsTotal) * 100) : 0;

  // V2 Score total
  const scoreTotal = opp.score ? opp.score.v + opp.score.l + opp.score.r + opp.score.c : null;

  // V2 · MEDDPICC progress (qualification depth)
  const meddpicc = opp.meddpicc || {};
  const meddpiccRatings: number[] = MEDDPICC_FIELDS.map((f) => meddpicc[f.key]?.rating ?? 0);
  const meddpiccMapped = meddpiccRatings.filter((r) => r >= 2).length;
  const meddpiccSolid = meddpiccRatings.filter((r) => r === 3).length;
  const meddpiccTotalPoints = meddpiccRatings.reduce((a: number, b: number) => a + b, 0);
  const dealAtRisk = meddpiccMapped < 3;

  // V2 · Stakeholder health
  const sHealth = computeStakeholderHealth(contacts);
  const sMissing = missingRequiredRoles(contacts);

  function updateMeddpicc(field: keyof MEDDPICC, currentRating: 1 | 2 | 3 | 0) {
    const next: 1 | 2 | 3 = currentRating === 0 ? 1 : currentRating === 3 ? 1 : ((currentRating + 1) as 1 | 2 | 3);
    update((s) => ({
      ...s,
      opps: {
        ...s.opps,
        [id]: {
          ...(s.opps[id] || {}),
          meddpicc: {
            ...((s.opps[id] as Opportunity)?.meddpicc || {}),
            [field]: { rating: next },
          },
        },
      },
    }));
  }

  function toggleCadence(stepId: string) {
    update((s) => ({
      ...s,
      cadence: {
        ...s.cadence,
        [id]: {
          ...(s.cadence[id] || {}),
          [stepId]: s.cadence[id]?.[stepId] ? "" : today(),
        },
      },
    }));
  }

  function moveStage(stage: Stage) {
    update((s) => ({
      ...s,
      opps: { ...s.opps, [id]: { ...(s.opps[id] || {}), stage, daysInStage: 0 } },
    }));
  }

  function saveNote() {
    const finalNote = noteDraft || opp.note || "";
    update((s) => ({
      ...s,
      opps: { ...s.opps, [id]: { ...(s.opps[id] || {}), note: finalNote } },
    }));
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  }

  function updateContactStatus(contactName: string, newStatus: ContactStatus) {
    const updatedContacts = contacts.map((c) =>
      c.name === contactName ? { ...c, status: newStatus, contactedAt: newStatus !== "identified" ? today() : c.contactedAt } : c
    );
    update((s) => ({
      ...s,
      opps: { ...s.opps, [id]: { ...(s.opps[id] || {}), contacts: updatedContacts } },
    }));
  }

  // Star Map verification gate · prevents AI-surfaced drift by requiring manual verification
  function toggleVerifyContact(contactName: string) {
    const updatedContacts = contacts.map((c) =>
      c.name === contactName
        ? { ...c, verified: !c.verified, verifiedAt: !c.verified ? new Date().toISOString() : undefined }
        : c
    );
    update((s) => ({
      ...s,
      opps: { ...s.opps, [id]: { ...(s.opps[id] || {}), contacts: updatedContacts } },
    }));
  }

  // Threading Research Layer · pre-DM intel surface (4 sections)
  function updateResearch<K extends keyof import("@/lib/types").ThreadingResearch>(
    field: K,
    value: import("@/lib/types").ThreadingResearch[K]
  ) {
    update((s) => {
      const existing = (s.opps[id] as Opportunity | undefined)?.research || {};
      return {
        ...s,
        opps: {
          ...s.opps,
          [id]: {
            ...(s.opps[id] || {}),
            research: { ...existing, [field]: value, researchUpdatedAt: new Date().toISOString() },
          },
        },
      };
    });
  }

  const nextStage = STAGES.findIndex((s) => s.id === opp.stage);
  const nextStageDef = nextStage >= 0 && nextStage < STAGES.length - 2 ? STAGES[nextStage + 1] : null;

  // V2.3 · Launch Pack visible when the probe was Apply-approved with a role picked
  const applyUrl = opp.triage?.appliedToRoleUrl || opp.url;
  // Launch Pack renders when opp has applyUrl AND (triage-approved OR has verified contacts with DMs OR is in active applied/early/late stage)
  const hasReadyDMs = (opp.contacts || []).some((c) => !!c.dmDraft);
  const isActiveStage = ["applied", "early", "late", "offer"].includes(opp.stage);
  const showLaunchPack = !!applyUrl && (opp.triage?.status === "approved" || hasReadyDMs || isActiveStage);
  const hmContact = contacts.find((c) => c.role === "HM");
  const recruiterContact = contacts.find((c) => c.role === "GTM_RECRUITER");
  const peerContact = contacts.find((c) => c.role === "PEER");
  const dmContacts = [
    { label: "DM 1 · Hiring Manager", contact: hmContact, sendOrder: "After silent connect + 3-5 day pre-touch engagement" },
    { label: "DM 2 · Peer", contact: peerContact, sendOrder: "After silent connect accepted" },
    { label: "DM 3 · Recruiter", contact: recruiterContact, sendOrder: "Send immediately · talent partners don't need pre-touch" },
  ].filter((d) => d.contact && d.contact.dmDraft);

  function copyText(text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  }

  // V2.4 · auto-substitute [LOOM LINK] + [GAMMA LINK] with the global asset URLs
  const assets = state.globalAssets || {};
  function substituteAssets(text: string): string {
    let out = text;
    if (assets.loomUrl) out = out.replaceAll("[LOOM LINK]", assets.loomUrl);
    if (assets.gammaUrl) out = out.replaceAll("[GAMMA LINK]", assets.gammaUrl);
    return out;
  }
  function hasUnfilledPlaceholders(text: string): { loom: boolean; gamma: boolean } {
    return {
      loom: text.includes("[LOOM LINK]") && !assets.loomUrl,
      gamma: text.includes("[GAMMA LINK]") && !assets.gammaUrl,
    };
  }

  // V2.4 · HM follow-up template Variant B · direct, role-anchored, stat-led
  // Variant A is the warm "Thanks for connecting" draft (lives in seed dmDraft)
  // Variant B is the direct "I've applied for the [Role]" draft generated on the fly
  function generateVariantB(): string {
    const roleCharacteristic =
      opp.type === "SDR" || opp.type === "BDR" ? "high-activity and phone-first" :
      opp.type === "AE" ? "full-cycle and quota-carrying" :
      opp.type === "AM" || opp.type === "CSM" ? "relationship-driven and retention-focused" :
      opp.type === "BDM" ? "hunter-motion and territory-led" :
      "high-activity";
    return `I've applied for the ${opp.type} role in ${opp.location.split("·")[0].trim()} and I think I'm a strong fit for this specific role.

It's ${roleCharacteristic}, and [add one or two of your most relevant, quantified results here]. I also work with AI tools every day across my whole workflow, which I understand is exactly the bar your JD calls for.

Quick 90-second Loom on why I'd be a strong fit: ${assets.loomUrl || "[LOOM LINK]"}

I'm available for an immediate start, and I'd love 15 minutes any time that suits you to discuss the role.

Cheers,
[Your name]`;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted mb-4">
        <Link href="/pipeline" className="hover:text-accent">Launch Manifest</Link>
        <span>›</span>
        <span className="text-navy font-semibold">{opp.company}</span>
      </div>

      {/* ============================================================
          GROUP (a) · COMPANY / ROLE HERO + single primary Apply
          ============================================================ */}

      {/* HERO · Mission Header */}
      <div className="bg-gradient-to-br from-navy via-navy/95 to-accent/25 text-white rounded-2xl p-8 mb-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent/25 rounded-full blur-3xl -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl -ml-16 -mb-16" />
        <div className="relative">
          <div className="flex items-start justify-between gap-6 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap text-[10px] uppercase tracking-[1.5px] text-white/70 mb-3 font-semibold">
                <span className="inline-flex items-center gap-1.5">{stageDef?.icon} {stageDef?.label}</span>
                {opp.priority && <span className="px-2 py-0.5 bg-white/15 rounded-md">{opp.priority}</span>}
                {opp.pattern && <span className="px-2 py-0.5 bg-white/15 rounded-md">{PATTERN_ICONS[opp.pattern]} Pattern {opp.pattern}</span>}
              </div>
              <h1 className="display text-glow text-[38px] text-white leading-[1.08]">{opp.company}</h1>
              <p className="text-[16px] text-white/85 mt-1.5 leading-snug">{opp.position}</p>
              <p className="text-[12px] text-white/60 mt-1.5">{opp.type} · {opp.location}</p>
            </div>
            {scoreTotal !== null && opp.score && (
              <div className="text-right bg-white/10 border border-white/20 rounded-xl p-4 min-w-[140px] backdrop-blur-sm">
                <div className="text-[10px] uppercase tracking-[1.5px] text-white/70 font-semibold">V2 Score</div>
                <div className="text-[34px] font-bold leading-none mt-1">{scoreTotal}<span className="text-[16px] text-white/60 font-normal">/44</span></div>
                <div className="text-[10px] text-white/70 mt-2 font-mono">
                  V{opp.score.v} · L{opp.score.l} · R{opp.score.r} · C{opp.score.c}
                </div>
                <div className="text-[10px] text-white/70 mt-0.5 capitalize">eq: {opp.score.eq}</div>
              </div>
            )}
          </div>

          {/* Quick stats bar */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 border border-white/20 rounded-lg p-3.5 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[1.5px] text-white/60 font-semibold">Days in stage</div>
              <div className="text-[22px] font-bold mt-1 leading-none">{opp.daysInStage ?? 0}<span className="text-[12px] text-white/60 font-normal">d</span></div>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-lg p-3.5 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[1.5px] text-white/60 font-semibold">Thread health</div>
              <div className="text-[22px] font-bold mt-1 leading-none">{threadsSent}<span className="text-[12px] text-white/60 font-normal">/{threadsTotal} reached</span></div>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-lg p-3.5 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[1.5px] text-white/60 font-semibold">Cadence</div>
              <div className="text-[22px] font-bold mt-1 leading-none">{cadenceDone}<span className="text-[12px] text-white/60 font-normal">/6 ({cadencePct}%)</span></div>
            </div>
          </div>

          {opp.action && (
            <div className="mt-5 bg-accent/35 border border-accent/50 rounded-lg px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[1.5px] text-white/80 mb-1 font-semibold">Next action</div>
              <div className="text-[14px] font-semibold leading-snug">▶ {opp.action}</div>
            </div>
          )}
        </div>
      </div>

      {/* GROUP (a) continued · single primary Apply lives in the Launch Pack */}
      {/* V2.3 · LAUNCH PACK · single primary Apply button + Loom + 3 DMs · only when role is picked */}
      {showLaunchPack && (
        <div className="bg-gradient-to-br from-good/15 via-good/5 to-accent/10 border-2 border-good/40 rounded-2xl p-6 mb-6 shadow-md">
          <div className="flex items-baseline gap-2 mb-3 flex-wrap">
            <span className="text-2xl">🚀</span>
            <h2 className="text-[20px] font-bold text-navy">Launch Pack · ship today</h2>
            <span className="badge bg-good/20 text-good">APPLYING</span>
          </div>
          <p className="text-[13px] text-text-dim mb-4">
            Role picked. Pack drafted in your voice. Apply, then 3 DMs in send sequence below. Loom held until recruiter call books.
          </p>

          {/* BIG action buttons · Apply + Copy URL */}
          <div className="flex gap-3 mb-5 flex-wrap">
            <a
              href={applyUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 min-w-[200px] bg-good hover:bg-good/90 text-white text-center px-6 py-4 rounded-xl font-bold text-[16px] transition shadow-lg flex items-center justify-center gap-2"
            >
              🚀 Apply →
            </a>
            <button
              onClick={() => copyText(applyUrl || "")}
              className="px-5 py-4 bg-surface border-2 border-border hover:border-accent text-navy rounded-xl font-semibold text-[13px] transition whitespace-nowrap"
            >
              📋 Copy URL
            </button>
          </div>
          <div className="bg-surface/50 border border-border rounded-lg px-3 py-2 mb-5 text-[11px] font-mono text-cool break-all">
            {applyUrl}
          </div>

          {/* 3 DMs · the actual outreach payload */}
          {dmContacts.length > 0 && (
            <div className="space-y-3 mb-5">
              <div className="flex items-baseline gap-2">
                <h3 className="text-[14px] font-bold text-navy">📩 Send sequence · 2 messages per stakeholder · Day 0 connect + Day 5-7 follow-up</h3>
              </div>
              {dmContacts.map((d, i) => {
                const isHM = d.contact?.role === "HM";
                const variant = isHM ? (opp.hmTemplateVariant || "A") : "A";
                const rawDraft = isHM && variant === "B" ? generateVariantB() : (d.contact?.dmDraft || "");
                const displayText = substituteAssets(rawDraft);
                const placeholders = hasUnfilledPlaceholders(rawDraft);
                const isVerified = !!d.contact?.verified;
                const connectNote = d.contact?.connectNote || "";
                return (
                  <div key={i} className={`bg-surface rounded-lg p-4 border ${isVerified ? "border-good/30" : "border-warn/40"}`}>
                    <div className="flex items-baseline justify-between gap-2 mb-1 flex-wrap">
                      <div>
                        <span className="text-[12px] font-bold text-navy">{d.label}</span>
                        {d.contact?.name && (
                          <span className="text-[12px] text-text-dim ml-2">· {d.contact.name}</span>
                        )}
                        {isVerified ? (
                          <span className="ml-2 text-[10px] text-good font-bold">✓ verified</span>
                        ) : (
                          <span className="ml-2 text-[10px] text-warn font-bold">⚠ unverified · check LinkedIn before send</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted">follow-up: {rawDraft.length} chars{isHM ? ` · variant ${variant}` : ""}</span>
                    </div>
                    <p className="text-[10px] text-text-dim italic mb-2">{d.sendOrder}</p>

                    {/* HM Variant toggle */}
                    {isHM && (
                      <div className="flex gap-1 mb-2">
                        <button
                          onClick={() => update((s) => ({ ...s, opps: { ...s.opps, [id]: { ...(s.opps[id] || {}), hmTemplateVariant: "A" } } }))}
                          className={`text-[10px] px-2 py-1 rounded font-semibold transition ${variant === "A" ? "bg-accent text-white" : "bg-surface-2 text-muted hover:text-text"}`}
                        >
                          A · Warm (Thanks for connecting)
                        </button>
                        <button
                          onClick={() => update((s) => ({ ...s, opps: { ...s.opps, [id]: { ...(s.opps[id] || {}), hmTemplateVariant: "B" } } }))}
                          className={`text-[10px] px-2 py-1 rounded font-semibold transition ${variant === "B" ? "bg-accent text-white" : "bg-surface-2 text-muted hover:text-text"}`}
                        >
                          B · Direct (Applied + stats)
                        </button>
                      </div>
                    )}

                    {/* CONNECT NOTE (300 char Day 0) · separate from full follow-up DM */}
                    {connectNote && (
                      <div className="mb-3 border border-accent/30 bg-accent/5 rounded p-3">
                        <div className="flex items-baseline justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Day 0 · 300-char connect request</span>
                          <span className="text-[10px] text-muted">{connectNote.length} / 300</span>
                        </div>
                        <div className="bg-bg border border-border rounded p-2.5 text-[12.5px] text-navy leading-snug whitespace-pre-wrap">
                          {connectNote}
                        </div>
                        <button
                          onClick={() => copyText(connectNote)}
                          className="mt-2 text-[11px] px-3 py-1 bg-accent/10 hover:bg-accent/20 text-accent rounded font-semibold transition"
                        >
                          📋 Copy connect note
                        </button>
                      </div>
                    )}

                    {/* FULL FOLLOW-UP DM (Day 5-7 after acceptance) */}
                    <div className="border border-good/30 bg-good/5 rounded p-3">
                      <div className="flex items-baseline justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-good">Day 5-7 · full follow-up message (after connect accepted)</span>
                      </div>
                      <div className="bg-bg border border-border rounded p-3 text-[13px] text-navy leading-snug whitespace-pre-wrap">
                        {displayText}
                      </div>
                    </div>

                    {(placeholders.loom || placeholders.gamma) && (
                      <div className="mt-2 text-[11px] text-warn bg-warn/10 border border-warn/30 rounded px-2 py-1.5">
                        ⚠ Missing global asset{placeholders.loom && placeholders.gamma ? "s" : ""}: {placeholders.loom && "Loom URL"}{placeholders.loom && placeholders.gamma && " + "}{placeholders.gamma && "Gamma URL"}. Set on Mission Control before sending.
                      </div>
                    )}

                    <div className="flex gap-2 mt-2 flex-wrap">
                      <button
                        onClick={() => copyText(displayText)}
                        className="text-[11px] px-3 py-1.5 bg-good/10 hover:bg-good/20 text-good rounded font-semibold transition"
                      >
                        📋 Copy follow-up DM
                      </button>
                      {d.contact?.linkedin && (
                        <a
                          href={d.contact.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] px-3 py-1.5 bg-cool/10 hover:bg-cool/20 text-cool rounded font-semibold transition"
                        >
                          Open LinkedIn →
                        </a>
                      )}
                      {d.contact && (
                        <button
                          onClick={() => toggleVerifyContact(d.contact!.name)}
                          className={`text-[11px] px-3 py-1.5 rounded font-semibold transition ${isVerified ? "bg-good/15 text-good hover:bg-good/25" : "bg-warn/15 text-warn hover:bg-warn/25"}`}
                        >
                          {isVerified ? "✓ Verified" : "Mark verified"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Generic Volume Loom script · reusable across every HM follow-up · face-to-camera, no platform demo */}
          <details className="bg-surface border border-border rounded-lg group">
            <summary className="px-4 py-3 cursor-pointer flex items-baseline justify-between gap-2 flex-wrap">
              <div>
                <span className="text-[13px] font-bold text-navy">🎥 Generic Loom script · 80 sec · personal intro for volume mode</span>
              </div>
              <span className="text-[10px] text-muted group-open:hidden">Click to expand</span>
              <span className="text-[10px] text-muted hidden group-open:inline">Click to collapse</span>
            </summary>
            <div className="px-4 pb-4 text-[13px] text-navy leading-relaxed space-y-2">
              <p><strong>Volume mode asset.</strong> Reusable across every HM follow-up. Record once, send everywhere. Face-to-camera, no screen share, no product demo. Swap [first name] in the opening. Fill the italic beats below with your own story.</p>
              <p className="bg-bg border-l-4 border-accent px-3 py-2 italic">
                Hi [first name], [your name] here. Quick 90 seconds.
              </p>
              <p className="bg-bg border-l-4 border-good px-3 py-2 italic">
                [The short version of you: your most relevant roles and one or two quantified results.]
              </p>
              <p className="bg-bg border-l-4 border-good px-3 py-2 italic">
                What I want to lead with isn&apos;t a track record though. It&apos;s how I work.
              </p>
              <p className="bg-bg border-l-4 border-good px-3 py-2 italic">
                [How you work: the tools, habits, or approach that make you different. Land your one true differentiator here.]
              </p>
              <p className="bg-bg border-l-4 border-good px-3 py-2 italic">
                That&apos;s what I&apos;d love to bring to your team. Whether it&apos;s prospecting, qualification, or learning a new vertical from scratch, the prep is faster and the thinking is sharper.
              </p>
              <p className="bg-bg border-l-4 border-accent px-3 py-2 italic">
                If you&apos;ve got 15 minutes this week, I&apos;d love to walk you through how I&apos;d ramp in the role. Coffee or Zoom, your call. Thanks for the time, chat soon.
              </p>
              <div className="text-[11px] text-text-dim pt-2 border-t border-border mt-3">
                <strong>Recording notes:</strong> Face-to-camera the whole way. Steady eye contact. Land your differentiator with conviction. Don&apos;t name a company in the Loom · stays generic for reuse. ~220 words at 165 wpm = 80 sec.
              </div>
            </div>
          </details>
        </div>
      )}

      {/* ============================================================
          GROUP (b) · ASSESS · Mission Compass
          ============================================================ */}
      <h2 className="text-[11px] font-mono uppercase tracking-[2px] text-muted mb-3 mt-10">Assess</h2>
      <MissionCompassCard opp={opp} state={state} update={update} />

      {/* ============================================================
          GROUP (c) · PREP · Interview Prep
          ============================================================ */}
      <h2 className="text-[11px] font-mono uppercase tracking-[2px] text-muted mb-3 mt-10">Prep</h2>
      <InterviewPrepCard opp={opp} state={state} update={update} />

      {/* ============================================================
          GROUP (d) · THREADING & STAKEHOLDERS
          Star Map + MEDDPICC (primary) · Multi-thread + Research Brief +
          Credential Layer (collapsed, secondary) · Contact Roster + refs
          ============================================================ */}
      <h2 className="text-[11px] font-mono uppercase tracking-[2px] text-muted mb-3 mt-10">Threading &amp; Stakeholders</h2>

      {/* OPERATOR PLAYBOOK STATUS · stakeholder health + MEDDPICC qualification depth */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stakeholder Health Card */}
        <div className={`p-4 rounded-xl border ${
          sHealth === "complete" ? "bg-good/5 border-good/30" :
          sHealth === "partial" ? "bg-accent/5 border-accent/30" :
          sHealth === "single-thread" ? "bg-warn/5 border-warn/30" :
          "bg-hot/5 border-hot/30"
        }`}>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[10px] text-muted uppercase tracking-wider font-bold">
              ⭐ Star Map · stakeholder health
            </div>
            <Link href="/threads" className="text-[10px] text-accent hover:underline">View →</Link>
          </div>
          <div className={`text-lg font-bold mb-1 ${
            sHealth === "complete" ? "text-good" :
            sHealth === "partial" ? "text-accent" :
            sHealth === "single-thread" ? "text-warn" :
            "text-hot"
          }`}>
            {healthLabel(sHealth)}
          </div>
          {sMissing.length > 0 ? (
            <div className="text-xs text-text-dim">
              Need: {sMissing.map((m) => m.label).join(" + ")}
            </div>
          ) : (
            <div className="text-xs text-text-dim">All 3 required roles engaged</div>
          )}
        </div>

        {/* MEDDPICC Card */}
        <div className={`p-4 rounded-xl border ${
          dealAtRisk ? "bg-warn/5 border-warn/30" : "bg-good/5 border-good/30"
        }`}>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[10px] text-muted uppercase tracking-wider font-bold">
              🎯 MEDDPICC · qualification depth
            </div>
            <div className="text-[10px] text-muted">{meddpiccTotalPoints}/21 pts</div>
          </div>
          <div className={`text-lg font-bold mb-2 ${dealAtRisk ? "text-warn" : "text-good"}`}>
            {meddpiccSolid} solid · {meddpiccMapped} mapped of 7
            {dealAtRisk && <span className="ml-2 text-xs">· Deal at risk</span>}
          </div>
          <div className="flex gap-1 flex-wrap">
            {MEDDPICC_FIELDS.map((f, i) => {
              const r = meddpiccRatings[i];
              return (
                <button
                  key={`${f.key}-${i}`}
                  onClick={() => updateMeddpicc(f.key, r as 0 | 1 | 2 | 3)}
                  title={`${f.label} · ${f.question} · click to toggle (1→2→3)`}
                  className={`w-7 h-7 rounded text-[11px] font-bold flex items-center justify-center transition ${
                    r === 3 ? "bg-good text-white" :
                    r === 2 ? "bg-accent text-white" :
                    r === 1 ? "bg-warn/30 text-warn border border-warn/40" :
                    "bg-surface-2 text-muted border border-border hover:border-accent"
                  }`}
                >
                  {f.letter}
                </button>
              );
            })}
          </div>
          <div className="text-[10px] text-text-dim mt-2">Click a letter to cycle rating · 0 unmapped → 1 partial → 2 mapped → 3 solid</div>
        </div>
      </div>

      {/* Auto star map · role-mapped stakeholder scaffold (deterministic) */}
      <div className="mb-4">
        <StarMapBuilder
          id={id}
          company={opp.company}
          roleType={opp.triage?.availableRoles?.[0]?.type || opp.position || ""}
          contacts={contacts}
          update={update}
        />
      </div>

      {/* CONTACTS · Detail list with inline status update */}
      <div className="card mb-4">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>👥</span> Contact Roster · {contacts.length} on board
        </h2>
        {contacts.length === 0 ? (
          <p className="text-sm text-text-dim">No contacts mapped. Use the Briefing Lab to start researching.</p>
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => (
              <div key={c.name} className="flex items-center gap-3 p-3 bg-surface-2 border border-border rounded-lg">
                <div className={`px-2 py-1 rounded text-[10px] font-semibold ${STATUS_COLOR[c.status]}`}>
                  {STATUS_LABEL[c.status]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-xs text-text-dim">{c.title || c.role.replace("_", " ")}</div>
                  {c.notes && <div className="text-[11px] text-muted italic mt-0.5">{c.notes}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={c.status}
                    onChange={(e) => updateContactStatus(c.name, e.target.value as ContactStatus)}
                    className="text-[11px] bg-surface border border-border rounded px-2 py-1"
                  >
                    {(Object.keys(STATUS_LABEL) as ContactStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  {c.linkedin && (
                    <a href={c.linkedin} target="_blank" rel="noreferrer" className="text-xs text-navy hover:underline whitespace-nowrap">
                      LinkedIn ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MULTI-THREAD SYSTEM · Solar System · collapsed by default (secondary) */}
      <details className="mb-4 bg-surface border border-border rounded-xl group">
        <summary className="px-5 py-4 cursor-pointer flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>🌌</span> Multi-thread System
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{threadPct}% reached</span>
            <span className="text-[10px] text-muted group-open:hidden">Click to expand</span>
            <span className="text-[10px] text-muted hidden group-open:inline">Click to collapse</span>
          </div>
        </summary>
        <div className="px-5 pb-5">
          {contacts.length === 0 ? (
            <div className="text-center py-12 text-sm text-text-dim">
              <div className="text-4xl mb-2 opacity-40">🪐</div>
              No contacts mapped yet.
              <div className="text-xs mt-1">Add APAC AE → Recruiter → Peer to populate orbits.</div>
            </div>
          ) : (
            <SolarSystem company={opp.company} contacts={contacts} size="md" />
          )}
          <div className="flex gap-2 flex-wrap text-[10px] mt-3 justify-center pt-3 border-t border-border">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted opacity-50" />Identified</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-navy" />Silent</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" />DM sent</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-good" />Replied</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-hot opacity-60" />Cold</span>
          </div>
        </div>
      </details>

      {/* THREADING RESEARCH BRIEF · the pre-DM intel surface · collapsed by default */}
      <details className="mb-4 bg-surface border border-border rounded-xl group">
        <summary className="px-5 py-4 cursor-pointer flex items-baseline justify-between gap-2 flex-wrap">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[15px]">🔬</span>
            <span className="text-[15px] font-bold text-navy">Threading Research Brief</span>
            {opp.research?.researchUpdatedAt && (
              <span className="text-[10px] text-good">✓ researched {new Date(opp.research.researchUpdatedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
            )}
            {!opp.research?.researchUpdatedAt && (
              <span className="text-[10px] text-warn">unresearched · DM hooks will be generic</span>
            )}
          </div>
          <span className="text-[10px] text-muted group-open:hidden">Click to expand</span>
          <span className="text-[10px] text-muted hidden group-open:inline">Click to collapse</span>
        </summary>
        <div className="px-5 pb-5 space-y-4">
          <p className="text-[12px] text-text-dim">
            Four-step research surface per the 3-stakeholder threading framework. Feeds DM scroll-stop openers, cover letter hooks, and per-stakeholder personalisation lines.
          </p>

          {/* 1. Company overview */}
          <div>
            <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">1. Company overview</label>
            <p className="text-[10px] text-muted italic mb-1">One paragraph from web research: what they do, who they sell to, current stage.</p>
            <textarea
              value={opp.research?.companyOverview || ""}
              onChange={(e) => updateResearch("companyOverview", e.target.value)}
              placeholder="e.g. Example Corp is a data infrastructure company extending into an AI platform. Public, growing revenue year over year. Sells to enterprise data teams. Marquee logos include several Fortune 500 brands."
              rows={3}
              className="w-full text-[12px] px-3 py-2 border border-border rounded bg-bg text-navy"
            />
          </div>

          {/* 2. Recent commercial signals · public earnings vs private funding */}
          <div>
            <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">2. Recent commercial signals</label>
            <p className="text-[10px] text-muted italic mb-1">If public: most recent earnings highlights. If private: latest funding round, leadership podcast, TechCrunch coverage.</p>
            <textarea
              value={opp.research?.signalsContent || ""}
              onChange={(e) => updateResearch("signalsContent", e.target.value)}
              placeholder="e.g. Latest earnings: strong product revenue growth, high net revenue retention, AI usage up several times quarter-over-quarter. APJ team grew 40% in 12 months."
              rows={3}
              className="w-full text-[12px] px-3 py-2 border border-border rounded bg-bg text-navy"
            />
          </div>

          {/* 3. Press releases / 30-day announcements */}
          <div>
            <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">3. Press releases · last 30 days</label>
            <p className="text-[10px] text-muted italic mb-1">Hook material for DM openers. Last 7 days = urgent, last 30 = relevant context.</p>
            <textarea
              value={opp.research?.recentNews?.[0]?.headline || ""}
              onChange={(e) => updateResearch("recentNews", e.target.value ? [{ date: new Date().toISOString(), headline: e.target.value }] : [])}
              placeholder="e.g. Last week: announced a major product partnership. Earlier this month: expanded their local office."
              rows={2}
              className="w-full text-[12px] px-3 py-2 border border-border rounded bg-bg text-navy"
            />
          </div>

          {/* 4. Per-stakeholder personal hooks · one per contact */}
          <div>
            <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">4. Per-stakeholder hooks</label>
            <p className="text-[10px] text-muted italic mb-2">One line per contact: recent post URL, personal fact, mutual connection, location signal, or a shared-interest hook.</p>
            <div className="space-y-2">
              {contacts.filter((c) => ["HM", "GTM_RECRUITER", "PEER"].includes(c.role)).map((c) => (
                <div key={c.name} className="bg-bg border border-border rounded p-2">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[11px] font-bold text-navy">{c.name}</span>
                    <span className="text-[10px] text-muted">{c.role.replace("GTM_RECRUITER", "Recruiter")}</span>
                  </div>
                  <input
                    type="text"
                    value={c.personalHook || ""}
                    onChange={(e) => {
                      const updatedContacts = contacts.map((x) => x.name === c.name ? { ...x, personalHook: e.target.value } : x);
                      update((s) => ({ ...s, opps: { ...s.opps, [id]: { ...(s.opps[id] || {}), contacts: updatedContacts } } }));
                    }}
                    placeholder="e.g. Posted last week about scaling SDR teams from 5 to 50. Based in your city. Mutual connection: [name]."
                    className="w-full text-[11px] px-2 py-1 border border-border rounded bg-surface text-navy"
                  />
                </div>
              ))}
              {contacts.filter((c) => ["HM", "GTM_RECRUITER", "PEER"].includes(c.role)).length === 0 && (
                <p className="text-[11px] text-text-dim italic">No HM / Recruiter / Peer contacts yet · add to Star Map first.</p>
              )}
            </div>
          </div>

          {/* Scroll-stop opener · the line that becomes the HM DM hook */}
          <div className="bg-accent/5 border border-accent/30 rounded-lg p-3">
            <label className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-1">⭐ Scroll-stop opener for HM DM</label>
            <p className="text-[10px] text-muted italic mb-1">The one specific JD-or-company observation that opens the HM follow-up DM. Drafted from the research above.</p>
            <input
              type="text"
              value={opp.research?.scrollStopOpener || ""}
              onChange={(e) => updateResearch("scrollStopOpener", e.target.value)}
              placeholder="e.g. The AI-native thinker line in your JD is the reason I'm here."
              className="w-full text-[12px] px-3 py-2 border border-accent/30 rounded bg-surface text-navy font-medium"
            />
          </div>
        </div>
      </details>

      {/* CREDENTIAL LAYER · always-on proof · collapsed by default (secondary) */}
      <details className="mb-4 bg-gradient-to-r from-surface-2 to-surface border border-border rounded-xl group">
        <summary className="px-4 py-3 cursor-pointer flex items-baseline justify-between gap-2 flex-wrap">
          <span className="text-[10px] text-muted uppercase tracking-wider font-bold">Your credential layer (always-on)</span>
          <span className="text-[10px] text-muted group-open:hidden">Click to expand</span>
          <span className="text-[10px] text-muted hidden group-open:inline">Click to collapse</span>
        </summary>
        <div className="px-4 pb-4">
          <p className="text-[11px] text-text-dim">Add your own quantified wins and marquee logos here so they stay visible during interview demos.</p>
        </div>
      </details>

      {/* REFERENCE STATUS */}
      {opp.reference && (
        <div className="card mb-4">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span>📞</span> Reference Activation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-[10px] text-muted uppercase tracking-wider">Status</div>
              <div className={`font-semibold ${opp.reference.briefed ? "text-good" : "text-warn"}`}>
                {opp.reference.briefed ? "✓ Briefed" : "⚠ Not briefed"}
              </div>
            </div>
            {opp.reference.briefedAt && (
              <div>
                <div className="text-[10px] text-muted uppercase tracking-wider">Briefed</div>
                <div>{opp.reference.briefedAt}</div>
              </div>
            )}
            {opp.reference.expectedCallWindow && (
              <div>
                <div className="text-[10px] text-muted uppercase tracking-wider">Call window</div>
                <div>{opp.reference.expectedCallWindow}</div>
              </div>
            )}
            <div>
              <div className="text-[10px] text-muted uppercase tracking-wider">Outcome</div>
              <div className="capitalize">{opp.reference.outcome || "pending"}</div>
            </div>
          </div>
          {opp.reference.notes && (
            <div className="mt-3 text-[11px] text-text-dim italic bg-surface-3 p-2 rounded">
              {opp.reference.notes}
            </div>
          )}
        </div>
      )}

      {/* HM / NOTE meta */}
      {(opp.hm || opp.note) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {opp.hm && (
            <div className="bg-surface-2 border border-border rounded-lg p-4">
              <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Hiring Manager / Primary Thread</div>
              <div className="text-sm font-semibold">{opp.hm}</div>
            </div>
          )}
          {opp.loom !== undefined && (
            <div className="bg-surface-2 border border-border rounded-lg p-4">
              <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Loom status</div>
              <div className={`text-sm font-semibold ${opp.loom ? "text-good" : "text-warn"}`}>
                {opp.loom ? "✓ Loom sent" : "○ No Loom yet"}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          GROUP (e) · MISSION CADENCE
          ============================================================ */}
      <h2 className="text-[11px] font-mono uppercase tracking-[2px] text-muted mb-3 mt-10">Mission Cadence</h2>
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>📊</span> Mission Cadence
          </h2>
          <div className="text-xs text-muted">{cadenceDone}/6 complete</div>
        </div>
        <div className="progress-track mb-4">
          <div className="progress-fill" style={{ width: `${cadencePct}%` }} />
        </div>
        <div className="space-y-2">
          {CADENCE_STEPS.map((step, i) => {
            const doneDate = oppCadence[step.id];
            const done = !!doneDate;
            return (
              <div
                key={step.id}
                onClick={() => toggleCadence(step.id)}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${
                  done ? "bg-good/10 border-good/40" : "bg-surface-2 border-border hover:border-border-strong"
                }`}
              >
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  done ? "bg-good text-white border-good" : "bg-surface border-border text-muted"
                }`}>
                  {done ? "✓" : i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{step.icon}</span>
                    <span className="text-sm font-semibold">{step.label}</span>
                  </div>
                  <div className="text-[11px] text-text-dim mt-0.5">{step.desc}</div>
                  {done && <div className="text-[10px] text-good mt-1">✓ {doneDate}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          GROUP (f) · TOOLS · compact row
          ============================================================ */}
      <h2 className="text-[11px] font-mono uppercase tracking-[2px] text-muted mb-3 mt-10">Tools</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <Link href={`/briefing?opp=${id}`} className="bg-surface-2 border border-border rounded-lg p-3 text-center hover:border-accent hover:bg-surface-3 transition">
          <div className="text-xl mb-1">🎯</div>
          <div className="text-xs font-semibold">Briefing Lab</div>
          <div className="text-[10px] text-muted">DM · Loom · Cover</div>
        </Link>
        <Link href={`/cv?opp=${id}`} className="bg-surface-2 border border-border rounded-lg p-3 text-center hover:border-accent hover:bg-surface-3 transition">
          <div className="text-xl mb-1">📄</div>
          <div className="text-xs font-semibold">CV Analyser</div>
          <div className="text-[10px] text-muted">Tailor for this JD</div>
        </Link>
        <Link href={`/coach?opp=${id}`} className="bg-surface-2 border border-border rounded-lg p-3 text-center hover:border-accent hover:bg-surface-3 transition">
          <div className="text-xl mb-1">🤖</div>
          <div className="text-xs font-semibold">Co-Pilot</div>
          <div className="text-[10px] text-muted">Ask Claude w/ context</div>
        </Link>
        {opp.url ? (
          <a href={opp.url} target="_blank" rel="noreferrer" className="bg-surface-2 border border-border rounded-lg p-3 text-center hover:border-accent hover:bg-surface-3 transition">
            <div className="text-xl mb-1">🔗</div>
            <div className="text-xs font-semibold">Job Posting</div>
            <div className="text-[10px] text-muted">Open ATS</div>
          </a>
        ) : (
          <div className="bg-surface border border-border rounded-lg p-3 text-center opacity-50">
            <div className="text-xl mb-1">🔗</div>
            <div className="text-xs font-semibold">No URL set</div>
          </div>
        )}
      </div>

      {/* ============================================================
          GROUP (g) · ADMIN · Time invested · Notes · Move Stage
          ============================================================ */}
      <h2 className="text-[11px] font-mono uppercase tracking-[2px] text-muted mb-3 mt-10">Admin</h2>

      {/* TIME INVESTED · velocity discipline tracker */}
      {(opp.hoursSpent !== undefined || (opp.timestamps && opp.timestamps.length > 0)) && (
        <div className="mb-4 p-4 bg-surface border border-border rounded-xl">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <div>
              <div className="text-[10px] text-muted uppercase tracking-wider font-bold mb-1">⏱ Time invested</div>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-accent">
                  {opp.hoursSpent ?? 0}<span className="text-sm text-muted"> hrs</span>
                </div>
                {opp.patternType && (
                  <span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider ${
                    opp.patternType === "first"
                      ? "bg-warn/15 text-warn"
                      : "bg-good/15 text-good"
                  }`}>
                    {opp.patternType === "first" ? "🔨 First-of-pattern" : "♻️ Framework reuse"}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right text-[11px] text-muted max-w-[280px]">
              <strong>Velocity target:</strong> ≤2 hrs for reuse · 3-5 hrs for first-of-pattern · 80%-quality shipped beats 95%-quality polished
            </div>
          </div>

          {opp.timestamps && opp.timestamps.length > 0 && (
            <div className="border-t border-border pt-3">
              <div className="text-[10px] text-muted uppercase tracking-wider mb-2">Event log</div>
              <div className="space-y-1.5">
                {opp.timestamps.map((ts, i) => (
                  <div key={i} className="flex items-start gap-3 text-[12px]">
                    <div className="flex-shrink-0 w-12 text-right text-muted font-mono">
                      {ts.hours ? `+${ts.hours}h` : ""}
                    </div>
                    <div className="flex-shrink-0 w-6 text-center text-accent">→</div>
                    <div className="flex-1">
                      <span className="font-semibold text-navy">{ts.event}</span>
                      <span className="text-muted text-[11px]"> · {ts.date}</span>
                      {ts.note && <div className="text-text-dim text-[11px] mt-0.5">{ts.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* NOTES · Editable */}
      <div className="card mb-4">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <span>📝</span> Mission Notes
        </h2>
        <textarea
          value={noteDraft !== "" ? noteDraft : opp.note || ""}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Research notes, talking points, things you learned about the company, founder thesis, ICP, USP..."
          className="w-full min-h-[120px] p-3 bg-surface-2 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
        />
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={saveNote}
            className="text-xs px-3 py-1.5 bg-accent text-white rounded hover:bg-accent/90 font-semibold"
          >
            Save notes
          </button>
          {savedNote && <span className="text-xs text-good">✓ Saved</span>}
        </div>
      </div>

      {/* STAGE CONTROLS */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>🚀</span> Move Mission Stage
        </h2>
        <div className="text-xs text-muted mb-3">
          Currently: <strong className="text-navy">{stageDef?.icon} {stageDef?.label}</strong>
          {nextStageDef && <> · Next: <strong className="text-accent">{nextStageDef.icon} {nextStageDef.label}</strong></>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => moveStage(s.id as Stage)}
              disabled={s.id === opp.stage}
              className={`text-xs px-3 py-2 rounded border ${
                s.id === opp.stage
                  ? "bg-accent text-white border-accent cursor-default"
                  : "bg-surface-2 border-border hover:border-accent hover:bg-surface-3"
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
