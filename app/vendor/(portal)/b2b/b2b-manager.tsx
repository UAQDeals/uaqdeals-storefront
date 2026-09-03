"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Row = Record<string, any>;

const TABS = ["browse", "listings", "orders"] as const;
type Tab = (typeof TABS)[number];

function statusColor(s: string) {
  switch (s) {
    case "pending": return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "approved": return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    case "fulfilled": return "bg-green-50 text-green-700 ring-1 ring-green-200";
    case "rejected": return "bg-red-50 text-red-700 ring-1 ring-red-200";
    case "cancelled": case "refunded": return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
    default: return "bg-[color:var(--paper-2)] text-[color:var(--brand-muted)] ring-1 ring-[color:var(--brand-border)]";
  }
}

const money = (n: any) => `AED ${Number(n ?? 0).toFixed(2)}`;

function friendly(e: any): string {
  const s = String(e?.message ?? e ?? "");
  if (s.includes("insufficient_wallet_balance")) return "Insufficient wallet balance";
  if (s.includes("insufficient_stock")) return "Not enough stock";
  if (s.includes("cannot_buy_own_listing")) return "You can't buy your own listing";
  if (s.includes("item_unavailable")) return "Item unavailable";
  if (s.includes("bad_status")) return "Action not allowed in this state";
  return "Something went wrong";
}

