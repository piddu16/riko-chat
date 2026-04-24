"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ReceiptText,
  Package,
  CalendarClock,
  TrendingDown,
  FileText,
  GitCompareArrows,
  BarChart3,
  Receipt,
  Flame,
  MessageSquare,
  Upload,
} from "lucide-react";
import type { MomentCard, PendingAction } from "@/lib/types";
import { MOMENT_CARDS } from "@/lib/mock-data";
import { YesterdayActionBanner } from "./yesterday-action";

const ICON_MAP = {
  "alert-triangle": AlertTriangle,
  "receipt-text": ReceiptText,
  package: Package,
  "calendar-clock": CalendarClock,
  "trending-down": TrendingDown,
} as const;

const TONE = {
  red: { color: "var(--red)", bg: "var(--red-bg)" },
  yellow: { color: "var(--yellow)", bg: "var(--yellow-bg)" },
  orange: { color: "var(--orange)", bg: "color-mix(in srgb, var(--orange) 14%, transparent)" },
  neutral: { color: "var(--text-2)", bg: "var(--bg-surface)" },
} as const;

const CAPABILITIES = [
  { icon: FileText, label: "Generate MIS report", query: "Generate the March MIS report" },
  { icon: GitCompareArrows, label: "Reconcile 2B", query: "Reconcile my 2B for March" },
  { icon: BarChart3, label: "Revenue chart", query: "Show me the revenue chart" },
  { icon: Receipt, label: "Draft invoice", query: "Create an invoice for Nykaa" },
];

export function EmptyState({
  onSeed,
  greeting,
  userName,
  streakDays,
  pendingAction,
  onResolvePending,
  onToggleWhatsapp,
  whatsappOptIn,
}: {
  onSeed: (query: string) => void;
  greeting: string;
  userName: string | null;
  streakDays: number;
  pendingAction: PendingAction | null;
  onResolvePending: (outcome: "done" | "snooze" | "skip") => void;
  onToggleWhatsapp: () => void;
  whatsappOptIn: boolean;
}) {
  const headline = userName ? `${greeting}, ${userName}` : greeting;

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-10 md:py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        {/* Greeting + streak */}
        <div className="flex items-end justify-between gap-3 mb-1 flex-wrap">
          <h1
            className="text-3xl md:text-4xl font-bold leading-tight"
            style={{
              color: "var(--text-1)",
              fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
            }}
          >
            {headline}.
          </h1>
          {streakDays >= 2 && (
            <span
              className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--orange) 12%, transparent)",
                color: "var(--orange)",
                border: "1px solid color-mix(in srgb, var(--orange) 28%, transparent)",
              }}
              title={`${streakDays} days of morning reviews`}
            >
              <Flame size={11} />
              {streakDays}-day streak
            </span>
          )}
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>
          Here&apos;s what your books are saying. Tap any card — or ask anything below.
        </p>

        {/* Yesterday's action */}
        {pendingAction && (
          <YesterdayActionBanner action={pendingAction} onResolve={onResolvePending} />
        )}

        {/* Moment cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOMENT_CARDS.map((card, i) => (
            <MomentCardView key={card.id} card={card} index={i} onSeed={onSeed} />
          ))}
        </div>

        {/* Capability chips */}
        <div className="mt-8">
          <p className="text-[11px] uppercase tracking-wider mb-3" style={{ color: "var(--text-4)" }}>
            Riko can also
          </p>
          <div className="flex flex-wrap gap-2">
            {CAPABILITIES.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <motion.button
                  key={cap.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.04 }}
                  onClick={() => onSeed(cap.query)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full cursor-pointer transition-colors"
                  style={{
                    background: "var(--bg-surface)",
                    color: "var(--text-2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Icon size={13} style={{ color: "var(--green)" }} />
                  {cap.label}
                </motion.button>
              );
            })}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full"
              style={{
                background: "transparent",
                color: "var(--text-4)",
                border: "1px dashed var(--border)",
              }}
            >
              <Upload size={13} />
              Drop a file — bank stmt, invoice, receipt
            </motion.span>
          </div>
        </div>

        {/* WhatsApp morning nudge opt-in */}
        <div className="mt-8">
          <button
            onClick={onToggleWhatsapp}
            className="w-full flex items-start gap-3 rounded-xl p-4 cursor-pointer transition-all text-left"
            style={{
              background: whatsappOptIn
                ? "color-mix(in srgb, var(--green) 8%, var(--bg-surface))"
                : "var(--bg-surface)",
              border: `1px solid ${whatsappOptIn ? "color-mix(in srgb, var(--green) 30%, transparent)" : "var(--border)"}`,
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center"
              style={{ background: whatsappOptIn ? "var(--green)" : "color-mix(in srgb, var(--green) 14%, transparent)" }}
            >
              <MessageSquare size={15} color={whatsappOptIn ? "white" : "var(--green)"} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-1)" }}>
                {whatsappOptIn ? "9am WhatsApp summary is on" : "Send me this every morning on WhatsApp"}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                {whatsappOptIn
                  ? "Tap to turn off · delivered 9:00 IST each working day"
                  : "Top 3 things to do, in Hinglish if you prefer. No ads, no spam."}
              </p>
            </div>
            <span
              className="text-[11px] font-semibold"
              style={{ color: whatsappOptIn ? "var(--green)" : "var(--text-3)" }}
            >
              {whatsappOptIn ? "On" : "Turn on"}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function MomentCardView({
  card,
  index,
  onSeed,
}: {
  card: MomentCard;
  index: number;
  onSeed: (q: string) => void;
}) {
  const Icon = ICON_MAP[card.icon];
  const tone = TONE[card.tone];

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      onClick={() => onSeed(card.seedQuery)}
      className="group text-left rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-[2px] hover:shadow-lg"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: tone.bg }}
        >
          <Icon size={16} style={{ color: tone.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-semibold leading-snug mb-0.5"
            style={{ color: "var(--text-1)" }}
          >
            {card.headline}
          </p>
          <p className="text-xs" style={{ color: "var(--text-4)" }}>
            {card.sublabel}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
