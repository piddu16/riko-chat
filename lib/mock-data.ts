/* Mock data ported (narrow subset) from the riko-ux-prototype.
 * Enough to power the chat mock responder for v0. */

import type {
  RevenueChartArtifact,
  MisReportArtifact,
  ReconReportArtifact,
  InvoiceArtifact,
} from "./types";
import { formatINR } from "./format";

export const COMPANY = {
  name: "Bandra Soap Pvt Ltd",
  fy: "FY 2025-26",
  gstin: "27AABCB1234F1Z5",
  state: "Maharashtra",
  tallySyncedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(), // 14 min ago
} as const;

export const CASH = {
  cash: 559_740,
  debtors: 867_461,
  monthlyBurn: 1_745_000,
  runwayDays: 9,
};

export const REVENUE = {
  currentFY: 92_523_800,
  priorFY: 82_460_000,
  yoyPct: 12.2,
};

export const RECEIVABLES = [
  { name: "Nykaa E-Retail Pvt Ltd", amount: 1_261_337, days: 62, priority: "P1" },
  { name: "Website Debtors", amount: 1_251_122, days: 41, priority: "P1" },
  { name: "LLC Olimpiya", amount: 449_626, days: 107, priority: "P2" },
  { name: "One97 Communications (Paytm)", amount: 355_000, days: 132, priority: "P1" },
  { name: "Prodsol Biotech Pvt Ltd", amount: 289_756, days: 93, priority: "P3" },
  { name: "Nykaa E-Retail (2)", amount: 306_667, days: 132, priority: "P2" },
  { name: "Scale Global Debtors", amount: 270_334, days: 78, priority: "P3" },
  { name: "Buy More (Counfreedise)", amount: 257_865, days: 54, priority: "P3" },
];

export const TOP_CUSTOMERS = [
  { name: "Nykaa E-Retail Pvt Ltd", channel: "Marketplace", revenue: 3_240_000, orders: 142 },
  { name: "Website D2C (rikoskin.com)", channel: "D2C", revenue: 3_220_000, orders: 821 },
  { name: "Amazon Seller Central", channel: "Marketplace", revenue: 2_850_000, orders: 298 },
  { name: "Flipkart Marketplace", channel: "Marketplace", revenue: 1_980_000, orders: 187 },
  { name: "Paytm Mall (One97)", channel: "Marketplace", revenue: 890_000, orders: 62 },
];

export const TOP_SKUS = [
  { sku: "SKU-001", name: "100 Gm Riko Jar", qty: 14_820, revenue: 18_680_000, marginPct: 41.1 },
  { sku: "SKU-006", name: "150 Gm Riko Jar New Tube", qty: 9_140, revenue: 15_640_000, marginPct: 43.1 },
  { sku: "SKU-007", name: "Niacinamide Serum 30ml", qty: 7_180, revenue: 14_360_000, marginPct: 44.0 },
  { sku: "SKU-010", name: "Sunscreen SPF50 60ml", qty: 8_420, revenue: 12_630_000, marginPct: 48.0 },
  { sku: "SKU-008", name: "Vitamin C Face Wash 100ml", qty: 9_840, revenue: 9_840_000, marginPct: 46.0 },
];

export const DEAD_STOCK = [
  { sku: "SKU-010 (old)", name: "100 GM CHINA SURAH K TOAN (old)", qty: 452, value: 1_130_000, lastSold: "2 years ago" },
  { sku: "SKU-004", name: "100 GM BROWN GLASS JAR", qty: 186, value: 372_000, lastSold: "6 months ago" },
  { sku: "SKU-028", name: "Herbal Toner 100ml", qty: 156, value: 195_000, lastSold: "5 months ago" },
];

export const GST = {
  period: "March 2026",
  matched: 118,
  manualMatched: 6,
  partialMatch: 4,
  mismatches: 12,
  missingFromPortal: 8,
  missingFromTally: 2,
  totalTallyInvoices: 150,
  itcAtRiskValue: 420_000,
  nextFilingDue: "20 Apr 2026 (GSTR-3B)",
  complianceRating: "A" as "A" | "B" | "C" | "D",
};