export function VendorB2BManager({
  vendorId,
  walletBalance,
  initialBrowse,
  initialListings,
  initialOrders,
}: {
  vendorId: string;
  walletBalance: number;
  initialBrowse: Row[];
  initialListings: Row[];
  initialOrders: Row[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>("browse");
  const [busy, setBusy] = useState(false);

  // Browse filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  // Modals
  const [buyItem, setBuyItem] = useState<Row | null>(null);
  const [editItem, setEditItem] = useState<Row | null | "new">(null);
  const [restockItem, setRestockItem] = useState<Row | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const it of initialBrowse) if (it.category) set.add(it.category);
    return [...set].sort();
  }, [initialBrowse]);

  const browse = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialBrowse.filter((it) => {
      if (category && it.category !== category) return false;
      if (q && !String(it.name ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [initialBrowse, search, category]);

  async function refresh() {
    router.refresh();
  }

  // ── Buy ──────────────────────────────────────────────
  async function placeOrder(item: Row, qty: number, note: string) {
    const isPlatform = item.seller_vendor_id == null;
    setBusy(true);
    try {
      if (isPlatform) {
        const { error } = await supabase.from("source_requests").insert({
          source_item_id: item.id, vendor_id: vendorId, quantity: qty,
          note: note || null,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc("place_b2b_order", {
          p_listing_id: item.id, p_buyer_vendor_id: vendorId,
          p_quantity: qty, p_note: note || null,
        });
        if (error) throw error;
      }
      toast.success("Order placed");
      setBuyItem(null);
      setTab("orders");
      await refresh();
    } catch (e) {
      toast.error(friendly(e));
    } finally {
      setBusy(false);
    }
  }

  // ── Order actions ────────────────────────────────────
  async function orderRpc(fn: string, id: string) {
    setBusy(true);
    try {
      const { error } = await supabase.rpc(fn, { p_order_id: id });
      if (error) throw error;
      toast.success("Done");
      await refresh();
    } catch (e) {
      toast.error(friendly(e));
    } finally {
      setBusy(false);
    }
  }

  // ── Listing toggle ───────────────────────────────────
  async function toggleListing(item: Row, active: boolean) {
    setBusy(true);
    try {
      const { error } = await supabase.from("source_items")
        .update({ is_active: active, updated_at: new Date().toISOString() })
        .eq("id", item.id);
      if (error) throw error;
      await refresh();
    } catch (e) {
      toast.error(friendly(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Wholesale</p>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--ink)]">B2B Market</h1>
        </div>
        <div className="rounded-xl border border-[color:var(--brand-border)] bg-white px-4 py-2 text-right">
          <p className="text-[11px] uppercase tracking-wide text-[color:var(--brand-muted)]">Wallet</p>
          <p className="font-semibold text-[color:var(--brand-maroon)]">{money(walletBalance)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "rounded-full px-4 py-2 text-sm font-medium capitalize transition-all " +
              (tab === t
                ? "bg-brand-gradient text-white shadow-[var(--shadow-card)]"
                : "bg-white text-[color:var(--ink)]/70 ring-1 ring-[color:var(--brand-border)] hover:text-[color:var(--brand-maroon)]")
            }
          >
            {t === "browse" ? "Browse" : t === "listings" ? `My Listings (${initialListings.length})` : `Orders (${initialOrders.length})`}
          </button>
        ))}
      </div>

      {tab === "browse" && (
        <BrowseTab
          browse={browse}
          categories={categories}
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          onBuy={setBuyItem}
        />
      )}

      {tab === "listings" && (
        <ListingsTab
          listings={initialListings}
          busy={busy}
          onNew={() => setEditItem("new")}
          onEdit={setEditItem}
          onRestock={setRestockItem}
          onToggle={toggleListing}
        />
      )}

      {tab === "orders" && (
        <OrdersTab orders={initialOrders} vendorId={vendorId} busy={busy} onAction={orderRpc} />
      )}

      {buyItem && (
        <BuyModal item={buyItem} wallet={walletBalance} busy={busy}
          onClose={() => setBuyItem(null)} onConfirm={placeOrder} />
      )}
      {editItem !== null && (
        <ListingModal
          supabase={supabase}
          vendorId={vendorId}
          existing={editItem === "new" ? null : editItem}
          onClose={() => setEditItem(null)}
          onSaved={async () => { setEditItem(null); await refresh(); }}
        />
      )}
      {restockItem && (
        <RestockModal supabase={supabase} item={restockItem}
          onClose={() => setRestockItem(null)}
          onSaved={async () => { setRestockItem(null); await refresh(); }} />
      )}
    </div>
  );
}

// ─────────────────────────── Browse ───────────────────────────
function BrowseTab({
  browse, categories, search, setSearch, category, setCategory, onBuy,
}: {
  browse: Row[]; categories: string[]; search: string; setSearch: (s: string) => void;
  category: string | null; setCategory: (c: string | null) => void; onBuy: (it: Row) => void;
}) {
  return (
    <div>
      <div className="mb-4 space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search wholesale items"
          className="w-full rounded-xl border border-[color:var(--brand-border)] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40"
        />
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Chip label="All" active={category == null} onClick={() => setCategory(null)} />
            {categories.map((c) => (
              <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
            ))}
          </div>
        )}
      </div>
      {browse.length === 0 ? (
        <Empty text="No matching wholesale listings" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {browse.map((it) => (
            <button
              key={it.id}
              onClick={() => onBuy(it)}
              className="group overflow-hidden rounded-2xl border border-[color:var(--brand-border)] bg-white text-left shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-card)]"
            >
              <div className="relative aspect-square bg-[color:var(--paper-2)]">
                {it.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[color:var(--brand-muted)]">No image</div>
                )}
                {it.seller_vendor_id == null && (
                  <span className="absolute left-2 top-2 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white">Platform</span>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-semibold text-[color:var(--ink)]">{it.name}</p>
                {it.category && <p className="mt-0.5 text-xs text-[color:var(--brand-muted)]">{it.category}</p>}
                <p className="mt-1.5 font-semibold text-[color:var(--brand-maroon)]">
                  {money(it.wholesale_price)}
                  {it.unit && <span className="text-xs font-normal text-[color:var(--brand-muted)]"> / {it.unit}</span>}
                </p>
                <p className="text-[11px] text-[color:var(--brand-muted)]">MOQ: {it.moq ?? 1}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors " +
        (active
          ? "bg-brand-gradient text-white"
          : "bg-white text-[color:var(--ink)]/70 ring-1 ring-[color:var(--brand-border)] hover:text-[color:var(--brand-maroon)]")
      }
    >
      {label}
    </button>
  );
}

// ─────────────────────────── My Listings ───────────────────────────
function ListingsTab({
  listings, busy, onNew, onEdit, onRestock, onToggle,
}: {
  listings: Row[]; busy: boolean; onNew: () => void;
  onEdit: (it: Row) => void; onRestock: (it: Row) => void;
  onToggle: (it: Row, active: boolean) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={onNew}
          className="rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-card)]"
        >
          + New listing
        </button>
      </div>
      {listings.length === 0 ? (
        <Empty text="You haven't listed anything yet" />
      ) : (
        <div className="space-y-3">
          {listings.map((it) => {
            const st = (it.status as string) ?? "pending";
            return (
              <div key={it.id} className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 shadow-[var(--shadow-sm)]">
                <div className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[color:var(--paper-2)]">
                    {it.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-semibold text-[color:var(--ink)]">{it.name}</p>
                      <span className={"rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize " + statusColor(st)}>{st}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-[color:var(--brand-muted)]">
                      {money(it.wholesale_price)}{it.unit ? ` / ${it.unit}` : ""} · MOQ {it.moq ?? 1}
                    </p>
                    <p className={"text-xs " + (typeof it.stock === "number" && it.stock <= 0 ? "text-red-600" : "text-[color:var(--brand-muted)]")}>
                      {it.stock == null ? "Stock: unlimited" : `Stock: ${it.stock}`}
                    </p>
                    {st === "rejected" && it.rejection_reason && (
                      <p className="mt-1 text-xs text-red-600">Reason: {it.rejection_reason}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => onEdit(it)} className="rounded-lg border border-[color:var(--brand-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-maroon)] hover:bg-[color:var(--paper-2)]">Edit</button>
                  <button onClick={() => onRestock(it)} className="rounded-lg border border-[color:var(--brand-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-maroon)] hover:bg-[color:var(--paper-2)]">Restock</button>
                  <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-[color:var(--brand-muted)]">
                    <span>{it.is_active ? "Active" : "Paused"}</span>
                    <input type="checkbox" disabled={busy} checked={!!it.is_active}
                      onChange={(e) => onToggle(it, e.target.checked)}
                      className="h-4 w-4 accent-[color:var(--brand-maroon)]" />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── Orders ───────────────────────────
function OrdersTab({
  orders, vendorId, busy, onAction,
}: {
  orders: Row[]; vendorId: string; busy: boolean; onAction: (fn: string, id: string) => void;
}) {
  if (orders.length === 0) return <Empty text="No orders yet" />;
  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const st = (o.status as string) ?? "pending";
        const isSeller = String(o.seller_vendor_id) === vendorId;
        const total = o.total_amount;
        const commission = o.commission_amount;
        const net = total != null && commission != null ? Number(total) - Number(commission) : null;
        return (
          <div key={o.id} className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between">
              <span className={"rounded-md px-2 py-0.5 text-[10px] font-bold " + (isSeller ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700")}>
                {isSeller ? "SELL" : "BUY"}
              </span>
              <span className={"rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize " + statusColor(st)}>{st}</span>
            </div>
            <p className="mt-2 font-semibold text-[color:var(--ink)]">{o.item_name ?? "—"}</p>
            <p className="text-sm text-[color:var(--brand-muted)]">
              Qty: {o.quantity} · {total != null ? money(total) : o.unit_price != null ? money(o.unit_price) : "—"}
            </p>
            {isSeller && commission != null && (
              <div className="mt-1 text-sm">
                <p className="text-[color:var(--brand-muted)]">Commission: {money(commission)}</p>
                {net != null && <p className="font-semibold text-green-700">You receive: {money(net)}</p>}
              </div>
            )}
            <OrderActions o={o} st={st} isSeller={isSeller} busy={busy} onAction={onAction} />
          </div>
        );
      })}
    </div>
  );
}

function OrderActions({
  o, st, isSeller, busy, onAction,
}: {
  o: Row; st: string; isSeller: boolean; busy: boolean; onAction: (fn: string, id: string) => void;
}) {
  const btns: React.ReactNode[] = [];
  const btn = (label: string, fn: string, variant: "solid" | "danger" | "success") => (
    <button
      key={label}
      disabled={busy}
      onClick={() => onAction(fn, o.id)}
      className={
        "rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 " +
        (variant === "danger"
          ? "border border-red-300 text-red-600 hover:bg-red-50"
          : variant === "success"
          ? "bg-green-600 text-white hover:bg-green-700"
          : "bg-brand-gradient text-white")
      }
    >
      {label}
    </button>
  );
  if (isSeller && st === "pending") {
    btns.push(btn("Accept", "accept_b2b_order", "solid"), btn("Reject", "reject_b2b_order", "danger"));
  } else if (isSeller && st === "approved") {
    btns.push(btn("Mark fulfilled", "fulfil_b2b_order", "success"));
  } else if (!isSeller && st === "pending" && o.seller_vendor_id != null) {
    btns.push(btn("Cancel", "cancel_b2b_order", "danger"));
  }
  if (btns.length === 0) return null;
  return <div className="mt-3 flex gap-2">{btns}</div>;
}

// ─────────────────────────── Modals ───────────────────────────
function BuyModal({
  item, wallet, busy, onClose, onConfirm,
}: {
  item: Row; wallet: number; busy: boolean;
  onClose: () => void; onConfirm: (item: Row, qty: number, note: string) => void;
}) {
  const moq = Number(item.moq ?? 1);
  const price = Number(item.wholesale_price ?? 0);
  const isPlatform = item.seller_vendor_id == null;
  const [qty, setQty] = useState(moq);
  const [note, setNote] = useState("");
  const total = price * qty;
  const low = !isPlatform && wallet < total;

  return (
    <Overlay onClose={onClose}>
      <h3 className="text-lg font-semibold text-[color:var(--ink)]">{item.name}</h3>
      <p className="text-sm text-[color:var(--brand-muted)]">{money(price)}{item.unit ? ` / ${item.unit}` : ""} · MOQ {moq}</p>
      {item.description && <p className="mt-2 text-sm text-[color:var(--ink)]/80">{item.description}</p>}
      <div className="mt-4 flex items-center justify-between">
        <span className="font-medium">Quantity</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setQty((q) => Math.max(moq, q - 1))} className="h-9 w-9 rounded-lg bg-[color:var(--paper-2)] text-lg font-bold text-[color:var(--brand-maroon)]">−</button>
          <span className="w-8 text-center text-lg font-bold">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="h-9 w-9 rounded-lg bg-[color:var(--paper-2)] text-lg font-bold text-[color:var(--brand-maroon)]">+</button>
        </div>
      </div>
      <div className="mt-3 rounded-xl bg-[color:var(--paper-2)] p-3 text-sm">
        <div className="flex justify-between font-semibold"><span>Total</span><span>{money(total)}</span></div>
        {!isPlatform && (
          <div className={"mt-1 flex justify-between " + (low ? "text-red-600" : "text-[color:var(--brand-muted)]")}>
            <span>Your wallet</span><span>{money(wallet)}</span>
          </div>
        )}
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" rows={2}
        className="mt-3 w-full rounded-xl border border-[color:var(--brand-border)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40" />
      <button
        disabled={busy}
        onClick={() => onConfirm(item, qty, note.trim())}
        className="mt-4 w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Placing…" : isPlatform ? "Request" : "Buy now"}
      </button>
    </Overlay>
  );
}

function ListingModal({
  supabase, vendorId, existing, onClose, onSaved,
}: {
  supabase: ReturnType<typeof createClient>; vendorId: string; existing: Row | null;
  onClose: () => void; onSaved: () => void;
}) {
  const editing = existing != null;
  const wasApproved = existing?.status === "approved";
  const [name, setName] = useState(existing?.name ?? "");
  const [price, setPrice] = useState(existing?.wholesale_price?.toString() ?? "");
  const [unit, setUnit] = useState(existing?.unit ?? "carton");
  const [moq, setMoq] = useState(existing?.moq?.toString() ?? "1");
  const [stock, setStock] = useState(existing?.stock?.toString() ?? "");
  const [cat, setCat] = useState(existing?.category ?? "");
  const [desc, setDesc] = useState(existing?.description ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(existing?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function pickImage(file: File) {
    setUploading(true);
    try {
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
      const path = `source-items/${Date.now()}-${Math.floor(Math.random() * 9999)}.${ext}`;
      const { error } = await supabase.storage.from("public-assets").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (e) {
      toast.error(friendly(e));
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!name.trim() || !price.trim()) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    const payload: Row = {
      name: name.trim(),
      wholesale_price: Number(price),
      unit: unit.trim() || "carton",
      moq: parseInt(moq) || 1,
      stock: stock.trim() === "" ? null : parseInt(stock),
      category: cat.trim() || null,
      description: desc.trim() || null,
      image_url: imageUrl,
      updated_at: new Date().toISOString(),
    };
    try {
      if (!editing) {
        const { error } = await supabase.from("source_items").insert({
          ...payload, seller_vendor_id: vendorId, is_active: true, status: "pending",
        });
        if (error) throw error;
        toast.success("Submitted for review");
      } else {
        // Material edits are pushed back to pending by the DB guard trigger.
        const { error } = await supabase.from("source_items").update(payload).eq("id", existing!.id);
        if (error) throw error;
        toast.success("Changes saved");
      }
      onSaved();
    } catch (e) {
      toast.error(friendly(e));
      setSaving(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <h3 className="text-lg font-semibold text-[color:var(--ink)]">{editing ? "Edit listing" : "New wholesale listing"}</h3>
      <p className="text-xs text-[color:var(--brand-muted)]">
        {editing
          ? wasApproved ? "Editing price or details sends it back for review" : "Stays pending review"
          : "Reviewed by admin before it goes live"}
      </p>

      <div className="mt-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-[color:var(--paper-2)] text-sm text-[color:var(--brand-muted)]"
        >
          {uploading ? "Uploading…" : imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : "+ Add photo"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pickImage(f); }} />
      </div>

      <div className="mt-3 space-y-2.5">
        <Field label="Item name *" value={name} onChange={setName} />
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Price (AED) *" value={price} onChange={setPrice} type="number" />
          <Field label="Unit" value={unit} onChange={setUnit} />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="MOQ" value={moq} onChange={setMoq} type="number" />
          <Field label="Stock (optional)" value={stock} onChange={setStock} type="number" />
        </div>
        <Field label="Category" value={cat} onChange={setCat} />
        <Field label="Description" value={desc} onChange={setDesc} textarea />
      </div>

      <button disabled={saving || uploading} onClick={save}
        className="mt-4 w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white disabled:opacity-50">
        {saving ? "Saving…" : editing ? "Save changes" : "Submit for review"}
      </button>
    </Overlay>
  );
}

function RestockModal({
  supabase, item, onClose, onSaved,
}: {
  supabase: ReturnType<typeof createClient>; item: Row; onClose: () => void; onSaved: () => void;
}) {
  const [stock, setStock] = useState(item.stock?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase.from("source_items")
        .update({ stock: stock.trim() === "" ? null : parseInt(stock), updated_at: new Date().toISOString() })
        .eq("id", item.id);
      if (error) throw error;
      toast.success("Stock updated");
      onSaved();
    } catch (e) {
      toast.error(friendly(e));
      setSaving(false);
    }
  }
  return (
    <Overlay onClose={onClose}>
      <h3 className="text-lg font-semibold text-[color:var(--ink)]">Update stock</h3>
      <p className="text-xs text-[color:var(--brand-muted)]">Leave empty for unlimited stock. No re-review needed.</p>
      <Field label="Stock" value={stock} onChange={setStock} type="number" />
      <button disabled={saving} onClick={save}
        className="mt-4 w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white disabled:opacity-50">
        {saving ? "Saving…" : "Save"}
      </button>
    </Overlay>
  );
}

// ─────────────────────────── primitives ───────────────────────────
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", textarea = false,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean;
}) {
  const cls = "mt-1 w-full rounded-xl border border-[color:var(--brand-border)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40";
  return (
    <label className="block">
      <span className="text-xs font-medium text-[color:var(--brand-muted)]">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className={cls} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls}
          inputMode={type === "number" ? "decimal" : undefined} />
      )}
    </label>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[color:var(--brand-border)] bg-white py-16 text-center text-sm text-[color:var(--brand-muted)]">
      {text}
    </div>
  );
}
