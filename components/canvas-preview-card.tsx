"use client";

import { motion } from "framer-motion";
import { BarChart3, FileText, GitCompareArrows, Receipt, ArrowUpRight } from "lucide-react";
import type { CanvasRef } from "@/lib/types";

const KIND_META: Record<
  CanvasRef["kind"],
  { icon: typeof BarChart3; label: string; accent: string }
> = {
  "revenue-chart": { icon: BarChart3, label: "Interactive chart", accent: "var(--blue)" },
  "mis-report": { icon: FileText, label: "MIS Report", accent: "var(--green)" },
  "recon-report": { icon: GitCompareArrows, label: "Reconciliation", accent: "var(--purple)" },
  invoice: { icon: Receipt, label: "Invoice", accent: "var(--orange)" },
};

/** Inline card shown in a chat message whenever the response has a canvas artifact.
 *  Tap → opens that artifact in the canvas (desktop: right pane · mobile: full-screen). */
export function CanvasPreviewCard({
  ref_,
  onOpen,
}: {
  ref_: CanvasRef;
  onOpen: () => void;
}) {
  const meta = KIND_META[ref_.kind];
  const Icon = meta.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onOpen}
      className="w-full text-left rounded-xl p-4 cursor-pointer group transition-all hover:-translate-y-[1px]"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `color-mix(in srgb, ${meta.accent} 14%, transparent)` }}
        >
          <Icon size={18} style={{ color: meta.accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] uppercase tracking-wider font-semibold mb-0.5"
            style={{ color: meta.accent }}
          >
            {meta.label}
          </p>
          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-1)" }}>
            {ref_.title}
          </p>
          {ref_.subtitle && (
            <p className="text-[11px] truncate" style={{ color: "var(--text-4)" }}>
              {ref_.subtitle}
            </p>
          )}
        </div>
        <div
          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-md flex-shrink-0 transition-colors group-hover:bg-[var(--bg-hover)]"
          style={{ color: "var(--text-2)" }}
        >
          Open
          <ArrowUpRight size={12} />
        </div>
      </div>
    </motion.button>
  );
}
