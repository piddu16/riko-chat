"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ReceiptText,
  Package,
  CalendarClock,
  TrendingDown,
} from "lucide-react";
import type { MomentCard } from "@/lib/types";
import { MOMENT_CARDS } from "@/lib/mock-data";

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

export function EmptyState({ onSeed }: { onSeed: (query: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <p
          className="text-xs uppercase tracking-widest font-medium mb-2"
          style={{ color: "var(--text-4)" }}
        >
          Good morning
        </p>
        <h1
          className="text-3xl md:text-4xl font-bold mb-1"
          style={{
            color: "var(--text-1)",
            fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          }}
        >
          Your books this morning.
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
          Tap any to dig in — or ask anything below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOMENT_CARDS.map((card, i) => (
            <MomentCardView key={card.id} card={card} index={i} onSeed={onSeed} />
          ))}
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
