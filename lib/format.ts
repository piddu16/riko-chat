/* Indian currency formatters — lakhs / crores per Indian convention. */

export function fL(v: number): string {
  return (Math.abs(v) / 1e5).toFixed(1);
}

export function fCr(v: number): string {
  return (Math.abs(v) / 1e7).toFixed(2);
}

/** Smart INR formatter — picks L / Cr automatically. Returns "—" for null. */
export function formatINR(
  v: number | null | undefined,
  opts?: { raw?: boolean }
): string {
  if (v === null || v === undefined) return "—";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (opts?.raw) return `${sign}₹${abs.toLocaleString("en-IN")}`;
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(1)}L`;
  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}

/** "14 min ago" / "3 hours ago" / "2 days ago" */
export function relativeTime(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  const diffMs = Date.now() - d.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.round(hr / 24);
  return `${day} day${day === 1 ? "" : "s"} ago`;
}
