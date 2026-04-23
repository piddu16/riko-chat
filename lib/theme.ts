"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "riko-theme";

/** Read the current theme — prefers localStorage, falls back to dark. */
function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore storage access failures (private mode, etc) */
  }
  return "dark";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

/** React hook for the app's theme state. Syncs to localStorage + <html data-theme>. */
export function useTheme(): { theme: Theme; toggle: () => void; set: (t: Theme) => void } {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount. The pre-paint script in layout.tsx
  // has already set the <html data-theme> attribute, so no FOUC.
  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  const set = useCallback((t: Theme) => {
    setTheme(t);
    applyTheme(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    set(theme === "dark" ? "light" : "dark");
  }, [theme, set]);

  // Avoid a mismatched render between SSR and client during hydration
  return { theme: mounted ? theme : "dark", toggle, set };
}

/** Inline script — runs in the <head> before any React code executes,
 *  so the initial paint already uses the saved theme (no flash). */
export const THEME_INIT_SCRIPT = `
(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t='dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();
`.trim();
