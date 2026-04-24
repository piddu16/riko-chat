"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileCode2, ExternalLink } from "lucide-react";
import { getTrace } from "@/lib/source-trace";
import { formatINR } from "@/lib/format";

/** Right-side drawer (desktop) / bottom sheet (mobile) showing the exact
 *  Tally vouchers behind a number. Opens when the user taps "View sources"
 *  on an assistant message. */
export function SourceDrawer({
  traceId,
  onClose,
}: {
  traceId: string | null;
  onClose: () => void;
}) {
  const trace = traceId ? getTrace(traceId) : null;

  return (
    <AnimatePresence>
      {trace && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: "var(--overlay)" }}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 z-[70] w-full md:w-[480px] flex flex-col"
            style={{
              background: "var(--bg-primary)",
              borderLeft: "1px solid var(--border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {/* Header */}
            <header
              className="h-14 flex items-center px-4 gap-2 flex-shrink-0"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--green)" }}>
                Source vouchers
              </span>
              <button
                aria-label="Close"
                onClick={onClose}
                className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-surface)]"
                style={{ color: "var(--text-3)" }}
              >
                <X size={16} />
              </button>
            </header>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5">
              <h2
                className="text-lg md:text-xl font-bold mb-1 leading-snug"
                style={{
                  color: "var(--text-1)",
                  fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                }}
              >
                {trace.headline}
              </h2>
              <p className="text-xs mb-5" style={{ color: "var(--text-3)" }}>
                {trace.subtitle}
              </p>

              {/* Query reconstruction */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
              >
                <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: "var(--text-4)" }}>
                  How Riko computed this
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                  {trace.query}
                </p>
              </div>

              {/* Pseudo-SQL */}
              {trace.pseudoSql && (
                <details
                  className="rounded-xl p-3 mb-4 cursor-pointer"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                >
                  <summary
                    className="text-[11px] flex items-center gap-1.5 list-none cursor-pointer"
                    style={{ color: "var(--text-3)" }}
                  >
                    <FileCode2 size={12} />
                    <span>Query (pseudo-SQL)</span>
                  </summary>
                  <pre
                    className="text-[11px] leading-relaxed mt-2 overflow-x-auto font-mono"
                    style={{ color: "var(--text-2)" }}
                  >
                    {trace.pseudoSql}
                  </pre>
                </details>
              )}

              {/* Voucher list */}
              <div>
                <p
                  className="text-[10px] uppercase tracking-wider font-medium mb-2"
                  style={{ color: "var(--text-4)" }}
                >
                  Underlying vouchers · {trace.vouchers.length}
                </p>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                >
                  {trace.vouchers.map((v, i) => (
                    <div
                      key={`${v.voucherNo}-${i}`}
                      className="px-3 py-3"
                      style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="text-xs font-semibold truncate" style={{ color: "var(--text-1)" }}>
                          {v.party}
                        </span>
                        <span
                          className="text-xs font-bold tabular-nums flex-shrink-0"
                          style={{
                            color: v.amount < 0 ? "var(--red)" : "var(--text-1)",
                            fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                          }}
                        >
                          {formatINR(v.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] mb-1 flex-wrap">
                        <span
                          className="font-mono px-1.5 py-0.5 rounded"
                          style={{ background: "var(--bg-hover)", color: "var(--text-3)" }}
                        >
                          {v.voucherNo}
                        </span>
                        <span style={{ color: "var(--text-4)" }}>{v.voucherType}</span>
                        <span style={{ color: "var(--text-4)" }}>·</span>
                        <span style={{ color: "var(--text-4)" }}>{v.date}</span>
                      </div>
                      {v.narration && (
                        <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                          {v.narration}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  className="w-full mt-3 text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  style={{
                    background: "var(--bg-surface)",
                    color: "var(--text-2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  Open in Day Book
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
