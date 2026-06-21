"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, Plus as PlusIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { aed } from "@/lib/format";

export type UpsellProduct = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  thumbnail_url: string | null;
  vendor_name: string | null;
};

export function CartDrawer({ upsells }: { upsells: UpsellProduct[] }) {
  const t = useTranslations("cartDrawer");
  const tc = useTranslations("common");
  const tp = useTranslations("product");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const { items, drawerOpen, closeDrawer, setQty, remove, subtotal, add } = useCart();

  // Lock body scroll while open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    if (drawerOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  const sub = subtotal();
  const inCartIds = new Set(items.map((i) => i.product_id));
  const upsellList = upsells.filter((u) => !inCartIds.has(u.id)).slice(0, 4);

  const side = isRTL ? "left-0" : "right-0";
  const enterFrom = isRTL ? "-translate-x-full" : "translate-x-full";

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeDrawer}
        className={
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 " +
          (drawerOpen ? "opacity-100" : "pointer-events-none opacity-0")
        }
        aria-hidden={!drawerOpen}
      />

      {/* Panel */}
      <aside
        dir={isRTL ? "rtl" : "ltr"}
        className={
          `fixed top-0 ${side} z-50 flex h-[100dvh] w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ` +
          (drawerOpen ? "translate-x-0" : enterFrom)
        }
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[color:var(--brand-border)] px-4 py-3">
          <h2 className="text-base font-bold">{t("title")}</h2>
          <button onClick={closeDrawer} aria-label={tc("cancel")} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-semibold text-neutral-800">{t("empty")}</p>
            <button onClick={closeDrawer} className="bg-brand-gradient mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white">
              {tc("continueShopping")}
            </button>
          </div>
        ) : (
          <>
            {/* Lines */}
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {i.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-5 w-5" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/products/${i.product_id}`} onClick={closeDrawer} className="line-clamp-2 text-sm font-semibold hover:text-[color:var(--brand-maroon)]">{i.name}</Link>
                      <button onClick={() => remove(i.id)} aria-label={tc("remove")} className="shrink-0 text-neutral-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    {i.variant && <p className="text-xs text-neutral-500">{i.variant}</p>}
                    <div className="mt-1.5 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-neutral-200">
                        <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="−" className="inline-flex h-7 w-7 items-center justify-center text-neutral-700 hover:bg-neutral-100"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-6 text-center text-xs font-semibold">{i.qty}</span>
                        <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="+" className="inline-flex h-7 w-7 items-center justify-center text-neutral-700 hover:bg-neutral-100"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <span className="text-sm font-bold text-[color:var(--brand-maroon)]">{aed(i.qty * i.price)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Upsells */}
              {upsellList.length > 0 && (
                <div className="mt-4 border-t border-[color:var(--brand-border)] pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">{t("youMightLike")}</p>
                  <div className="space-y-2">
                    {upsellList.map((u) => {
                      const hasSale = u.sale_price != null && u.sale_price > 0 && u.sale_price < u.price;
                      const price = hasSale ? (u.sale_price as number) : u.price;
                      return (
                        <div key={u.id} className="flex items-center gap-3 rounded-xl border border-[color:var(--brand-border)] p-2">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                            {u.thumbnail_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.thumbnail_url} alt={u.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-4 w-4" /></div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link href={`/products/${u.id}`} onClick={closeDrawer} className="line-clamp-1 text-xs font-semibold hover:text-[color:var(--brand-maroon)]">{u.name}</Link>
                            <p className="text-xs font-bold text-[color:var(--brand-maroon)]">{aed(price)}</p>
                          </div>
                          <button
                            onClick={() => {
                              add({ id: u.id, product_id: u.id, name: u.name, price, original_price: hasSale ? u.price : null, image: u.thumbnail_url, variant: null, vendor_name: u.vendor_name }, 1);
                              toast.success(tp("added1", { name: u.name }));
                            }}
                            aria-label={tp("add")}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--brand-maroon)] text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[color:var(--brand-border)] px-4 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-700">{t("subtotal")}</span>
                <span className="text-xl font-extrabold text-[color:var(--brand-maroon)]">{aed(sub)}</span>
              </div>
              <Link href="/checkout" onClick={closeDrawer} className="bg-brand-gradient inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white">
                {t("checkout")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link href="/cart" onClick={closeDrawer} className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                {t("viewCart")}
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
