"use client";

import { Download, MessageSquare, Printer } from "lucide-react";
import { formatINR } from "@/lib/format";
import type { InvoiceArtifact } from "@/lib/types";

export function InvoiceRenderer({ artifact: inv }: { artifact: InvoiceArtifact }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Action bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[11px]" style={{ color: "var(--text-4)" }}>
          Draft invoice · not yet posted to Tally
        </span>
        <div className="flex items-center gap-2">
          <IconBtn icon={Printer} label="Print" />
          <IconBtn icon={Download} label="PDF" />
          <IconBtn icon={MessageSquare} label="WhatsApp" primary />
        </div>
      </div>

      {/* Invoice paper */}
      <div
        className="rounded-xl p-6 md:p-10"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap pb-5" style={{ borderBottom: "2px solid var(--border)" }}>
          <div>
            <p
              className="text-[10px] uppercase tracking-wider font-semibold mb-1"
              style={{ color: "var(--green)" }}
            >
              Tax Invoice
            </p>
            <h2
              className="text-lg font-bold leading-tight mb-2"
              style={{
                color: "var(--text-1)",
                fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
              }}
            >
              {inv.sellerName}
            </h2>
            <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{inv.sellerAddress}</p>
            <p className="text-[11px] font-mono mt-1" style={{ color: "var(--text-4)" }}>
              GSTIN: {inv.sellerGstin}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--text-4)" }}>
              Invoice #
            </p>
            <p className="text-lg font-bold font-mono" style={{ color: "var(--text-1)" }}>
              {inv.invoiceNo}
            </p>
            <p className="text-[11px] mt-2" style={{ color: "var(--text-3)" }}>
              Date: <span style={{ color: "var(--text-1)" }}>{inv.date}</span>
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
              Due: <span style={{ color: "var(--text-1)" }}>{inv.dueDate}</span>
            </p>
          </div>
        </div>

        {/* Bill to */}
        <div className="pt-5 pb-4">
          <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--text-4)" }}>
            Bill To
          </p>
          <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>{inv.buyerName}</p>
          <p className="text-[11px] mt-1" style={{ color: "var(--text-3)" }}>{inv.buyerAddress}</p>
          {inv.buyerGstin && (
            <p className="text-[11px] font-mono mt-1" style={{ color: "var(--text-4)" }}>
              GSTIN: {inv.buyerGstin}
            </p>
          )}
        </div>

        {/* Line items */}
        <div className="overflow-x-auto my-4">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "var(--bg-secondary)" }}>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>Description</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>HSN</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>Qty</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>Rate</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>GST</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.lineItems.map((item, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-3 py-3 text-sm font-medium" style={{ color: "var(--text-1)" }}>{item.description}</td>
                  <td className="px-3 py-3 text-[11px] font-mono" style={{ color: "var(--text-4)" }}>{item.hsn}</td>
                  <td className="px-3 py-3 text-right tabular-nums" style={{ color: "var(--text-2)" }}>{item.qty}</td>
                  <td className="px-3 py-3 text-right tabular-nums" style={{ color: "var(--text-2)", fontFamily: "var(--font-display), 'Space Grotesk', sans-serif" }}>
                    {formatINR(item.rate, { raw: true })}
                  </td>
                  <td className="px-3 py-3 text-right text-[11px]" style={{ color: "var(--text-3)" }}>{item.taxRate}%</td>
                  <td className="px-3 py-3 text-right tabular-nums font-bold" style={{ color: "var(--text-1)", fontFamily: "var(--font-display), 'Space Grotesk', sans-serif" }}>
                    {formatINR(item.amount, { raw: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-1.5 py-3">
            <TotalRow label="Subtotal" value={formatINR(inv.subtotal, { raw: true })} />
            {inv.cgst > 0 && <TotalRow label="CGST 9%" value={formatINR(inv.cgst, { raw: true })} />}
            {inv.sgst > 0 && <TotalRow label="SGST 9%" value={formatINR(inv.sgst, { raw: true })} />}
            {inv.igst > 0 && <TotalRow label="IGST 18%" value={formatINR(inv.igst, { raw: true })} />}
            <div className="pt-2 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
              <TotalRow label="Total" value={formatINR(inv.total, { raw: true })} emphasis />
            </div>
          </div>
        </div>

        <p className="text-[11px] pt-4 mt-2" style={{ color: "var(--text-3)", borderTop: "1px solid var(--border)" }}>
          <span className="font-semibold" style={{ color: "var(--text-2)" }}>Amount in words: </span>
          {inv.amountInWords}
        </p>

        {inv.notes && (
          <p className="text-[11px] mt-3" style={{ color: "var(--text-4)" }}>
            <span className="font-semibold">Notes: </span>{inv.notes}
          </p>
        )}
      </div>
    </div>
  );
}

function TotalRow({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span
        className={`${emphasis ? "text-sm font-bold" : "text-xs"}`}
        style={{ color: emphasis ? "var(--text-1)" : "var(--text-3)" }}
      >
        {label}
      </span>
      <span
        className={`tabular-nums ${emphasis ? "text-lg font-bold" : "text-xs font-semibold"}`}
        style={{
          color: emphasis ? "var(--green)" : "var(--text-1)",
          fontFamily: "var(--font-display), 'Space Grotesk', sans-serif",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function IconBtn({ icon: Icon, label, primary }: { icon: React.ComponentType<{ size?: number }>; label: string; primary?: boolean }) {
  return (
    <button
      className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
      style={{
        background: primary ? "var(--green)" : "var(--bg-secondary)",
        color: primary ? "white" : "var(--text-2)",
        border: primary ? "none" : "1px solid var(--border)",
      }}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}
