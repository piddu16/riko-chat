"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart3, FileText, GitCompareArrows, Receipt } from "lucide-react";
import type { CanvasArtifact } from "@/lib/types";
import { RevenueChartRenderer } from "./revenue-chart";
import { MisReportRenderer } from "./mis-report";
import { ReconReportRenderer } from "./recon-report";
import { InvoiceRenderer } from "./invoice";

const KIND_META: Record<
  CanvasArtifact["kind"],
  { icon: typeof BarChart3; label: string }
> = {
  "revenue-chart": { icon: BarChart3, label: "Chart" },
  "mis-report": { icon: FileText, label: "Report" },
  "recon-report": { icon: GitCompareArrows, label: "Recon" },
  invoice: { icon: Receipt, label: "Invoice" },
};

export function Canvas({
  artifacts,
  activeId,
  onSelect,
  onClose,
  variant,
}: {
  artifacts: CanvasArtifact[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  /** "split" = desktop embedded right pane · "full" = mobile full-screen */
  variant: "split" | "full";
}) {
  const active = artifacts.find((a) => a.id === activeId) ?? artifacts[artifacts.length - 1];

  if (!active) return null;

  return (
    <div
      className="flex flex-col h-full min-h-0"
      style={{
        background: "var(--bg-primary)",
        borderLeft: variant === "split" ? "1px solid var(--border)" : undefined,
      }}
    >
      {/* Header: tab bar + close */}
      <header
        className="flex items-center h-14 px-3 gap-2 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {artifacts.map((a) => {
            const Icon = KIND_META[a.kind].icon;
            const isActive = a.id === active.id;
            return (
              <button
                key={a.id}
                onClick={() => onSelect(a.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors flex-shrink-0"
                style={{
                  background: isActive ? "var(--bg-surface)" : "transparent",
                  color: isActive ? "var(--text-1)" : "var(--text-4)",
                  border: `1px solid ${isActive ? "var(--border)" : "transparent"}`,
                }}
              >
                <Icon size={13} style={{ color: isActive ? "var(--green)" : "var(--text-4)" }} />
                <span className="max-w-[180px] truncate">{a.title}</span>
              </button>
            );
          })}
        </div>
        <button
          aria-label="Close canvas"
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors hover:bg-[var(--bg-surface)]"
          style={{ color: "var(--text-3)" }}
        >
          <X size={16} />
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-4xl mx-auto p-5 md:p-6"
          >
            <ArtifactRenderer artifact={active} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ArtifactRenderer({ artifact }: { artifact: CanvasArtifact }) {
  switch (artifact.kind) {
    case "revenue-chart":
      return <RevenueChartRenderer artifact={artifact} />;
    case "mis-report":
      return <MisReportRenderer artifact={artifact} />;
    case "recon-report":
      return <ReconReportRenderer artifact={artifact} />;
    case "invoice":
      return <InvoiceRenderer artifact={artifact} />;
    default:
      return null;
  }
}
