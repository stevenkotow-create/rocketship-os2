"use client";

import { useState } from "react";
import { PageHero } from "@/components/PageHero";

type TabId = "strategy" | "posts" | "vault" | "calendar" | "analytics";

type StarterPost = { id: string; title: string; pillar: string; body: string; status: string };

// Add your own pre-drafted starter posts here.
const STARTER_POSTS: StarterPost[] = [];

const CONTENT_PILLARS = [
  { id: "operator", name: "AI-Native Operator", desc: "Posts about building things, AI workflows, and how you use AI daily", color: "accent" },
  { id: "founder", name: "Founder / Operator DNA", desc: "Ownership lessons, P&L reality, an operator's perspective on sales", color: "navy" },
  { id: "sales", name: "Sales tactics & frameworks", desc: "Outreach templates, multi-threading, and your own sales methodology", color: "gold" },
  { id: "variety", name: "Your background", desc: "The varied path that shaped you. Path-not-detour storytelling.", color: "purple" },
  { id: "ai-thesis", name: "AI as empowerment", desc: "What AI actually does for people, businesses, sales. Not buzzword takes.", color: "cool" },
  { id: "vulnerable", name: "Hard lessons", desc: "What you learned from setbacks (without naming names). Capture & move on.", color: "hot" },
];

type VaultTopic = { topic: string; pillar: string; angle: string };

// Add topics you can authentically write about. Each can become 2-3 posts.
const VAULT_TOPICS: VaultTopic[] = [];

const WEEKLY_CADENCE = [
  { day: "Mon", type: "Frame post", desc: "Strategic insight or contrarian take from the week. Sets the conversation." },
  { day: "Tue", type: "(rest)", desc: "" },
  { day: "Wed", type: "Operator post", desc: "Something specific you built, shipped, learned, observed. Proof of craft." },
  { day: "Thu", type: "(rest)", desc: "" },
  { day: "Fri", type: "Network post", desc: "Celebrate someone, surface a market signal, reciprocate. Builds the network in public." },
  { day: "Sat", type: "(rest)", desc: "" },
  { day: "Sun", type: "(plan)", desc: "Plan next week's 3 posts. Draft if energy. Schedule in LinkedIn." },
];

const GROWTH_TACTICS = [
  { id: "engage-first", title: "Engage-before-post", desc: "Spend 15 min commenting on 5-10 posts BEFORE publishing your own. Your post lands in feeds you've recently warmed." },
  { id: "specific-people", title: "Tag specific people, not generic '@everyone'", desc: "1-2 named tags per post if relevant. Drives notification + their network sees it." },
  { id: "hook-first-line", title: "First line must earn the click", desc: "LinkedIn truncates after ~210 chars. Your first line must make people click 'see more'. Specific number, contrarian take, or specific story beats." },
  { id: "personal-story", title: "Lead with personal story, end with framework", desc: "Story hooks. Frameworks save. The two together compound — readers feel seen AND learn something." },
  { id: "consistent-cadence", title: "Consistency > virality", desc: "3 posts/week for 12 weeks beats 1 viral post that gets 100K impressions but no follow-through." },
  { id: "respond-to-comments", title: "Respond to every comment within 4 hours", desc: "LinkedIn algorithm boosts posts with high comment engagement. Your replies trigger that loop." },
  { id: "no-links", title: "No links in the post body", desc: "LinkedIn deprioritises posts with external links. Put any link in the first comment instead." },
  { id: "carousel-power", title: "Carousels for frameworks, text for stories", desc: "Image carousels get 3x reach for educational content. Text posts win for personal stories." },
];

const TARGET_METRICS = [
  { metric: "Followers", current: "?", target: "1000", framing: "12-week target" },
  { metric: "Profile views/week", current: "?", target: "100", framing: "weekly cadence baseline" },
  { metric: "Post impressions avg", current: "?", target: "5000", framing: "per post by week 6" },
  { metric: "Connection requests inbound", current: "?", target: "10/week", framing: "signal you're being found" },
  { metric: "Comments per post avg", current: "?", target: "15", framing: "engagement health" },
  { metric: "DM intros from posts", current: "?", target: "2/week", framing: "the actual ROI metric" },
];

