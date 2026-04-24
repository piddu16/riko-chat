"use client";

import { useCallback, useEffect, useState } from "react";
import type { PendingAction } from "./types";
export type { PendingAction };

/* ── Lightweight per-device personalization state.
 *
 *   ▸ user name           — shown in greetings
 *   ▸ onboarded            — has the user completed Connect-Tally (even mocked)
 *   ▸ whatsappOptIn        — has the user opted into 9am daily summaries
 *   ▸ whatsappPhone        — their number (E.164 or local, user-entered)
 *   ▸ lastVisitISO         — for the streak + yesterday's-action flow
 *   ▸ streakDays           — running count of distinct-day visits
 *   ▸ pendingAction        — an action the user committed to yesterday
 *
 *  All values live in localStorage. No auth, no backend. */

const KEYS = {
  name: "riko-user-name",
  onboarded: "riko-onboarded",
  whatsappOptIn: "riko-wa-optin",
  whatsappPhone: "riko-wa-phone",
  lastVisit: "riko-last-visit",
  streak: "riko-streak",
  pendingAction: "riko-pending-action",
} as const;

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, value); } catch { /* ignore */ }
}

function safeRemove(key: string) {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(key); } catch { /* ignore */ }
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isYesterday(earlier: Date, later: Date): boolean {
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = later.setHours(0,0,0,0) - new Date(earlier).setHours(0,0,0,0);
  return diff === oneDay;
}

/** Computes greeting based on current time. */
export function greetingFor(now: Date = new Date()): "Good morning" | "Good afternoon" | "Good evening" {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** React hook — returns the full personalization state + mutators. */
export function usePersonalization() {
  const [name, setNameState] = useState<string | null>(null);
  const [onboarded, setOnboardedState] = useState<boolean>(false);
  const [whatsappOptIn, setWhatsappOptInState] = useState<boolean>(false);
  const [whatsappPhone, setWhatsappPhoneState] = useState<string>("");
  const [streakDays, setStreakDaysState] = useState<number>(0);
  const [pendingAction, setPendingActionState] = useState<PendingAction | null>(null);
  const [mounted, setMounted] = useState(false);

  // Hydrate on mount
  useEffect(() => {
    const now = new Date();
    setNameState(safeGet(KEYS.name));
    setOnboardedState(safeGet(KEYS.onboarded) === "1");
    setWhatsappOptInState(safeGet(KEYS.whatsappOptIn) === "1");
    setWhatsappPhoneState(safeGet(KEYS.whatsappPhone) ?? "");

    const pendingRaw = safeGet(KEYS.pendingAction);
    if (pendingRaw) {
      try {
        setPendingActionState(JSON.parse(pendingRaw) as PendingAction);
      } catch { /* ignore malformed */ }
    }

    // Streak logic: if last visit was yesterday, increment; same day, keep; otherwise reset to 1.
    const lastRaw = safeGet(KEYS.lastVisit);
    const storedStreak = parseInt(safeGet(KEYS.streak) ?? "0", 10);
    let newStreak = 1;
    if (lastRaw) {
      const last = new Date(lastRaw);
      if (isSameDay(last, now)) {
        newStreak = storedStreak || 1;
      } else if (isYesterday(last, now)) {
        newStreak = storedStreak + 1;
      } else {
        newStreak = 1;
      }
    }
    safeSet(KEYS.lastVisit, now.toISOString());
    safeSet(KEYS.streak, newStreak.toString());
    setStreakDaysState(newStreak);

    setMounted(true);
  }, []);

  const setName = useCallback((n: string) => {
    setNameState(n);
    safeSet(KEYS.name, n);
  }, []);

  const markOnboarded = useCallback(() => {
    setOnboardedState(true);
    safeSet(KEYS.onboarded, "1");
  }, []);

  const setWhatsappOptIn = useCallback((v: boolean) => {
    setWhatsappOptInState(v);
    safeSet(KEYS.whatsappOptIn, v ? "1" : "0");
  }, []);

  const setWhatsappPhone = useCallback((p: string) => {
    setWhatsappPhoneState(p);
    safeSet(KEYS.whatsappPhone, p);
  }, []);

  const setPendingAction = useCallback((action: PendingAction | null) => {
    setPendingActionState(action);
    if (action) safeSet(KEYS.pendingAction, JSON.stringify(action));
    else safeRemove(KEYS.pendingAction);
  }, []);

  return {
    mounted,
    name,
    onboarded,
    whatsappOptIn,
    whatsappPhone,
    streakDays,
    pendingAction,
    setName,
    markOnboarded,
    setWhatsappOptIn,
    setWhatsappPhone,
    setPendingAction,
  };
}

/* Exported for tests / SSR seed */
export const PERSONALIZATION_KEYS = KEYS;
