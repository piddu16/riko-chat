"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, X } from "lucide-react";
import type { PendingAction } from "@/lib/types";
import { relativeTime } from "@/lib/format";

/** Single row at the top of the empty state: "Yesterday you committed to…"
 *  Three options: Done, Snooze, Skip. Closes the ritual loop. */
export function YesterdayActionBanner({
  action,
  onResolve,
}: {
  action: PendingAction;
  onResolve: (outcome: "done" | "snooze" | "skip") => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl p-3 md:p-4 mb-5 flex items-start gap-3"
      style={{
        background: "color-mix(in srgb, var(--yellow) 10%, var(--bg-surface))",
        border: "1px solid color-mix(in srgb, var(--yellow) 28%, transparent)",
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
        style={{ background: "var(--yellow-bg)" }}
      >
        <Clock size={14} style={{ color: "var(--yellow)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "var(--yellow)" }}>
          Yesterday you said
        </p>
        <p className="text-sm font-medium mb-0.5" style={{ color: "var(--text-1)" }}>
          {action.verb} <span style={{ color: "var(--text-3)" }}>— {action.context}</span>
        </p>
        <p className="text-[11px]" style={{ color: "var(--text-4)" }}>
          Committed {relativeTime(action.setAt)}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-1.5 flex-shrink-0">
        <button
          onClick={() => onResolve("done")}
          className="text-[11px] font-semibold px-2.5 py-1.5 rounded-md cursor-pointer flex items-center gap-1 transition-colors"
          style={{
            background: "var(--green)",
            color: "white",
            border: "none",
          }}
        >
          <CheckCircle2 size={11} />
          Done
        </button>
        <button
          onClick={() => onResolve("snooze")}
          className="text-[11px] font-semibold px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
          style={{ background: "var(--bg-surface)", color: "var(--text-3)", border: "1px solid var(--border)" }}
        >
          Snooze
        </button>
        <button
          onClick={() => onResolve("skip")}
          aria-label="Skip"
          className="text-[11px] px-2 py-1.5 rounded-md cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: "var(--text-4)" }}
        >
          <X size={11} />
        </button>
      </div>
    </motion.div>
  );
}
