"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Reveal } from "@/components/reveal";

type Order = Record<string, any>;
type Item = Record<string, any>;

const STATUS_TABS = ["all", "pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

function statusColor(s: string) {
  switch (s) {
    case "pending": return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "confirmed": return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    case "preparing": return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200";
    case "ready": return "bg-purple-50 text-purple-700 ring-1 ring-purple-200";
    case "delivered": case "completed": return "bg-green-50 text-green-700 ring-1 ring-green-200";
    case "cancelled": case "refunded": return "bg-red-50 text-red-700 ring-1 ring-red-200";
    default: return "bg-[color:var(--paper-2)] text-[color:var(--brand-muted)] ring-1 ring-[color:var(--brand-border)]";
  }
}
const pretty = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function VendorOrdersManager({
  vendorId,
  initialOrders,
}: {
  vendorId: string;
  initialOrders: Order[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [orders, setOrders] = useState(initialOrders);
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [busy, setBusy] = useState(false);

  const filtered = tab === "all" ? orders : orders.filter((o) => o.status === tab);
  const counts = STATUS_TABS.reduce<Record<string, number>>((acc, t) => {
    acc[t] = t === "all" ? orders.length : orders.filter((o) => o.status === t).length;
    return acc;
  }, {});

  async function openOrder(o: Order) {
    setSelected(o);
    setLoadingItems(true);
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", o.id)
      .order("created_at");
    setItems(data ?? []);
    setLoadingItems(false);
  }

  function nextAction(status: string): { label: string; next: string } | null {
    if (status === "pending") return { label: "Accept Order", next: "confirmed" };
    if (status === "confirmed") return { label: "Start Preparing", next: "preparing" };
    if (status === "preparing") return { label: "Mark Ready", next: "ready" };
    return null;
  }

  async function advance(next: string) {
    if (!selected) return;
    setBusy(true);
    const now = new Date().toISOString();
    const upd: Order = { status: next, updated_at: now };
    if (next === "confirmed") upd.confirmed_at = now;
    try {
      const { error } = await supabase.rpc("vendor_advance_order", { p_order_id: selected.id, p_next_status: (upd as any).status });
      if (error) throw error;
      const updated = { ...selected, ...upd };
      setSelected(updated);
      setOrders((prev) => prev.map((o) => o.id === selected.id ? updated : o));
      toast.success(`Order ${pretty(next)}`);
    } catch (e: any) {
      toast.error(e.message ?? "Could not update");
    } finally {
      setBusy(false);
    }
  }

  async function cancelOrder() {
    if (!selected) return;
    if (!confirm("Cancel this order?")) return;
    setBusy(true);
    const now = new Date().toISOString();
    try {
      const { error } = await supabase.rpc("vendor_advance_order", { p_order_id: selected.id, p_next_status: "cancelled" });
      if (error) throw error;
      const updated = { ...selected, status: "cancelled", cancelled_at: now };
      setSelected(updated);
      setOrders((prev) => prev.map((o) => o.id === selected.id ? updated : o));
      toast.success("Order cancelled");
    } catch (e: any) {
      toast.error(e.message ?? "Could not cancel");
    } finally {
      setBusy(false);
    }
  }

  const canCancel = (s: string) => ["pending", "confirmed", "preparing"].includes(s);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3.5">
        <span className="accent-bar h-9 w-1.5 rounded-full" />
        <div>
          <p className="eyebrow">UAQ Deals</p>
          <h1 className="font-display mt-0.5 text-[24px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[28px]">Orders</h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition " +
              (tab === t ? "bg-brand-gradient text-white shadow-[var(--shadow-card)]" : "border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-muted)] hover:border-[color:var(--brand-gold)] hover:text-[color:var(--ink)]")
            }
          >
            {pretty(t)} ({counts[t]})
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="premium-card p-14 text-center">
            <p className="text-sm text-[color:var(--brand-muted)]">No orders in this category.</p>
          </div>
        ) : filtered.map((o, i) => (
          <Reveal key={o.id} delay={Math.min(i, 8) * 40}>
          <button
            onClick={() => openOrder(o)}
            className="premium-card flex w-full items-center gap-3 p-4 text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[color:var(--ink)]">#{o.order_number ?? o.id.slice(0, 8)}</p>
              <p className="text-xs text-[color:var(--brand-muted)]">
                {o.created_at ? new Date(o.created_at).toLocaleDateString("en-AE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                {o.delivery_address ? ` · ${String(o.delivery_address).slice(0, 30)}` : ""}
              </p>
            </div>
            <span className="text-sm font-bold text-[color:var(--brand-maroon)]">AED {Number(o.total).toFixed(2)}</span>
            <span className={"rounded-full px-2.5 py-1 text-[10px] font-bold " + statusColor(o.status)}>{pretty(o.status)}</span>
          </button>
          </Reveal>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="premium-card relative my-8 w-full max-w-lg p-6 shadow-[var(--shadow-premium)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-[color:var(--ink)]">#{selected.order_number ?? selected.id.slice(0, 8)}</h2>
              <span className={"rounded-full px-2.5 py-1 text-xs font-bold " + statusColor(selected.status)}>{pretty(selected.status)}</span>
            </div>

            <div className="mt-5">
              <p className="eyebrow">Items</p>
              {loadingItems ? (
                <p className="py-4 text-center text-sm text-[color:var(--brand-muted)]">Loading…</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between rounded-xl border border-[color:var(--brand-border)] px-3 py-2.5 text-sm">
                      <span className="text-[color:var(--ink)]">{it.name} × {it.quantity}</span>
                      <span className="font-semibold text-[color:var(--ink)]">AED {Number(it.total_price ?? it.unit_price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-1.5 rounded-2xl bg-[color:var(--paper-2)] p-4 text-sm">
              <div className="flex justify-between"><span className="text-[color:var(--brand-muted)]">Subtotal</span><span className="text-[color:var(--ink)]">AED {Number(selected.subtotal ?? 0).toFixed(2)}</span></div>
              {selected.delivery_fee ? <div className="flex justify-between"><span className="text-[color:var(--brand-muted)]">Delivery</span><span className="text-[color:var(--ink)]">AED {Number(selected.delivery_fee).toFixed(2)}</span></div> : null}
              {selected.coupon_discount ? <div className="flex justify-between text-green-600"><span>Coupon</span><span>− AED {Number(selected.coupon_discount).toFixed(2)}</span></div> : null}
              {selected.coin_discount ? <div className="flex justify-between text-green-600"><span>Coins</span><span>− AED {Number(selected.coin_discount).toFixed(2)}</span></div> : null}
              <div className="mt-1 flex justify-between border-t border-[color:var(--brand-border)] pt-2 font-bold"><span className="text-[color:var(--ink)]">Total</span><span className="text-[color:var(--brand-maroon)]">AED {Number(selected.total).toFixed(2)}</span></div>
            </div>

            <div className="mt-4 text-sm">
              <p className="eyebrow">Delivery</p>
              <p className="mt-1 text-[color:var(--ink)]">{selected.delivery_address ?? "—"}</p>
              <p className="text-xs text-[color:var(--brand-muted)]">{(selected.payment_method ?? "COD").toUpperCase()} · {selected.payment_status ?? "pending"}</p>
            </div>

            <div className="mt-6 space-y-2.5">
              {nextAction(selected.status) && (
                <button onClick={() => advance(nextAction(selected.status)!.next)} disabled={busy} className="bg-brand-gradient w-full rounded-full py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110 disabled:opacity-60">
                  {busy ? "Updating…" : nextAction(selected.status)!.label}
                </button>
              )}
              {canCancel(selected.status) && (
                <button onClick={cancelOrder} disabled={busy} className="w-full rounded-full border border-red-300 py-3 text-sm font-semibold text-[color:var(--brand-red)] transition hover:bg-red-50 disabled:opacity-60">
                  Cancel Order
                </button>
              )}
              <button onClick={() => setSelected(null)} className="w-full rounded-full border border-[color:var(--brand-border)] py-3 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--paper-2)]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
