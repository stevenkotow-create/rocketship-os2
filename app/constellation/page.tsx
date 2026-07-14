"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageHero } from "@/components/PageHero";
import { JOB_SOURCES } from "@/lib/jobsource";
import {
  fetchGraph,
  addNode,
  addEdge,
  currentUserId,
  NODE_KINDS,
  type CNode,
  type CEdge,
  type NodeKind,
} from "@/lib/constellation";
import { supabaseEnabled } from "@/lib/supabase";

const KIND_COLOR: Record<NodeKind, string> = {
  company: "var(--c-accent)",
  person: "var(--c-gold)",
  industry: "var(--c-cool)",
  role: "var(--c-good)",
  other: "var(--c-purple)",
};

const W = 900;
const H = 620;

type Pos = Record<string, { x: number; y: number; vx: number; vy: number }>;

function layout(nodes: CNode[], edges: CEdge[]): Pos {
  const pos: Pos = {};
  nodes.forEach((n, i) => {
    const a = (i / Math.max(nodes.length, 1)) * Math.PI * 2;
    pos[n.id] = { x: W / 2 + Math.cos(a) * 160 + (i % 3) * 8, y: H / 2 + Math.sin(a) * 130 + (i % 5) * 6, vx: 0, vy: 0 };
  });
  const ids = new Set(nodes.map((n) => n.id));
  const links = edges.filter((e) => ids.has(e.source) && ids.has(e.target));
  for (let it = 0; it < 300; it++) {
    for (let a = 0; a < nodes.length; a++) {
      for (let b = a + 1; b < nodes.length; b++) {
        const pa = pos[nodes[a].id];
        const pb = pos[nodes[b].id];
        let dx = pa.x - pb.x;
        let dy = pa.y - pb.y;
        const d2 = dx * dx + dy * dy + 0.01;
        const d = Math.sqrt(d2);
        const rep = 6500 / d2;
        const fx = (dx / d) * rep;
        const fy = (dy / d) * rep;
        pa.vx += fx;
        pa.vy += fy;
        pb.vx -= fx;
        pb.vy -= fy;
      }
    }
    for (const e of links) {
      const pa = pos[e.source];
      const pb = pos[e.target];
      let dx = pb.x - pa.x;
      let dy = pb.y - pa.y;
      const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
      const k = (d - 140) * 0.02;
      const fx = (dx / d) * k;
      const fy = (dy / d) * k;
      pa.vx += fx;
      pa.vy += fy;
      pb.vx -= fx;
      pb.vy -= fy;
    }
    for (const n of nodes) {
      const p = pos[n.id];
      p.vx += (W / 2 - p.x) * 0.004;
      p.vy += (H / 2 - p.y) * 0.004;
      p.vx *= 0.86;
      p.vy *= 0.86;
      p.x += p.vx;
      p.y += p.vy;
      p.x = Math.max(28, Math.min(W - 28, p.x));
      p.y = Math.max(24, Math.min(H - 24, p.y));
    }
  }
  return pos;
}