export default function PersonalBrand() {
  const [tab, setTab] = useState<TabId>("strategy");

  return (
    <div>
      <PageHero eyebrow="Playbook" title="Personal Brand · LinkedIn Growth" subtitle="Build the AI-native operator brand in public while job-searching. Inbound DMs > outbound spray." marker="PB.01" />

      {/* Tab nav */}
      <div className="flex gap-2 mb-5 border-b border-border">
        {[
          { id: "strategy" as const, label: "Strategy" },
          { id: "posts" as const, label: "Posts" },
          { id: "vault" as const, label: "Content Vault" },
          { id: "calendar" as const, label: "Cadence" },
          { id: "analytics" as const, label: "Targets" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${tab === t.id ? "border-accent text-accent" : "border-transparent text-text-dim hover:text-text"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* STRATEGY TAB */}
      {tab === "strategy" && (
        <div>
          <div className="card !border-accent bg-gradient-to-br from-surface to-surface-2 mb-5">
            <h3 className="text-base font-semibold text-accent mt-0 mb-2">The thesis</h3>
            <p className="text-sm leading-relaxed">
              Most candidates in a job search are <em>invisible</em>. HMs Google them and find nothing — or worse, a LinkedIn profile with a 2017 headline.
            </p>
            <p className="text-sm leading-relaxed mt-2">
              Build a brand in public DURING the search and the math flips: HMs find substance, peers DM you about roles, recruiters reach OUT. The same 90 minutes/week that builds inbound is also the proof-of-craft for any role you&apos;re pursuing.
            </p>
            <p className="text-sm leading-relaxed mt-2 text-accent font-semibold">
              Inbound DMs &gt; outbound spray. Always.
            </p>
          </div>

          <h2 className="text-xl font-semibold mt-7 mb-4">Content Pillars · what you post about</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CONTENT_PILLARS.map((p) => (
              <div key={p.id} className={`card !border-${p.color}/40`}>
                <h3 className={`text-base font-semibold mt-0 mb-1 text-${p.color}`}>{p.name}</h3>
                <p className="text-sm text-text-dim">{p.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-semibold mt-7 mb-4">Growth tactics · the playbook</h2>
          <div className="space-y-2">
            {GROWTH_TACTICS.map((g, i) => (
              <div key={g.id} className="card">
                <h3 className="text-sm font-semibold mt-0 mb-1"><span className="text-muted">{i + 1}.</span> {g.title}</h3>
                <p className="text-sm text-text-dim">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POSTS TAB */}
      {tab === "posts" && (
        <div>
          <div className="card !border-accent mb-4">
            <h3 className="text-base font-semibold text-accent mt-0 mb-2">Ready to publish</h3>
            <p className="text-sm text-text-dim">Draft your own starter posts here. Pick one, edit, post. Or use the Vault to spin up new drafts.</p>
          </div>
          {STARTER_POSTS.length === 0 && (
            <div className="card text-center py-10">
              <p className="text-2xl mb-2">✍️</p>
              <p className="text-sm text-text-dim">No posts yet.</p>
              <p className="text-xs text-muted mt-1">Add drafts to the STARTER_POSTS list to see them here.</p>
            </div>
          )}
          <div className="space-y-3">
            {STARTER_POSTS.map((post) => (
              <div key={post.id} className="card">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold mt-0 mb-1">{post.title}</h3>
                    <span className="badge bg-navy/15 text-navy">{post.pillar}</span>
                    <span className="badge bg-warn/15 text-warn ml-1">{post.status}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(post.body);
                    }}
                    className="text-xs px-3 py-1.5 border border-border rounded-md hover:border-accent"
                  >
                    Copy
                  </button>
                </div>
                <div className="bg-surface-2 border border-border rounded-md p-4 text-sm leading-relaxed whitespace-pre-line">{post.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VAULT TAB */}
      {tab === "vault" && (
        <div>
          <div className="card !border-accent mb-4">
            <h3 className="text-base font-semibold text-accent mt-0 mb-2">Topics you can authentically write about</h3>
            <p className="text-sm text-text-dim">Each could become 2-3 posts. Pick a topic, build a Claude prompt to draft 3 angles on it, copy + open Claude.ai.</p>
          </div>
          {VAULT_TOPICS.length === 0 && (
            <div className="card text-center py-10 mb-3">
              <p className="text-2xl mb-2">🗂️</p>
              <p className="text-sm text-text-dim">No topics yet.</p>
              <p className="text-xs text-muted mt-1">Add topics to the VAULT_TOPICS list to generate post drafts.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VAULT_TOPICS.map((v) => (
              <div key={v.topic} className="card">
                <h3 className="text-sm font-semibold mt-0 mb-1">{v.topic}</h3>
                <span className="badge bg-accent/15 text-accent mb-2">{v.pillar}</span>
                <p className="text-xs text-text-dim mt-2">{v.angle}</p>
                <button
                  onClick={() => {
                    const prompt = `Help me draft 3 LinkedIn post angles on this topic:\n\nTopic: ${v.topic}\nPillar: ${v.pillar}\nMy angle: ${v.angle}\n\nVoice rules:\n- Specific not generic\n- First-line hook that earns the click (truncated at ~210 chars)\n- Personal story → framework conclusion\n- 150-250 words ideal\n- No fabricated claims (draw only on my real, verifiable background)\n\nMy verified credentials:\n- [Add your own roles, results, and background here so the drafts stay true to you]\n\nOutput 3 distinct angles, each as a full post-ready draft.`;
                    navigator.clipboard.writeText(prompt);
                    window.open("https://claude.ai/new", "_blank");
                  }}
                  className="mt-3 text-[11px] px-3 py-1.5 bg-accent text-white rounded-md hover:bg-accent-2"
                >
                  Build draft prompt → Claude.ai
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CALENDAR TAB */}
      {tab === "calendar" && (
        <div>
          <div className="card !border-accent mb-4">
            <h3 className="text-base font-semibold text-accent mt-0 mb-2">Weekly cadence · 3 posts/week</h3>
            <p className="text-sm text-text-dim">Sustainable rhythm that compounds without burnout. Mon-Wed-Fri rotation. Sunday plans the next week.</p>
          </div>
          <div className="space-y-2">
            {WEEKLY_CADENCE.map((d) => {
              const isRest = d.type.includes("rest") || d.type.includes("plan");
              return (
                <div key={d.day} className={`flex items-center gap-4 p-4 bg-surface border rounded-lg ${isRest ? "border-border opacity-60" : "border-border"}`}>
                  <div className="w-12 text-center">
                    <div className="text-xs text-muted uppercase tracking-wider">{d.day}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{d.type}</div>
                    {d.desc && <div className="text-xs text-text-dim mt-1">{d.desc}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {tab === "analytics" && (
        <div>
          <div className="card !border-accent mb-4">
            <h3 className="text-base font-semibold text-accent mt-0 mb-2">12-week growth targets</h3>
            <p className="text-sm text-text-dim">Update manually each week from your LinkedIn analytics. The DM-intros-from-posts metric is the real ROI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TARGET_METRICS.map((m) => (
              <div key={m.metric} className="card">
                <h3 className="text-sm font-semibold mt-0 mb-2 text-navy">{m.metric}</h3>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[11px] text-muted uppercase tracking-wider">Current</div>
                    <div className="text-2xl font-bold">{m.current}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-muted uppercase tracking-wider">Target</div>
                    <div className="text-2xl font-bold text-accent">{m.target}</div>
                  </div>
                </div>
                <div className="text-[10px] text-muted mt-2">{m.framing}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card mt-6 !border-warn">
        <h3 className="text-base font-semibold mt-0 mb-2 text-warn">📥 Make it yours</h3>
        <p className="text-sm text-text-dim">
          The scaffold here is a starting point, not the final state. Add your own content pillars, starter posts, and vault topics to the arrays at the top of this page to tailor it to your brand.
        </p>
      </div>
    </div>
  );
}
