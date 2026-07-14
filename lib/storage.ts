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
async function loadRemote(userId: string): Promise<AppState | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("user_state")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return { ...defaultState, ...(data.state as Partial<AppState>) };
}

async function saveRemote(userId: string, state: AppState) {
  if (!supabase) return;
  await supabase
    .from("user_state")
    .upsert({ user_id: userId, state, updated_at: new Date().toISOString() });
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

  useEffect(() => {
    let active = true;
    (async () => {
      if (supabaseEnabled && supabase) {
        let uid = targetUserId ?? null;
        if (!uid) {
          const { data } = await supabase.auth.getUser();
          uid = data.user?.id ?? null;
        }
        uidRef.current = uid;
        if (uid) {
          const remote = await loadRemote(uid);
          if (!active) return;
          if (remote) {
            setState(remote);
          } else {
            // First load for this account. For the user's own account, migrate
            // any existing local data up to the cloud once. For an admin target,
            // start empty.
            const seed = targetUserId ? defaultState : loadState();
            setState(seed);
            await saveRemote(uid, seed);
          }
          return;
        }
      }
      // Local-only mode.
      if (active) setState(loadState());
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
        // Debounced cloud write so rapid edits don't hammer the API.
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          void saveRemote(uid, next);
        }, 600);
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
