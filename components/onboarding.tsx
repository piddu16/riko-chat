"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, FileSpreadsheet, Database, FolderOpen, ArrowRight } from "lucide-react";

type OnboardingOption = "tally" | "excel" | "demo";

/** Minimal one-screen onboarding modal. Three honest paths. Marks user
 *  as onboarded once they pick any option. Light chrome — no 4-step wizard. */
export function OnboardingModal({
  open,
  onComplete,
  onSetName,
}: {
  open: boolean;
  onComplete: (option: OnboardingOption) => void;
  onSetName: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [stage, setStage] = useState<"name" | "connect">("name");

  const submitName = () => {
    if (!name.trim()) {
      setStage("connect");
      return;
    }
    onSetName(name.trim());
    setStage("connect");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80]"
            style={{ background: "var(--overlay)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-md rounded-2xl p-7 md:p-8"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-md)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Brand */}
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--green)" }}
                >
                  <Sparkles size={15} color="white" />
                </div>
                <span
                  className="text-base font-bold"
                  style={{
                    color: "var(--text-1)",
                    fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                  }}
                >
                  Riko
                </span>
              </div>

              {stage === "name" ? (
                <div>
                  <h2
                    className="text-xl md:text-2xl font-bold mb-1 leading-snug"
                    style={{
                      color: "var(--text-1)",
                      fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                    }}
                  >
                    Namaste. Let&apos;s get Riko talking to your books.
                  </h2>
                  <p className="text-sm mb-5" style={{ color: "var(--text-3)" }}>
                    Takes about 60 seconds. Your Tally data never leaves your setup.
                  </p>
                  <label
                    className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--text-4)" }}
                  >
                    Your first name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitName();
                    }}
                    placeholder="e.g. Yogesh"
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text-1)",
                    }}
                    autoFocus
                  />
                  <button
                    onClick={submitName}
                    className="w-full mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-lg cursor-pointer transition-opacity hover:opacity-90"
                    style={{
                      background: "var(--green)",
                      color: "white",
                      border: "none",
                    }}
                  >
                    Continue
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => {
                      onSetName("");
                      setStage("connect");
                    }}
                    className="w-full mt-2 text-[11px] cursor-pointer transition-colors hover:text-[var(--text-2)]"
                    style={{ color: "var(--text-4)" }}
                  >
                    Skip for now
                  </button>
                </div>
              ) : (
                <div>
                  <h2
                    className="text-xl md:text-2xl font-bold mb-1 leading-snug"
                    style={{
                      color: "var(--text-1)",
                      fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
                    }}
                  >
                    How should Riko read your books?
                  </h2>
                  <p className="text-sm mb-5" style={{ color: "var(--text-3)" }}>
                    Pick one — you can change this any time.
                  </p>
                  <div className="space-y-2">
                    <OptionRow
                      icon={Database}
                      label="Connect TallyPrime"
                      sub="Live sync via INFINI — 5 min setup"
                      badge="recommended"
                      onClick={() => onComplete("tally")}
                    />
                    <OptionRow
                      icon={FileSpreadsheet}
                      label="Upload Tally exports"
                      sub="Excel / CSV — useful for CAs with many clients"
                      onClick={() => onComplete("excel")}
                    />
                    <OptionRow
                      icon={FolderOpen}
                      label="Explore with demo data"
                      sub="Try Riko with Bandra Soap sample books"
                      onClick={() => onComplete("demo")}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function OptionRow({
  icon: Icon,
  label,
  sub,
  badge,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  sub: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 rounded-xl p-3.5 cursor-pointer transition-all hover:-translate-y-[1px] hover:shadow-md"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center"
        style={{ background: "color-mix(in srgb, var(--green) 14%, transparent)" }}
      >
        <Icon size={16} style={{ color: "var(--green)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
            {label}
          </span>
          {badge && (
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider"
              style={{
                background: "var(--green-bg)",
                color: "var(--green)",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
          {sub}
        </p>
      </div>
      <ArrowRight size={14} style={{ color: "var(--text-4)", flexShrink: 0, alignSelf: "center" }} />
    </button>
  );
}
