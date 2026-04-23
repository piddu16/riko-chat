"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, ArrowUp, Building2, Mic } from "lucide-react";
import { COMPANY } from "@/lib/mock-data";
import { relativeTime } from "@/lib/format";

export function Composer({
  onSubmit,
  pending,
  placeholder,
}: {
  onSubmit: (query: string) => void;
  pending: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  /* Auto-grow height */
  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = "0px";
    const scroll = Math.min(ta.scrollHeight, 220);
    ta.style.height = scroll + "px";
  }, [value]);

  const submit = () => {
    const q = value.trim();
    if (!q || pending) return;
    onSubmit(q);
    setValue("");
  };

  return (
    <div className="w-full px-4 pb-4 md:pb-6">
      <div className="max-w-3xl mx-auto">
        {/* Context pill — always visible */}
        <div className="flex items-center justify-between mb-2 px-1">
          <button
            className="flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2 py-1 cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: "var(--text-3)", background: "var(--bg-surface)" }}
          >
            <Building2 size={12} />
            <span style={{ color: "var(--text-1)" }}>{COMPANY.name}</span>
            <span style={{ color: "var(--text-4)" }}>· {COMPANY.fy}</span>
          </button>
          <span className="text-[11px]" style={{ color: "var(--text-4)" }}>
            Tally synced {relativeTime(COMPANY.tallySyncedAt)}
          </span>
        </div>

        <div
          className="rounded-2xl p-2.5 flex items-end gap-2"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-composer)",
          }}
        >
          <button
            aria-label="Attach file"
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: "var(--text-3)" }}
          >
            <Paperclip size={16} />
          </button>

          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={placeholder ?? "Ask anything about your books…"}
            className="flex-1 min-w-0 bg-transparent border-none outline-none resize-none text-sm py-2 px-1"
            style={{ color: "var(--text-1)", maxHeight: 220 }}
            disabled={pending}
          />

          <button
            aria-label="Voice"
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: "var(--text-3)" }}
          >
            <Mic size={16} />
          </button>

          <button
            aria-label="Send"
            onClick={submit}
            disabled={!value.trim() || pending}
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: value.trim() && !pending ? "var(--green)" : "var(--bg-hover)",
              color: value.trim() && !pending ? "white" : "var(--text-4)",
            }}
          >
            <ArrowUp size={16} />
          </button>
        </div>

        <p
          className="text-[10px] text-center mt-2"
          style={{ color: "var(--text-4)" }}
        >
          Riko answers from your Tally + INFINI + bank data. It cites sources. It won&apos;t guess.
        </p>
      </div>
    </div>
  );
}
