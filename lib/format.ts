export function aed(value: number | string | null | undefined): string {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  if (!isFinite(n) || n <= 0) return "—";
  return "AED " + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
