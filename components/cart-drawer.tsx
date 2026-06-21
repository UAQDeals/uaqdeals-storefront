"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, Plus as PlusIcon, Tag } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
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
  const tco = useTranslations("checkout");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const { items, drawerOpen, closeDrawer, setQty, remove, subtotal, add, coupon, setCoupon } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") closeDrawer(); }
    if (drawerOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  const sub = subtotal();
  const couponDiscount = coupon?.discount ?? 0;
  const total = Math.max(0, sub - couponDiscount);
  const inCartIds = new Set(items.map((i) => i.product_id));
  const upsellList = upsells.filter((u) => !inCartIds.has(u.id)).slice(0, 8);

  const side = isRTL ? "left-0" : "right-0";
  const enterFrom = isRTL ? "-translate-x-full" : "translate-x-full";

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("id, code, discount_type, discount_value, min_order_amount, max_discount, starts_at, expires_at, max_uses, used_count, is_active")
        .eq("code", code).eq("is_active", true).maybeSingle();
      if (error || !data) throw new Error(tco("invalidCoupon"));
      const now = new Date();
      if (data.starts_at && new Date(data.starts_at) > now) throw new Error(tco("couponNotActive"));
      if (data.expires_at && new Date(data.expires_at) < now) throw new Error(tco("couponExpired"));
      if (data.max_uses != null && (data.used_count ?? 0) >= data.max_uses) throw new Error(tco("couponLimitReached"));
      if (data.min_order_amount && sub < Number(data.min_order_amount)) throw new Error(tco("minOrderRequired", { amount: aed(data.min_order_amount) }));

      let discount = 0;
      if (data.discount_type === "percentage") {
        discount = (sub * Number(data.discount_value)) / 100;
        if (data.max_discount) discount = Math.min(discount, Number(data.max_discount));
      } else {
        discount = Number(data.discount_value);
      }
      discount = Math.min(discount, sub);
      setCoupon({ code: data.code as string, discount, id: data.id as string });
      setCouponInput("");
      toast.success(tco("couponApplied", { amount: aed(discount) }));
    } catch (e) {
      setCoupon(null);
      toast.error(e instanceof Error ? e.message : tco("invalidCoupon"));
    } finally {
      setCouponBusy(false);
    }
  }

  return (
    <>
      <div
        onClick={closeDrawer}
        className={"fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 " + (drawerOpen ? "opacity-100" : "pointer-events-none opacity-0")}
        aria-hidden={!drawerOpen}
      />
      <aside
        dir={isRTL ? "rtl" : "ltr"}
        className={`fixed top-0 ${side} z-50 flex h-[100dvh] w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ` + (drawerOpen ? "translate-x-0" : enterFrom)}
        role="dialog" aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--brand-border)] px-4 py-3">
          <h2 className="text-base font-bold">{t("title")}</h2>
          <button onClick={closeDrawer} aria-label={tc("cancel")} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"><X className="h-5 w-5" /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400"><ShoppingBag className="h-6 w-6" /></div>
            <p className="mt-4 text-sm font-semibold text-neutral-800">{t("empty")}</p>
            <button onClick={closeDrawer} className="bg-brand-gradient mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white">{tc("continueShopping")}</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {/* Lines */}
              <div className="space-y-3">
                {items.map((i) => (
                  <div key={i.id} className="flex gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {i.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                      ) : (<div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-5 w-5" /></div>)}
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
              </div>

              {/* Upsell carousel */}
              {upsellList.length > 0 && (
                <div className="mt-5 border-t border-[color:var(--brand-border)] pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">{t("youMightLike")}</p>
                  <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {upsellList.map((u) => {
                      const hasSale = u.sale_price != null && u.sale_price > 0 && u.sale_price < u.price;
                      const price = hasSale ? (u.sale_price as number) : u.price;
                      return (
                        <div key={u.id} className="w-32 shrink-0">
                          <Link href={`/products/${u.id}`} onClick={closeDrawer} className="block">
                            <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
                              {u.thumbnail_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={u.thumbnail_url} alt={u.name} className="h-full w-full object-cover" />
                              ) : (<div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-6 w-6" /></div>)}
                            </div>
                          </Link>
                          <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-tight">{u.name}</p>
                          <div className="mt-1 flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-[color:var(--brand-maroon)]">{aed(price)}</span>
                            <button
                              onClick={() => {
                                add({ id: u.id, product_id: u.id, name: u.name, price, original_price: hasSale ? u.price : null, image: u.thumbnail_url, variant: null, vendor_name: u.vendor_name }, 1);
                                toast.success(tp("added1", { name: u.name }));
                              }}
                              aria-label={tp("add")}
                              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[color:var(--brand-maroon)] text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white"
                            ><PlusIcon className="h-4 w-4" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[color:var(--brand-border)] px-4 py-4">
              {/* Coupon */}
              {coupon ? (
                <div className="mb-3 flex items-center justify-between rounded-xl bg-green-50 px-3 py-2 text-sm">
                  <span className="inline-flex items-center gap-2 font-semibold text-green-700"><Tag className="h-4 w-4" /> {coupon.code} · −{aed(coupon.discount)}</span>
                  <button onClick={() => setCoupon(null)} className="text-xs font-semibold text-neutral-600 hover:text-red-600">{tc("remove")}</button>
                </div>
              ) : (
                <div className="mb-3 flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") applyCoupon(); }}
                    placeholder={tco("enterCode")}
                    className="h-10 flex-1 rounded-full border border-neutral-200 bg-white px-4 text-sm uppercase outline-none focus:border-[color:var(--brand-maroon)]"
                  />
                  <button onClick={applyCoupon} disabled={couponBusy || !couponInput.trim()} className="inline-flex items-center justify-center rounded-full border border-[color:var(--brand-maroon)] px-4 text-sm font-semibold text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white disabled:opacity-50">
                    {couponBusy ? "…" : tc("apply")}
                  </button>
                </div>
              )}

              <div className="mb-3 space-y-1">
                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">{tco("subtotal")}</span>
                    <span className="font-semibold">{aed(sub)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">{tco("coupon")}</span>
                    <span className="font-semibold text-green-600">−{aed(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-700">{couponDiscount > 0 ? tco("total") : t("subtotal")}</span>
                  <span className="text-xl font-extrabold text-[color:var(--brand-maroon)]">{aed(total)}</span>
                </div>
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
