"use client";

// V4.2 · LinkedIn Brand Progress · post tracking + engagement trajectory + narrative pillar split
// Manual entry for now · future-state pulls via LinkedIn browser extension (task #173)
// Companion to /brand (content hub) · this is the metrics/progress view

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/storage";
import { Beacon, Sparkle } from "@/components/icons";
import type { BrandPostEntry, BrandSnapshot } from "@/lib/types";

const PILLARS: { id: BrandPostEntry["narrativePillar"]; label: string; color: string }[] = [
  { id: "pillar-1", label: "Pillar one", color: "rgb(var(--c-accent))" },
  { id: "pillar-2", label: "Pillar two", color: "rgb(var(--c-cool))" },
  { id: "pillar-3", label: "Pillar three", color: "rgb(var(--c-purple))" },
  { id: "pillar-4", label: "Pillar four", color: "rgb(var(--c-warn))" },
  { id: "pillar-5", label: "Pillar five", color: "rgb(var(--c-good))" },
  { id: "other", label: "Other", color: "rgb(var(--c-muted))" },
];

function emptyPost(): BrandPostEntry {
  return {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    postedAt: new Date().toISOString().split("T")[0],
    topic: "",
    hook: "",
    narrativePillar: "pillar-1",
    engagement: {},
  };
}

