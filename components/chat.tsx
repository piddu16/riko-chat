"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, PanelRight } from "lucide-react";
import type {
  Conversation,
  Message,
  AssistantMessage,
  CanvasArtifact,
} from "@/lib/types";
import { Sidebar } from "./sidebar";
import { Composer, type ComposerSubmit } from "./composer";
import { EmptyState } from "./empty-state";
import { MessageRenderer } from "./message";
import { Canvas } from "./canvas/canvas";
import { ThemeToggle } from "./theme-toggle";
import { SystemHealth } from "./system-health";
import { SourceDrawer } from "./source-drawer";
import { OnboardingModal } from "./onboarding";
import { usePersonalization, greetingFor } from "@/lib/personalization";

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
  const [sourceTraceId, setSourceTraceId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  const {
    mounted: personalMounted,
    name,
    onboarded,
    whatsappOptIn,
    streakDays,
    pendingAction,
    setName,
    markOnboarded,
    setWhatsappOptIn,
    setPendingAction,
  } = usePersonalization();

  /* Show onboarding on first visit (after personalization hydrates). */
  useEffect(() => {
    if (personalMounted && !onboarded) {
      // small delay so initial paint feels calm
      const t = setTimeout(() => setShowOnboarding(true), 350);
      return () => clearTimeout(t);
    }
  }, [personalMounted, onboarded]);

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

  /* Smart auto-scroll: only follow-to-bottom if the user is already near it.
   *  Prevents yanking a user who scrolled up to read older messages. */
  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom < 120;
    if (nearBottom) {
      // Use rAF so layout settles (esp. when an artifact just rendered)
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    }
  }, [conversations, activeId, pending]);

  /* Body scroll lock whenever a full-screen overlay is visible (modal / drawer / mobile sidebar).
   *  Prevents "double scroll" where the background thread shifts under the panel. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const lock =
      showOnboarding ||
      sourceTraceId !== null ||
      (isMobile && sidebarOpen);
    if (lock) {
      document.body.setAttribute("data-scroll-lock", "on");
    } else {
      document.body.removeAttribute("data-scroll-lock");
    }
    return () => document.body.removeAttribute("data-scroll-lock");
  }, [showOnboarding, sourceTraceId, isMobile, sidebarOpen]);

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

  const sendPayload = useCallback(
    async (payload: ComposerSubmit) => {
      const labelForTitle = payload.query ?? (payload.file ? payload.file.name : "New chat");
      const convId = ensureActiveConv(labelForTitle);

      const userContent = payload.file
        ? payload.query
          ? `${payload.query}\n\n📎 ${payload.file.name}`
          : `📎 ${payload.file.name}`
        : payload.query ?? "";

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: userContent,
        createdAt: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                title:
                  c.messages.length === 0
                    ? labelForTitle.slice(0, 40) + (labelForTitle.length > 40 ? "…" : "")
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
          body: JSON.stringify(
            payload.file
              ? { file: payload.file, note: payload.query }
              : { query: payload.query },
          ),
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

        // If the response has a WhatsApp-ish verb, stash it as a pending action
        // so it re-surfaces tomorrow. This is the "close the loop" ritual.
        if (data.message.action && (data.message.action.verb === "whatsapp" || data.message.action.verb === "remind")) {
          setPendingAction({
            id: data.message.id,
            verb: data.message.action.label,
            context: data.message.answer,
            setAt: new Date().toISOString(),
          });
        }

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
    [ensureActiveConv, isMobile, setPendingAction],
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

  const resolveYesterday = (outcome: "done" | "snooze" | "skip") => {
    if (outcome === "snooze") {
      // Keep pendingAction, do nothing
      return;
    }
    setPendingAction(null);
    if (outcome === "done") {
      // Could seed a congrats message — keeping UX quiet for now.
    }
  };

  const handleOnboardingComplete = (option: "tally" | "excel" | "demo") => {
    markOnboarded();
    setShowOnboarding(false);
    // Option doesn't change behavior in the mock — all three land at the same demo data.
    void option;
  };

  const showCanvasPane = isDesktop && canvasOpen && hasCanvas;

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        background: "var(--bg-primary)",
        // svh = small viewport height (accounts for iOS Safari URL bar)
        // fallback to 100vh for browsers without svh support
        height: "100svh",
        maxHeight: "100svh",
      }}
    >
      <SystemHealth />

      <div className="flex flex-1 min-h-0 overflow-hidden">
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

        {/* Main: chat column + optional canvas pane */}
        <div className="flex flex-1 min-w-0">
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
                      onOpenSources={setSourceTraceId}
                    />
                  ))}
                  {pending && <PendingDots />}
                </div>
              ) : (
                <EmptyState
                  onSeed={(q) => sendPayload({ query: q })}
                  greeting={greetingFor()}
                  userName={name}
                  streakDays={streakDays}
                  pendingAction={pendingAction}
                  onResolvePending={resolveYesterday}
                  onToggleWhatsapp={() => setWhatsappOptIn(!whatsappOptIn)}
                  whatsappOptIn={whatsappOptIn}
                />
              )}
            </div>

            <Composer onSubmit={sendPayload} pending={pending} />
          </main>

          {/* Desktop canvas pane */}
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

          {/* Mobile full-screen canvas — Canvas carries its own back button */}
          {isMobile && mobileView === "canvas" && hasCanvas && (
            <main className="flex-1 flex flex-col min-w-0">
              <Canvas
                artifacts={canvasArtifacts}
                activeId={activeCanvasId}
                onSelect={setActiveCanvasId}
                onClose={() => setMobileView("chat")}
                onBackToChat={() => setMobileView("chat")}
                variant="full"
              />
            </main>
          )}
        </div>
      </div>

      {/* Global overlays */}
      <SourceDrawer traceId={sourceTraceId} onClose={() => setSourceTraceId(null)} />
      <OnboardingModal
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSetName={(n) => {
          if (n) setName(n);
        }}
      />
    </div>
  );
}

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