export default function ConstellationPage() {
  const [nodes, setNodes] = useState<CNode[]>([]);
  const [edges, setEdges] = useState<CEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<NodeKind>("company");
  const [connect, setConnect] = useState(false);
  const [firstSel, setFirstSel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const seededRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    const g = await fetchGraph();
    setNodes(g.nodes);
    setEdges(g.edges);
    setOk(g.ok);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    currentUserId().then(setUid);
  }, [load]);

  const pos = useMemo(() => layout(nodes, edges), [nodes, edges]);

  async function onAddNode() {
    if (!label.trim() || busy) return;
    setBusy(true);
    const n = await addNode(label, kind);
    setBusy(false);
    if (n) {
      setNodes((prev) => [...prev, n]);
      setLabel("");
    }
  }

  async function onNodeClick(id: string) {
    if (!connect) return;
    if (!firstSel) {
      setFirstSel(id);
      return;
    }
    if (firstSel === id) {
      setFirstSel(null);
      return;
    }
    setBusy(true);
    const e = await addEdge(firstSel, id);
    setBusy(false);
    if (e) setEdges((prev) => [...prev, e]);
    setFirstSel(null);
  }

  async function seedCompanies() {
    if (busy) return;
    setBusy(true);
    seededRef.current = true;
    const existing = new Set(nodes.map((n) => n.label.toLowerCase()));
    const created: CNode[] = [];
    for (const c of JOB_SOURCES) {
      if (existing.has(c.company.toLowerCase())) continue;
      const n = await addNode(c.company, "company");
      if (n) created.push(n);
    }
    setBusy(false);
    if (created.length) setNodes((prev) => [...prev, ...created]);
  }

  const mineCount = nodes.filter((n) => n.created_by && n.created_by === uid).length;

  return (
    <div>
      <PageHero
        eyebrow="Community"
        title="Constellation"
        marker="CN.01"
        subtitle="A living network graph everyone invited builds together. Add companies, people and the connections between them; whoever's invited sees and shapes the same constellation."
        actions={
          <button
            onClick={load}
            disabled={loading}
            className="rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-text-dim transition hover:border-accent hover:text-text disabled:opacity-50"
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        }
      />

      {!supabaseEnabled ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-14 text-center text-[14px] text-text-dim">
          The shared constellation needs the backend connected. It runs in local mode here.
        </div>
      ) : (
        <>
          {/* Answer-first read */}
          <p className="mb-4 text-[14px] text-text-dim">
            {loading ? (
              "Loading the shared constellation…"
            ) : !ok ? (
              <span className="text-warn">
                Constellation tables aren&apos;t set up yet. Run the one-time SQL, then hit Refresh.
              </span>
            ) : nodes.length === 0 ? (
              "The constellation is empty. Seed it with target companies, or add the first node below."
            ) : (
              <>
                <span className="font-semibold text-text">{nodes.length}</span> nodes ·{" "}
                <span className="font-semibold text-text">{edges.length}</span> connections
                {uid && (
                  <>
                    {" "}
                    · <span className="font-semibold text-text">{mineCount}</span> added by you
                  </>
                )}
              </>
            )}
          </p>

          {/* Controls */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddNode()}
              placeholder="Add a node (company, person, industry…)"
              className="min-w-[200px] flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-accent"
            />
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as NodeKind)}
              className="rounded-lg border border-border bg-bg px-2 py-2 text-[13px] text-text outline-none focus:border-accent"
              aria-label="Node type"
            >
              {NODE_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
            <button
              onClick={onAddNode}
              disabled={busy || !label.trim()}
              className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50 dark:text-bg"
            >
              Add
            </button>
            <button
              onClick={() => {
                setConnect((v) => !v);
                setFirstSel(null);
              }}
              className={`rounded-lg border px-3 py-2 text-[12px] font-medium transition ${
                connect ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:text-text"
              }`}
            >
              {connect ? (firstSel ? "Pick the second node…" : "Connecting · pick two") : "Connect nodes"}
            </button>
            {nodes.length === 0 && ok && (
              <button
                onClick={seedCompanies}
                disabled={busy}
                className="rounded-lg border border-accent bg-accent/10 px-3 py-2 text-[12px] font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-50"
              >
                Seed target companies
              </button>
            )}
          </div>

          {/* Graph */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/30 backdrop-blur-md">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-[62vh] min-h-[460px] w-full">
              {edges.map((e) => {
                const a = pos[e.source];
                const b = pos[e.target];
                if (!a || !b) return null;
                return (
                  <line
                    key={e.id}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="rgb(var(--c-accent))"
                    strokeOpacity={0.25}
                    strokeWidth={1}
                  />
                );
              })}
              {nodes.map((n) => {
                const p = pos[n.id];
                if (!p) return null;
                const c = KIND_COLOR[n.kind] || KIND_COLOR.other;
                const selected = firstSel === n.id;
                const mine = n.created_by && n.created_by === uid;
                const r = n.kind === "company" ? 9 : 7;
                const right = p.x > W / 2;
                return (
                  <g
                    key={n.id}
                    transform={`translate(${p.x},${p.y})`}
                    onClick={() => onNodeClick(n.id)}
                    style={{ cursor: connect ? "pointer" : "default" }}
                  >
                    {selected && <circle r={r + 6} fill="none" stroke={`rgb(${c})`} strokeOpacity={0.8} strokeWidth={1.5} />}
                    <circle
                      r={r}
                      fill={`rgb(${c})`}
                      fillOpacity={0.9}
                      stroke={mine ? "#fff" : `rgb(${c})`}
                      strokeOpacity={mine ? 0.9 : 0.4}
                      strokeWidth={mine ? 1.5 : 1}
                      style={{ filter: `drop-shadow(0 0 6px rgb(${c} / 0.5))` }}
                    />
                    <text
                      x={right ? -(r + 6) : r + 6}
                      y={4}
                      textAnchor={right ? "end" : "start"}
                      className="fill-text-dim font-mono"
                      style={{ fontSize: 11 }}
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-muted">
            {NODE_KINDS.map((k) => (
              <span key={k.id} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: `rgb(${KIND_COLOR[k.id]})` }} />
                {k.label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full border border-white" /> added by you
            </span>
          </div>
        </>
      )}
    </div>
  );
}
