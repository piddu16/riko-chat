"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  FileX,
  Send,
  Filter,
  MessageSquare,
  Download,
} from "lucide-react";
import { formatINR } from "@/lib/format";
import type { ReconReportArtifact, ReconLine } from "@/lib/types";

type StatusFilter = "all" | ReconLine["status"];

const STATUS_META: Record<
  ReconLine["status"],
  { label: string; color: string; icon: typeof CheckCircle2; short: string }
> = {
  matched: { label: "Matched", color: "var(--green)", icon: CheckCircle2, short: "Match" },
  manual_matched: { label: "Manual matched", color: "#10B981", icon: CheckCircle2, short: "Manual" },
  partial_match: { label: "Partial match", color: "var(--orange)", icon: AlertTriangle, short: "Partial" },
  mismatch: { label: "Value mismatch", color: "var(--yellow)", icon: AlertTriangle, short: "Mismatch" },
  missing_portal: { label: "Missing from 2B", color: "var(--orange)", icon: FileQuestion, short: "Not in 2B" },
  missing_tally: { label: "Missing from Tally", color: "var(--red)", icon: FileX, short: "Not in Tally" },
};

export function ReconReportRenderer({ artifact }: { artifact: ReconReportArtifact }) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [actioned, setActioned] = useState<Record<string, string>>({});

  const { summary, lines } = artifact;
  const matchRate = Math.round(((summary.matched + summary.manualMatched) / summary.total) * 100);

  const filtered = filter === "all" ? lines : lines.filter((l) => l.status === filter);

  const handleAction = (id: string, label: string) => {
    setActioned((p) => ({ ...p, [id]: label }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header summary card */}
      <div
        className="rounded-xl p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--purple)" }}>
              GSTR-2B Reconciliation
            </p>
            <h2
              className="text-lg md:text-xl font-bold"
              style={{ color: "var(--text-1)", fontFamily: "var(--font-display), 'Space Grotesk', sans-serif" }}
            >
              {artifact.period}
            </h2>
          </div>
          <div className="text-right">
            <p
              className="text-3xl font-bold leading-none"
              style={{
                color: matchRate > 85 ? "var(--green)" : matchRate > 70 ? "var(--yellow)" : "var(--red)",
                fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
              }}
            >
              {matchRate}%
            </p>
            <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "var(--text-4)" }}>
              Match rate
            </p>
          </div>
        </div>

        {/* Stacked bar */}
        <div className="flex w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: "var(--bg-hover)" }}>
          {(
            [
              { label: "Matched", value: summary.matched, color: "var(--green)" },
              { label: "Manual", value: summary.manualMatched, color: "#10B981" },
              { label: "Partial", value: summary.partialMatch, color: "var(--orange)" },
              { label: "Mismatches", value: summary.mismatches, color: "var(--yellow)" },
              { label: "Not in 2B", value: summary.missingFromPortal, color: "var(--orange)" },
              { label: "Not in Tally", value: summary.missingFromTally, color: "var(--red)" },
            ] as const
          ).map((s, i) => (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: `${(s.value / summary.total) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              style={{ background: s.color, height: "100%" }}
            />
          ))}
        </div>
        <p className="text-[11px]" style={{ color: "var(--text-4)" }}>
          {summary.total} invoices in Tally · ITC at risk{" "}
          <span className="font-semibold" style={{ color: "var(--red)" }}>{summary.itcAtRisk}</span>
        </p>
      </div>

      {/* Risk callout with batch remind */}
      <div
        className="rounded-lg p-4 flex items-center gap-3"
        style={{ background: "color-mix(in srgb, var(--red) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--red) 25%, transparent)" }}
      >
        <AlertTriangle size={16} style={{ color: "var(--red)" }} />
        <p className="text-xs flex-1" style={{ color: "var(--text-1)" }}>
          <span className="font-bold">{summary.itcAtRisk} ITC at risk</span>{" "}
          <span style={{ color: "var(--text-3)" }}>— {summary.missingFromPortal} suppliers haven&apos;t filed GSTR-1 yet</span>
        </p>
        <button
          className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-md cursor-pointer"
          style={{ background: "var(--red)", color: "white" }}
        >
          <MessageSquare size={11} />
          Remind all {summary.missingFromPortal}
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Filter size={12} style={{ color: "var(--text-4)" }} />
        {(
          [
            { key: "all", label: "All", count: lines.length },
            { key: "matched", label: "Matched", count: summary.matched },
            { key: "manual_matched", label: "Manual", count: summary.manualMatched },
            { key: "partial_match", label: "Partial", count: summary.partialMatch },
            { key: "mismatch", label: "Mismatches", count: summary.mismatches },
            { key: "missing_portal", label: "Not in 2B", count: summary.missingFromPortal },
            { key: "missing_tally", label: "Not in Tally", count: summary.missingFromTally },
          ] as Array<{ key: StatusFilter; label: string; count: number }>
        ).map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="text-[11px] font-semibold px-3 py-1.5 min-h-[30px] rounded-full cursor-pointer transition-colors"
              style={{
                background: active ? "color-mix(in srgb, var(--green) 15%, transparent)" : "var(--bg-surface)",
                color: active ? "var(--green)" : "var(--text-3)",
                border: `1px solid ${active ? "color-mix(in srgb, var(--green) 35%, transparent)" : "var(--border)"}`,
              }}
            >
              {f.label} · {f.count}
            </button>
          );
        })}
      </div>

      {/* Lines */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <AnimatePresence initial={false}>
          {filtered.map((line, i) => {
            const meta = STATUS_META[line.status];
            const Icon = meta.icon;
            const taken = actioned[line.id];
            return (
              <motion.div
                key={line.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className="px-4 py-3 flex items-start gap-3"
                style={{
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                  background: taken ? "color-mix(in srgb, var(--green) 6%, transparent)" : "transparent",
                }}
              >
                <Icon size={16} style={{ color: meta.color, flexShrink: 0, marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-semibold truncate" style={{ color: "var(--text-1)" }}>
                      {line.supplier}
                    </span>
                    <span
                      className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                      style={{
                        background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
                        color: meta.color,
                      }}
                    >
                      {meta.short}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--text-4)" }}>
                    {line.invoiceNo} · {line.date}
                  </p>
                  {line.issue && (
                    <p className="text-[11px] mt-1" style={{ color: "var(--text-3)" }}>
                      {line.issue}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-1.5 text-[11px]">
                    <span style={{ color: "var(--text-4)" }}>
                      Tally:{" "}
                      <span
                        className="font-semibold tabular-nums"
                        style={{ color: line.tallyAmount !== null ? "var(--text-2)" : "var(--text-4)", fontFamily: "var(--font-display), 'Space Grotesk', sans-serif" }}
                      >
                        {formatINR(line.tallyAmount)}
                      </span>
                    </span>
                    <span style={{ color: "var(--text-4)" }}>
                      2B:{" "}
                      <span
                        className="font-semibold tabular-nums"
                        style={{ color: line.portalAmount !== null ? "var(--text-2)" : "var(--text-4)", fontFamily: "var(--font-display), 'Space Grotesk', sans-serif" }}
                      >
                        {formatINR(line.portalAmount)}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {taken ? (
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-md flex items-center gap-1"
                      style={{ background: "color-mix(in srgb, var(--green) 15%, transparent)", color: "var(--green)" }}
                    >
                      <CheckCircle2 size={11} />
                      {taken}
                    </span>
                  ) : line.status === "matched" || line.status === "manual_matched" ? (
                    <ActionBtn label="Accept" tone="green" onClick={() => handleAction(line.id, "Accepted")} />
                  ) : line.status === "missing_portal" ? (
                    <ActionBtn label="Remind" icon={Send} tone="orange" onClick={() => handleAction(line.id, "Reminded")} />
                  ) : line.status === "mismatch" || line.status === "partial_match" ? (
                    <ActionBtn label="Investigate" tone="yellow" onClick={() => handleAction(line.id, "Flagged")} />
                  ) : (
                    <ActionBtn label="Record in Tally" tone="red" onClick={() => handleAction(line.id, "Queued")} />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Export bar */}
      <div className="flex items-center justify-end gap-2 pb-4">
        <button
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-md cursor-pointer transition-colors"
          style={{ background: "var(--bg-surface)", color: "var(--text-2)", border: "1px solid var(--border)" }}
        >
          <Download size={12} />
          Export CSV
        </button>
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  tone,
  icon: Icon,
  onClick,
}: {
  label: string;
  tone: "green" | "orange" | "yellow" | "red";
  icon?: typeof Send;
  onClick: () => void;
}) {
  const color =
    tone === "green" ? "var(--green)" :
    tone === "orange" ? "var(--orange)" :
    tone === "yellow" ? "var(--yellow)" :
    "var(--red)";
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-semibold px-3 py-1.5 rounded-md cursor-pointer flex items-center gap-1 transition-colors"
      style={{
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        color,
        border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
      }}
    >
      {Icon && <Icon size={11} />}
      {label}
    </button>
  );
}
