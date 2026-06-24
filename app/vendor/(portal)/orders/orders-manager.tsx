"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Order = Record<string, any>;
type Item = Record<string, any>;

const STATUS_TABS = ["all", "pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

function statusColor(s: string) {
  switch (s) {
    case "pending": return "bg-amber-100 text-amber-700";
    case "confirmed": return "bg-blue-100 text-blue-700";
    case "preparing": return "bg-indigo-100 text-indigo-700";
    case "ready": return "bg-purple-100 text-purple-700";
    case "delivered": case "completed": return "bg-green-100 text-green-700";
    case "cancelled": case "refunded": return "bg-red-100 text-red-700";
    default: return "bg-neutral-100 text-neutral-600";
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
      const { error } = await supabase.from("orders").update(upd).eq("id", selected.id);
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
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled", cancelled_at: now, updated_at: now })
        .eq("id", selected.id);
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
      <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors " +
              (tab === t ? "bg-gradient-to-r from-[#8E1B3A] to-[#C72931] text-white" : "border border-neutral-300 bg-white text-neutral-600")
            }
          >
            {pretty(t)} ({counts[t]})
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center text-sm text-neutral-500">
            No orders in this category.
          </div>
        ) : filtered.map((o) => (
          <button
            key={o.id}
            onClick={() => openOrder(o)}
            className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left hover:border-[#8E1B3A]/40"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900">#{o.order_number ?? o.id.slice(0, 8)}</p>
              <p className="text-xs text-neutral-500">
                {o.created_at ? new Date(o.created_at).toLocaleDateString("en-AE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                {o.delivery_address ? ` · ${String(o.delivery_address).slice(0, 30)}` : ""}
              </p>
            </div>
            <span className="text-sm font-bold text-neutral-900">AED {Number(o.total).toFixed(2)}</span>
            <span className={"rounded-full px-2 py-0.5 text-[10px] font-bold " + statusColor(o.status)}>{pretty(o.status)}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">#{selected.order_number ?? selected.id.slice(0, 8)}</h2>
              <span className={"rounded-full px-2.5 py-1 text-xs font-bold " + statusColor(selected.status)}>{pretty(selected.status)}</span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Items</p>
              {loadingItems ? (
                <p className="py-4 text-center text-sm text-neutral-400">Loading…</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2 text-sm">
                      <span className="text-neutral-700">{it.name} × {it.quantity}</span>
                      <span className="font-semibold text-neutral-900">AED {Number(it.total_price ?? it.unit_price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-1 rounded-lg bg-neutral-50 p-3 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>AED {Number(selected.subtotal ?? 0).toFixed(2)}</span></div>
              {selected.delivery_fee ? <div className="flex justify-between"><span className="text-neutral-500">Delivery</span><span>AED {Number(selected.delivery_fee).toFixed(2)}</span></div> : null}
              {selected.coupon_discount ? <div className="flex justify-between text-green-600"><span>Coupon</span><span>− AED {Number(selected.coupon_discount).toFixed(2)}</span></div> : null}
              {selected.coin_discount ? <div className="flex justify-between text-green-600"><span>Coins</span><span>− AED {Number(selected.coin_discount).toFixed(2)}</span></div> : null}
              <div className="flex justify-between border-t border-neutral-200 pt-1 font-bold"><span>Total</span><span>AED {Number(selected.total).toFixed(2)}</span></div>
            </div>

            <div className="mt-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Delivery</p>
              <p className="mt-1 text-neutral-700">{selected.delivery_address ?? "—"}</p>
              <p className="text-xs text-neutral-500">{(selected.payment_method ?? "COD").toUpperCase()} · {selected.payment_status ?? "pending"}</p>
            </div>

            <div className="mt-6 space-y-2">
              {nextAction(selected.status) && (
                <button onClick={() => advance(nextAction(selected.status)!.next)} disabled={busy} className="w-full rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] py-2.5 text-sm font-bold text-white disabled:opacity-60">
                  {busy ? "Updating…" : nextAction(selected.status)!.label}
                </button>
              )}
              {canCancel(selected.status) && (
                <button onClick={cancelOrder} disabled={busy} className="w-full rounded-lg border border-red-300 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-60">
                  Cancel Order
                </button>
              )}
              <button onClick={() => setSelected(null)} className="w-full rounded-lg border border-neutral-300 py-2.5 text-sm font-semibold text-neutral-600">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
