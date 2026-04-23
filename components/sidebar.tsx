"use client";

import { motion } from "framer-motion";
import { Plus, MessageSquareText, Settings, Sparkles } from "lucide-react";
import type { Conversation } from "@/lib/types";
import { ThemeToggle } from "./theme-toggle";

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  collapsed,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  collapsed: boolean;
}) {
  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: collapsed ? 0 : 260,
        minWidth: collapsed ? 0 : 260,
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        transition: "width 0.2s, min-width 0.2s",
        overflow: "hidden",
      }}
    >
      {/* Brand header */}
      <div
        className="flex items-center gap-2 px-4 h-14 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "var(--green)" }}
        >
          <Sparkles size={14} color="white" />
        </div>
        <span
          className="text-sm font-bold"
          style={{
            color: "var(--text-1)",
            fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
          }}
        >
          Riko
        </span>
        <span className="text-[10px] ml-auto uppercase tracking-wider" style={{ color: "var(--text-4)" }}>
          demo
        </span>
      </div>

      {/* New chat */}
      <div className="px-3 pt-3">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
          style={{
            background: "var(--bg-surface)",
            color: "var(--text-1)",
            border: "1px solid var(--border)",
          }}
        >
          <Plus size={14} />
          New chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-3 pt-4 pb-3">
        <p
          className="text-[10px] uppercase tracking-wider font-medium mb-2 px-2"
          style={{ color: "var(--text-4)" }}
        >
          Recent
        </p>
        {conversations.length === 0 ? (
          <p className="text-xs px-2 py-4" style={{ color: "var(--text-4)" }}>
            No conversations yet. Start by asking anything.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => (
              <li key={c.id}>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => onSelect(c.id)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs cursor-pointer transition-colors"
                  style={{
                    background: activeId === c.id ? "var(--bg-surface)" : "transparent",
                    color: activeId === c.id ? "var(--text-1)" : "var(--text-3)",
                  }}
                >
                  <MessageSquareText size={12} style={{ flexShrink: 0, opacity: 0.6 }} />
                  <span className="truncate">{c.title || "Untitled"}</span>
                </motion.button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-3 py-3 flex-shrink-0 space-y-0.5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <ThemeToggle />
        <button
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: "var(--text-3)" }}
        >
          <Settings size={12} />
          Settings
        </button>
      </div>
    </aside>
  );
}
