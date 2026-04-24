"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { COMPANY } from "@/lib/mock-data";
import { relativeTime } from "@/lib/format";

type SyncStatus = "ok" | "stale" | "error";

interface Source {
  label: string;
  status: SyncStatus;
  lastSync: string;
  detail: string;
}

const SOURCES: Source[] = [
  {
    label: "Tally",
    status: "ok",
    lastSync: COMPANY.tallySyncedAt,
    detail: "847 vouchers indexed · last change: Sale INV/25-26/2040 at 14:18",
  },
  {
    label: "GSTN 2B",
    status: "ok",
    lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    detail: "Cut-off 14 Apr · next refresh 14 May · fetched via INFINI",
  },
  {
    label: "HDFC Bank",
    status: "stale",
    lastSync: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    detail: "Statement ****1234 · 147 lines · reconcile pending",
  },
];

const STATUS_COLOR: Record<SyncStatus, string> = {
  ok: "var(--green)",
  stale: "var(--yellow)",
  error: "var(--red)",
};

/** A thin, persistent strip at the top of the app — the trust layer's
 *  always-visible anchor. Tap any source to see its detail popover. */
export function SystemHealth() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const anyStale = SOURCES.some((s) => s.status !== "ok");

  return (
    <div
      className="flex items-center px-3 md:px-4 flex-shrink-0 relative"
      style={{
        height: 28,
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border)",
        fontSize: 11,
      }}
    >
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar flex-1 min-w-0">
        <span
          className="text-[10px] uppercase tracking-wider font-medium flex-shrink-0"
          style={{ color: "var(--text-4)" }}
        >
          {COMPANY.name}
        </span>
        <span style={{ color: "var(--text-4)" }}>·</span>
        {SOURCES.map((s, i) => {
          const isOpen = openIdx === i;
          return (
            <button
              key={s.label}
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer transition-colors hover:text-[var(--text-1)]"
              style={{ color: isOpen ? "var(--text-1)" : "var(--text-3)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: STATUS_COLOR[s.status] }}
              />
              <span>{s.label}</span>
              <span style={{ color: "var(--text-4)" }}>{relativeTime(s.lastSync)}</span>
            </button>
          );
        })}
      </div>
      {anyStale && (
        <span
          className="text-[10px] font-medium flex-shrink-0 ml-2"
          style={{ color: "var(--yellow)" }}
        >
          1 source stale
        </span>
      )}

      {/* Popover */}
      <AnimatePresence>
        {openIdx !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenIdx(null)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 right-0 md:left-auto md:right-3 top-[28px] z-50 mt-1 max-w-sm rounded-xl p-4"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              {openIdx !== null && <SourceDetail source={SOURCES[openIdx]} />}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SourceDetail({ source }: { source: Source }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: STATUS_COLOR[source.status] }}
        />
        <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
          {source.label}
        </span>
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded ml-auto uppercase tracking-wider"
          style={{
            color: STATUS_COLOR[source.status],
            background: source.status === "ok" ? "var(--green-bg)" : source.status === "stale" ? "var(--yellow-bg)" : "var(--red-bg)",
          }}
        >
          {source.status === "ok" ? "healthy" : source.status === "stale" ? "stale" : "error"}
        </span>
      </div>
      <p className="text-[11px] mb-3" style={{ color: "var(--text-3)" }}>
        Last sync {relativeTime(source.lastSync)} — {new Date(source.lastSync).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
      </p>
      <p className="text-xs" style={{ color: "var(--text-2)" }}>
        {source.detail}
      </p>
      {source.status !== "ok" && (
        <button
          className="mt-3 text-[11px] font-semibold px-3 py-1.5 rounded-md cursor-pointer"
          style={{
            background: "var(--green)",
            color: "white",
            border: "none",
          }}
        >
          Refresh now
        </button>
      )}
    </div>
  );
}
