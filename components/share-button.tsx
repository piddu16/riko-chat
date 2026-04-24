"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share2, Check } from "lucide-react";
import type { AssistantMessage } from "@/lib/types";
import { shareMessage } from "@/lib/whatsapp-formatter";

/** Compact share button — triggers the OS native share sheet (WhatsApp-ready
 *  plain text), falls back to clipboard copy. */
export function ShareButton({ message }: { message: AssistantMessage }) {
  const [feedback, setFeedback] = useState<"idle" | "copied" | "shared">("idle");

  const handleClick = async () => {
    const result = await shareMessage(message);
    if (result === "shared") {
      setFeedback("shared");
    } else if (result === "copied") {
      setFeedback("copied");
    }
    setTimeout(() => setFeedback("idle"), 1700);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-md cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
      style={{ color: "var(--text-4)" }}
      title="Share to WhatsApp, email, or copy"
      aria-label="Share"
    >
      <AnimatePresence mode="wait">
        {feedback === "idle" ? (
          <motion.span key="idle" className="flex items-center gap-1">
            <Share2 size={12} />
            <span>Share</span>
          </motion.span>
        ) : (
          <motion.span
            key="done"
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1"
            style={{ color: "var(--green)" }}
          >
            <Check size={12} />
            <span>{feedback === "shared" ? "Shared" : "Copied"}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
