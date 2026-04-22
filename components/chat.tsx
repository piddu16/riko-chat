"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { Conversation, Message, AssistantMessage } from "@/lib/types";
import { Sidebar } from "./sidebar";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import { MessageRenderer } from "./message";

export function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  /* Responsive detection */
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Auto-scroll when messages change */
  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [conversations, activeId, pending]);

  const activeConv = conversations.find((c) => c.id === activeId) ?? null;
  const messages: Message[] = activeConv?.messages ?? [];

  const ensureActiveConv = useCallback(
    (firstQuery?: string): string => {
      if (activeId) return activeId;
      const id = crypto.randomUUID();
      const title =
        firstQuery?.slice(0, 40) + (firstQuery && firstQuery.length > 40 ? "…" : "") ||
        "New chat";
      const conv: Conversation = {
        id,
        title,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(id);
      return id;
    },
    [activeId],
  );

  const sendQuery = useCallback(
    async (query: string) => {
      const convId = ensureActiveConv(query);
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: query,
        createdAt: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                title: c.messages.length === 0 ? query.slice(0, 40) + (query.length > 40 ? "…" : "") : c.title,
                messages: [...c.messages, userMsg],
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
      setPending(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = (await res.json()) as { message: AssistantMessage };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, data.message], updatedAt: new Date().toISOString() }
              : c,
          ),
        );
      } catch (err) {
        const errMsg: AssistantMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          createdAt: new Date().toISOString(),
          answer: "Something went wrong on my end. Try again?",
          sources: { summary: err instanceof Error ? err.message : "unknown" },
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId ? { ...c, messages: [...c.messages, errMsg] } : c,
          ),
        );
      } finally {
        setPending(false);
      }
    },
    [ensureActiveConv],
  );

  const handleNew = () => {
    setActiveId(null);
    if (isMobile) setSidebarOpen(false);
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (isMobile) setSidebarOpen(false);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen max-h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar — desktop: inline · mobile: overlay */}
      {isMobile ? (
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-40"
                style={{ background: "rgba(0,0,0,0.6)" }}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-y-0 left-0 z-50"
              >
                <Sidebar
                  conversations={conversations}
                  activeId={activeId}
                  onSelect={handleSelect}
                  onNew={handleNew}
                  collapsed={false}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      ) : (
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onNew={handleNew}
          collapsed={!sidebarOpen}
        />
      )}

      {/* Main column */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-14 flex items-center justify-between px-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <button
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-surface)]"
            style={{ color: "var(--text-3)" }}
          >
            {sidebarOpen && isMobile ? <X size={16} /> : <Menu size={16} />}
          </button>
          <span className="text-xs font-medium truncate mx-3" style={{ color: "var(--text-2)" }}>
            {activeConv?.title ?? "Riko"}
          </span>
          <div className="w-8" />
        </header>

        {/* Thread / empty state */}
        <div ref={threadRef} className="flex-1 overflow-y-auto">
          {hasMessages ? (
            <div className="max-w-3xl mx-auto px-4 py-6 md:px-6 md:py-8">
              {messages.map((m) => (
                <MessageRenderer key={m.id} message={m} />
              ))}
              {pending && <PendingDots />}
            </div>
          ) : (
            <EmptyState onSeed={(q) => sendQuery(q)} />
          )}
        </div>

        {/* Composer */}
        <Composer onSubmit={sendQuery} pending={pending} />
      </main>
    </div>
  );
}

/* Pending indicator while waiting for response */
function PendingDots() {
  return (
    <div className="flex items-center gap-1.5 mb-8 h-6">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--text-3)" }}
        />
      ))}
    </div>
  );
}
