import type { AssistantMessage } from "./types";
import {
  CASH,
  REVENUE,
  RECEIVABLES,
  TOP_CUSTOMERS,
  TOP_SKUS,
  DEAD_STOCK,
  GST,
} from "./mock-data";
import { formatINR } from "./format";

/** Returns a mock AssistantMessage based on keyword-matching the user's query.
 *  This is the stub that a real LLM + tool-calling will replace. */
export function mockResponse(query: string): Omit<AssistantMessage, "id" | "createdAt"> {
  const q = query.toLowerCase();

  /* ── Cash runway ── */
  if (q.match(/runway|cash position|how much cash|kitna cash/)) {
    return {
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
    };
  }

  /* ── Overdue receivables ── */
  if (q.match(/overdue|receivable|who owes|paise|owed to us|collect/)) {
    const top = RECEIVABLES.slice(0, 6);
    const total = RECEIVABLES.reduce((s, r) => s + r.amount, 0);
    return {
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
    };
  }

  /* ── Top customers ── */
  if (q.match(/top customer|biggest customer|who buys|main customer/)) {
    return {
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
      sources: {
        summary: "Sales vouchers · GROUP BY party · FY 2025-26",
      },
    };
  }

  /* ── GST status ── */
  if (q.match(/gst|gstr|2b|recon|filing/)) {
    const matchRate = Math.round(
      ((GST.matched + GST.manualMatched) / GST.totalTallyInvoices) * 100,
    );
    return {
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
        summary: `From ${GST.totalTallyInvoices} Tally vouchers vs GSTR-2B (cut-off 14 Apr) · INFINI API`,
      },
      action: { label: "Remind 8 suppliers missing from 2B", verb: "whatsapp" },
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
    };
  }

  /* ── Dead stock ── */
  if (q.match(/dead stock|stuck|slow mov|not selling|liquidat/)) {
    const total = DEAD_STOCK.reduce((s, d) => s + d.value, 0);
    return {
      role: "assistant",
      answer: `${formatINR(total)} is locked in dead stock across ${DEAD_STOCK.length} SKUs.`,
      sources: {
        summary: "Stock items with zero sales vouchers in the last 90 days",
      },
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
    };
  }

  /* ── Top SKUs ── */
  if (q.match(/top sku|top product|best sell|best product/)) {
    return {
      role: "assistant",
      answer: `Top 5 SKUs drove ${formatINR(
        TOP_SKUS.reduce((s, t) => s + t.revenue, 0),
      )} in FY 2025-26.`,
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
      sources: {
        summary: "Sales line items · GROUP BY stock_item · FY 2025-26",
      },
    };
  }

  /* ── Revenue / sales summary ── */
  if (q.match(/revenue|sales|total sale|turnover|yoy/)) {
    return {
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
      sources: {
        summary: `SUM(sales vouchers) · both FYs`,
      },
    };
  }

  /* ── Fallback ── */
  return {
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
          { label: "What's my cash runway?", action: { label: "Ask", verb: "open" } },
          { label: "Who owes me the most?", action: { label: "Ask", verb: "open" } },
          { label: "GSTR-3B status for March", action: { label: "Ask", verb: "open" } },
          { label: "Top 5 customers this FY", action: { label: "Ask", verb: "open" } },
          { label: "What dead stock should I liquidate?", action: { label: "Ask", verb: "open" } },
        ],
      },
    ],
  };
}
