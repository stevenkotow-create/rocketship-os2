"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/lib/storage";
import { PageHero } from "@/components/PageHero";
import { JobCardSkeleton } from "@/components/Skeleton";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import {
  JOB_SOURCES,
  scanCompany,
  scanByUrl,
  isSalesRole,
  inAPAC,
  inANZ,
  type NormalizedJob,
} from "@/lib/jobsource";
import type { Opportunity } from "@/lib/types";

type Region = "anz" | "apac" | "anywhere";

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
  // Off by default: the region filter already scopes to takeable roles, and forcing
  // remote-only was hiding genuine ANZ-based (office) roles. Users can still opt in.
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [region, setRegion] = useState<Region>("anz");
  const [kw, setKw] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

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

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  async function addCompanyByUrl() {
    const url = urlInput.trim();
    if (!url) return;
    setAddingUrl(true);
    const { jobs: newJobs } = await scanByUrl(url);
    const fresh = newJobs.filter((j) => j.id);
    setJobs((prev) => {
      const seen = new Set(prev.map((j) => j.id));
      return [...prev, ...fresh.filter((j) => !seen.has(j.id))];
    });
    setAddingUrl(false);
    if (fresh.length > 0) {
      setUrlInput("");
      showToast(`✓ Pulled ${fresh.length} role${fresh.length === 1 ? "" : "s"} in`);
    } else {
      showToast("No live board there — use “Add as a single job”");
    }
  }

  // Add ANY job by its link (LinkedIn, ServiceNow, Workday, anywhere) — parses the
  // company + title from the URL, adds it straight to the board. You refine the
  // details on the mission page.
  function addManualByUrl() {
    const raw = urlInput.trim();
    if (!raw) return;
    let company = "New company";
    let title = "Role";
    try {
      const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      const host = u.hostname.replace(/^www\./, "").replace(/^careers\./, "").replace(/^jobs\./, "");
      company = host.split(".")[0].replace(/\b\w/g, (c) => c.toUpperCase());
      const segs = u.pathname.split("/").filter(Boolean).filter((s) => !/^\d+$/.test(s) && s.length > 2);
      const slug = segs[segs.length - 1];
      if (slug) title = decodeURIComponent(slug).replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    } catch {
      /* leave defaults */
    }
    const id = `manual-${Date.now()}`;
    const opp: Opportunity = {
      id,
      company,
      position: title,
      type: "role",
      location: "",
      stage: "targeting",
      url: raw,
      note: "Added manually by link. Edit the details on the mission page.",
    };
    update((s) => ({ ...s, customOpps: [...(s.customOpps || []), opp] }));
    setAdded((a) => ({ ...a, [id]: true }));
    setUrlInput("");
    showToast(`✓ Added ${title} at ${company}`);
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
    showToast(`✓ Added ${j.title} to your board`);
  }

  function regionMatch(j: NormalizedJob): boolean {
    if (region === "anywhere") return true;
    if (region === "anz") return inANZ(j.location);
    return inAPAC(j.location) || j.remote; // apac
  }

  const view = useMemo(() => {
    const q = kw.trim().toLowerCase();
    return jobs
      .filter((j) => !salesOnly || isSalesRole(j.title))
      .filter((j) => !remoteOnly || j.remote)
      .filter(regionMatch)
      .filter((j) => !q || `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(q))
      .sort((a, b) => (b.postedAt || "").localeCompare(a.postedAt || ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, salesOnly, remoteOnly, region, kw]);

  const companiesLive = useMemo(() => new Set(jobs.map((j) => j.company)).size, [jobs]);
  const remoteCount = useMemo(() => view.filter((j) => j.remote).length, [view]);

  return (
    <div>
      <PageHero
        eyebrow="Daily"
        title="Live Roles"
        marker="LR.01"
        subtitle="Real openings pulled straight from each company's own hiring system (Greenhouse, Lever, Ashby). No job board in the middle, no cost. Sales roles you can actually take from Australia or New Zealand, whether they're remote or based here. Flip on Remote only to narrow further."
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

      {/* Answer-first · lead with the read */}
      <p className="mb-4 text-[14px] text-text-dim">
        {loading ? (
          "Scanning company boards for live openings…"
        ) : view.length > 0 ? (
          <>
            <span className="font-semibold text-text">{view.length}</span> role{view.length === 1 ? "" : "s"} you can take from{" "}
            {region === "anz" ? "Australia or New Zealand" : region === "apac" ? "APAC" : "anywhere"} right now.
          </>
        ) : (
          "No roles match right now. Widen the region or filters below."
        )}
      </p>

      {/* Animated stat header · instrument readout */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "Matching roles", value: view.length, tone: "text-accent" },
          { label: "Remote", value: remoteCount, tone: "text-good" },
          { label: "Companies live", value: companiesLive, tone: "text-text" },
        ].map((s) => (
          <div key={s.label} className="stat">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[1.8px] text-muted">{s.label}</div>
            <div className={`mt-1.5 font-mono text-[30px] font-bold leading-none ${s.tone}`}>
              {loading ? <span className="text-muted">··</span> : <AnimatedNumber value={s.value} />}
            </div>
          </div>
        ))}
      </div>

      {/* Add a job · top of page · pull a board OR add any single job by link */}
      <div className="mb-6 rounded-xl border border-border bg-surface/50 p-4">
        <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[1.8px] text-muted">Add a job</div>
        <p className="mb-3 text-[12px] text-text-dim">
          Paste a Greenhouse / Lever / Ashby careers URL to pull a company&apos;s whole live board, or paste any single
          job link (LinkedIn, ServiceNow, Workday, anywhere) and add it straight to your board.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCompanyByUrl()}
            placeholder="https://… a careers board, or a single job link"
            className="min-w-[240px] flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-accent"
          />
          <button
            onClick={addCompanyByUrl}
            disabled={addingUrl || !urlInput.trim()}
            className="rounded-lg border border-accent bg-accent/10 px-4 py-2 text-[13px] font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-50"
          >
            {addingUrl ? "Pulling…" : "Pull roles"}
          </button>
          <button
            onClick={addManualByUrl}
            disabled={!urlInput.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50 dark:text-bg"
          >
            Add as a single job
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {/* region segmented control */}
        <div className="flex gap-1 rounded-lg border border-border bg-surface-2/60 p-0.5">
          {([
            { id: "anz", label: "ANZ" },
            { id: "apac", label: "APAC" },
            { id: "anywhere", label: "Anywhere" },
          ] as { id: Region; label: string }[]).map((r) => (
            <button
              key={r.id}
              onClick={() => setRegion(r.id)}
              className={`rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[1px] transition ${
                region === r.id ? "bg-accent text-white dark:text-bg" : "text-muted hover:text-text"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setRemoteOnly((v) => !v)}
          className={`rounded-lg border px-3 py-2 text-[12px] font-medium transition ${
            remoteOnly ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:text-text"
          }`}
        >
          Remote only
        </button>
        <button
          onClick={() => setSalesOnly((v) => !v)}
          className={`rounded-lg border px-3 py-2 text-[12px] font-medium transition ${
            salesOnly ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:text-text"
          }`}
        >
          Sales roles
        </button>
        <input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder="Filter…"
          className="min-w-[160px] flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-accent"
        />
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
                      <span className="rounded bg-good/15 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-good">
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

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-text shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
