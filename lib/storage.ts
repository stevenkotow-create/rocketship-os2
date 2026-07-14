"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppState } from "./types";
import { supabase, supabaseEnabled } from "./supabase";

const STORAGE_KEY = "operation-rocket-ship-v2";

const defaultState: AppState = {
  opps: {},
  tasks: {},
  ritual: {},
  log: {},
  energy: {},
  cadence: {},
  expandedOpps: {},
  customOpps: [],
  currentPhase: 1,
  chat: [],
};

// ---------------------------------------------------------------------------
// Local (per-browser) cache. Used as a fallback when the backend is not
// configured, and as an offline mirror + one-time migration source when it is.
// ---------------------------------------------------------------------------
export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------------------------------------------------------------------------
// Remote (Supabase) persistence. One row per user in `user_state`.
// ---------------------------------------------------------------------------
// Discriminated result so a failed READ is never mistaken for "new empty user"
// (that mistake could seed + save an empty state over real data).
type LoadResult =
  | { ok: true; state: AppState }
  | { ok: false; empty: boolean };

async function loadRemote(userId: string): Promise<LoadResult> {
  if (!supabase) return { ok: false, empty: true };
  const { data, error } = await supabase
    .from("user_state")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return { ok: false, empty: false }; // read failed — do NOT treat as empty
  if (!data) return { ok: false, empty: true }; // genuinely no row yet
  return { ok: true, state: { ...defaultState, ...(data.state as Partial<AppState>) } };
}

async function saveRemote(userId: string, state: AppState) {
  if (!supabase) return;
  await supabase
    .from("user_state")
    .upsert({ user_id: userId, state, updated_at: new Date().toISOString() });
}

// ---------------------------------------------------------------------------
// Admin "act as" mode. An admin opens another user's board and drives the whole
// app against that user's cloud data. Guarded server-side by RLS (only admins
// can read/write other users' rows), so a non-admin setting this achieves
// nothing.
// ---------------------------------------------------------------------------
const ACTING_AS_KEY = "ors-acting-as";

export function getActingAs(): { userId: string; email: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTING_AS_KEY);
    return raw ? (JSON.parse(raw) as { userId: string; email: string }) : null;
  } catch {
    return null;
  }
}

export function setActingAs(userId: string, email: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTING_AS_KEY, JSON.stringify({ userId, email }));
  window.location.href = "/";
}

export function clearActingAs() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACTING_AS_KEY);
  window.location.href = "/admin";
}

// ---------------------------------------------------------------------------
// useAppState()
//   - No backend configured  -> localStorage (original behaviour).
//   - Backend + logged in     -> that user's cloud row (syncs across devices).
//   - Backend + targetUserId  -> admin/coach editing another user's row.
// The [state, update] interface is unchanged, so no calling component changes.
// ---------------------------------------------------------------------------
export function useAppState(targetUserId?: string) {
  const [state, setState] = useState<AppState>(defaultState);
  const uidRef = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    let active = true;
    loadedRef.current = false;
    (async () => {
      if (supabaseEnabled && supabase) {
        // If an admin is "acting as" another user, the no-arg hook drives that
        // user's data across the whole app.
        const acting = targetUserId ? null : getActingAs();
        let uid = targetUserId ?? acting?.userId ?? null;
        if (!uid) {
          const { data } = await supabase.auth.getUser();
          uid = data.user?.id ?? null;
        }
        uidRef.current = uid;
        if (uid) {
          const res = await loadRemote(uid);
          if (!active) return;
          if (res.ok) {
            setState(res.state);
            loadedRef.current = true; // safe to persist edits
          } else if (res.empty) {
            // Genuinely no row yet -> seed once. Own account migrates local data
            // up; a target / acted-as account starts empty.
            const seed = targetUserId || acting ? defaultState : loadState();
            setState(seed);
            await saveRemote(uid, seed);
            loadedRef.current = true;
          } else {
            // Read FAILED (network/transient). Show defaults in memory but keep
            // loadedRef false so no edit can save an empty state over real data.
            setState(defaultState);
          }
          return;
        }
      }
      // Local-only mode.
      if (active) {
        setState(loadState());
        loadedRef.current = true;
      }
    })();
    return () => {
      active = false;
    };
  }, [targetUserId]);

  const update = useCallback((updater: (s: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      const uid = uidRef.current;
      if (supabaseEnabled && uid) {
        // Never persist before the initial cloud load has completed, or the
        // empty default state could overwrite real data (this is what wiped a
        // board when opened in admin "act as" mode).
        if (loadedRef.current) {
          if (saveTimer.current) clearTimeout(saveTimer.current);
          saveTimer.current = setTimeout(() => {
            void saveRemote(uid, next);
          }, 600);
        }
      } else {
        saveState(next);
      }
      return next;
    });
  }, []);

  return [state, update] as const;
}

export function resetState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("ors-welcome-dismissed");
  if (supabaseEnabled && supabase) {
    void supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id;
      if (uid) void saveRemote(uid, defaultState);
      window.location.reload();
    });
  } else {
    window.location.reload();
  }
}

// V2.5 · welcome banner dismissal · per-browser, shown once
const WELCOME_KEY = "ors-welcome-dismissed";

export function hasSeenWelcome(): boolean {
  if (typeof window === "undefined") return true; // SSR · assume seen so it doesn't flash
  return localStorage.getItem(WELCOME_KEY) === "true";
}

export function dismissWelcome() {
  if (typeof window === "undefined") return;
  localStorage.setItem(WELCOME_KEY, "true");
}

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function weekStart(d = new Date()): string {
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  return monday.toISOString().split("T")[0];
}
