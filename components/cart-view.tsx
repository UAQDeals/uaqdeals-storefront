"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart";
import { aed } from "@/lib/format";
import { useCartVariantValidation } from "@/lib/use-cart-validation";
import { Reveal } from "@/components/reveal";

const DELIVERY_THRESHOLD = 50;

export function CartView() {
  const t = useTranslations("cartPage");
  const tc = useTranslations("common");
  const { items, hydrated, setQty, remove, subtotal, totalQty } = useCart();
  const variantIssues = useCartVariantValidation(items);
  const hasBlockingIssue = Object.keys(variantIssues).length > 0;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1320px] px-5 py-12 md:px-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[34px]">{t("title")}</h1>
        <div className="mt-8 h-40 animate-pulse rounded-2xl border border-[color:var(--brand-border)] bg-white" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center md:px-8">
        <Reveal>
          <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-[color:var(--brand-maroon)] shadow-[var(--shadow-sm)]">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="font-display mt-6 text-[26px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[32px]">{t("empty")}</h1>
          <p className="mt-2 text-sm text-[color:var(--brand-muted)]">{t("emptyDesc")}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/deals" className="bg-brand-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110">
              {tc("shopDeals")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <Link href="/categories" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--brand-maroon)] transition hover:border-[color:var(--brand-maroon)]">
              {tc("browseCategories")}
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  const sub = subtotal();
  const remainingForFree = Math.max(0, DELIVERY_THRESHOLD - sub);

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-10 md:px-8">
      <Reveal className="mb-7">
        <div className="flex items-center gap-3.5">
          <span className="accent-bar h-9 w-1.5 rounded-full" />
          <div>
            <p className="eyebrow">{t("orderSummary")}</p>
            <h1 className="font-display mt-0.5 text-[26px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[32px]">{t("title")}</h1>
            <p className="mt-0.5 text-sm text-[color:var(--brand-muted)]">{t("items", { count: totalQty() })}</p>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {items.map((i, idx) => {
            const lineTotal = i.qty * i.price;
            const lineOriginal = i.original_price ? i.qty * i.original_price : null;
            const issue = variantIssues[i.id];
            return (
              <Reveal key={i.id} delay={Math.min(idx * 60, 240)}>
                <div className={"premium-card flex gap-3 p-3 sm:gap-4 sm:p-4 " + (issue ? "!border-red-300" : "")}>
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[color:var(--paper-2)] sm:h-24 sm:w-24">
                    {i.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-7 w-7" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/products/${i.product_id}`} className="line-clamp-2 text-sm font-semibold text-[color:var(--ink)] transition hover:text-[color:var(--brand-maroon)]">{i.name}</Link>
                        {i.variant && <p className="mt-0.5 text-xs text-[color:var(--brand-muted)]">{i.variant}</p>}
                        {i.vendor_name && <p className="mt-0.5 text-xs text-neutral-400">{i.vendor_name}</p>}
                        {issue && (
                          <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-2.5 py-2 text-xs">
                            <p className="flex items-start gap-1.5 font-medium text-red-700">
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              {issue === "oos" ? t("variantOOS") : t("variantUnavailable")}
                            </p>
                            <div className="mt-1.5 flex items-center gap-3 ps-5">
                              <Link href={`/products/${i.product_id}`} className="font-semibold text-[color:var(--brand-maroon)] hover:underline">
                                {t("reselect")}
                              </Link>
                              <button onClick={() => remove(i.id)} className="font-semibold text-neutral-600 hover:text-red-600">
                                {tc("remove")}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <button onClick={() => remove(i.id)} aria-label={tc("remove")} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-[color:var(--brand-border)] bg-white">
                        <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="−" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition hover:bg-[color:var(--paper-2)] hover:text-[color:var(--brand-maroon)]"><Minus className="h-4 w-4" /></button>
                        <span className="w-7 text-center text-sm font-bold">{i.qty}</span>
                        <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="+" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition hover:bg-[color:var(--paper-2)] hover:text-[color:var(--brand-maroon)]"><Plus className="h-4 w-4" /></button>
                      </div>
                      <div className="text-end">
                        <p className="text-base font-bold text-[color:var(--brand-maroon)]">{aed(lineTotal)}</p>
                        {lineOriginal && lineOriginal > lineTotal && <p className="text-xs text-neutral-400 line-through">{aed(lineOriginal)}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <aside className="h-fit lg:sticky lg:top-20">
          <div className="rounded-3xl border border-[color:var(--brand-border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="eyebrow">{t("orderSummary")}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-[color:var(--brand-muted)]">{t("subtotal")}</dt><dd className="font-semibold">{aed(sub)}</dd></div>
              <div className="flex justify-between"><dt className="text-[color:var(--brand-muted)]">{t("delivery")}</dt><dd className="text-neutral-500">{t("deliveryCalc")}</dd></div>
            </dl>
            {remainingForFree > 0 && (
              <p className="mt-3 rounded-xl border border-[color:var(--brand-gold)]/30 bg-[color:var(--brand-gold)]/10 px-3 py-2 text-xs font-medium text-[color:var(--brand-gold-deep)]">{t("freeDeliveryHint", { amount: aed(remainingForFree) })}</p>
            )}
            <div className="gold-rule my-4" />
            <div className="flex items-end justify-between">
              <span className="text-sm font-semibold text-neutral-700">{t("total")}</span>
              <span className="font-display text-[26px] font-semibold text-[color:var(--brand-maroon)]">{aed(sub)}</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">{t("vatNote")}</p>
            {hasBlockingIssue ? (
              <>
                <div className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-500">
                  {t("checkout")}
                </div>
                <p className="mt-2 text-center text-xs font-medium text-red-600">{t("fixBeforeCheckout")}</p>
              </>
            ) : (
              <Link href="/checkout" className="bg-brand-gradient mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110">
                {t("checkout")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            )}
            <Link href="/categories" className="mt-2 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-[color:var(--brand-muted)] transition hover:bg-[color:var(--paper-2)] hover:text-[color:var(--brand-maroon)]">
              {tc("continueShopping")}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
