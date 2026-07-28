"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Plus, Minus, Star, MapPin, ChevronLeft } from "lucide-react";
import { aed } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { Reveal } from "@/components/reveal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Product = any;
type Vendor = { id: string; name: string; description: string | null; logo_url: string | null; rating: number | null; review_count: number | null; emirate: string | null };

function QtyButton({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const { items, add, setQty } = useCart();
  const item = items.find((i) => i.product_id === product.id);
  const qty = item?.qty ?? 0;

  if (qty === 0) {
    return (
      <button
        onClick={() => onAdd(product)}
        className="flex items-center gap-1 rounded-full bg-[color:var(--brand-maroon)] px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity shrink-0">
        <Plus className="h-3.5 w-3.5" /> Add
      </button>
    );
  }

  return (
    <div className="flex items-center gap-0 rounded-full border-2 border-[color:var(--brand-maroon)] overflow-hidden shrink-0">
      <button onClick={() => setQty(product.id, qty - 1)}
        className="flex h-8 w-8 items-center justify-center text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white transition-colors">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-7 text-center text-sm font-extrabold text-[color:var(--brand-maroon)]">{qty}</span>
      <button onClick={() => setQty(product.id, qty + 1)}
        className="flex h-8 w-8 items-center justify-center text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white transition-colors">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function VendorMenuClient({ vendor, grouped }: { vendor: Vendor; grouped: Record<string, Product[]> }) {
  const { items } = useCart();
  const [confirmSwitch, setConfirmSwitch] = useState<{ otherVendorName: string; pendingProduct: Product } | null>(null);
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const categories = Object.keys(grouped);

  function performAdd(product: Product, vendorId: string, vendorName: string) {
    const store = useCart.getState();
    const existing = store.items.find((i) => i.product_id === product.id);
    if (existing) {
      store.setQty(product.id, existing.qty + 1);
    } else {
      const newItem = {
        id: product.id,
        product_id: product.id,
        name: product.name,
        price: Number(product.sale_price ?? product.price ?? 0),
        original_price: product.price ? Number(product.price) : null,
        image: product.thumbnail_url ?? null,
        vendor_name: vendorName,
        vendor_id: vendorId,
        variant: null,
        qty: 1,
      };
      useCart.setState({ items: [...store.items, newItem] });
    }
    toast.success(`${product.name} added`);
  }

  function onAddToCart(product: Product, vendorId: string, vendorName: string) {
    const activeVendorId = useCart.getState().getActiveVendorId();
    if (activeVendorId && activeVendorId !== vendorId) {
      const otherVendorName = useCart.getState().items.find((i) => i.vendor_id === activeVendorId)?.vendor_name ?? "another restaurant";
      setConfirmSwitch({ otherVendorName, pendingProduct: product });
      return;
    }
    performAdd(product, vendorId, vendorName);
  }
  const [activeTab, setActiveTab] = useState(categories[0] ?? "");

  return (
    <div className="min-h-screen bg-[color:var(--paper)]">

      {/* ── Header ── */}
      <div className="bg-maroon-radial relative overflow-hidden sticky top-0 z-20">
        <span className="pointer-events-none absolute -top-16 -end-16 h-52 w-52 rounded-full bg-[color:var(--brand-gold)]/15 blur-2xl" aria-hidden />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 py-3.5 flex items-center gap-3">
          <Link href="/categories/restaurant"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-[color:var(--brand-gold)]/25 backdrop-blur-sm text-white transition hover:bg-white/20">
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </Link>
          {vendor.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vendor.logo_url} alt={vendor.name} className="h-11 w-11 rounded-xl object-cover shrink-0 ring-1 ring-[color:var(--brand-gold)]/40" />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white text-lg ring-1 ring-[color:var(--brand-gold)]/40">
              🍕
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-[17px] font-semibold text-white truncate">{vendor.name}</h1>
            <div className="flex items-center gap-2.5 text-[11px] text-white/70">
              {vendor.rating && vendor.rating > 0 && (
                <span className="flex items-center gap-0.5 font-bold text-[color:var(--brand-gold)]">
                  <Star className="h-3 w-3 fill-[color:var(--brand-gold)]" /> {Number(vendor.rating).toFixed(1)}
                </span>
              )}
              {vendor.emirate && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" /> {vendor.emirate}
                </span>
              )}
            </div>
          </div>
          {totalItems > 0 && (
            <Link href="/cart"
              className="relative flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[color:var(--brand-maroon)] shadow-sm ring-1 ring-[color:var(--brand-gold)]/40 transition hover:brightness-105 shrink-0">
              <ShoppingCart className="h-4 w-4" />
              <span>{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
              <span className="hidden sm:inline">· {aed(totalPrice)}</span>
            </Link>
          )}
        </div>

        {/* Category tabs */}
        {categories.length > 1 && (
          <div className="relative flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 pb-3">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveTab(cat)}
                className={"shrink-0 rounded-full px-4 py-1.5 text-[13px] font-semibold whitespace-nowrap border transition-colors " +
                  (activeTab === cat
                    ? "border-[color:var(--brand-gold)]/60 bg-white text-[color:var(--brand-maroon)]"
                    : "border-white/20 bg-white/10 text-white/80 backdrop-blur-sm hover:bg-white/20")}>
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Menu items ── */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-4xl ring-1 ring-[color:var(--brand-gold)]/30">🍽️</span>
            <p className="font-display text-[17px] font-semibold text-[color:var(--ink)]">No menu items yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(grouped[activeTab] ?? []).map((p: Product, i: number) => {
              const price = p.sale_price ?? p.price;
              const hasDiscount = p.sale_price && p.price && Number(p.sale_price) < Number(p.price);
              return (
                <Reveal key={p.id} delay={i * 45}>
                  <div className="group premium-card flex items-center gap-3 p-3.5">
                    {/* Image */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[color:var(--paper-2)]">
                      {p.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumbnail_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl text-neutral-300">🍝</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-[color:var(--ink)] leading-tight">{p.name}</p>
                      {p.description && (
                        <p className="text-[12px] text-[color:var(--brand-muted)] mt-0.5 line-clamp-2">{p.description}</p>
                      )}
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-[15px] font-extrabold text-[color:var(--brand-maroon)]">{aed(price)}</span>
                        {hasDiscount && (
                          <span className="text-[11px] text-neutral-400 line-through">{aed(p.price)}</span>
                        )}
                      </div>
                    </div>

                    {/* +/- stepper */}
                    <QtyButton product={p} onAdd={(prod) => onAddToCart(prod, vendor.id, vendor.name)} />
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Switch restaurant confirmation dialog ── */}
      {confirmSwitch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="premium-card w-full max-w-sm p-6 shadow-[var(--shadow-premium)]">
            <h3 className="font-display text-[19px] font-semibold text-[color:var(--ink)] mb-2">Start a new order?</h3>
            <p className="text-sm text-[color:var(--brand-muted)] mb-5">
              Your cart has items from <span className="font-semibold text-[color:var(--ink)]">{confirmSwitch.otherVendorName}</span>.
              Adding items from {vendor.name} will clear your current cart.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmSwitch(null)}
                className="flex-1 rounded-full border border-[color:var(--brand-border)] py-2.5 text-sm font-bold text-[color:var(--ink)] hover:bg-[color:var(--paper-2)] transition-colors">
                Cancel
              </button>
              <button
                onClick={() => {
                  useCart.getState().clearAndSetVendor(vendor.id);
                  performAdd(confirmSwitch.pendingProduct, vendor.id, vendor.name);
                  setConfirmSwitch(null);
                }}
                className="bg-brand-gradient flex-1 rounded-full py-2.5 text-sm font-bold text-white shadow-[var(--shadow-card)] hover:brightness-110 transition">
                Clear &amp; Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating cart bar ── */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-4">
          <Link href="/cart"
            className="bg-brand-gradient inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-[var(--shadow-premium)] ring-1 ring-[color:var(--brand-gold)]/40 hover:brightness-110 transition">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-extrabold">{totalItems}</span>
            View Cart
            <span className="ms-1 opacity-80">· {aed(totalPrice)}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
