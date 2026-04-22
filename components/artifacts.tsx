"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  FileText,
  Receipt,
  Send,
  ChevronRight,
} from "lucide-react";
import type { Artifact, ActionBlock } from "@/lib/types";

/* ── Router ── */
export function ArtifactRenderer({ artifact }: { artifact: Artifact }) {
  if (artifact.kind === "kpi") return <KpiArtifact {...artifact} />;
  if (artifact.kind === "table") return <TableArtifact {...artifact} />;
  if (artifact.kind === "action-list") return <ActionListArtifact {...artifact} />;
  if (artifact.kind === "stacked-bar") return <StackedBarArtifact {...artifact} />;
  return null;
}

/* ── KPI (single big number) ── */
function KpiArtifact({
  label,
  value,
  sublabel,
  delta,
}: Extract<Artifact, { kind: "kpi" }>) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      <p
        className="text-[10px] uppercase tracking-wider font-medium mb-1"
        style={{ color: "var(--text-4)" }}
      >
        {label}
      </p>
      <p
        className="text-4xl font-bold tabular-nums"
        style={{
          color: "var(--text-1)",
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
        }}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-xs mt-1.5" style={{ color: "var(--text-3)" }}>
          {sublabel}
        </p>
      )}
      {delta && (
        <span
          className="inline-block text-[11px] font-semibold px-1.5 py-0.5 rounded mt-2"
          style={{
            color: delta.direction === "up" ? "var(--green)" : "var(--red)",
            background: delta.direction === "up" ? "var(--green-bg)" : "var(--red-bg)",
          }}
        >
          {delta.direction === "up" ? "▲" : "▼"} {Math.abs(delta.pct).toFixed(1)}%
        </span>
      )}
    </div>
  );
}

/* ── Table ── */
function TableArtifact({
  title,
  columns,
  rows,
  footer,
}: Extract<Artifact, { kind: "table" }>) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      {title && (
        <div
          className="px-4 py-3 text-xs font-semibold"
          style={{ color: "var(--text-2)", borderBottom: "1px solid var(--border)" }}
        >
          {title}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "var(--bg-secondary)" }}>
              {columns.map((c, i) => (
                <th
                  key={c}
                  className={`px-3 py-2 text-[10px] font-medium ${
                    i === 0 ? "text-left" : i >= 2 ? "text-right" : "text-left"
                  }`}
                  style={{ color: "var(--text-4)" }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  borderTop: ri === 0 ? "none" : "1px solid var(--border)",
                  background:
                    ri % 2 === 1
                      ? "color-mix(in srgb, var(--bg-secondary) 50%, transparent)"
                      : "transparent",
                }}
              >
                {row.map((cell, ci) => {
                  const isNumeric = ci >= 2;
                  return (
                    <td
                      key={ci}
                      className={`px-3 py-2 ${isNumeric ? "text-right tabular-nums font-semibold" : ""} ${
                        ci === 0 ? "font-medium" : ""
                      }`}
                      style={{
                        color: ci === 0 ? "var(--text-1)" : "var(--text-2)",
                        fontFamily: isNumeric
                          ? "var(--font-display), 'Space Grotesk', sans-serif"
                          : undefined,
                      }}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && (
        <div
          className="px-4 py-2 text-[11px]"
          style={{ color: "var(--text-4)", borderTop: "1px solid var(--border)" }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

/* ── Action list ── */
function ActionListArtifact({
  title,
  items,
}: Extract<Artifact, { kind: "action-list" }>) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      <div
        className="px-4 py-3 text-xs font-semibold"
        style={{ color: "var(--text-2)", borderBottom: "1px solid var(--border)" }}
      >
        {title}
      </div>
      <div>
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className="flex items-center justify-between gap-3 px-4 py-3"
            style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
          >
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "var(--text-1)" }}
              >
                {item.label}
              </p>
              {item.sublabel && (
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-4)" }}>
                  {item.sublabel}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {item.amount && (
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{
                    color: "var(--text-1)",
                    fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                  }}
                >
                  {item.amount}
                </span>
              )}
              <ActionButton action={item.action} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Stacked bar ── */
function StackedBarArtifact({
  title,
  segments,
  total,
}: Extract<Artifact, { kind: "stacked-bar" }>) {
  const sum = segments.reduce((s, seg) => s + seg.value, 0);
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
          {title}
        </p>
        <span className="text-[11px]" style={{ color: "var(--text-4)" }}>
          {total}
        </span>
      </div>
      <div
        className="flex w-full h-2 rounded-full overflow-hidden mb-3"
        style={{ background: "var(--bg-hover)" }}
      >
        {segments.map((seg, i) => {
          const pct = (seg.value / sum) * 100;
          return (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
              style={{ background: seg.color, height: "100%" }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((seg) => (
          <span
            key={seg.label}
            className="flex items-center gap-1.5 text-[11px]"
            style={{ color: "var(--text-3)" }}
          >
            <span
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ background: seg.color }}
            />
            <span>
              {seg.label} <span className="tabular-nums font-semibold">{seg.value}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Shared action button ── */
function ActionButton({ action }: { action: ActionBlock }) {
  const Icon = {
    whatsapp: MessageSquare,
    file: FileText,
    record: Receipt,
    remind: Send,
    acknowledge: ChevronRight,
    open: ChevronRight,
  }[action.verb];

  return (
    <button
      className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
      style={{
        background: "color-mix(in srgb, var(--green) 14%, transparent)",
        color: "var(--green)",
        border: "1px solid color-mix(in srgb, var(--green) 30%, transparent)",
      }}
    >
      <Icon size={12} />
      {action.label}
    </button>
  );
}

export { ActionButton };
