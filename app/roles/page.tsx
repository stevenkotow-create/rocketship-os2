"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/lib/storage";
import { PageHero } from "@/components/PageHero";
import { JobCardSkeleton } from "@/components/Skeleton";
import {
  JOB_SOURCES,
  scanCompany,
  scanByUrl,
  isSalesRole,
  inAPAC,
  type NormalizedJob,
} from "@/lib/jobsource";
import type { Opportunity } from "@/lib/types";

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const d = Date.now() - new Date(iso).getTime();
  const days = Math.floor(d / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const mo = Math.floor(days / 30);
  return `${mo} mo ago`;
}

export default function LiveRoles() {
  const [state, update] = useAppState();
  const [jobs, setJobs] = useState<NormalizedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [salesOnly, setSalesOnly] = useState(true);
  const [apacOnly, setApacOnly] = useState(true);
  const [kw, setKw] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const onBoard = useMemo(() => {
    const s = new Set<string>();
    (state.customOpps || []).forEach((o) => {
      if (o.url) s.add(o.url);
      s.add(o.id);
    });
    return s;
  }, [state.customOpps]);

  async function scanAll() {
    setLoading(true);
    setScanned(true);
    const results = await Promise.all(JOB_SOURCES.map(scanCompany));
    const seen = new Set<string>();
    const all = results.flat().filter((j) => {
      if (!j?.id || seen.has(j.id)) return false;
      seen.add(j.id);
      return true;
    });
    setJobs(all);
    setLoading(false);
  }

  useEffect(() => {
    scanAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addCompanyByUrl() {
    if (!urlInput.trim()) return;
    setAddingUrl(true);
    const { jobs: newJobs } = await scanByUrl(urlInput.trim());
    setJobs((prev) => {
      const seen = new Set(prev.map((j) => j.id));
      return [...prev, ...newJobs.filter((j) => j.id && !seen.has(j.id))];
    });
    setUrlInput("");
    setAddingUrl(false);
  }

  function addToBoard(j: NormalizedJob) {
    update((s) => {
      const exists = (s.customOpps || []).some((o) => o.id === j.id || (o.url && o.url === j.url));
      if (exists) return s;
      const opp: Opportunity = {
        id: j.id,
        company: j.company,
        position: j.title,
        type: "role",
        location: j.location || "Remote",
        stage: "targeting",
        note: j.snippet || `Live role sourced from ${j.company}'s careers board.`,
        url: j.url,
      };
      return { ...s, customOpps: [...(s.customOpps || []), opp] };
    });
    setAdded((a) => ({ ...a, [j.id]: true }));
  }

  const view = useMemo(() => {
    const q = kw.trim().toLowerCase();
    return jobs
      .filter((j) => !salesOnly || isSalesRole(j.title))
      .filter((j) => !apacOnly || j.remote || inAPAC(j.location))
      .filter((j) => !q || `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(q))
      .sort((a, b) => (b.postedAt || "").localeCompare(a.postedAt || ""));
  }, [jobs, salesOnly, apacOnly, kw]);

  const companiesLive = useMemo(() => new Set(jobs.map((j) => j.company)).size, [jobs]);

  return (
    <div>
      <PageHero
        eyebrow="Daily"
        title="Live Roles"
        marker="LR.01"
        subtitle="Real openings pulled straight from each company's own hiring system (Greenhouse, Lever, Ashby). No job board in the middle, no cost. Filtered to sales roles you can actually reach from APAC."
        actions={
          <button
            onClick={scanAll}
            disabled={loading}
            className="glow-accent rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:text-bg"
          >
            {loading ? "Scanning…" : "Rescan"}
          </button>
        }
      />

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder="Filter by title, company, location…"
          className="min-w-[220px] flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-accent"
        />
        <button
          onClick={() => setSalesOnly((v) => !v)}
          className={`rounded-lg border px-3 py-2 text-[12px] font-medium transition ${
            salesOnly ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:text-text"
          }`}
        >
          Sales roles
        </button>
        <button
          onClick={() => setApacOnly((v) => !v)}
          className={`rounded-lg border px-3 py-2 text-[12px] font-medium transition ${
            apacOnly ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:text-text"
          }`}
        >
          APAC / remote
        </button>
        <span className="ml-auto font-mono text-[11px] text-muted">
          {loading ? "scanning boards…" : `${view.length} roles · ${companiesLive} companies live`}
        </span>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : view.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-14 text-center">
          <h2 className="display text-[22px] text-navy">No roles match right now.</h2>
          <p className="mx-auto mt-2 max-w-md text-[13px] text-text-dim">
            {scanned
              ? "Try loosening the filters, or add a company by its careers URL below. Boards refresh every 30 minutes."
              : "Hit Rescan to pull live roles from target companies."}
          </p>
        </div>
      ) : (
        <div className="stagger space-y-3">
          {view.map((j) => {
            const isAdded = added[j.id] || onBoard.has(j.id) || (j.url && onBoard.has(j.url));
            return (
              <div key={j.id} className="card lift !mb-0 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-semibold text-text">{j.title}</span>
                    {j.remote && (
                      <span className="rounded bg-good/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-good">
                        Remote
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-text-dim">
                    <span className="font-semibold text-accent">{j.company}</span>
                    {j.location && <span>· {j.location}</span>}
                    {j.department && <span className="text-muted">· {j.department}</span>}
                    {j.postedAt && <span className="font-mono text-muted">· {timeAgo(j.postedAt)}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={j.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-dim transition hover:border-accent hover:text-text"
                  >
                    View
                  </a>
                  <button
                    onClick={() => addToBoard(j)}
                    disabled={!!isAdded}
                    className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                      isAdded
                        ? "cursor-default bg-good/15 text-good"
                        : "bg-accent text-white hover:opacity-90 dark:text-bg"
                    }`}
                  >
                    {isAdded ? "✓ On board" : "Add to board"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add by URL */}
      <div className="mt-8 rounded-xl border border-border bg-surface/40 p-4">
        <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[1.8px] text-muted">
          Add any company
        </div>
        <p className="mb-3 text-[12px] text-text-dim">
          Paste a Greenhouse, Lever or Ashby careers URL (e.g. jobs.ashbyhq.com/company or jobs.lever.co/company)
          and pull their live board in.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCompanyByUrl()}
            placeholder="https://jobs.ashbyhq.com/company"
            className="min-w-[240px] flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-accent"
          />
          <button
            onClick={addCompanyByUrl}
            disabled={addingUrl || !urlInput.trim()}
            className="rounded-lg border border-accent bg-accent/10 px-4 py-2 text-[13px] font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-50"
          >
            {addingUrl ? "Pulling…" : "Pull roles"}
          </button>
        </div>
      </div>
    </div>
  );
}
