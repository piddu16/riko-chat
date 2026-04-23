"use client";

import { motion } from "framer-motion";
import { formatINR } from "@/lib/format";
import type { RevenueChartArtifact } from "@/lib/types";

/** Monthly revenue with FY24 ghost-bar overlay. Scales to the canvas width. */
export function RevenueChartRenderer({ artifact }: { artifact: RevenueChartArtifact }) {
  const { fy25, fy24, months, currentFYLabel, priorFYLabel } = artifact;
  const max = Math.max(...fy25, ...fy24);
  const totalFy25 = fy25.reduce((s, v) => s + v, 0);
  const totalFy24 = fy24.reduce((s, v) => s + v, 0);
  const yoy = ((totalFy25 - totalFy24) / totalFy24) * 100;

  const barH = 280; // tall chart, canvas has real estate

  return (
    <div className="flex flex-col gap-5">
      {/* Totals row */}
      <div className="grid grid-cols-3 gap-3">
        <KpiBlock label={currentFYLabel} value={formatINR(totalFy25)} tone="green" emphasis />
        <KpiBlock label={priorFYLabel} value={formatINR(totalFy24)} tone="neutral" />
        <KpiBlock
          label="YoY"
          value={`${yoy >= 0 ? "▲" : "▼"} ${Math.abs(yoy).toFixed(1)}%`}
          tone={yoy >= 0 ? "green" : "red"}
        />
      </div>

      {/* The chart */}
      <div
        className="rounded-xl p-6"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-baseline justify-between gap-2 mb-4 flex-wrap">
          <p className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
            Monthly Revenue
          </p>
          <span className="text-[11px]" style={{ color: "var(--text-4)" }}>
            SUM(sales vouchers) by month · ghost peeks above solid = YoY decline
          </span>
        </div>

        <div className="flex items-end gap-1.5" style={{ height: barH + 22 }}>
          {fy25.map((v, i) => {
            const curH = (v / max) * (barH - 30);
            const priorH = (fy24[i] / max) * (barH - 30);
            const colH = Math.max(curH, priorH);
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end h-full"
              >
                <div
                  className="relative w-full"
                  style={{ height: colH, minWidth: 18 }}
                >
                  {/* FY24 ghost */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: priorH }}
                    transition={{ duration: 0.6, delay: i * 0.04 }}
                    className="absolute bottom-0 inset-x-0 rounded-t-md"
                    style={{
                      background: "color-mix(in srgb, var(--text-4) 10%, transparent)",
                      border: "1px dashed color-mix(in srgb, var(--text-4) 50%, transparent)",
                      borderBottom: "none",
                    }}
                  />
                  {/* FY25 solid */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: curH }}
                    transition={{ duration: 0.6, delay: i * 0.04 }}
                    className="absolute bottom-0 inset-x-0 rounded-t-md"
                    style={{ background: "var(--green)" }}
                  />
                </div>
                <span
                  className="text-[10px] leading-none mt-1.5"
                  style={{ color: "var(--text-4)" }}
                >
                  {months[i]}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-5 mt-5 flex-wrap text-[11px]">
          <LegendItem color="var(--green)" label={currentFYLabel} solid />
          <LegendItem color="var(--text-4)" label={priorFYLabel} dashed />
          <span style={{ color: "var(--text-4)" }}>
            · Hover for monthly values
          </span>
        </div>
      </div>

      {/* Detailed table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="px-4 py-3 text-xs font-semibold"
          style={{ color: "var(--text-2)", borderBottom: "1px solid var(--border)" }}
        >
          Month-by-month breakdown
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "var(--bg-secondary)" }}>
                <th className="px-3 py-2 text-left font-medium text-[10px]" style={{ color: "var(--text-4)" }}>Month</th>
                <th className="px-3 py-2 text-right font-medium text-[10px]" style={{ color: "var(--text-4)" }}>{currentFYLabel}</th>
                <th className="px-3 py-2 text-right font-medium text-[10px]" style={{ color: "var(--text-4)" }}>{priorFYLabel}</th>
                <th className="px-3 py-2 text-right font-medium text-[10px]" style={{ color: "var(--text-4)" }}>YoY</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m, i) => {
                const diff = fy25[i] - fy24[i];
                const pct = (diff / fy24[i]) * 100;
                return (
                  <tr
                    key={m}
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid var(--border)",
                      background: i % 2 === 1 ? "color-mix(in srgb, var(--bg-secondary) 50%, transparent)" : "transparent",
                    }}
                  >
                    <td className="px-3 py-2 font-medium" style={{ color: "var(--text-1)" }}>{m}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold" style={{ color: "var(--text-1)", fontFamily: "var(--font-display), 'Space Grotesk', sans-serif" }}>
                      {formatINR(fy25[i])}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums" style={{ color: "var(--text-3)", fontFamily: "var(--font-display), 'Space Grotesk', sans-serif" }}>
                      {formatINR(fy24[i])}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold" style={{ color: pct >= 0 ? "var(--green)" : "var(--red)", fontFamily: "var(--font-display), 'Space Grotesk', sans-serif" }}>
                      {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiBlock({
  label,
  value,
  tone,
  emphasis,
}: {
  label: string;
  value: string;
  tone: "green" | "red" | "yellow" | "neutral";
  emphasis?: boolean;
}) {
  const color =
    tone === "green" ? "var(--green)" : tone === "red" ? "var(--red)" : tone === "yellow" ? "var(--yellow)" : "var(--text-1)";
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: emphasis ? "color-mix(in srgb, var(--green) 8%, var(--bg-surface))" : "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <p
        className="text-[10px] uppercase tracking-wider font-medium mb-1"
        style={{ color: "var(--text-4)" }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold tabular-nums"
        style={{ color, fontFamily: "var(--font-display), 'Space Grotesk', sans-serif" }}
      >
        {value}
      </p>
    </div>
  );
}

function LegendItem({ color, label, solid, dashed }: { color: string; label: string; solid?: boolean; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5" style={{ color: "var(--text-3)" }}>
      {solid && <span className="w-3 h-3 rounded-sm" style={{ background: color }} />}
      {dashed && (
        <span
          className="w-3 h-3 rounded-sm"
          style={{
            background: "color-mix(in srgb, var(--text-4) 10%, transparent)",
            border: `1px dashed ${color}`,
          }}
        />
      )}
      <span style={{ color: "var(--text-2)" }}>{label}</span>
    </span>
  );
}
