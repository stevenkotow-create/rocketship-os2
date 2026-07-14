"use client";

import { useEffect, useState } from "react";
import type { AppState } from "./types";

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

export function useAppState() {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    setState(loadState());
  }, []);

  const update = (updater: (s: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  };

  return [state, update] as const;
}

export function resetState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("ors-welcome-dismissed");
  window.location.reload();
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
