"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageSquare, PanelRight } from "lucide-react";
import type {
  Conversation,
  Message,
  AssistantMessage,
  CanvasArtifact,
} from "@/lib/types";
import { Sidebar } from "./sidebar";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import { MessageRenderer } from "./message";
import { Canvas } from "./canvas/canvas";
import { ThemeToggle } from "./theme-toggle";

type MobileView = "chat" | "canvas";

export function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("chat");
  const threadRef = useRef<HTMLDivElement>(null);

  /* Responsive detection */
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      const mobile = w < 768;
      const desktop = w >= 1024;
      setIsMobile(mobile);
      setIsDesktop(desktop);
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
  const canvasArtifacts: CanvasArtifact[] = activeConv?.canvasArtifacts ?? [];
  const hasMessages = messages.length > 0;
  const hasCanvas = canvasArtifacts.length > 0;

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
        canvasArtifacts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(id);
      return id;
    },
    [activeId],
  );

  const openCanvasArtifact = useCallback(
    (artifactId: string) => {
      setActiveCanvasId(artifactId);
      setCanvasOpen(true);
      if (isMobile) setMobileView("canvas");
    },
    [isMobile],
  );

  const closeCanvas = useCallback(() => {
    setCanvasOpen(false);
    if (isMobile) setMobileView("chat");
  }, [isMobile]);

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
                title:
                  c.messages.length === 0
                    ? query.slice(0, 40) + (query.length > 40 ? "…" : "")
                    : c.title,
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
        const data = (await res.json()) as {
          message: AssistantMessage;
          canvasArtifacts?: CanvasArtifact[];
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: [...c.messages, data.message],
                  canvasArtifacts: [
                    ...c.canvasArtifacts,
                    ...(data.canvasArtifacts ?? []),
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : c,
          ),
        );

        // Auto-open the first artifact from this response
        if (data.canvasArtifacts && data.canvasArtifacts.length > 0) {
          const first = data.canvasArtifacts[0];
          setActiveCanvasId(first.id);
          setCanvasOpen(true);
          if (isMobile) setMobileView("canvas");
        }
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
            c.id === convId
              ? { ...c, messages: [...c.messages, errMsg] }
              : c,
          ),
        );
      } finally {
        setPending(false);
      }
    },
    [ensureActiveConv, isMobile],
  );

  const handleNew = () => {
    setActiveId(null);
    setCanvasOpen(false);
    setActiveCanvasId(null);
    setMobileView("chat");
    if (isMobile) setSidebarOpen(false);
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    const conv = conversations.find((c) => c.id === id);
    if (conv && conv.canvasArtifacts.length > 0) {
      setActiveCanvasId(conv.canvasArtifacts[conv.canvasArtifacts.length - 1].id);
    } else {
      setActiveCanvasId(null);
      setCanvasOpen(false);
    }
    setMobileView("chat");
    if (isMobile) setSidebarOpen(false);
  };

  /* ─ Layout: sidebar + chat column + (canvas pane on desktop when open) ─ */
  const showCanvasPane = isDesktop && canvasOpen && hasCanvas;

  return (
    <div
      className="flex h-screen max-h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Sidebar */}
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
                style={{ background: "var(--overlay)" }}
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

      {/* Main content: chat column + optional canvas pane */}
      <div className="flex flex-1 min-w-0">
        {/* CHAT COLUMN — hidden on mobile when canvas view is active */}
        <main
          className={`flex-1 flex flex-col min-w-0 ${
            isMobile && mobileView === "canvas" ? "hidden" : ""
          }`}
        >
          {/* Top bar */}
          <header
            className="h-14 flex items-center justify-between px-4 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <button
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                onClick={() => setSidebarOpen((v) => !v)}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-surface)]"
                style={{ color: "var(--text-3)" }}
              >
                {sidebarOpen && isMobile ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
            <span
              className="text-xs font-medium truncate mx-3 flex-1 text-center"
              style={{ color: "var(--text-2)" }}
            >
              {activeConv?.title ?? "Riko"}
            </span>
            <div className="flex items-center justify-end gap-0.5">
              <ThemeToggle compact />
              {/* Mobile: switch to canvas view */}
              {isMobile && hasCanvas && (
                <button
                  aria-label="Open canvas"
                  onClick={() => setMobileView("canvas")}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-surface)]"
                  style={{ color: "var(--green)" }}
                >
                  <PanelRight size={16} />
                </button>
              )}
              {/* Desktop: re-open canvas if closed */}
              {isDesktop && hasCanvas && !canvasOpen && (
                <button
                  aria-label="Re-open canvas"
                  onClick={() => setCanvasOpen(true)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-surface)]"
                  style={{ color: "var(--green)" }}
                  title="Re-open canvas"
                >
                  <PanelRight size={16} />
                </button>
              )}
            </div>
          </header>

          {/* Thread / empty state */}
          <div ref={threadRef} className="flex-1 overflow-y-auto">
            {hasMessages ? (
              <div
                className={`mx-auto px-4 py-6 md:px-6 md:py-8 ${
                  showCanvasPane ? "max-w-2xl" : "max-w-3xl"
                }`}
              >
                {messages.map((m) => (
                  <MessageRenderer
                    key={m.id}
                    message={m}
                    onOpenCanvas={openCanvasArtifact}
                  />
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

        {/* DESKTOP CANVAS PANE */}
        <AnimatePresence initial={false}>
          {showCanvasPane && (
            <motion.div
              key="canvas-desktop"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "min(760px, 55%)", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              style={{ minWidth: 0, overflow: "hidden", flexShrink: 0 }}
            >
              <Canvas
                artifacts={canvasArtifacts}
                activeId={activeCanvasId}
                onSelect={setActiveCanvasId}
                onClose={closeCanvas}
                variant="split"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* MOBILE CANVAS VIEW (full-screen, replaces chat) */}
        {isMobile && mobileView === "canvas" && hasCanvas && (
          <main className="flex-1 flex flex-col min-w-0">
            {/* Mobile canvas header: back-to-chat button */}
            <header
              className="h-14 flex items-center px-3 gap-2 flex-shrink-0"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <button
                aria-label="Back to chat"
                onClick={() => setMobileView("chat")}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-[var(--bg-surface)]"
                style={{ color: "var(--text-2)" }}
              >
                <MessageSquare size={14} />
                Chat
              </button>
            </header>
            <div className="flex-1 min-h-0">
              <Canvas
                artifacts={canvasArtifacts}
                activeId={activeCanvasId}
                onSelect={setActiveCanvasId}
                onClose={() => setMobileView("chat")}
                variant="full"
              />
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

/* Pending indicator */
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
