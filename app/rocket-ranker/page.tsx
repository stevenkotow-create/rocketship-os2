"use client";

// Rocket Ranker · leaderboard view · cross-company standardised scoring
// Ranks every opp in the seed by tier + composite index
// APAC gate enforced · role-shape fit applied

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/PageHero";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import { useAppState } from "@/lib/storage";
import { rankAll, TIER_STYLE, type RocketTier } from "@/lib/rocket-ranker";

type TierFilter = RocketTier | "ALL";

const FILTER_LABEL: Record<TierFilter, string> = {
  ALL: "All tiers",
  P1_TARGET: "P1 · Target",
  P2_STRONG: "P2 · Strong",
  WATCHLIST: "Watchlist",
  JETTISON: "Jettison",
};

export default function RocketRankerPage() {
  const [state] = useAppState();
  const ALL_OPPS = [...OPPORTUNITIES, ...(state.customOpps || [])];
  const [filter, setFilter] = useState<TierFilter>("ALL");
  const [showDetail, setShowDetail] = useState<string | null>(null);

  const ranked = useMemo(() => rankAll(ALL_OPPS), [ALL_OPPS]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return ranked;
    return ranked.filter((r) => r.rank.tier === filter);
  }, [ranked, filter]);

  const tierCounts = useMemo(() => {
    const counts: Record<RocketTier, number> = {
      P1_TARGET: 0,
      P2_STRONG: 0,
      WATCHLIST: 0,
      JETTISON: 0,
    };
    for (const r of ranked) counts[r.rank.tier]++;
    return counts;
  }, [ranked]);

  return (
    <div style={styles.page}>
      <PageHero
        eyebrow="Rocket Ranker · v1"
        title="Cross-company leaderboard"
        subtitle="Six-Dimension Evaluator × Role-Shape Fit · APAC gate applied · sorted by tier + composite index"
        marker="RR.01"
        actions={<Link href="/" style={styles.back}>← Home</Link>}
      />

      {/* Tier summary strip */}
      <div style={styles.strip}>
        {(["P1_TARGET", "P2_STRONG", "WATCHLIST", "JETTISON"] as RocketTier[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(filter === t ? "ALL" : t)}
            style={{
              ...styles.stripCard,
              borderColor: filter === t ? TIER_STYLE[t].color : "#1F1F2A",
              background: filter === t ? TIER_STYLE[t].bg : "#0E0E14",
            }}
          >
            <div style={{ ...styles.stripLabel, color: TIER_STYLE[t].color }}>
              {TIER_STYLE[t].label}
            </div>
            <div style={styles.stripNum}>{tierCounts[t]}</div>
          </button>
        ))}
        <button
          onClick={() => setFilter("ALL")}
          style={{
            ...styles.stripCard,
            borderColor: filter === "ALL" ? "#F8F4F3" : "#1F1F2A",
            background: filter === "ALL" ? "rgba(248,244,243,0.06)" : "#0E0E14",
          }}
        >
          <div style={{ ...styles.stripLabel, color: "#F8F4F3" }}>ALL</div>
          <div style={styles.stripNum}>{ranked.length}</div>
        </button>
      </div>

      <div style={styles.filterRow}>
        <span style={styles.filterLabel}>Showing:</span>
        <span style={styles.filterValue}>{FILTER_LABEL[filter]} · {filtered.length} companies</span>
      </div>

      {/* Leaderboard */}
      <div style={styles.tableWrap}>
        <div style={styles.tableHead}>
          <div style={{ ...styles.col, ...styles.colRank }}>#</div>
          <div style={{ ...styles.col, ...styles.colCompany }}>Company</div>
          <div style={{ ...styles.col, ...styles.colRole }}>Role</div>
          <div style={{ ...styles.col, ...styles.colTier }}>Tier</div>
          <div style={{ ...styles.col, ...styles.colScore }}>Company</div>
          <div style={{ ...styles.col, ...styles.colScore }}>Shape</div>
          <div style={{ ...styles.col, ...styles.colComposite }}>Index</div>
        </div>
        {filtered.map((row, idx) => {
          const t = TIER_STYLE[row.rank.tier];
          const isOpen = showDetail === row.opp.id;
          return (
            <div key={row.opp.id} style={styles.rowWrap}>
              <div
                style={styles.row}
                onClick={() => setShowDetail(isOpen ? null : row.opp.id)}
                role="button"
              >
                <div style={{ ...styles.col, ...styles.colRank, color: "#7C7C8A" }}>
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div style={{ ...styles.col, ...styles.colCompany }}>
                  <div style={styles.company}>{row.opp.company}</div>
                  <div style={styles.location}>{row.opp.location || "—"}</div>
                </div>
                <div style={{ ...styles.col, ...styles.colRole }}>
                  <div style={styles.role}>{row.opp.type}</div>
                  <div style={styles.position}>{row.opp.position}</div>
                </div>
                <div style={{ ...styles.col, ...styles.colTier }}>
                  <span style={{ ...styles.tierPill, background: t.bg, color: t.color, borderColor: t.color }}>
                    {t.label}
                  </span>
                </div>
                <div style={{ ...styles.col, ...styles.colScore }}>
                  <span style={styles.scoreNum}>{row.rank.companyScore}</span>
                  <span style={styles.scoreDenom}>/30</span>
                </div>
                <div style={{ ...styles.col, ...styles.colScore }}>
                  <span style={styles.scoreNum}>{row.rank.roleShapeFit}</span>
                  <span style={styles.scoreDenom}>/10</span>
                </div>
                <div style={{ ...styles.col, ...styles.colComposite }}>
                  <span style={{ ...styles.compositeNum, color: t.color }}>{row.rank.compositeIndex}</span>
                </div>
              </div>
              {isOpen && (
                <div style={styles.detail}>
                  <div style={styles.detailSection}>
                    <div style={styles.detailLabel}>Reasons</div>
                    <ul style={styles.detailList}>
                      {row.rank.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                  {row.rank.gaps.length > 0 && (
                    <div style={styles.detailSection}>
                      <div style={styles.detailLabel}>Gaps to move up</div>
                      <ul style={styles.detailList}>
                        {row.rank.gaps.map((g, i) => <li key={i}>{g}</li>)}
                      </ul>
                    </div>
                  )}
                  {row.opp.url && (
                    <div style={styles.detailSection}>
                      <a href={row.opp.url} target="_blank" rel="noreferrer" style={styles.link}>
                        Open role posting ↗
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={styles.empty}>No companies in this tier yet.</div>
        )}
      </div>

      <footer style={styles.footer}>
        <div>Ranker rules · APAC-only hard gate · BDR-first targeting · AE tier calibration</div>
        <div>Rocket Ship v9 · Rocket Ranker v1</div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0A0A10",
    color: "#F8F4F3",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
    padding: "32px 40px 64px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottom: "1px solid #1F1F2A",
    paddingBottom: 20,
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#AC55FF",
    fontWeight: 700,
    marginBottom: 4,
  },
  h1: { fontSize: 40, margin: 0, letterSpacing: -0.5, fontFamily: "Georgia, serif" },
  sub: { fontSize: 13, color: "#7C7C8A", marginTop: 6, maxWidth: 640 },
  back: { color: "#7C7C8A", textDecoration: "none", fontSize: 12 },
  strip: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 12,
    marginBottom: 24,
  },
  stripCard: {
    background: "#0E0E14",
    border: "1px solid #1F1F2A",
    borderRadius: 4,
    padding: "14px 16px",
    cursor: "pointer",
    textAlign: "left",
    color: "#F8F4F3",
    transition: "all 0.15s ease",
  },
  stripLabel: { fontSize: 10, letterSpacing: 1.5, fontWeight: 700, marginBottom: 4 },
  stripNum: { fontSize: 32, fontFamily: "Georgia, serif", fontWeight: 700, color: "#F8F4F3" },
  filterRow: { fontSize: 12, color: "#7C7C8A", marginBottom: 12 },
  filterLabel: { textTransform: "uppercase", letterSpacing: 1, marginRight: 6 },
  filterValue: { color: "#F8F4F3" },
  tableWrap: { border: "1px solid #1F1F2A", borderRadius: 4, overflow: "hidden" },
  tableHead: {
    display: "flex",
    padding: "10px 12px",
    fontSize: 9,
    letterSpacing: 1,
    color: "#7C7C8A",
    textTransform: "uppercase",
    borderBottom: "1px solid #1F1F2A",
    background: "#0E0E14",
    fontWeight: 700,
  },
  rowWrap: { borderBottom: "1px solid #1F1F2A" },
  row: {
    display: "flex",
    padding: "14px 12px",
    cursor: "pointer",
    alignItems: "center",
    transition: "background 0.15s",
  },
  col: { padding: "0 8px", fontSize: 12 },
  colRank: { width: 40, fontFamily: "Georgia, serif", fontSize: 13 },
  colCompany: { flex: 2 },
  colRole: { flex: 2 },
  colTier: { flex: 1.5 },
  colScore: { width: 80, textAlign: "center" },
  colComposite: { width: 70, textAlign: "center" },
  company: { fontSize: 14, fontWeight: 600 },
  location: { fontSize: 10, color: "#7C7C8A", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 },
  role: { fontSize: 12, fontWeight: 600, color: "#AC55FF" },
  position: { fontSize: 10, color: "#7C7C8A", marginTop: 2, lineHeight: 1.3 },
  tierPill: {
    display: "inline-block",
    padding: "3px 8px",
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: 700,
    border: "1px solid",
    borderRadius: 2,
  },
  scoreNum: { fontSize: 18, fontFamily: "Georgia, serif", fontWeight: 700 },
  scoreDenom: { fontSize: 10, color: "#7C7C8A", marginLeft: 2 },
  compositeNum: { fontSize: 22, fontFamily: "Georgia, serif", fontWeight: 700 },
  detail: {
    background: "#0A0A10",
    padding: "16px 24px 20px 60px",
    borderTop: "1px solid #1F1F2A",
  },
  detailSection: { marginBottom: 12 },
  detailLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#AC55FF",
    fontWeight: 700,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  detailList: { margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.6, color: "#C0C0CC" },
  link: { color: "#AC55FF", fontSize: 12, textDecoration: "none" },
  empty: { padding: 40, textAlign: "center", color: "#7C7C8A", fontSize: 13 },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTop: "1px solid #1F1F2A",
    display: "flex",
    justifyContent: "space-between",
    fontSize: 10,
    color: "#7C7C8A",
    letterSpacing: 0.5,
  },
};
