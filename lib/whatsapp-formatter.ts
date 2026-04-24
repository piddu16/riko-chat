/* Turns an AssistantMessage into plain-text copy suitable for WhatsApp.
 *
 * Rules:
 *   - No markdown (WhatsApp doesn't render it consistently across web/iOS/Android)
 *   - Rupee symbol + lakh/crore format (₹12.6L not Rs.1260000)
 *   - Short answer first, supporting data as labelled lines
 *   - Brand signature at the end
 *   - Keep under ~900 chars so it doesn't truncate in share sheets
 */

import type { AssistantMessage } from "./types";
import { COMPANY } from "./mock-data";

export function formatForWhatsApp(message: AssistantMessage): string {
  const lines: string[] = [];

  // Headline answer
  lines.push(message.answer);

  // Calculation rows (label: value)
  if (message.calculation && message.calculation.rows.length > 0) {
    lines.push("");
    for (const row of message.calculation.rows) {
      lines.push(`${row.label}: ${row.value}`);
    }
  }

  // Inline artifact summaries
  if (message.artifacts) {
    for (const art of message.artifacts) {
      if (art.kind === "action-list" && art.items.length > 0) {
        lines.push("");
        lines.push(art.title);
        art.items.slice(0, 5).forEach((item) => {
          const line = item.amount
            ? `• ${item.label} — ${item.amount}${item.sublabel ? ` (${item.sublabel})` : ""}`
            : `• ${item.label}`;
          lines.push(line);
        });
        if (art.items.length > 5) {
          lines.push(`…and ${art.items.length - 5} more`);
        }
      } else if (art.kind === "table" && art.rows.length > 0) {
        lines.push("");
        if (art.title) lines.push(art.title);
        art.rows.slice(0, 5).forEach((row) => {
          lines.push(`• ${row.slice(0, 3).join(" · ")}`);
        });
        if (art.rows.length > 5) {
          lines.push(`…and ${art.rows.length - 5} more rows`);
        }
      }
    }
  }

  // Canvas artifact mentions
  if (message.canvasRefs && message.canvasRefs.length > 0) {
    lines.push("");
    for (const ref of message.canvasRefs) {
      lines.push(`📎 ${ref.title}${ref.subtitle ? ` — ${ref.subtitle}` : ""}`);
    }
  }

  // Source one-liner
  if (message.sources?.summary) {
    lines.push("");
    lines.push(`Source: ${message.sources.summary}`);
  }

  // Signature
  const now = new Date();
  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  const dd = now.getDate();
  const monthName = now.toLocaleString("en-GB", { month: "short" });
  lines.push("");
  lines.push(`— Riko · ${COMPANY.name} · ${hh}:${mm} ${dd} ${monthName}`);

  return lines.join("\n").slice(0, 900);
}

/** Open the OS share sheet with a pre-formatted WhatsApp-ready payload.
 *  Falls back to clipboard if native share is unavailable. */
export async function shareMessage(
  message: AssistantMessage,
  onFallback?: (copiedText: string) => void,
): Promise<"shared" | "copied" | "failed"> {
  const text = formatForWhatsApp(message);

  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await navigator.share({
        title: "Riko — " + message.answer.slice(0, 60),
        text,
      });
      return "shared";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return "failed"; // User cancelled; not an error to surface
      }
      // fall through to clipboard
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      onFallback?.(text);
      return "copied";
    } catch {
      return "failed";
    }
  }

  return "failed";
}

/** Build a plain WhatsApp deep-link (wa.me) for cases where the OS share
 *  sheet isn't available — used as a last-resort fallback button. */
export function whatsappDeepLink(message: AssistantMessage): string {
  const text = encodeURIComponent(formatForWhatsApp(message));
  return `https://wa.me/?text=${text}`;
}
