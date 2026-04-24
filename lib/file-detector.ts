/* File auto-detection — the copilot moment.
 *
 * User drops a file (PDF / XLSX / image / CSV) into the composer. Riko looks
 * at the filename + extension + approximate size + (if provided) a first-page
 * text sample and decides what kind of document it is:
 *
 *   ▸ bank-statement  → opens a reconciliation flow
 *   ▸ purchase-invoice → drafts a Purchase voucher
 *   ▸ expense-receipt → drafts a Payment voucher
 *   ▸ sales-request   → drafts a Sales invoice
 *   ▸ batch-upload    → opens the bulk-voucher preview
 *   ▸ tally-export    → recognises a Tally XLS and routes to the right section
 *   ▸ unknown         → asks the user to clarify
 *
 * Rules are deliberately simple for v1. In production this is ocr + LLM
 * classification; here we pattern-match filename + extension + size heuristics.
 */

export type DetectedKind =
  | "bank-statement"
  | "purchase-invoice"
  | "expense-receipt"
  | "sales-request"
  | "batch-upload"
  | "tally-export"
  | "unknown";

export interface DetectionResult {
  kind: DetectedKind;
  confidence: "high" | "medium" | "low";
  /** One-line human readable description */
  summary: string;
  /** What Riko proposes to do with it */
  proposal: string;
  /** The detection signals (for the Sources block) */
  signals: string[];
}

export interface UploadedFileMeta {
  name: string;
  size: number;
  type: string;              // MIME
  lastModified?: number;
}

const BANK_KEYWORDS = [
  "statement", "stmt", "bank", "hdfc", "icici", "kotak", "axis", "sbi",
  "indusind", "yes bank", "passbook", "account",
];
const INVOICE_KEYWORDS = [
  "invoice", "inv-", "inv_", "bill", "vendor", "supplier", "gst_inv", "tax-invoice",
];
const EXPENSE_KEYWORDS = [
  "receipt", "expense", "reimbursement", "voucher", "payment-", "pay_",
];
const SALES_KEYWORDS = [
  "po-", "purchase-order", "order-", "buy", "client-order", "sales-inquiry",
];
const TALLY_KEYWORDS = [
  "tally", "daybook", "ledger", "trial-balance", "stock-register", "outstandings",
];

function matchAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase();
  return needles.some((n) => lower.includes(n));
}

export function detectFile(meta: UploadedFileMeta): DetectionResult {
  const { name, size, type } = meta;
  const lower = name.toLowerCase();
  const ext = lower.split(".").pop() ?? "";
  const signals: string[] = [`Filename: ${name}`, `Size: ${(size / 1024).toFixed(0)} KB`, `MIME: ${type || "unknown"}`];

  // ── Tally-native exports first (most specific) ──
  if (matchAny(lower, TALLY_KEYWORDS)) {
    return {
      kind: "tally-export",
      confidence: "high",
      summary: `Tally export detected — ${name}`,
      proposal: "Route to the right module based on which Tally report this is.",
      signals: [...signals, "Tally keyword match"],
    };
  }

  // ── Bank statements ──
  if (matchAny(lower, BANK_KEYWORDS) && (ext === "pdf" || ext === "csv" || ext === "xlsx" || ext === "xls")) {
    return {
      kind: "bank-statement",
      confidence: "high",
      summary: `Bank statement detected — ${name}`,
      proposal: "Parse transactions and run bank reconciliation against Tally receipts + payments.",
      signals: [...signals, "Bank keyword match", `Tabular extension .${ext}`],
    };
  }

  // ── Purchase invoice (PDF / image) ──
  if (matchAny(lower, INVOICE_KEYWORDS) && (ext === "pdf" || ext === "jpg" || ext === "jpeg" || ext === "png")) {
    return {
      kind: "purchase-invoice",
      confidence: "high",
      summary: `Purchase invoice detected — ${name}`,
      proposal: "OCR the invoice → extract vendor + GSTIN + line items + tax → draft a Purchase voucher for your review.",
      signals: [...signals, "Invoice keyword match", `Document extension .${ext}`],
    };
  }

  // ── Expense / receipt (usually photo from a phone) ──
  if (matchAny(lower, EXPENSE_KEYWORDS) || (ext === "jpg" || ext === "jpeg" || ext === "png")) {
    return {
      kind: "expense-receipt",
      confidence: EXPENSE_KEYWORDS.some((k) => lower.includes(k)) ? "high" : "medium",
      summary: `Expense receipt detected — ${name}`,
      proposal: "OCR the receipt → draft a Payment voucher against the right expense ledger.",
      signals: [...signals, "Image or expense keyword"],
    };
  }

  // ── Sales request / PO ──
  if (matchAny(lower, SALES_KEYWORDS)) {
    return {
      kind: "sales-request",
      confidence: "medium",
      summary: `Sales order / request detected — ${name}`,
      proposal: "Draft a Sales invoice pre-filled from the PO and hold for your review before posting to Tally.",
      signals: [...signals, "Sales/PO keyword match"],
    };
  }

  // ── Batch upload (XLSX / CSV without specific keyword) ──
  if ((ext === "xlsx" || ext === "xls" || ext === "csv") && size > 25_000) {
    return {
      kind: "batch-upload",
      confidence: "medium",
      summary: `Bulk data file — ${name}`,
      proposal: "Preview as a batch upload — detect rows, columns, and propose which voucher type to create per row.",
      signals: [...signals, `Spreadsheet (.${ext})`, size > 100_000 ? "Large file → batch" : "Small spreadsheet"],
    };
  }

  // ── Fallback ──
  return {
    kind: "unknown",
    confidence: "low",
    summary: `Uploaded — ${name}`,
    proposal: "Tell me what this is and I'll take it from there. (Bank statement? Invoice? Receipt?)",
    signals: [...signals, "No strong classifier signals"],
  };
}

/* ── Human labels for UI chips ── */
export const KIND_LABEL: Record<DetectedKind, string> = {
  "bank-statement": "Bank statement",
  "purchase-invoice": "Purchase invoice",
  "expense-receipt": "Expense receipt",
  "sales-request": "Sales order",
  "batch-upload": "Batch upload",
  "tally-export": "Tally export",
  "unknown": "Attachment",
};
