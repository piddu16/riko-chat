"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { Paperclip, ArrowUp, Mic } from "lucide-react";
import { UploadChip, type UploadState } from "./upload-chip";

export interface ComposerSubmit {
  query?: string;
  file?: { name: string; size: number; type: string };
}

export function Composer({
  onSubmit,
  pending,
  placeholder,
}: {
  onSubmit: (payload: ComposerSubmit) => void;
  pending: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Auto-grow textarea */
  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = "0px";
    const scroll = Math.min(ta.scrollHeight, 220);
    ta.style.height = scroll + "px";
  }, [value]);

  const pickFile = (f: File) => {
    setUpload({ stage: "picked", name: f.name, size: f.size });
  };

  const submit = () => {
    const q = value.trim();
    if (pending) return;
    if (!q && !upload) return;

    if (upload) {
      // Fire upload with optional text as note
      onSubmit({
        file: { name: upload.name, size: upload.size, type: "" },
        query: q || undefined,
      });
    } else {
      onSubmit({ query: q });
    }
    setValue("");
    setUpload(null);
  };

  /* Drag + drop */
  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!dragging) setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  };

  return (
    <div
      className="w-full px-4"
      style={{
        // iOS home-indicator / Android gesture area
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
        paddingTop: 4,
      }}
    >
      <div
        className="max-w-3xl mx-auto"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div
          className="rounded-2xl p-2.5 flex flex-col gap-0 relative"
          style={{
            background: "var(--bg-surface)",
            border: `1px solid ${dragging ? "var(--green)" : "var(--border)"}`,
            boxShadow: "var(--shadow-composer)",
            transition: "border-color 0.15s",
          }}
        >
          {dragging && (
            <div
              className="absolute inset-0 rounded-2xl flex items-center justify-center pointer-events-none z-10"
              style={{
                background: "color-mix(in srgb, var(--green) 12%, transparent)",
                color: "var(--green)",
              }}
            >
              <span className="text-sm font-semibold">Drop to auto-detect & import</span>
            </div>
          )}

          {upload && (
            <UploadChip state={upload} onRemove={() => setUpload(null)} />
          )}

          <div className="flex items-end gap-2">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.csv,.xlsx,.xls,.jpg,.jpeg,.png"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) pickFile(f);
                e.target.value = "";
              }}
            />
            <button
              aria-label="Attach file"
              onClick={() => fileRef.current?.click()}
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
              placeholder={
                placeholder ?? (upload ? "Add a note (optional)…" : "Ask anything · or drop a file")
              }
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
              disabled={(!value.trim() && !upload) || pending}
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  (value.trim() || upload) && !pending
                    ? "var(--green)"
                    : "var(--bg-hover)",
                color: (value.trim() || upload) && !pending ? "white" : "var(--text-4)",
              }}
            >
              <ArrowUp size={16} />
            </button>
          </div>
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
