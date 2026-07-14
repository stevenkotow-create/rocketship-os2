"use client";

// V4 · Constellation · coming-soon hero · the visual relationship graph showcase
// Static SVG mock with the user's network seed contacts as nodes, lines connecting them.
// Becomes the live force-directed graph in V2.x (per project_future_state_constellation_graph memory).

import { useMemo } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/storage";
import { Sparkle, Constellation as ConstellationIcon, NavIcon } from "@/components/icons";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  type: "you" | "warm" | "target" | "stake";
  size: number;
}

interface Edge {
  from: string;
  to: string;
  strength: "strong" | "medium" | "weak";
}

export default function ConstellationPage() {
  const [state] = useAppState();

  // Build the static showcase graph from real data + placeholder cluster shape
  const { nodes, edges, clusters } = useMemo(() => {
    const networkSeed = state.networkSeed || [];

    // Centre node · the user
    const nodes: Node[] = [{ id: "you", x: 400, y: 300, label: "You", type: "you", size: 8 }];
    const edges: Edge[] = [];

    // First orbit · warm contacts from networkSeed
    const seedCount = Math.min(networkSeed.length, 5);
    networkSeed.slice(0, seedCount).forEach((c, i) => {
      const angle = (i / Math.max(seedCount, 1)) * Math.PI * 2 - Math.PI / 2;
      const radius = 130;
      const x = 400 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle) * radius;
      nodes.push({ id: c.id, x, y, label: c.name, type: "warm", size: 5 });
      edges.push({ from: "you", to: c.id, strength: "strong" });
    });

    // Second orbit · placeholder target company nodes (drawn from opportunities or generic)
    const targetLabels = ["Target A", "Target B", "Target C", "Target D", "Target E", "Target F", "Target G", "Target H"];
    const targetAngles = [0.3, 0.9, 1.5, 2.1, 2.7, 3.5, 4.3, 5.1];
    targetLabels.forEach((label, i) => {
      const angle = targetAngles[i];
      const radius = 240;
      const x = 400 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle) * radius;
      const id = `target-${i}`;
      nodes.push({ id, x, y, label, type: "target", size: 4 });
      // Connect to nearest warm contact (cycle through)
      if (seedCount > 0) {
        const warmId = networkSeed[i % seedCount]?.id;
        if (warmId) edges.push({ from: warmId, to: id, strength: "medium" });
      } else {
        edges.push({ from: "you", to: id, strength: "weak" });
      }
    });

    // Third orbit · stakeholder constellation (HMs, peers etc · placeholder)
    const stakeLabels = ["HM", "Recruiter", "Peer", "VP", "CRO", "Founder"];
    stakeLabels.forEach((label, i) => {
      const angle = (i / stakeLabels.length) * Math.PI * 2 + 0.5;
      const radius = 340;
      const x = 400 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle) * radius;
      const id = `stake-${i}`;
      nodes.push({ id, x, y, label, type: "stake", size: 3 });
      // Connect to the nearest target node
      const targetId = `target-${i % targetLabels.length}`;
      edges.push({ from: targetId, to: id, strength: "weak" });
    });

    const clusters = [
      { label: "WARM ORBIT", radius: 130, count: seedCount, color: "var(--c-accent)" },
      { label: "TARGET ROCKETS", radius: 240, count: targetLabels.length, color: "var(--c-cool)" },
      { label: "STAKEHOLDER CONSTELLATION", radius: 340, count: stakeLabels.length, color: "var(--c-muted)" },
    ];

    return { nodes, edges, clusters };
  }, [state.networkSeed]);

  function nodeColor(type: Node["type"]) {
    switch (type) {
      case "you": return "rgb(var(--c-accent))";
      case "warm": return "rgb(var(--c-accent))";
      case "target": return "rgb(var(--c-cool))";
      case "stake": return "rgb(var(--c-muted))";
    }
  }

  function edgeOpacity(s: Edge["strength"]) {
    return s === "strong" ? 0.6 : s === "medium" ? 0.3 : 0.15;
  }

  function getNode(id: string) {
    return nodes.find((n) => n.id === id);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-accent"><ConstellationIcon size={20} strokeWidth={1.5} /></span>
            <h1 className="display text-glow text-[34px] leading-[1.1] text-text m-0">Constellation</h1>
            <span className="font-mono text-[9px] uppercase tracking-[2px] font-bold text-purple bg-purple/15 px-2 py-0.5 rounded">Coming · V2.x</span>
          </div>
          <p className="text-[14px] text-text-dim m-0 max-w-2xl">
            Your network as a constellation · not a LinkedIn list. Visual relationship graph spanning warm contacts, target rockets, and the stakeholders that thread you in.
          </p>
        </div>
        <span className="font-mono text-[10px] text-muted lowercase">CN.01</span>
      </div>

      {/* Retro stripe accent */}
      <div className="retro-band mb-6"><span /><span /></div>

      {/* Hero · the constellation viz */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-4 relative overflow-hidden">
        <span className="absolute top-3 right-3 font-mono text-[9px] text-muted/60 lowercase">cn.02</span>

        {/* Background topographic feel */}
        <svg viewBox="0 0 800 600" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          {/* Orbit rings · cluster boundaries */}
          {clusters.map((c, i) => (
            <circle
              key={c.label}
              cx={400}
              cy={300}
              r={c.radius}
              fill="none"
              stroke="rgb(var(--c-border-strong))"
              strokeWidth="0.5"
              strokeDasharray="4 4"
              opacity={0.4 - i * 0.1}
            />
          ))}

          {/* Cluster labels */}
          {clusters.map((c, i) => {
            const labelY = 300 - c.radius - 6;
            return (
              <text
                key={`l-${c.label}`}
                x={400}
                y={labelY}
                textAnchor="middle"
                fontFamily="var(--font-mono), monospace"
                fontSize="9"
                fontWeight="600"
                fill="rgb(var(--c-muted))"
                opacity={0.7 - i * 0.15}
                letterSpacing="2"
              >
                · {c.label} · {c.count} ·
              </text>
            );
          })}

          {/* Edges · the threading lines */}
          {edges.map((e, i) => {
            const from = getNode(e.from);
            const to = getNode(e.to);
            if (!from || !to) return null;
            return (
              <line
                key={`e-${i}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgb(var(--c-accent))"
                strokeWidth="0.8"
                opacity={edgeOpacity(e.strength)}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => (
            <g key={n.id}>
              {/* Glow halo */}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.size + 4}
                fill={nodeColor(n.type)}
                opacity={0.15}
              />
              {/* Core dot */}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.size}
                fill={nodeColor(n.type)}
              />
              {/* Label */}
              <text
                x={n.x}
                y={n.y + n.size + 12}
                textAnchor="middle"
                fontFamily="var(--font-inter), system-ui, sans-serif"
                fontSize={n.type === "you" ? 12 : 10}
                fontWeight={n.type === "you" ? 700 : 500}
                fill="rgb(var(--c-text))"
                opacity={n.type === "stake" ? 0.6 : 0.85}
              >
                {n.label}
              </text>
            </g>
          ))}

          {/* Centre crosshair on YOU */}
          <g>
            <line x1={380} y1={300} x2={392} y2={300} stroke="rgb(var(--c-accent))" strokeWidth="0.6" opacity="0.6" />
            <line x1={408} y1={300} x2={420} y2={300} stroke="rgb(var(--c-accent))" strokeWidth="0.6" opacity="0.6" />
            <line x1={400} y1={280} x2={400} y2={292} stroke="rgb(var(--c-accent))" strokeWidth="0.6" opacity="0.6" />
            <line x1={400} y1={308} x2={400} y2={320} stroke="rgb(var(--c-accent))" strokeWidth="0.6" opacity="0.6" />
          </g>
        </svg>
      </div>

      {/* Legend + coming-soon explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full" style={{ background: "rgb(var(--c-accent))" }} />
            <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-text font-semibold">Warm orbit</span>
          </div>
          <p className="text-[12px] text-text-dim leading-relaxed m-0">
            Your seed contacts · ex-colleagues, mentors, industry friends. The first orbit · directly connected to you.
          </p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full" style={{ background: "rgb(var(--c-cool))" }} />
            <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-text font-semibold">Target rockets</span>
          </div>
          <p className="text-[12px] text-text-dim leading-relaxed m-0">
            Companies on your radar · scored, audited, awaiting threading. Connected to warm contacts wherever paths exist.
          </p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full" style={{ background: "rgb(var(--c-muted))" }} />
            <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-text font-semibold">Stakeholder constellation</span>
          </div>
          <p className="text-[12px] text-text-dim leading-relaxed m-0">
            HMs, recruiters, peers, execs inside the target rockets. The third orbit · the people who say yes.
          </p>
        </div>
      </div>

      {/* What's coming */}
      <div className="bg-purple/8 border border-purple/30 rounded-lg p-6 relative">
        <span className="absolute top-3 right-3 font-mono text-[9px] text-muted/60 lowercase">cn.03</span>
        <div className="flex items-start gap-4 flex-wrap">
          <span className="text-accent flex-shrink-0 mt-1"><Sparkle size={24} strokeWidth={1.5} /></span>
          <div className="flex-1 min-w-[260px]">
            <h2 className="text-[18px] font-semibold text-text m-0 mb-2">Live constellation · the V2.x build</h2>
            <p className="text-[13px] text-text-dim leading-relaxed mb-4 max-w-2xl">
              What you&apos;re looking at now is a static showcase. The live version makes every node interactive · click any stakeholder to see how you know them, what context exists, and the shortest threading path. Filter by &ldquo;show me everyone who could thread me into [target]&rdquo; and watch the graph highlight the path.
            </p>
            <ul className="text-[12px] text-text-dim space-y-1.5 mb-4">
              <li>· Force-directed layout · nodes settle into natural clusters by company, industry, network</li>
              <li>· Hover any node · context card with how/when you met, last contact, mutual connections</li>
              <li>· Filter by intent · &ldquo;path to [target company]&rdquo; · &ldquo;everyone in [industry]&rdquo; · &ldquo;ex-employees of [company]&rdquo;</li>
              <li>· Mission Compass overlay · which clusters align with which values</li>
              <li>· Auto-grows as Probes Inbox surfaces new companies and Star Map maps new stakeholders</li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/onboarding"
                className="px-4 py-2 bg-accent text-white rounded-md font-bold text-[12px] hover:bg-accent-2 transition inline-flex items-center gap-2"
              >
                <NavIcon name="Sparkle" size={14} /> Add to your seed network →
              </Link>
              <Link
                href="/threads"
                className="px-4 py-2 border border-border text-text rounded-md font-semibold text-[12px] hover:bg-surface-2 transition"
              >
                Star Map (current per-opp view) →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer · context */}
      <div className="mt-6 text-[11px] text-muted leading-relaxed font-mono">
        <span className="uppercase tracking-[1.5px]">v4.1 · static showcase · live build v2.x</span>
      </div>
    </div>
  );
}
