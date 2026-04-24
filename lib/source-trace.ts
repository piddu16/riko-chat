/* Source voucher trace — the trust primitive.
 *
 * When Riko surfaces a number, we hand back the exact vouchers that produced
 * it. Tapping "View sources" opens a drawer with these rows. Each entry points
 * at a specific Tally voucher (voucher_no + type + date + amount + party).
 *
 * In production this will come from the same Tally query that produced the
 * aggregate — we just stop returning only the SUM and carry forward the rows.
 */

export interface SourceVoucher {
  voucherNo: string;
  voucherType: "Sales" | "Purchase" | "Receipt" | "Payment" | "Journal" | "Credit Note" | "Debit Note" | "Contra";
  date: string;        // human-readable
  party: string;
  amount: number;
  narration?: string;
}

export interface SourceTrace {
  id: string;
  headline: string;    // e.g. "₹12.6L overdue from Nykaa"
  subtitle: string;    // e.g. "From 6 invoices · oldest 62 days · party ledger: Nykaa E-Retail Pvt Ltd"
  query: string;       // The plain-English reconstruction of the query
  pseudoSql?: string;  // The SQL-equivalent for power users
  vouchers: SourceVoucher[];
}

/* ── Sample traces keyed by response type ── */

export const TRACES: Record<string, SourceTrace> = {
  "runway-cash": {
    id: "runway-cash",
    headline: "Cash runway: 9 days",
    subtitle: "Bank balance ₹5.6L ÷ daily burn ₹58,167",
    query: "Latest bank balance from all cash/bank ledgers, divided by average daily Payment + Journal voucher outflow across the last 90 days.",
    pseudoSql: "SELECT closing_balance FROM bank_stmt WHERE date = (SELECT MAX(date) FROM bank_stmt)\n— burn: SUM(amount) / 90 FROM voucher WHERE type IN ('payment','journal') AND date > TODAY - 90",
    vouchers: [
      { voucherNo: "REC/26/0412", voucherType: "Receipt", date: "21 Apr 2026", party: "HDFC ****1234", amount: 559_740, narration: "Closing balance snapshot" },
      { voucherNo: "PAY/26/0389", voucherType: "Payment", date: "20 Apr 2026", party: "Shiprocket Logistics", amount: -32_100, narration: "Monthly logistics" },
      { voucherNo: "PAY/26/0385", voucherType: "Payment", date: "18 Apr 2026", party: "Google India Pvt Ltd", amount: -1_63_988, narration: "Ads — April" },
      { voucherNo: "PAY/26/0378", voucherType: "Payment", date: "15 Apr 2026", party: "Office Rent A/c", amount: -1_25_000, narration: "Apr rent" },
      { voucherNo: "JRL/26/0104", voucherType: "Journal", date: "01 Apr 2026", party: "Salary Payable", amount: -14_10_000, narration: "Apr salaries booked" },
    ],
  },

  "overdue-receivables": {
    id: "overdue-receivables",
    headline: "₹17.4L overdue across 8 parties",
    subtitle: "Debtor ledgers · aged > credit_days on each party",
    query: "Party-ledger balances in the Sundry Debtors group, filtered to invoices where today's date exceeds invoice_date + party.credit_days.",
    pseudoSql: "SELECT party, SUM(amount) FROM voucher\n  WHERE type='sales' AND party.group='Sundry Debtors'\n    AND (TODAY - voucher_date) > party.credit_days\n  GROUP BY party ORDER BY SUM(amount) DESC",
    vouchers: [
      { voucherNo: "INV/25-26/1842", voucherType: "Sales", date: "18 Feb 2026", party: "Nykaa E-Retail Pvt Ltd", amount: 12_61_337, narration: "Feb despatch · 62 days overdue" },
      { voucherNo: "INV/25-26/1751", voucherType: "Sales", date: "10 Feb 2026", party: "Website Debtors", amount: 12_51_122, narration: "41 days overdue" },
      { voucherNo: "INV/25-26/1409", voucherType: "Sales", date: "01 Jan 2026", party: "LLC Olimpiya", amount: 4_49_626, narration: "107 days overdue · overseas" },
      { voucherNo: "INV/25-26/1384", voucherType: "Sales", date: "14 Dec 2025", party: "One97 Communications", amount: 3_55_000, narration: "132 days overdue" },
      { voucherNo: "INV/25-26/1502", voucherType: "Sales", date: "22 Jan 2026", party: "Prodsol Biotech", amount: 2_89_756, narration: "93 days overdue" },
      { voucherNo: "INV/25-26/1355", voucherType: "Sales", date: "14 Dec 2025", party: "Nykaa E-Retail (2)", amount: 3_06_667, narration: "132 days overdue" },
    ],
  },

  "top-customers": {
    id: "top-customers",
    headline: "Top 5 customers — ₹1.22Cr (67% of FY25)",
    subtitle: "Sales vouchers grouped by party · FY 2025-26",
    query: "Sum of Debit amounts on all Sales vouchers in the current financial year, grouped by party ledger, ordered descending, top 10.",
    pseudoSql: "SELECT party, SUM(debit_amount), COUNT(*) FROM voucher\n  WHERE type='sales' AND voucher_date BETWEEN '2025-04-01' AND '2026-03-31'\n  GROUP BY party ORDER BY 2 DESC LIMIT 10",
    vouchers: [
      { voucherNo: "—", voucherType: "Sales", date: "Aggregate", party: "Nykaa E-Retail Pvt Ltd", amount: 32_40_000, narration: "142 invoices · FY25" },
      { voucherNo: "—", voucherType: "Sales", date: "Aggregate", party: "Website D2C", amount: 32_20_000, narration: "821 invoices · FY25" },
      { voucherNo: "—", voucherType: "Sales", date: "Aggregate", party: "Amazon Seller Central", amount: 28_50_000, narration: "298 invoices · FY25" },
      { voucherNo: "—", voucherType: "Sales", date: "Aggregate", party: "Flipkart Marketplace", amount: 19_80_000, narration: "187 invoices · FY25" },
      { voucherNo: "—", voucherType: "Sales", date: "Aggregate", party: "Paytm Mall (One97)", amount: 8_90_000, narration: "62 invoices · FY25" },
    ],
  },

  "gst-reconciliation": {
    id: "gst-reconciliation",
    headline: "GSTR-2B recon — 82% matched",
    subtitle: "150 Tally purchase vouchers vs GSTR-2B (cut-off 14 Apr)",
    query: "Purchase vouchers for March 2026 matched against GSTR-2B lines fetched from INFINI. Match key: supplier GSTIN + invoice number + taxable value.",
    pseudoSql: "SELECT v.invoice_no, v.amount, g.amount\n  FROM voucher v FULL OUTER JOIN gstr_2b_line g\n  ON v.gstin=g.gstin AND v.invoice_no=g.invoice_no\n  WHERE v.period='2026-03' OR g.period='2026-03'",
    vouchers: [
      { voucherNo: "PUR/26/0412", voucherType: "Purchase", date: "02 Mar 2026", party: "Amazon Services LLC", amount: 2_85_000, narration: "Matched ✓" },
      { voucherNo: "PUR/26/0418", voucherType: "Purchase", date: "05 Mar 2026", party: "Google India Pvt Ltd", amount: 1_63_988, narration: "Matched ✓" },
      { voucherNo: "PUR/26/0441", voucherType: "Purchase", date: "11 Mar 2026", party: "Goat Brand Labs Pvt Ltd", amount: 3_07_850, narration: "Not in 2B — supplier hasn't filed" },
      { voucherNo: "PUR/26/0467", voucherType: "Purchase", date: "17 Mar 2026", party: "Radcom Packaging", amount: 85_357, narration: "Mismatch · 2B shows ₹83,500" },
      { voucherNo: "(N/A)", voucherType: "Purchase", date: "22 Mar 2026", party: "Freshworks Inc.", amount: 48_200, narration: "In 2B but not in Tally — record?" },
    ],
  },

  "top-skus": {
    id: "top-skus",
    headline: "Top 5 SKUs — ₹7.13Cr FY25",
    subtitle: "Sales line items grouped by stock_item",
    query: "Sum of line-item amounts on all Sales vouchers in FY25, grouped by stock item.",
    pseudoSql: "SELECT stock_item, SUM(line.amount), SUM(line.qty) FROM voucher v JOIN voucher_line line ON line.voucher_id=v.id WHERE v.type='sales' AND v.voucher_date BETWEEN '2025-04-01' AND '2026-03-31' GROUP BY stock_item",
    vouchers: [
      { voucherNo: "—", voucherType: "Sales", date: "Aggregate", party: "SKU-001 · 100 Gm Riko Jar", amount: 1_86_80_000, narration: "14,820 units · margin 41.1%" },
      { voucherNo: "—", voucherType: "Sales", date: "Aggregate", party: "SKU-006 · 150 Gm Riko Jar New Tube", amount: 1_56_40_000, narration: "9,140 units · margin 43.1%" },
      { voucherNo: "—", voucherType: "Sales", date: "Aggregate", party: "SKU-007 · Niacinamide Serum 30ml", amount: 1_43_60_000, narration: "7,180 units · margin 44.0%" },
      { voucherNo: "—", voucherType: "Sales", date: "Aggregate", party: "SKU-010 · Sunscreen SPF50 60ml", amount: 1_26_30_000, narration: "8,420 units · margin 48.0%" },
      { voucherNo: "—", voucherType: "Sales", date: "Aggregate", party: "SKU-008 · Vitamin C Face Wash 100ml", amount: 98_40_000, narration: "9,840 units · margin 46.0%" },
    ],
  },

  "dead-stock": {
    id: "dead-stock",
    headline: "₹17L locked in dead stock — 12 SKUs",
    subtitle: "Stock items with no sales vouchers in 90+ days · closing_qty > 0",
    query: "Stock items whose latest sales voucher line is more than 90 days old and whose closing quantity is positive.",
    pseudoSql: "SELECT si.sku, si.closing_qty, si.closing_value, MAX(v.voucher_date) AS last_sold\n  FROM stock_item si LEFT JOIN voucher_line vl ON vl.stock_item_id=si.id\n    LEFT JOIN voucher v ON vl.voucher_id=v.id AND v.type='sales'\n  WHERE si.closing_qty > 0\n  GROUP BY si.sku HAVING MAX(v.voucher_date) < TODAY - 90",
    vouchers: [
      { voucherNo: "STK/26/009", voucherType: "Journal", date: "Stock snapshot", party: "SKU-010 · 100 GM CHINA SURAH K TOAN (old)", amount: 11_30_000, narration: "452 units · last sold 2 years ago" },
      { voucherNo: "STK/26/004", voucherType: "Journal", date: "Stock snapshot", party: "SKU-004 · 100 GM BROWN GLASS JAR", amount: 3_72_000, narration: "186 units · last sold 6 months ago" },
      { voucherNo: "STK/26/028", voucherType: "Journal", date: "Stock snapshot", party: "SKU-028 · Herbal Toner 100ml", amount: 1_95_000, narration: "156 units · last sold 5 months ago" },
    ],
  },
};

export function getTrace(id: string): SourceTrace | null {
  return TRACES[id] ?? null;
}
