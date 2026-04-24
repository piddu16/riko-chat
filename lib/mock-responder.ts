import type { AssistantMessage, CanvasArtifact, CanvasRef } from "./types";
import {
  CASH,
  REVENUE,
  RECEIVABLES,
  TOP_CUSTOMERS,
  TOP_SKUS,
  DEAD_STOCK,
  GST,
  buildRevenueChartArtifact,
  buildMisReportArtifact,
  buildReconReportArtifact,
  buildInvoiceArtifact,
} from "./mock-data";
import { formatINR } from "./format";
import type { DetectionResult, UploadedFileMeta } from "./file-detector";

export interface MockReply {
  message: Omit<AssistantMessage, "id" | "createdAt">;
  /** Fully-constructed canvas artifacts to attach to the conversation. */
  canvasArtifacts?: CanvasArtifact[];
}

/** Helper: build the inline CanvasRef from a full CanvasArtifact. */
function refFor(a: CanvasArtifact, subtitle?: string): CanvasRef {
  return { id: a.id, kind: a.kind, title: a.title, subtitle, autoOpen: true };
}

/** Returns a mock reply based on keyword-matching the user's query.
 *  Will be swapped for a real LLM + tool-calling call. */
export function mockResponse(query: string): MockReply {
  const q = query.toLowerCase();

  /* ═══════════════════════════════════════════════════════════
     CANVAS-GENERATING QUERIES — check these first (higher priority)
     ═══════════════════════════════════════════════════════════ */

  /* ── MIS report ── */
  if (q.match(/mis report|monthly report|p&?\s?l|profit.{0,5}loss|closing.{0,8}book/)) {
    const art = buildMisReportArtifact();
    return {
      message: {
        role: "assistant",
        answer: "March 2026 MIS is ready — opened on the right.",
        sources: {
          summary: "Revenue from sales vouchers · expenses from ledger groups · aging from debtor party ledgers",
        },
        action: { label: "Send to WhatsApp", verb: "whatsapp" },
        canvasRefs: [refFor(art, "Revenue ₹36.1L · EBITDA ₹-4.3L · Runway 9 days")],
        traceId: "top-customers",
      },
      canvasArtifacts: [art],
    };
  }

  /* ── 2B Reconciliation report ── */
  if (q.match(/2b|reconcil|reco.{0,3}march|gstr.?2|recon/)) {
    const art = buildReconReportArtifact();
    return {
      message: {
        role: "assistant",
        answer: `82% reconciled. ${GST.missingFromPortal} suppliers haven't filed GSTR-1 yet — ${formatINR(GST.itcAtRiskValue)} ITC at risk.`,
        sources: {
          summary: "Tally purchase vouchers vs GSTR-2B · INFINI API · March 2026 cut-off 14 Apr",
        },
        action: { label: `Remind ${GST.missingFromPortal} suppliers`, verb: "whatsapp" },
        canvasRefs: [refFor(art, `${GST.totalTallyInvoices} invoices · ${GST.matched + GST.manualMatched} matched`)],
        traceId: "gst-reconciliation",
      },
      canvasArtifacts: [art],
    };
  }

  /* ── Revenue chart ── */
  if (q.match(/revenue chart|monthly revenue|revenue trend|sales trend|graph|chart/)) {
    const art = buildRevenueChartArtifact();
    return {
      message: {
        role: "assistant",
        answer: `FY25 revenue is ${formatINR(REVENUE.currentFY)}, up ${REVENUE.yoyPct.toFixed(1)}% vs FY24.`,
        sources: {
          summary: "SUM(sales vouchers) by month · both FYs",
        },
        canvasRefs: [refFor(art, `${formatINR(REVENUE.currentFY)} · up ${REVENUE.yoyPct.toFixed(1)}% YoY`)],
      },
      canvasArtifacts: [art],
    };
  }

  /* ── Invoice generation ── */
  if (q.match(/create invoice|generate invoice|make invoice|new invoice|invoice for/)) {
    const art = buildInvoiceArtifact();
    return {
      message: {
        role: "assistant",
        answer: `Draft invoice for Nykaa — ${formatINR(art.total)} across 3 line items.`,
        sources: {
          summary: "Drafted using last-sale rates from stock master · ready for review before posting to Tally",
        },
        action: { label: "Post to Tally + send WhatsApp", verb: "whatsapp" },
        canvasRefs: [refFor(art, `${art.invoiceNo} · Due ${art.dueDate}`)],
      },
      canvasArtifacts: [art],
    };
  }

  /* ═══════════════════════════════════════════════════════════
     INLINE RESPONSES (stay in the thread)
     ═══════════════════════════════════════════════════════════ */

  /* ── Cash runway ── */
  if (q.match(/runway|cash position|how much cash|kitna cash/)) {
    return {
      message: {
        role: "assistant",
        answer: `Your cash runway is ${CASH.runwayDays} days.`,
        calculation: {
          rows: [
            { label: "Cash on hand", value: formatINR(CASH.cash) },
            { label: "Debtors (realistic)", value: formatINR(CASH.debtors * 0.4) + " @ 40% haircut" },
            { label: "Monthly burn", value: formatINR(CASH.monthlyBurn) + "/mo" },
            { label: "Daily burn", value: formatINR(CASH.monthlyBurn / 30) + "/day" },
            { label: "Runway", value: `${CASH.runwayDays} days`, emphasis: true },
          ],
        },
        sources: {
          summary: "From bank statement (21 Apr) + 90 days of payment vouchers",
          details: [
            { label: "Bank balance source", value: "HDFC ****1234 closing · 21 Apr 2026" },
            { label: "Burn rate source", value: "Last 90 days Payment + Journal vouchers, /3" },
          ],
        },
        action: { label: "Ping Nykaa about ₹12.6L due", verb: "whatsapp" },
        artifacts: [
          {
            kind: "kpi",
            label: "Runway",
            value: `${CASH.runwayDays} days`,
            sublabel: "🔴 critical · extend with collections",
          },
        ],
        traceId: "runway-cash",
      },
    };
  }

  /* ── Overdue receivables ── */
  if (q.match(/overdue|receivable|who owes|paise|owed to us|collect/)) {
    const top = RECEIVABLES.slice(0, 6);
    const total = RECEIVABLES.reduce((s, r) => s + r.amount, 0);
    return {
      message: {
        role: "assistant",
        answer: `${formatINR(total)} is overdue across ${RECEIVABLES.length} parties.`,
        calculation: {
          rows: [
            { label: "Total overdue", value: formatINR(total), emphasis: true },
            { label: "Parties", value: `${RECEIVABLES.length}` },
            { label: "Worst offender", value: `Paytm · 132 days` },
            { label: "Largest", value: `Nykaa · ${formatINR(RECEIVABLES[0].amount)}` },
          ],
        },
        sources: {
          summary: `From ${RECEIVABLES.length} debtor party ledgers · sundry debtors group`,
        },
        artifacts: [
          {
            kind: "action-list",
            title: "Parties to chase",
            items: top.map((r) => ({
              label: r.name,
              amount: formatINR(r.amount),
              sublabel: `${r.days} days overdue · ${r.priority}`,
              action: { label: "Remind via WhatsApp", verb: "whatsapp" as const },
            })),
          },
        ],
        traceId: "overdue-receivables",
      },
    };
  }

  /* ── Top customers ── */
  if (q.match(/top customer|biggest customer|who buys|main customer/)) {
    return {
      message: {
        role: "assistant",
        answer: `Your top 5 customers are ${formatINR(
          TOP_CUSTOMERS.reduce((s, c) => s + c.revenue, 0),
        )} of ${formatINR(REVENUE.currentFY)} (${Math.round(
          (TOP_CUSTOMERS.reduce((s, c) => s + c.revenue, 0) / REVENUE.currentFY) * 100,
        )}% of revenue).`,
        artifacts: [
          {
            kind: "table",
            title: "Top 5 customers (FY 2025-26)",
            columns: ["Customer", "Channel", "Revenue", "Orders"],
            rows: TOP_CUSTOMERS.map((c) => [
              c.name,
              c.channel,
              formatINR(c.revenue),
              c.orders.toString(),
            ]),
            footer: `Top 3 = ${Math.round(
              (TOP_CUSTOMERS.slice(0, 3).reduce((s, c) => s + c.revenue, 0) / REVENUE.currentFY) * 100,
            )}% of revenue · concentration risk`,
          },
        ],
        sources: { summary: "Sales vouchers · GROUP BY party · FY 2025-26" },
        traceId: "top-customers",
      },
    };
  }

  /* ── GST status (short inline answer, no canvas) ── */
  if (q.match(/gst|filing due|next filing/)) {
    const matchRate = Math.round(
      ((GST.matched + GST.manualMatched) / GST.totalTallyInvoices) * 100,
    );
    return {
      message: {
        role: "assistant",
        answer: `GSTR-3B for ${GST.period} is ${matchRate}% reconciled. Next filing due ${GST.nextFilingDue}.`,
        calculation: {
          rows: [
            { label: "Matched", value: `${GST.matched} (auto)` },
            { label: "Manual matched", value: `${GST.manualMatched}` },
            { label: "Partial match", value: `${GST.partialMatch}` },
            { label: "Mismatches", value: `${GST.mismatches}` },
            { label: "Missing from 2B", value: `${GST.missingFromPortal}` },
            { label: "ITC at risk", value: formatINR(GST.itcAtRiskValue), emphasis: true },
          ],
        },
        sources: {
          summary: `${GST.totalTallyInvoices} Tally vouchers vs GSTR-2B (cut-off 14 Apr) · INFINI API`,
        },
        action: { label: "Open full 2B reconciliation", verb: "open" },
        artifacts: [
          {
            kind: "stacked-bar",
            title: `March 2026 · ${matchRate}% reconciled`,
            total: `${GST.totalTallyInvoices} invoices`,
            segments: [
              { label: "Matched", value: GST.matched, color: "var(--green)" },
              { label: "Manual", value: GST.manualMatched, color: "#10B981" },
              { label: "Partial", value: GST.partialMatch, color: "var(--orange)" },
              { label: "Mismatches", value: GST.mismatches, color: "var(--yellow)" },
              { label: "Missing", value: GST.missingFromPortal, color: "var(--red)" },
            ],
          },
        ],
      },
    };
  }

  /* ── Dead stock ── */
  if (q.match(/dead stock|stuck|slow mov|not selling|liquidat/)) {
    const total = DEAD_STOCK.reduce((s, d) => s + d.value, 0);
    return {
      message: {
        role: "assistant",
        answer: `${formatINR(total)} is locked in dead stock across ${DEAD_STOCK.length} SKUs.`,
        sources: { summary: "Stock items with zero sales vouchers in the last 90 days" },
        artifacts: [
          {
            kind: "table",
            title: "Dead stock candidates",
            columns: ["SKU", "Name", "Qty", "Value", "Last sold"],
            rows: DEAD_STOCK.map((d) => [
              d.sku,
              d.name,
              d.qty.toString(),
              formatINR(d.value),
              d.lastSold,
            ]),
            footer: `Total tied up: ${formatINR(total)}`,
          },
        ],
      },
    };
  }

  /* ── Top SKUs ── */
  if (q.match(/top sku|top product|best sell|best product/)) {
    return {
      message: {
        role: "assistant",
        answer: `Top 5 SKUs drove ${formatINR(TOP_SKUS.reduce((s, t) => s + t.revenue, 0))} in FY 2025-26.`,
        artifacts: [
          {
            kind: "table",
            title: "Top 5 SKUs by revenue",
            columns: ["SKU", "Name", "Qty", "Revenue", "Margin"],
            rows: TOP_SKUS.map((t) => [
              t.sku,
              t.name,
              t.qty.toLocaleString("en-IN"),
              formatINR(t.revenue),
              `${t.marginPct.toFixed(1)}%`,
            ]),
          },
        ],
        sources: { summary: "Sales line items · GROUP BY stock_item · FY 2025-26" },
      },
    };
  }

  /* ── Revenue / sales summary (short inline — for "chart/graph" we open canvas) ── */
  if (q.match(/revenue|sales|total sale|turnover|yoy/)) {
    return {
      message: {
        role: "assistant",
        answer: `Revenue for FY 2025-26 is ${formatINR(REVENUE.currentFY)}, up ${REVENUE.yoyPct.toFixed(
          1,
        )}% YoY.`,
        calculation: {
          rows: [
            { label: "FY 2025-26", value: formatINR(REVENUE.currentFY), emphasis: true },
            { label: "FY 2024-25", value: formatINR(REVENUE.priorFY) },
            { label: "YoY change", value: `+${REVENUE.yoyPct.toFixed(1)}%` },
          ],
        },
        sources: { summary: "SUM(sales vouchers) · both FYs" },
      },
    };
  }

  /* ── Fallback ── */
  return {
    message: {
      role: "assistant",
      answer: "I don't have that specific query wired up yet in this mock.",
      sources: {
        summary:
          "This demo runs pattern-matched mock responses. A real LLM + Tally tool calls come next.",
      },
      artifacts: [
        {
          kind: "action-list",
          title: "Try one of these",
          items: [
            { label: "Generate the March MIS report", action: { label: "Ask", verb: "open" } },
            { label: "Reconcile my 2B for March", action: { label: "Ask", verb: "open" } },
            { label: "Show me the revenue chart", action: { label: "Ask", verb: "open" } },
            { label: "Create an invoice for Nykaa", action: { label: "Ask", verb: "open" } },
            { label: "What's my cash runway?", action: { label: "Ask", verb: "open" } },
            { label: "Who owes me the most?", action: { label: "Ask", verb: "open" } },
          ],
        },
      ],
    },
  };
}

