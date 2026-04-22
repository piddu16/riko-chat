/* ── Message + response types for the chat thread ── */

export type Role = "user" | "assistant";

export interface UserMessage {
  id: string;
  role: "user";
  content: string;
  createdAt: string; // ISO
}

export interface AssistantMessage {
  id: string;
  role: "assistant";
  createdAt: string;
  /** 4-layer response pattern. All but `answer` are optional. */
  answer: string; // one-sentence lead, rendered large
  calculation?: CalculationBlock;
  sources?: SourcesBlock;
  action?: ActionBlock;
  /** Artifacts rendered inline with this response (tables, charts, lists) */
  artifacts?: Artifact[];
}

export type Message = UserMessage | AssistantMessage;

/* ── 4-layer blocks ── */

export interface CalculationBlock {
  rows: Array<{ label: string; value: string; emphasis?: boolean }>;
}

export interface SourcesBlock {
  /** One-line summary like "From 847 vouchers · Apr–Mar 2026" */
  summary: string;
  /** Optional drill-in details for the expandable "▸ Details" section */
  details?: Array<{ label: string; value: string }>;
}

export interface ActionBlock {
  label: string; // "Ping Nykaa"
  verb: "whatsapp" | "file" | "record" | "open" | "remind" | "acknowledge";
  payload?: Record<string, unknown>;
}

/* ── Artifacts ── */

export type Artifact =
  | { kind: "kpi"; label: string; value: string; sublabel?: string; delta?: { pct: number; direction: "up" | "down" } }
  | { kind: "table"; title?: string; columns: string[]; rows: Array<Array<string>>; footer?: string }
  | { kind: "action-list"; title: string; items: Array<{ label: string; amount?: string; sublabel?: string; action: ActionBlock }> }
  | { kind: "stacked-bar"; title: string; segments: Array<{ label: string; value: number; color: string }>; total: string };

/* ── Empty-state "current moment" card ── */

export interface MomentCard {
  id: string;
  icon: "alert-triangle" | "receipt-text" | "package" | "trending-down" | "calendar-clock";
  tone: "red" | "yellow" | "orange" | "neutral";
  headline: string;         // "You have ₹17.4L overdue"
  sublabel: string;         // "across 8 parties"
  seedQuery: string;        // What to send as the user message when tapped
}

/* ── Conversation shape (for history/persistence) ── */

export interface Conversation {
  id: string;
  title: string;            // Auto-generated from first user message
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}
