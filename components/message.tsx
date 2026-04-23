"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Copy } from "lucide-react";
import type { Message, AssistantMessage } from "@/lib/types";
import { ArtifactRenderer, ActionButton } from "./artifacts";
import { CanvasPreviewCard } from "./canvas-preview-card";

/* ── Router ── */
export function MessageRenderer({
  message,
  onOpenCanvas,
}: {
  message: Message;
  onOpenCanvas?: (id: string) => void;
}) {
  if (message.role === "user") return <UserMessage content={message.content} />;
  return <AssistantMessageRender message={message} onOpenCanvas={onOpenCanvas} />;
}

/* ── User message — right-aligned, subtle ── */
function UserMessage({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-end mb-6"
    >
      <div
        className="max-w-[85%] md:max-w-[70%] px-4 py-2.5 rounded-2xl rounded-tr-sm"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          color: "var(--text-1)",
        }}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </motion.div>
  );
}

/* ── Assistant message — no bubble, prose-forward, 4 layers ── */
function AssistantMessageRender({
  message,
  onOpenCanvas,
}: {
  message: AssistantMessage;
  onOpenCanvas?: (id: string) => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-8 max-w-full"
    >
      {/* Layer 1 — ANSWER (prose-large) */}
      <p
        className="text-lg md:text-xl font-medium leading-snug mb-4"
        style={{
          color: "var(--text-1)",
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
        }}
      >
        {message.answer}
      </p>

      {/* Canvas preview cards — for heavyweight artifacts that opened in the canvas */}
      {message.canvasRefs && message.canvasRefs.length > 0 && (
        <div className="space-y-2 mb-4">
          {message.canvasRefs.map((ref_) => (
            <CanvasPreviewCard
              key={ref_.id}
              ref_={ref_}
              onOpen={() => onOpenCanvas?.(ref_.id)}
            />
          ))}
        </div>
      )}

      {/* Artifacts (inline, always visible) */}
      {message.artifacts && message.artifacts.length > 0 && (
        <div className="space-y-3 mb-4">
          {message.artifacts.map((artifact, i) => (
            <ArtifactRenderer key={i} artifact={artifact} />
          ))}
        </div>
      )}

      {/* Layer 2 — CALCULATION */}
      {message.calculation && (
        <div
          className="rounded-xl p-4 mb-3"
          style={{
            background: "color-mix(in srgb, var(--bg-surface) 70%, transparent)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-[10px] uppercase tracking-wider font-medium mb-2"
            style={{ color: "var(--text-4)" }}
          >
            Calculation
          </p>
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5">
            {message.calculation.rows.map((r, i) => (
              <>
                <dt
                  key={`l-${i}`}
                  className="text-xs"
                  style={{ color: r.emphasis ? "var(--text-1)" : "var(--text-3)" }}
                >
                  {r.label}
                </dt>
                <dd
                  key={`v-${i}`}
                  className={`text-xs tabular-nums ${r.emphasis ? "font-bold" : "font-semibold"}`}
                  style={{
                    color: r.emphasis ? "var(--green)" : "var(--text-1)",
                    fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                  }}
                >
                  {r.value}
                </dd>
              </>
            ))}
          </dl>
        </div>
      )}

      {/* Layer 3 — SOURCES (subtle, expandable) */}
      {message.sources && (
        <div className="mb-3">
          <p className="text-[11px]" style={{ color: "var(--text-4)" }}>
            {message.sources.summary}
            {message.sources.details && message.sources.details.length > 0 && (
              <>
                {" · "}
                <button
                  onClick={() => setDetailsOpen((v) => !v)}
                  className="inline-flex items-center gap-0.5 cursor-pointer hover:text-[var(--text-2)] transition-colors"
                  style={{ color: "var(--text-3)" }}
                >
                  Details
                  <ChevronDown
                    size={11}
                    style={{
                      transform: detailsOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.15s",
                    }}
                  />
                </button>
              </>
            )}
          </p>
          {detailsOpen && message.sources.details && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2 }}
              className="mt-2 rounded-lg p-3 overflow-hidden"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                {message.sources.details.map((d, i) => (
                  <>
                    <dt
                      key={`dl-${i}`}
                      className="text-[11px]"
                      style={{ color: "var(--text-4)" }}
                    >
                      {d.label}
                    </dt>
                    <dd
                      key={`dv-${i}`}
                      className="text-[11px]"
                      style={{ color: "var(--text-2)" }}
                    >
                      {d.value}
                    </dd>
                  </>
                ))}
              </dl>
            </motion.div>
          )}
        </div>
      )}

      {/* Layer 4 — ACTION */}
      {message.action && (
        <div className="flex items-center gap-2">
          <ActionButton action={message.action} />
          <button
            className="flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-md cursor-pointer transition-colors"
            style={{ color: "var(--text-4)" }}
            title="Copy"
          >
            <Copy size={12} />
          </button>
        </div>
      )}
    </motion.div>
  );
}
