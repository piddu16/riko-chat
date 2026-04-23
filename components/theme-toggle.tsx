"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Moon : Sun;

  if (compact) {
    return (
      <button
        aria-label={`Switch to ${next} mode`}
        title={`Switch to ${next} mode`}
        onClick={toggle}
        className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
        style={{ color: "var(--text-3)" }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -30 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 30 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-center"
          >
            <Icon size={15} />
          </motion.span>
        </AnimatePresence>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
      style={{ color: "var(--text-3)" }}
      aria-label={`Switch to ${next} mode`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          <Icon size={13} />
        </motion.span>
      </AnimatePresence>
      <span className="capitalize">{theme === "dark" ? "Dark" : "Light"} mode</span>
    </button>
  );
}
