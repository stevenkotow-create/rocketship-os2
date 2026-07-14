"use client";

import { useState } from "react";
import { useAppState } from "@/lib/storage";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import type { ResumeVersion } from "@/lib/types";

// Add your CV versions, cover letters, and supporting assets here (or via the "Add a version" button).
const SEED_VERSIONS: ResumeVersion[] = [];

const TYPE_LABEL = {
  cv: "📄 CV",
  cover_letter: "✉️ Cover Letter",
  supporting: "📎 Supporting Asset",
};

const TYPE_COLOR = {
  cv: "border-accent",
  cover_letter: "border-cool",
  supporting: "border-muted",
};

export default function ResumeHub() {
  const [state, update] = useAppState();
  const versions = state.resumes && state.resumes.length > 0 ? state.resumes : SEED_VERSIONS;
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<Partial<ResumeVersion>>({
    type: "cover_letter",
    createdAt: new Date().toISOString().split("T")[0],
  });

  function addVersion() {
    if (!draft.name) return;
    const newVersion: ResumeVersion = {
      id: `${draft.type}-${draft.company?.toLowerCase().replace(/\s/g, "-") || "asset"}-${Date.now()}`,
      name: draft.name,
      type: (draft.type as ResumeVersion["type"]) || "cover_letter",
      company: draft.company,
      opportunityId: draft.opportunityId,
      filePath: draft.filePath,
      createdAt: draft.createdAt || new Date().toISOString().split("T")[0],
      notes: draft.notes,
    };
    update((s) => ({
      ...s,
      resumes: [...(s.resumes || SEED_VERSIONS), newVersion],
    }));
    setDraft({ type: "cover_letter", createdAt: new Date().toISOString().split("T")[0] });
    setShowAdd(false);
  }

  function deleteVersion(id: string) {
    update((s) => ({
      ...s,
      resumes: (s.resumes || SEED_VERSIONS).filter((v) => v.id !== id),
    }));
  }

  function setMaster(id: string) {
    update((s) => ({
      ...s,
      resumes: (s.resumes || SEED_VERSIONS).map((v) => ({
        ...v,
        isMaster: v.type === "cv" ? v.id === id : v.isMaster,
      })),
    }));
  }

  const masterCV = versions.find((v) => v.type === "cv" && v.isMaster);
  const cvs = versions.filter((v) => v.type === "cv");
  const coverLetters = versions.filter((v) => v.type === "cover_letter");
  const supporting = versions.filter((v) => v.type === "supporting");

  // group cover letters by company
  const coverByCompany = coverLetters.reduce<Record<string, ResumeVersion[]>>((acc, cl) => {
    const key = cl.company || "Unassigned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(cl);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight mb-1.5">Resume Hub 📄</h1>
      <p className="text-muted text-sm mb-6">
        Every CV version + company-tailored cover letter + supporting asset in one place. Track which artifact ships with which Mission.
      </p>

      {versions.length === 0 && (
        <div className="card text-center py-10 mb-6">
          <p className="text-2xl mb-2">📄</p>
          <p className="text-sm text-text-dim">No versions yet.</p>
          <p className="text-xs text-muted mt-1">Add your master CV and tailored cover letters to build your artifact gallery.</p>
        </div>
      )}

      {/* MASTER CV PROMINENT */}
      {masterCV && (
        <div className="mb-6">
          <div className="text-[11px] text-muted uppercase tracking-wider mb-2">Master CV (current)</div>
          <div className="bg-gradient-to-br from-surface-2 to-surface border-2 border-accent rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-[260px]">
                <div className="text-[10px] text-accent uppercase tracking-wider font-bold mb-1">⭐ Master</div>
                <h2 className="text-lg font-bold text-navy">{masterCV.name}</h2>
                {masterCV.filePath && (
                  <p className="text-xs text-muted mt-1 font-mono">{masterCV.filePath}</p>
                )}
                <p className="text-[11px] text-text-dim mt-2">Created {masterCV.createdAt}</p>
                {masterCV.notes && (
                  <p className="text-[13px] text-text-dim mt-2 italic">{masterCV.notes}</p>
                )}
              </div>
              <div className="text-right text-xs text-muted">
                Use this for default ATS uploads
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW */}
      <div className="mb-6">
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="text-xs px-3 py-2 bg-accent text-white rounded font-semibold hover:bg-accent/90"
          >
            + Add a version
          </button>
        ) : (
          <div className="card !border-accent">
            <h3 className="text-base font-semibold mb-3">Add a new version</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value as ResumeVersion["type"] })}
                  className="bg-surface-2 border border-border rounded p-2 text-sm"
                >
                  <option value="cv">📄 CV</option>
                  <option value="cover_letter">✉️ Cover Letter</option>
                  <option value="supporting">📎 Supporting Asset</option>
                </select>
                <input
                  type="date"
                  value={draft.createdAt}
                  onChange={(e) => setDraft({ ...draft, createdAt: e.target.value })}
                  className="bg-surface-2 border border-border rounded p-2 text-sm"
                />
              </div>
              <input
                type="text"
                placeholder="Filename (e.g. Cover Letter - Example Corp.pdf)"
                value={draft.name || ""}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full bg-surface-2 border border-border rounded p-2 text-sm"
              />
              <input
                type="text"
                placeholder="Company (optional, for cover letters)"
                value={draft.company || ""}
                onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                className="w-full bg-surface-2 border border-border rounded p-2 text-sm"
              />
              <select
                value={draft.opportunityId || ""}
                onChange={(e) => setDraft({ ...draft, opportunityId: e.target.value || undefined })}
                className="w-full bg-surface-2 border border-border rounded p-2 text-sm"
              >
                <option value="">Link to a Mission (optional)</option>
                {OPPORTUNITIES.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.company} · {o.position}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="File path (optional, for reference)"
                value={draft.filePath || ""}
                onChange={(e) => setDraft({ ...draft, filePath: e.target.value })}
                className="w-full bg-surface-2 border border-border rounded p-2 text-sm font-mono text-xs"
              />
              <textarea
                placeholder="Notes (what's in this version, what to remember)"
                value={draft.notes || ""}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                rows={2}
                className="w-full bg-surface-2 border border-border rounded p-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={addVersion}
                  disabled={!draft.name}
                  className="text-xs px-3 py-2 bg-accent text-white rounded font-semibold disabled:opacity-50 hover:bg-accent/90"
                >
                  Save version
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="text-xs px-3 py-2 bg-surface-3 text-text rounded hover:bg-surface-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ALL CVs */}
      {cvs.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-7 mb-3">All CV Versions ({cvs.length})</h2>
          <div className="space-y-2 mb-4">
            {cvs.map((v) => (
              <VersionRow key={v.id} v={v} onSetMaster={() => setMaster(v.id)} onDelete={() => deleteVersion(v.id)} />
            ))}
          </div>
        </>
      )}

      {/* COVER LETTERS GROUPED BY COMPANY */}
      {coverLetters.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-7 mb-3">Cover Letters by Company ({coverLetters.length})</h2>
          <div className="space-y-3 mb-4">
            {Object.entries(coverByCompany).map(([company, items]) => (
              <div key={company} className="card">
                <div className="text-[11px] text-muted uppercase tracking-wider mb-2">{company}</div>
                <div className="space-y-2">
                  {items.map((v) => (
                    <VersionRow key={v.id} v={v} onDelete={() => deleteVersion(v.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* SUPPORTING ASSETS */}
      {supporting.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-7 mb-3">Supporting Assets ({supporting.length})</h2>
          <div className="space-y-2 mb-4">
            {supporting.map((v) => (
              <VersionRow key={v.id} v={v} onDelete={() => deleteVersion(v.id)} />
            ))}
          </div>
        </>
      )}

      <div className="card mt-8">
        <h3 className="text-base font-semibold mb-2">How this hub works</h3>
        <ul className="text-sm text-text-dim list-disc pl-5 space-y-1">
          <li>Master CV is the default upload for any ATS submission</li>
          <li>Cover letters get tailored per company · link them to the Mission Profile via the dropdown</li>
          <li>Supporting assets (Looms, video pitches, decks) live here too</li>
          <li>The platform doesn't store the actual file binary — just the metadata and path reference. The file lives in your workspace folder.</li>
          <li>When interviewing, this page becomes the artifact gallery you walk through alongside the Mission Profile</li>
        </ul>
      </div>
    </div>
  );
}

function VersionRow({ v, onSetMaster, onDelete }: { v: ResumeVersion; onSetMaster?: () => void; onDelete: () => void }) {
  return (
    <div className={`bg-surface border ${TYPE_COLOR[v.type]} rounded-lg p-3 flex items-start gap-3`}>
      <div className="text-xl mt-0.5">{TYPE_LABEL[v.type].split(" ")[0]}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">{v.name}</span>
          {v.isMaster && (
            <span className="text-[9px] bg-accent text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
              Master
            </span>
          )}
          {v.company && !v.isMaster && (
            <span className="text-[9px] bg-cool/20 text-cool px-1.5 py-0.5 rounded uppercase tracking-wider">
              {v.company}
            </span>
          )}
        </div>
        {v.filePath && <p className="text-[11px] text-muted mt-0.5 font-mono">{v.filePath}</p>}
        <p className="text-[10px] text-text-dim mt-0.5">Created {v.createdAt}</p>
        {v.notes && <p className="text-[12px] text-text-dim mt-1 italic">{v.notes}</p>}
      </div>
      <div className="flex flex-col gap-1">
        {v.type === "cv" && !v.isMaster && onSetMaster && (
          <button
            onClick={onSetMaster}
            className="text-[10px] px-2 py-1 bg-surface-3 text-text rounded hover:bg-accent hover:text-white"
          >
            Set master
          </button>
        )}
        <button
          onClick={onDelete}
          className="text-[10px] px-2 py-1 bg-surface-3 text-muted rounded hover:bg-hot hover:text-white"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
