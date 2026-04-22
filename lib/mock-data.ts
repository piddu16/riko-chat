/* Mock data ported (narrow subset) from the riko-ux-prototype.
 * Enough to power the chat mock responder for v0. */

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
