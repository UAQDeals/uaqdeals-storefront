"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Plus, Minus, Star, MapPin, ChevronLeft } from "lucide-react";
import { aed } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Product = any;
type Vendor = { id: string; name: string; description: string | null; logo_url: string | null; rating: number | null; review_count: number | null; emirate: string | null };

function QtyButton({ product }: { product: Product }) {
  const { items, add, setQty } = useCart();
  const item = items.find((i) => i.product_id === product.id);
  const qty = item?.qty ?? 0;

  if (qty === 0) {
    return (
      <button
        onClick={() => {
              // Add without opening side drawer (restaurant flow uses floating cart bar)
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
                  vendor_name: null,
                  variant: null,
                  qty: 1,
                };
                useCart.setState({ items: [...store.items, newItem] });
              }
              toast.success(`${product.name} added`);
            }}
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
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const categories = Object.keys(grouped);
  const [activeTab, setActiveTab] = useState(categories[0] ?? "");

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <Link href="/categories/restaurant"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors">
            <ChevronLeft className="h-5 w-5 text-neutral-700" />
          </Link>
          {vendor.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vendor.logo_url} alt={vendor.name} className="h-10 w-10 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-lg"
              style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
              🍕
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-extrabold text-neutral-900 truncate">{vendor.name}</h1>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              {vendor.rating && vendor.rating > 0 && (
                <span className="flex items-center gap-0.5 font-semibold text-green-700">
                  <Star className="h-3 w-3 fill-green-700" /> {Number(vendor.rating).toFixed(1)}
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
              className="relative flex items-center gap-2 rounded-full bg-[color:var(--brand-maroon)] px-3 py-2 text-xs font-bold text-white hover:opacity-90 shrink-0">
              <ShoppingCart className="h-4 w-4" />
              <span>{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
              <span className="hidden sm:inline">· {aed(totalPrice)}</span>
            </Link>
          )}
        </div>

        {/* Category tabs */}
        {categories.length > 1 && (
          <div className="flex overflow-x-auto [scrollbar-width:none] border-t border-neutral-100 mx-0 px-4">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveTab(cat)}
                className={"shrink-0 px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors " +
                  (activeTab === cat
                    ? "border-[color:var(--brand-maroon)] text-[color:var(--brand-maroon)]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700")}>
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Menu items ── */}
      <div className="mx-auto max-w-3xl px-4 py-5">
        {categories.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-neutral-400 text-sm">No menu items yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(grouped[activeTab] ?? []).map((p: Product) => {
              const price = p.sale_price ?? p.price;
              const hasDiscount = p.sale_price && p.price && Number(p.sale_price) < Number(p.price);
              return (
                <div key={p.id}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {p.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.thumbnail_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl text-neutral-300">🍝</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-neutral-900 leading-tight">{p.name}</p>
                    {p.description && (
                      <p className="text-[12px] text-neutral-500 mt-0.5 line-clamp-2">{p.description}</p>
                    )}
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-[14px] font-extrabold text-[color:var(--brand-maroon)]">{aed(price)}</span>
                      {hasDiscount && (
                        <span className="text-[11px] text-neutral-400 line-through">{aed(p.price)}</span>
                      )}
                    </div>
                  </div>

                  {/* +/- stepper */}
                  <QtyButton product={p} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Floating cart bar ── */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-4">
          <Link href="/cart"
            className="inline-flex items-center gap-3 rounded-full bg-[color:var(--brand-maroon)] px-6 py-3.5 text-sm font-bold text-white shadow-xl hover:opacity-90 transition-opacity">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-extrabold">{totalItems}</span>
            View Cart
            <span className="ms-1 opacity-80">· {aed(totalPrice)}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