export default function BrandProgressPage() {
  const [state, update] = useAppState();
  const posts = state.brandPosts || [];
  const snapshots = state.brandSnapshots || [];

  const [draftPost, setDraftPost] = useState<BrandPostEntry>(emptyPost());
  const [showForm, setShowForm] = useState(false);
  const [snapshotDraft, setSnapshotDraft] = useState<Partial<BrandSnapshot>>({});
  const [showSnapshotForm, setShowSnapshotForm] = useState(false);

  function savePost() {
    if (!draftPost.topic.trim() || !draftPost.hook.trim()) return;
    update((s) => ({ ...s, brandPosts: [draftPost, ...(s.brandPosts || [])] }));
    setDraftPost(emptyPost());
    setShowForm(false);
  }

  function deletePost(id: string) {
    update((s) => ({ ...s, brandPosts: (s.brandPosts || []).filter((p) => p.id !== id) }));
  }

  function saveSnapshot() {
    if (!snapshotDraft.followerCount && !snapshotDraft.weeklyImpressions) return;
    const snap: BrandSnapshot = { capturedAt: new Date().toISOString(), ...snapshotDraft };
    update((s) => ({ ...s, brandSnapshots: [snap, ...(s.brandSnapshots || [])] }));
    setSnapshotDraft({});
    setShowSnapshotForm(false);
  }

  const pillarStats = useMemo(() => {
    return PILLARS.map((p) => {
      const matched = posts.filter((post) => post.narrativePillar === p.id);
      const totalLikes = matched.reduce((s, x) => s + (x.engagement?.likes || 0), 0);
      const totalComments = matched.reduce((s, x) => s + (x.engagement?.comments || 0), 0);
      const totalImpressions = matched.reduce((s, x) => s + (x.engagement?.impressions || 0), 0);
      const avgEng = matched.length > 0 ? Math.round((totalLikes + totalComments * 2) / matched.length) : 0;
      return { ...p, postCount: matched.length, totalLikes, totalComments, totalImpressions, avgEng };
    });
  }, [posts]);

  const topPillar = pillarStats.filter((p) => p.postCount > 0).sort((a, b) => b.avgEng - a.avgEng)[0];

  const totalPosts = posts.length;
  const last30 = posts.filter((p) => Date.now() - new Date(p.postedAt).getTime() < 30 * 86400000).length;
  const totalLikes = posts.reduce((s, p) => s + (p.engagement?.likes || 0), 0);
  const totalImpressions = posts.reduce((s, p) => s + (p.engagement?.impressions || 0), 0);

  const latestSnapshot = snapshots[0];
  const previousSnapshot = snapshots[1];
  const followerDelta = latestSnapshot?.followerCount && previousSnapshot?.followerCount
    ? latestSnapshot.followerCount - previousSnapshot.followerCount
    : null;

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-accent"><Beacon size={20} strokeWidth={1.5} /></span>
            <h1 className="display text-glow text-[34px] leading-[1.1] text-text m-0">Brand Progress</h1>
            <span className="font-mono text-[10px] uppercase tracking-[2px] font-bold text-purple bg-purple/15 px-2 py-0.5 rounded">V4.2</span>
          </div>
          <p className="text-[14px] text-text-dim m-0 max-w-3xl">
            Track every post · log engagement · see which narrative pillars move the needle. Manual entry now · auto-pull via LinkedIn extension is the V5 unlock.
          </p>
        </div>
        <span className="font-mono text-[10px] text-muted lowercase">BP.01</span>
      </div>

      <div className="retro-band mb-6"><span /><span /></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="font-mono text-[10px] text-muted uppercase tracking-[1.8px] font-semibold mb-2">Posts logged</div>
          <div className="font-mono text-[28px] font-bold leading-none text-text">{totalPosts}</div>
          <div className="text-[11px] text-text-dim mt-1.5">{last30} in last 30d</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="font-mono text-[10px] text-muted uppercase tracking-[1.8px] font-semibold mb-2">Total likes</div>
          <div className="font-mono text-[28px] font-bold leading-none text-text">{totalLikes}</div>
          <div className="text-[11px] text-text-dim mt-1.5">across all posts</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="font-mono text-[10px] text-muted uppercase tracking-[1.8px] font-semibold mb-2">Impressions</div>
          <div className="font-mono text-[28px] font-bold leading-none text-text">{totalImpressions.toLocaleString()}</div>
          <div className="text-[11px] text-text-dim mt-1.5">cumulative</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="font-mono text-[10px] text-muted uppercase tracking-[1.8px] font-semibold mb-2">Followers</div>
          <div className="font-mono text-[28px] font-bold leading-none text-text">{latestSnapshot?.followerCount || "—"}</div>
          {followerDelta !== null && (
            <div className={`text-[11px] mt-1.5 font-mono ${followerDelta > 0 ? "text-good" : followerDelta < 0 ? "text-hot" : "text-muted"}`}>
              {followerDelta > 0 ? "+" : ""}{followerDelta} vs prev
            </div>
          )}
        </div>
      </div>

      {posts.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-5 mb-4 relative">
          <span className="absolute top-3 right-3 font-mono text-[10px] text-muted/60 lowercase">bp.02</span>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent"><Sparkle size={16} strokeWidth={1.5} /></span>
            <h3 className="text-[15px] font-semibold text-text m-0">Narrative pillar split</h3>
          </div>
          <p className="text-[12px] text-text-dim mb-4 m-0">
            {topPillar
              ? <>Top-engaging pillar so far · <strong className="text-text">{topPillar.label}</strong> · {topPillar.postCount} posts · avg engagement {topPillar.avgEng}</>
              : <>Add posts with engagement data to see which pillar lands.</>}
          </p>
          <div className="space-y-2">
            {pillarStats.map((p) => {
              const maxEng = Math.max(...pillarStats.map((x) => x.avgEng), 1);
              const widthPct = Math.max((p.avgEng / maxEng) * 100, p.postCount > 0 ? 5 : 1);
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-[11px] text-text-dim w-[150px] flex-shrink-0">{p.label}</span>
                  <div className="flex-1 bg-surface-2 rounded h-5 relative overflow-hidden">
                    <div className="h-full rounded transition-all" style={{ width: `${widthPct}%`, background: p.color }} />
                    <span className="absolute inset-0 flex items-center px-2 font-mono text-[10px] font-bold text-text">
                      {p.postCount} {p.postCount === 1 ? "post" : "posts"} · avg {p.avgEng}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-accent text-white rounded-md font-bold text-[12px] hover:bg-accent-2 transition">
          {showForm ? "Cancel" : "+ Log post"}
        </button>
        <button onClick={() => setShowSnapshotForm(!showSnapshotForm)} className="px-4 py-2 border border-border text-text rounded-md font-semibold text-[12px] hover:bg-surface-2 transition">
          {showSnapshotForm ? "Cancel" : "+ Snapshot followers"}
        </button>
      </div>

      {showSnapshotForm && (
        <div className="bg-surface border border-border rounded-lg p-4 mb-4">
          <h3 className="text-[13px] font-semibold text-text mb-3">Profile snapshot · {new Date().toLocaleDateString()}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div>
              <label className="block label-caps mb-1">Followers</label>
              <input type="number" value={snapshotDraft.followerCount || ""}
                onChange={(e) => setSnapshotDraft({ ...snapshotDraft, followerCount: Number(e.target.value) || undefined })}
                placeholder="1247" className="w-full text-[13px] p-2 border border-border rounded-md bg-surface font-mono" />
            </div>
            <div>
              <label className="block label-caps mb-1">Weekly impressions</label>
              <input type="number" value={snapshotDraft.weeklyImpressions || ""}
                onChange={(e) => setSnapshotDraft({ ...snapshotDraft, weeklyImpressions: Number(e.target.value) || undefined })}
                placeholder="3800" className="w-full text-[13px] p-2 border border-border rounded-md bg-surface font-mono" />
            </div>
            <div>
              <label className="block label-caps mb-1">SSI (optional)</label>
              <input type="number" value={snapshotDraft.sssr || ""}
                onChange={(e) => setSnapshotDraft({ ...snapshotDraft, sssr: Number(e.target.value) || undefined })}
                placeholder="0-100" className="w-full text-[13px] p-2 border border-border rounded-md bg-surface font-mono" />
            </div>
          </div>
          <button onClick={saveSnapshot} className="px-4 py-2 bg-accent text-white rounded-md font-bold text-[12px] hover:bg-accent-2 transition">
            Save snapshot
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-surface border border-border rounded-lg p-4 mb-4">
          <h3 className="text-[13px] font-semibold text-text mb-3">Log a new post</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block label-caps mb-1">Posted on</label>
              <input type="date" value={draftPost.postedAt} onChange={(e) => setDraftPost({ ...draftPost, postedAt: e.target.value })}
                className="w-full text-[13px] p-2 border border-border rounded-md bg-surface font-mono" />
            </div>
            <div>
              <label className="block label-caps mb-1">Narrative pillar</label>
              <select value={draftPost.narrativePillar}
                onChange={(e) => setDraftPost({ ...draftPost, narrativePillar: e.target.value as BrandPostEntry["narrativePillar"] })}
                className="w-full text-[13px] p-2 border border-border rounded-md bg-surface">
                {PILLARS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <label className="block label-caps mb-1">Topic · short tag</label>
          <input type="text" value={draftPost.topic} onChange={(e) => setDraftPost({ ...draftPost, topic: e.target.value })}
            placeholder="e.g. product launch · a pitch · AI workflow demo"
            className="w-full text-[13px] p-2 border border-border rounded-md bg-surface mb-3" />
          <label className="block label-caps mb-1">Hook · scroll-stop line</label>
          <textarea value={draftPost.hook} onChange={(e) => setDraftPost({ ...draftPost, hook: e.target.value })}
            placeholder="First 1-2 lines of the post · the line that decides if people read on"
            className="w-full text-[12px] p-2 border border-border rounded-md bg-surface min-h-[60px] mb-3" />
          <label className="block label-caps mb-1">URL (optional)</label>
          <input type="url" value={draftPost.url || ""} onChange={(e) => setDraftPost({ ...draftPost, url: e.target.value })}
            placeholder="linkedin.com/posts/..." className="w-full text-[13px] p-2 border border-border rounded-md bg-surface mb-3" />
          <label className="block label-caps mb-1">Engagement (optional · come back to log later)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <input type="number" placeholder="Likes" value={draftPost.engagement?.likes || ""}
              onChange={(e) => setDraftPost({ ...draftPost, engagement: { ...draftPost.engagement, likes: Number(e.target.value) || undefined } })}
              className="text-[13px] p-2 border border-border rounded-md bg-surface font-mono" />
            <input type="number" placeholder="Comments" value={draftPost.engagement?.comments || ""}
              onChange={(e) => setDraftPost({ ...draftPost, engagement: { ...draftPost.engagement, comments: Number(e.target.value) || undefined } })}
              className="text-[13px] p-2 border border-border rounded-md bg-surface font-mono" />
            <input type="number" placeholder="Reposts" value={draftPost.engagement?.reposts || ""}
              onChange={(e) => setDraftPost({ ...draftPost, engagement: { ...draftPost.engagement, reposts: Number(e.target.value) || undefined } })}
              className="text-[13px] p-2 border border-border rounded-md bg-surface font-mono" />
            <input type="number" placeholder="Impressions" value={draftPost.engagement?.impressions || ""}
              onChange={(e) => setDraftPost({ ...draftPost, engagement: { ...draftPost.engagement, impressions: Number(e.target.value) || undefined } })}
              className="text-[13px] p-2 border border-border rounded-md bg-surface font-mono" />
          </div>
          <button onClick={savePost} disabled={!draftPost.topic.trim() || !draftPost.hook.trim()}
            className="px-4 py-2 bg-accent text-white rounded-md font-bold text-[12px] hover:bg-accent-2 transition disabled:opacity-40">
            Save post
          </button>
        </div>
      )}

      {posts.length === 0 && !showForm ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <div className="inline-flex text-muted opacity-40 mb-3"><Beacon size={48} strokeWidth={1.25} /></div>
          <p className="text-[13px] text-text-dim m-0">No posts logged yet. Hit &ldquo;+ Log post&rdquo; to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => {
            const pillar = PILLARS.find((x) => x.id === p.narrativePillar);
            const totalEng = (p.engagement?.likes || 0) + (p.engagement?.comments || 0) + (p.engagement?.reposts || 0);
            return (
              <div key={p.id} className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <strong className="text-[14px] text-text">{p.topic}</strong>
                    {pillar && (
                      <span className="font-mono text-[10px] uppercase tracking-[1.5px] font-bold px-2 py-0.5 rounded" style={{ color: pillar.color, background: `color-mix(in srgb, ${pillar.color} 18%, transparent)` }}>
                        {pillar.label}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-muted">{new Date(p.postedAt).toLocaleDateString()}</span>
                  </div>
                  <button onClick={() => deletePost(p.id)} className="font-mono text-[10px] text-muted hover:text-hot uppercase">Delete</button>
                </div>
                <p className="text-[12px] text-text-dim italic mb-2 m-0">&ldquo;{p.hook}&rdquo;</p>
                {totalEng > 0 && (
                  <div className="flex flex-wrap gap-3 text-[11px] font-mono text-text-dim mt-2">
                    {p.engagement?.likes ? <span>{p.engagement.likes} likes</span> : null}
                    {p.engagement?.comments ? <span>· {p.engagement.comments} comments</span> : null}
                    {p.engagement?.reposts ? <span>· {p.engagement.reposts} reposts</span> : null}
                    {p.engagement?.impressions ? <span>· {p.engagement.impressions.toLocaleString()} impressions</span> : null}
                  </div>
                )}
                {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-accent hover:underline mt-2 inline-block">View on LinkedIn →</a>}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-border text-[11px] text-muted flex items-center justify-between flex-wrap gap-2">
        <Link href="/brand" className="text-accent hover:underline font-mono uppercase tracking-[1.5px]">← Brand Hub (content + strategy)</Link>
        <Link href="/resume-lab" className="text-accent hover:underline font-mono uppercase tracking-[1.5px]">Resume Lab →</Link>
      </div>
    </div>
  );
}