/* ────────────────────────────────────────────────────────────
   CANVAS ARTIFACT FIXTURES
   (rich outputs that open in the right-side canvas / mobile view)
   ──────────────────────────────────────────────────────────── */

/* 12 months of monthly revenue + prior-year comparison */
const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const FY25_MS = [16_771_320, 12_994_570, 11_074_950, 7_844_520, 5_521_020, 4_275_480, 4_108_920, 4_562_910, 4_660_200, 11_758_990, 4_167_260, 3_609_300];
const FY24_MS = [14_200_000, 15_800_000, 13_200_000, 11_900_000, 16_800_000, 18_800_000, 21_200_000, 19_400_000, 16_200_000, 14_900_000, 16_400_000, 17_200_027];

export function buildRevenueChartArtifact(): RevenueChartArtifact {
  return {
    id: `chart-revenue-${Date.now()}`,
    kind: "revenue-chart",
    title: "Monthly Revenue — FY25 vs FY24",
    subtitle: "SUM(sales vouchers) by month",
    fy25: FY25_MS,
    fy24: FY24_MS,
    months: MONTHS,
    currentFYLabel: "FY25",
    priorFYLabel: "FY24",
  };
}

export function buildMisReportArtifact(): MisReportArtifact {
  return {
    id: `mis-${Date.now()}`,
    kind: "mis-report",
    title: "MIS Report — March 2026",
    company: COMPANY.name,
    gstin: COMPANY.gstin,
    period: "01 Mar 2026 – 31 Mar 2026",
    preparedBy: "Riko · auto-generated from Tally + INFINI",
    sections: [
      {
        heading: "Headline KPIs",
        kind: "kpi-grid",
        kpis: [
          { label: "Revenue", value: "₹36.1L", delta: "▲ 12% MoM", tone: "green" },
          { label: "Gross Profit", value: "₹28.2L", delta: "GP 78%", tone: "green" },
          { label: "EBITDA", value: "–₹4.3L", delta: "▼ vs Feb", tone: "red" },
          { label: "Cash on hand", value: "₹5.6L", delta: "runway 9 days", tone: "red" },
          { label: "Receivables", value: "₹86.7L", delta: "DSO 52 days", tone: "yellow" },
          { label: "Payables", value: "₹34.3L", delta: "DPO 47 days", tone: "neutral" },
        ],
      },
      {
        heading: "Profit & Loss",
        kind: "pl-table",
        rows: [
          { label: "Revenue from operations", current: "₹36.1L", prior: "₹32.2L", variance: "+12%" },
          { label: "Cost of goods sold", current: "(₹7.9L)", prior: "(₹7.1L)", variance: "+11%", indent: 1 },
          { label: "Gross Profit", current: "₹28.2L", prior: "₹25.1L", variance: "+12%", emphasis: true },
          { label: "Employee costs", current: "(₹14.1L)", prior: "(₹13.8L)", variance: "+2%", indent: 1 },
          { label: "Marketing & CAC", current: "(₹11.9L)", prior: "(₹8.6L)", variance: "+38%", indent: 1 },
          { label: "Overheads", current: "(₹6.5L)", prior: "(₹6.0L)", variance: "+8%", indent: 1 },
          { label: "EBITDA", current: "(₹4.3L)", prior: "(₹3.3L)", variance: "–", emphasis: true },
          { label: "Depreciation", current: "(₹1.1L)", prior: "(₹1.1L)", variance: "0%", indent: 1 },
          { label: "Interest", current: "(₹0.3L)", prior: "(₹0.3L)", variance: "0%", indent: 1 },
          { label: "Profit before tax", current: "(₹5.7L)", prior: "(₹4.7L)", variance: "–", emphasis: true },
        ],
      },
      {
        heading: "Receivables Aging",
        kind: "aging-bars",
        segments: [
          { label: "0–30 days", value: 42, color: "var(--green)", amount: "₹36.4L" },
          { label: "31–60 days", value: 24, color: "var(--blue)", amount: "₹20.8L" },
          { label: "61–90 days", value: 16, color: "var(--yellow)", amount: "₹13.9L" },
          { label: "90+ days", value: 18, color: "var(--red)", amount: "₹15.6L" },
        ],
      },
      {
        heading: "Commentary",
        kind: "commentary",
        paragraphs: [
          "March revenue of ₹36.1L represents 12% MoM growth, led by a 31% uptick on Nykaa (₹12.4L) and a modest 4% increase in Website D2C (₹11.2L).",
          "EBITDA remained negative at –₹4.3L, widening from –₹3.3L in February. The primary driver is a 38% increase in marketing spend (₹11.9L vs ₹8.6L) during the Holi campaign. CAC on Nykaa stayed within acceptable bounds; Amazon CAC deteriorated further.",
          "Cash position is critical at ₹5.6L (9 days runway at current burn). Top collection priority is Nykaa's ₹12.6L overdue for 62 days — recovery of this single invoice extends runway to ~68 days.",
          "GSTR-3B for March is due on 20 April. 2B reconciliation is 82% complete; 8 suppliers have not yet filed their GSTR-1 (ITC at risk: ₹4.2L).",
        ],
      },
    ],
  };
}

