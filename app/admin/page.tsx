"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, supabaseEnabled, type Profile } from "@/lib/supabase";
import { useAppState, setActingAs } from "@/lib/storage";
import type { AppState, Opportunity, Stage } from "@/lib/types";
import { PageHero } from "@/components/PageHero";

const STAGE_LABELS: Record<Stage, string> = {
  targeting: "Saved",
  contacted: "Contacted",
  applied: "Applied",
  early: "Interviewing",
  late: "Final rounds",
  offer: "Offer",
  accepted: "Accepted",
  closed: "Closed",
};

const STAGES = Object.keys(STAGE_LABELS) as Stage[];

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      if (!supabaseEnabled || !supabase) {
        setReady(true);
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (uid) {
        const { data: me } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", uid)
          .maybeSingle();
        if (me?.is_admin) {
          setIsAdmin(true);
          const { data: all } = await supabase
            .from("profiles")
            .select("*")
            .order("email");
          setProfiles((all as Profile[]) ?? []);
        }
      }
      setReady(true);
    })();
  }, []);

  if (!supabaseEnabled) {
    return (
      <Wrap>
        <p className="text-text-dim">
          The backend isn&apos;t configured yet. Add the Supabase environment variables and
          redeploy to enable accounts and the admin view.
        </p>
      </Wrap>
    );
  }
  if (!ready) return <Wrap><p className="text-text-dim">Loading…</p></Wrap>;
  if (!isAdmin) {
    return (
      <Wrap>
        <p className="text-text-dim">
          This page is for admins only. If you should have access, ask the owner to set
          <code className="mx-1 rounded bg-surface-2 px-1">is_admin = true</code> on your profile.
        </p>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <PageHero eyebrow="Admin" title="Admin · Team boards" subtitle="Watch each person's progress and seed their initial probes." marker="AT.01" />

      <div className="mt-6 grid grid-cols-[240px_1fr] gap-6">
        <div className="space-y-1">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            People ({profiles.length})
          </div>
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`block w-full rounded-lg border px-3 py-2 text-left text-[13px] transition-colors ${
                selected?.id === p.id
                  ? "border-accent bg-surface-2 text-text"
                  : "border-border bg-surface text-text-dim hover:bg-surface-2"
              }`}
            >
              <div className="truncate font-medium text-text">{p.email ?? "(no email)"}</div>
              {p.is_admin && <div className="text-[11px] text-accent">admin</div>}
            </button>
          ))}
        </div>

        <div>
          {selected ? (
            <UserBoard key={selected.id} profile={selected} />
          ) : (
            <div className="rounded-xl border border-border bg-surface p-8 text-center text-[14px] text-text-dim">
              Select a person to view their board.
            </div>
          )}
        </div>
      </div>
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[1000px]">{children}</div>;
}

function allOpps(state: AppState): Opportunity[] {
  return state.customOpps ?? [];
}

function UserBoard({ profile }: { profile: Profile }) {
  const [state, update] = useAppState(profile.id);
  const opps = allOpps(state);

  const byStage = useMemo(() => {
    const counts: Partial<Record<Stage, number>> = {};
    for (const o of opps) counts[o.stage] = (counts[o.stage] ?? 0) + 1;
    return counts;
  }, [opps]);

  const logEntries = useMemo(() => {
    return Object.entries(state.log ?? {})
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 10);
  }, [state.log]);

  // Add-probe form
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [stage, setStage] = useState<Stage>("targeting");
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");

  const addProbe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position) return;
    const probe: Opportunity = {
      id: (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `probe-${Date.now()}`,
      company,
      position,
      type: "role",
      location: location || "Remote",
      stage,
      note: note || undefined,
      url: url || undefined,
    };
    update((s) => ({ ...s, customOpps: [...(s.customOpps ?? []), probe] }));
    setCompany("");
    setPosition("");
    setLocation("");
    setNote("");
    setUrl("");
    setStage("targeting");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[13px] text-text-dim">Viewing</div>
            <div className="text-[18px] font-semibold text-text">{profile.email}</div>
          </div>
          <button
            onClick={() => setActingAs(profile.id, profile.email ?? "")}
            className="shrink-0 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90"
          >
            Open their full board →
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Stat label="Probes" value={opps.length} />
          {STAGES.filter((s) => byStage[s]).map((s) => (
            <Stat key={s} label={STAGE_LABELS[s]} value={byStage[s] ?? 0} />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 text-[13px] font-semibold text-text">Probes</div>
        {opps.length === 0 ? (
          <p className="text-[13px] text-text-dim">No probes yet. Add their first one below.</p>
        ) : (
          <div className="space-y-2">
            {opps.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border border-border bg-bg px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium text-text">
                    {o.company} · {o.position}
                  </div>
                  {o.note && <div className="truncate text-[12px] text-text-dim">{o.note}</div>}
                </div>
                <span className="ml-3 shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] text-text-dim">
                  {STAGE_LABELS[o.stage]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={addProbe} className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 text-[13px] font-semibold text-text">Add a probe to their board</div>
        <div className="grid grid-cols-2 gap-3">
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company *" className={inputCls} />
          <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Role / position *" className={inputCls} />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className={inputCls} />
          <select value={stage} onChange={(e) => setStage(e.target.value as Stage)} className={inputCls}>
            {STAGES.map((s) => (
              <option key={s} value={s}>{STAGE_LABELS[s]}</option>
            ))}
          </select>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Job URL (optional)" className={`${inputCls} col-span-2`} />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className={`${inputCls} col-span-2`} />
        </div>
        <button type="submit" className="mt-3 rounded-lg bg-accent px-4 py-2 text-[14px] font-semibold text-white hover:opacity-90">
          Add probe
        </button>
      </form>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 text-[13px] font-semibold text-text">Recent activity (mission log)</div>
        {logEntries.length === 0 ? (
          <p className="text-[13px] text-text-dim">No log entries yet.</p>
        ) : (
          <div className="space-y-1">
            {logEntries.map(([date]) => (
              <div key={date} className="text-[12px] text-text-dim">{date}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-accent";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-bg px-3 py-2">
      <div className="text-[18px] font-bold leading-none text-text">{value}</div>
      <div className="mt-1 text-[11px] text-text-dim">{label}</div>
    </div>
  );
}
