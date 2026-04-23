"use client";

import { motion } from "framer-motion";
import { Download, MessageSquare, FileText } from "lucide-react";
import type { MisReportArtifact, MisSection } from "@/lib/types";

export function MisReportRenderer({ artifact }: { artifact: MisReportArtifact }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Document-header card */}
      <div
        className="rounded-xl p-6"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p
              className="text-[10px] uppercase tracking-wider font-semibold mb-1"
              style={{ color: "var(--green)" }}
            >
              Monthly MIS Report
            </p>
            <h2
              className="text-xl md:text-2xl font-bold leading-tight mb-2"
              style={{
                color: "var(--text-1)",
                fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
              }}
            >
              {artifact.company}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "var(--text-3)" }}>
              <span>
                Period: <span style={{ color: "var(--text-1)" }}>{artifact.period}</span>
              </span>
              {artifact.gstin && (
                <span>
                  GSTIN: <span className="font-mono" style={{ color: "var(--text-1)" }}>{artifact.gstin}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] mt-2" style={{ color: "var(--text-4)" }}>
              {artifact.preparedBy}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton icon={FileText} label="PDF" />
            <ExportButton icon={Download} label="Excel" />
            <ExportButton icon={MessageSquare} label="WhatsApp" primary />
          </div>
        </div>
      </div>

      {/* Sections */}
      {artifact.sections.map((section, i) => (
        <motion.section
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="rounded-xl p-5"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <h3
            className="text-sm font-bold uppercase tracking-wide mb-4"
            style={{ color: "var(--text-2)" }}
          >
            {section.heading}
          </h3>
          <SectionBody section={section} />
        </motion.section>
      ))}

      {/* Footer */}
      <p className="text-[11px] text-center pb-4" style={{ color: "var(--text-4)" }}>
        All figures derived from Tally vouchers + INFINI API · {artifact.period}
      </p>
    </div>
  );
}

function SectionBody({ section }: { section: MisSection }) {
  if (section.kind === "kpi-grid" && section.kpis) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {section.kpis.map((k, i) => {
          const toneColor =
            k.tone === "green" ? "var(--green)" :
            k.tone === "red" ? "var(--red)" :
            k.tone === "yellow" ? "var(--yellow)" :
            "var(--text-1)";
          return (
            <div
              key={i}
              className="rounded-lg p-3"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
            >
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-4)" }}>
                {k.label}
              </p>
              <p
                className="text-xl font-bold tabular-nums mb-0.5"
                style={{ color: toneColor, fontFamily: "var(--font-display), 'Space Grotesk', sans-serif" }}
              >
                {k.value}
              </p>
              {k.delta && (
                <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                  {k.delta}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (section.kind === "pl-table" && section.rows) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="px-3 py-2 text-left text-[10px] font-medium" style={{ color: "var(--text-4)" }}>Line item</th>
              <th className="px-3 py-2 text-right text-[10px] font-medium" style={{ color: "var(--text-4)" }}>This month</th>
              <th className="px-3 py-2 text-right text-[10px] font-medium" style={{ color: "var(--text-4)" }}>Last month</th>
              <th className="px-3 py-2 text-right text-[10px] font-medium" style={{ color: "var(--text-4)" }}>Variance</th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((r, i) => (
              <tr
                key={i}
                style={{
                  borderTop: "1px solid var(--border)",
                  background: r.emphasis ? "color-mix(in srgb, var(--green) 6%, transparent)" : "transparent",
                }}
              >
                <td
                  className={`px-3 py-2 ${r.emphasis ? "font-bold" : ""}`}
                  style={{
                    color: r.emphasis ? "var(--text-1)" : "var(--text-2)",
                    paddingLeft: 12 + (r.indent ?? 0) * 14,
                  }}
                >
                  {r.label}
                </td>
                <td className={`px-3 py-2 text-right tabular-nums ${r.emphasis ? "font-bold" : "font-semibold"}`} style={{ color: "var(--text-1)", fontFamily: "var(--font-display), 'Space Grotesk', sans-serif" }}>
                  {r.current}
                </td>
                <td className="px-3 py-2 text-right tabular-nums" style={{ color: "var(--text-3)", fontFamily: "var(--font-display), 'Space Grotesk', sans-serif" }}>
                  {r.prior ?? "—"}
                </td>
                <td
                  className="px-3 py-2 text-right tabular-nums font-semibold"
                  style={{
                    color: r.variance?.startsWith("+") ? "var(--green)" : r.variance?.startsWith("-") ? "var(--red)" : "var(--text-3)",
                    fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                  }}
                >
                  {r.variance ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (section.kind === "aging-bars" && section.segments) {
    const total = section.segments.reduce((s, seg) => s + seg.value, 0);
    return (
      <div>
        {/* Stacked bar */}
        <div className="flex w-full h-3 rounded-full overflow-hidden mb-4" style={{ background: "var(--bg-hover)" }}>
          {section.segments.map((seg, i) => (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: `${(seg.value / total) * 100}%` }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              style={{ background: seg.color, height: "100%" }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {section.segments.map((seg, i) => (
            <div
              key={i}
              className="rounded-lg p-3"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderLeft: `3px solid ${seg.color}` }}
            >
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-4)" }}>{seg.label}</p>
              <p
                className="text-lg font-bold tabular-nums"
                style={{ color: "var(--text-1)", fontFamily: "var(--font-display), 'Space Grotesk', sans-serif" }}
              >
                {seg.amount}
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-3)" }}>{seg.value}% of total</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.kind === "commentary" && section.paragraphs) {
    return (
      <div className="space-y-3">
        {section.paragraphs.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
            {p}
          </p>
        ))}
      </div>
    );
  }

  return null;
}

function ExportButton({ icon: Icon, label, primary }: { icon: React.ComponentType<{ size?: number }>; label: string; primary?: boolean }) {
  return (
    <button
      className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
      style={{
        background: primary ? "var(--green)" : "var(--bg-secondary)",
        color: primary ? "white" : "var(--text-2)",
        border: primary ? "none" : "1px solid var(--border)",
      }}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}