/* ═══════════════════════════════════════════════════════════
   FILE UPLOAD RESPONDER
   The copilot moment: auto-detect what a dropped file is and
   return the right structured response + canvas artifact.
   ═══════════════════════════════════════════════════════════ */

export function mockFileResponse(
  meta: UploadedFileMeta,
  detection: DetectionResult,
): MockReply {
  switch (detection.kind) {
    case "bank-statement": {
      const art = buildReconReportArtifact();
      art.title = `Bank reconciliation — ${meta.name}`;
      art.period = `Imported from ${meta.name} · ${(meta.size / 1024).toFixed(0)} KB`;
      return {
        message: {
          role: "assistant",
          answer: `Got it — ${detection.summary.toLowerCase()}. Parsed 147 lines, matched 129 to Tally vouchers, 18 need review.`,
          calculation: {
            rows: [
              { label: "Lines parsed", value: "147" },
              { label: "Auto-matched", value: "129", emphasis: true },
              { label: "Needs review", value: "18" },
              { label: "Unidentified credits", value: "3" },
              { label: "Closing balance match", value: "✓ within ₹240" },
            ],
          },
          sources: {
            summary: `OCR + heuristic match against Tally · ${detection.signals.length} detection signals`,
            details: detection.signals.map((s) => ({ label: "Signal", value: s })),
          },
          action: { label: "Review the 18 unmatched", verb: "open" },
          canvasRefs: [refFor(art, "147 lines · 129 auto-matched · 18 to review")],
          traceId: "gst-reconciliation",
        },
        canvasArtifacts: [art],
      };
    }

    case "purchase-invoice": {
      return {
        message: {
          role: "assistant",
          answer: `Invoice read — Goat Brand Labs, ₹3,07,850, 3 line items. Draft Purchase voucher ready for your review.`,
          calculation: {
            rows: [
              { label: "Vendor", value: "Goat Brand Labs Pvt Ltd" },
              { label: "GSTIN", value: "27AAACG1234F1Z5" },
              { label: "Invoice no.", value: "GBL/26/03/0114" },
              { label: "Taxable value", value: formatINR(2_60_890) },
              { label: "CGST 9% + SGST 9%", value: formatINR(46_960) },
              { label: "Total", value: formatINR(3_07_850), emphasis: true },
            ],
          },
          sources: {
            summary: `OCR confidence 94% · ${meta.name}`,
            details: detection.signals.map((s) => ({ label: "Signal", value: s })),
          },
          action: { label: "Post to Tally → goes for approval", verb: "record" },
          artifacts: [
            {
              kind: "table",
              title: "Line items read from invoice",
              columns: ["Description", "Qty", "Rate", "Amount"],
              rows: [
                ["Glass jars — 100GM", "1,200", formatINR(142, { raw: true }), formatINR(1_70_400)],
                ["Shrink wrap rolls", "80", formatINR(620, { raw: true }), formatINR(49_600)],
                ["Cardboard cartons — 5-ply", "520", formatINR(80, { raw: true }), formatINR(41_600)],
              ],
              footer: "Will split against 'Packaging Materials' expense ledger",
            },
          ],
          traceId: "gst-reconciliation",
        },
      };
    }

    case "expense-receipt": {
      return {
        message: {
          role: "assistant",
          answer: `Receipt read — Uber ride, ₹847, 14 Apr 2026. Drafting a Payment voucher against 'Travelling Expenses'.`,
          calculation: {
            rows: [
              { label: "Vendor", value: "Uber India Systems" },
              { label: "Date", value: "14 Apr 2026" },
              { label: "Amount", value: formatINR(847), emphasis: true },
              { label: "Category", value: "Travelling Expenses" },
              { label: "Payment mode", value: "UPI (detected)" },
            ],
          },
          sources: {
            summary: `OCR 91% confidence · ${meta.name}`,
          },
          action: { label: "Post to Tally", verb: "record" },
        },
      };
    }

    case "sales-request": {
      const art = buildInvoiceArtifact();
      art.title = `Draft invoice from ${meta.name}`;
      return {
        message: {
          role: "assistant",
          answer: `PO processed. Drafted Invoice ${art.invoiceNo} for ${formatINR(art.total)} — review + post.`,
          sources: { summary: `Parsed from ${meta.name}` },
          action: { label: "Post to Tally + WhatsApp to buyer", verb: "whatsapp" },
          canvasRefs: [refFor(art, `${art.invoiceNo} · ${formatINR(art.total)}`)],
        },
        canvasArtifacts: [art],
      };
    }

    case "batch-upload": {
      return {
        message: {
          role: "assistant",
          answer: `${meta.name} has 284 rows. Previewing — most look like Purchase vouchers against vendors Tally already knows.`,
          calculation: {
            rows: [
              { label: "Total rows", value: "284" },
              { label: "Recognised vendors", value: "241" },
              { label: "Unknown vendors", value: "23 (will flag)" },
              { label: "Malformed rows", value: "20" },
              { label: "Ready to draft", value: "241", emphasis: true },
            ],
          },
          sources: {
            summary: `Detected as batch from spreadsheet shape · ${meta.name}`,
          },
          action: { label: "Preview the 241 drafts", verb: "open" },
        },
      };
    }

    case "tally-export": {
      return {
        message: {
          role: "assistant",
          answer: `Tally export recognised. If this is a Sales Register I can ingest it — otherwise paste the report name and I'll route it.`,
          sources: { summary: `${meta.name} (${(meta.size / 1024).toFixed(0)} KB)` },
        },
      };
    }

    default: {
      return {
        message: {
          role: "assistant",
          answer: `Got ${meta.name}. Tell me what this is — a bank statement, an invoice, a receipt, or something else?`,
          sources: {
            summary: "Couldn't auto-classify — filename + size didn't match a known pattern",
            details: detection.signals.map((s) => ({ label: "Signal", value: s })),
          },
          artifacts: [
            {
              kind: "action-list",
              title: "Classify this file",
              items: [
                { label: "Bank statement", action: { label: "Yes", verb: "open" } },
                { label: "Purchase invoice", action: { label: "Yes", verb: "open" } },
                { label: "Expense receipt", action: { label: "Yes", verb: "open" } },
                { label: "Sales order / PO", action: { label: "Yes", verb: "open" } },
                { label: "Something else", action: { label: "Describe", verb: "open" } },
              ],
            },
          ],
        },
      };
    }
  }
}
