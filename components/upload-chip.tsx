"use client";

import { motion } from "framer-motion";
import { File, X, Loader2 } from "lucide-react";
import { KIND_LABEL, type DetectedKind } from "@/lib/file-detector";

export type UploadState =
  | { stage: "picked"; name: string; size: number }
  | { stage: "detecting"; name: string; size: number }
  | { stage: "detected"; name: string; size: number; kind: DetectedKind };

/** Inline chip shown in the composer above the textarea when a file
 *  is selected. Three stages: picked → detecting → detected. */
export function UploadChip({
  state,
  onRemove,
}: {
  state: UploadState;
  onRemove: () => void;
}) {
  const sizeKb = (state.size / 1024).toFixed(0);
  const detectedLabel = state.stage === "detected" ? KIND_LABEL[state.kind] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 px-2.5 py-1.5 mb-2 rounded-lg"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        width: "fit-content",
        maxWidth: "100%",
      }}
    >
      <div
        className="w-7 h-7 rounded-md flex-shrink-0 flex items-center justify-center"
        style={{ background: "var(--bg-hover)" }}
      >
        {state.stage === "detecting" ? (
          <Loader2 size={13} className="animate-spin" style={{ color: "var(--text-3)" }} />
        ) : (
          <File size={13} style={{ color: "var(--text-3)" }} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold truncate" style={{ color: "var(--text-1)" }}>
          {state.name}
        </p>
        <p className="text-[10px]" style={{ color: "var(--text-4)" }}>
          {state.stage === "detecting"
            ? `Detecting… ${sizeKb} KB`
            : detectedLabel
            ? `${detectedLabel} · ${sizeKb} KB`
            : `${sizeKb} KB`}
        </p>
      </div>
      {detectedLabel && (
        <span
          className="text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider"
          style={{ background: "var(--green-bg)", color: "var(--green)" }}
        >
          {detectedLabel}
        </span>
      )}
      <button
        onClick={onRemove}
        aria-label="Remove file"
        className="w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
        style={{ color: "var(--text-4)" }}
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}