export function buildReconReportArtifact(): ReconReportArtifact {
  return {
    id: `recon-${Date.now()}`,
    kind: "recon-report",
    title: "GSTR-2B Reconciliation — March 2026",
    period: "March 2026 · 2B cut-off 14 Apr 2026",
    summary: {
      matched: GST.matched,
      manualMatched: GST.manualMatched,
      partialMatch: GST.partialMatch,
      mismatches: GST.mismatches,
      missingFromPortal: GST.missingFromPortal,
      missingFromTally: GST.missingFromTally,
      total: GST.totalTallyInvoices,
      itcAtRisk: formatINR(GST.itcAtRiskValue),
    },
    lines: [
      { id: "r1", supplier: "Amazon Services LLC", invoiceNo: "AMZ/25-26/00342", date: "02 Mar 2026", status: "matched", tallyAmount: 285_000, portalAmount: 285_000 },
      { id: "r2", supplier: "Google India Pvt Ltd", invoiceNo: "GIL/2026/0012", date: "05 Mar 2026", status: "matched", tallyAmount: 163_988, portalAmount: 163_988 },
      { id: "r3", supplier: "Shiprocket Logistics", invoiceNo: "SRL-88421", date: "08 Mar 2026", status: "partial_match", tallyAmount: 32_100, portalAmount: 31_950, issue: "Rate difference ₹150" },
      { id: "r4", supplier: "Goat Brand Labs", invoiceNo: "GBL/26/03/0114", date: "11 Mar 2026", status: "missing_portal", tallyAmount: 307_850, portalAmount: null, issue: "Supplier hasn't filed GSTR-1" },
      { id: "r5", supplier: "V-Trans India Ltd", invoiceNo: "VTI/MAR/9921", date: "14 Mar 2026", status: "manual_matched", tallyAmount: 10_323, portalAmount: 10_323 },
      { id: "r6", supplier: "Radcom Packaging", invoiceNo: "RP/2603/004", date: "17 Mar 2026", status: "mismatch", tallyAmount: 85_357, portalAmount: 83_500, issue: "Amount mismatch ₹1,857" },
      { id: "r7", supplier: "Universal Waste Mgmt", invoiceNo: "UWM-2026-03", date: "20 Mar 2026", status: "missing_portal", tallyAmount: 5_000, portalAmount: null },
      { id: "r8", supplier: "Freshworks Inc.", invoiceNo: "FW-INV-99412", date: "22 Mar 2026", status: "missing_tally", tallyAmount: null, portalAmount: 48_200, issue: "On 2B but not in Tally — record?" },
      { id: "r9", supplier: "Razorpay Software", invoiceNo: "RZP/03/2026/8821", date: "25 Mar 2026", status: "partial_match", tallyAmount: 24_800, portalAmount: 24_500, issue: "Rate variance" },
      { id: "r10", supplier: "Pop Club Vision Tech", invoiceNo: "PCV-2026-22", date: "27 Mar 2026", status: "matched", tallyAmount: 1_370, portalAmount: 1_370 },
      { id: "r11", supplier: "Tata Communications", invoiceNo: "TCL/26/03/4412", date: "28 Mar 2026", status: "matched", tallyAmount: 18_900, portalAmount: 18_900 },
      { id: "r12", supplier: "Godrej Properties", invoiceNo: "GPL-2026-INT", date: "30 Mar 2026", status: "mismatch", tallyAmount: 95_000, portalAmount: 102_000, issue: "Amount mismatch ₹7,000" },
    ],
  };
}

