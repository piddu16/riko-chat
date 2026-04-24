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
  /** Heavyweight artifacts that open in the right-side canvas (desktop)
   *  or a separate view on mobile. Only id + title + kind travel on the
   *  message; the full artifact lives in the conversation's canvasArtifacts. */
  canvasRefs?: CanvasRef[];
  /** Trace id — when set, users can tap "View sources" to see the exact
   *  Tally vouchers that produced the answer. */
  traceId?: string;
}

/** Pointer stored on a message — opens the referenced artifact in the canvas. */
export interface CanvasRef {
  id: string;
  kind: CanvasArtifact["kind"];
  title: string;
  subtitle?: string;
  /** If true, the canvas auto-opens on this message. Default: true for the
   *  first canvas-generating response; false if the user has previously closed
   *  the canvas this session. */
  autoOpen?: boolean;
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

/* ── Canvas (right-side / full-screen-on-mobile) artifacts ── */

export type CanvasArtifact =
  | RevenueChartArtifact
  | MisReportArtifact
  | ReconReportArtifact
  | InvoiceArtifact;

export interface RevenueChartArtifact {
  id: string;
  kind: "revenue-chart";
  title: string;
  subtitle?: string;
  /** 12 months of current FY, Apr → Mar */
  fy25: number[];
  /** 12 months of prior FY, Apr → Mar (ghost bar overlay) */
  fy24: number[];
  months: string[]; // length 12
  currentFYLabel: string;
  priorFYLabel: string;
}

export interface MisReportArtifact {
  id: string;
  kind: "mis-report";
  title: string;
  company: string;
  gstin?: string;
  period: string;
  preparedBy: string;
  sections: MisSection[];
}

export interface MisSection {
  heading: string;
  kind: "kpi-grid" | "pl-table" | "aging-bars" | "commentary";
  /** KPI grid */
  kpis?: Array<{ label: string; value: string; delta?: string; tone?: "green" | "red" | "yellow" | "neutral" }>;
  /** P&L / BS table */
  rows?: Array<{ label: string; current: string; prior?: string; variance?: string; emphasis?: boolean; indent?: 0 | 1 | 2 }>;
  /** Aging / stacked bars */
  segments?: Array<{ label: string; value: number; color: string; amount: string }>;
  /** Free-form commentary paragraphs */
  paragraphs?: string[];
}

export interface ReconReportArtifact {
  id: string;
  kind: "recon-report";
  title: string;
  period: string;
  summary: {
    matched: number;
    manualMatched: number;
    partialMatch: number;
    mismatches: number;
    missingFromPortal: number;
    missingFromTally: number;
    total: number;
    itcAtRisk: string;
  };
  lines: ReconLine[];
}

export interface ReconLine {
  id: string;
  supplier: string;
  invoiceNo: string;
  date: string;
  status: "matched" | "manual_matched" | "partial_match" | "mismatch" | "missing_portal" | "missing_tally";
  tallyAmount: number | null;
  portalAmount: number | null;
  issue?: string;
}

export interface InvoiceArtifact {
  id: string;
  kind: "invoice";
  title: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  sellerName: string;
  sellerGstin: string;
  sellerAddress: string;
  buyerName: string;
  buyerGstin?: string;
  buyerAddress: string;
  lineItems: Array<{ description: string; hsn: string; qty: number; rate: number; amount: number; taxRate: number }>;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  amountInWords: string;
  notes?: string;
}

/* ── Pending action (yesterday's commitment → today's resolution) ── */

export interface PendingAction {
  id: string;
  verb: string;     // "Call Nykaa"
  context: string;  // "about ₹12.6L overdue"
  setAt: string;
}

/* ── Conversation shape (for history/persistence) ── */

export interface Conversation {
  id: string;
  title: string;            // Auto-generated from first user message
  messages: Message[];
  canvasArtifacts: CanvasArtifact[];
  createdAt: string;
  updatedAt: string;
}