export function buildInvoiceArtifact(overrides?: Partial<InvoiceArtifact>): InvoiceArtifact {
  return {
    id: `inv-${Date.now()}`,
    kind: "invoice",
    title: "Invoice preview · INV/25-26/2041",
    invoiceNo: "INV/25-26/2041",
    date: "23 Apr 2026",
    dueDate: "23 May 2026",
    sellerName: COMPANY.name,
    sellerGstin: COMPANY.gstin,
    sellerAddress: "A-204, Bandra Industrial Estate, Bandra West, Mumbai — 400050",
    buyerName: "Nykaa E-Retail Pvt Ltd",
    buyerGstin: "27AAFCN1234P1ZV",
    buyerAddress: "104, Vibgyor Towers, BKC, Mumbai — 400051",
    lineItems: [
      { description: "100 Gm Riko Jar",                 hsn: "33079090", qty: 120, rate: 1_260, amount: 151_200, taxRate: 18 },
      { description: "Niacinamide Serum 30ml",          hsn: "33049990", qty:  80, rate: 2_000, amount: 160_000, taxRate: 18 },
      { description: "Vitamin C Face Wash 100ml",       hsn: "34022090", qty: 150, rate: 1_000, amount: 150_000, taxRate: 18 },
    ],
    subtotal: 461_200,
    cgst: 41_508,
    sgst: 41_508,
    igst: 0,
    total: 544_216,
    amountInWords: "Indian Rupees Five Lakh Forty-Four Thousand Two Hundred Sixteen Only",
    notes: "Terms: Payment within 30 days. 2% late fee after due date.",
    ...overrides,
  };
}

export const MOMENT_CARDS = [
  {
    id: "runway",
    icon: "alert-triangle" as const,
    tone: "red" as const,
    headline: "Cash runway: 9 days",
    sublabel: "₹5.6L cash · ₹17.5L monthly burn",
    seedQuery: "What's my cash runway? Break down the math.",
  },
  {
    id: "overdue-ar",
    icon: "receipt-text" as const,
    tone: "orange" as const,
    headline: "₹17.4L overdue receivables",
    sublabel: "across 8 parties · top: Nykaa ₹12.6L",
    seedQuery: "Show me my overdue receivables, top parties first.",
  },
  {
    id: "gst-due",
    icon: "calendar-clock" as const,
    tone: "yellow" as const,
    headline: "GSTR-3B due in 5 days",
    sublabel: "2B reconciliation 76% complete",
    seedQuery: "Where are we on GSTR-3B for March?",
  },
  {
    id: "dead-stock",
    icon: "package" as const,
    tone: "neutral" as const,
    headline: "₹17.0L locked in dead stock",
    sublabel: "12 SKUs with no sales in 90+ days",
    seedQuery: "What dead stock should I liquidate?",
  },
];
