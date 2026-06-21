"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Smartphone, ShoppingCart, Tag, Store } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { aed } from "@/lib/format";
import { useCart } from "@/lib/cart";

type Product = {
  id: string; name: string; description: string | null;
  price: number; sale_price: number | null;
  thumbnail_url: string | null; images: string[];
  variants: Array<{ name: string; options: string[] }>;
  stock_quantity: number | null; track_stock: boolean;
  requires_prescription: boolean; brand: string | null;
  unit: string | null; vendor_name: string | null;
};

export function ProductDetail({ product: p }: { product: Product }) {
  const t = useTranslations("product");
  const tc = useTranslations("common");

  const gallery = useMemo(() => {
    const set: string[] = [];
    if (p.thumbnail_url) set.push(p.thumbnail_url);
    for (const u of p.images) if (u && !set.includes(u)) set.push(u);
    return set;
  }, [p.thumbnail_url, p.images]);

  const [activeImg, setActiveImg] = useState(0);
  const [picked, setPicked] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const v of p.variants ?? []) {
      if (v?.name && Array.isArray(v.options) && v.options.length) init[v.name] = v.options[0];
    }
    return init;
  });
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  const hasSale = p.sale_price != null && p.sale_price > 0 && p.sale_price < p.price;
  const unitPrice = hasSale ? (p.sale_price as number) : p.price;
  const discountPct = hasSale ? Math.round(((p.price - (p.sale_price as number)) / p.price) * 100) : 0;
  const oos = p.track_stock && (p.stock_quantity == null || p.stock_quantity <= 0);
  const lowStock = p.track_stock && p.stock_quantity != null && p.stock_quantity > 0 && p.stock_quantity <= 5;
  const isRx = p.requires_prescription;
  const canAdd = !oos && !isRx;

  const variantSummary = Object.entries(picked).map(([k, v]) => `${k}: ${v}`).join(", ");
  const lineId = p.id + (variantSummary ? "::" + variantSummary.replace(/\s+/g, "_") : "");

  function handleAdd() {
    if (!canAdd) return;
    add({ id: lineId, product_id: p.id, name: p.name, price: unitPrice, original_price: hasSale ? p.price : null, image: gallery[0] ?? null, variant: variantSummary || null, vendor_name: p.vendor_name }, qty);
    toast.success(t("added", { qty, name: p.name }));
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div>
        <div className="overflow-hidden rounded-2xl border border-[color:var(--brand-border)] bg-white">
          <div className="relative aspect-square bg-neutral-100">
            {gallery[activeImg] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gallery[activeImg]} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-16 w-16" /></div>
            )}
            {discountPct > 0 && <span className="bg-brand-gradient absolute start-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white">-{discountPct}%</span>}
          </div>
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {gallery.map((src, i) => (
              <button key={src + i} onClick={() => setActiveImg(i)}
                className={"h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition " + (i === activeImg ? "border-[color:var(--brand-maroon)]" : "border-transparent opacity-70 hover:opacity-100")}
                aria-label={`Image ${i + 1}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{p.name}</h1>

        {(p.vendor_name || p.brand) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
            {p.vendor_name && <span className="inline-flex items-center gap-1.5"><Store className="h-3.5 w-3.5" />{p.vendor_name}</span>}
            {p.brand && <span className="inline-flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" />{p.brand}</span>}
          </div>
        )}

        <div className="mt-5 flex items-end gap-3">
          <span className="text-3xl font-extrabold text-[color:var(--brand-maroon)]">{aed(unitPrice)}</span>
          {hasSale && <span className="text-base text-neutral-500 line-through">{aed(p.price)}</span>}
          {p.unit && <span className="text-xs text-neutral-500">/ {p.unit}</span>}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {isRx && <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{t("prescriptionRequired")}</span>}
          {oos && <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">{tc("outOfStock")}</span>}
          {!oos && lowStock && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{tc("onlyLeft", { count: p.stock_quantity! })}</span>}
          {!oos && !isRx && !lowStock && <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">{tc("inStock")}</span>}
        </div>

        {p.variants?.length > 0 && (
          <div className="mt-6 space-y-4">
            {p.variants.map((v) => (
              <div key={v.name}>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{v.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {v.options.map((opt) => {
                    const active = picked[v.name] === opt;
                    return (
                      <button key={opt} onClick={() => setPicked((s) => ({ ...s, [v.name]: opt }))}
                        className={"rounded-full border px-3 py-1.5 text-sm font-medium transition " + (active ? "border-[color:var(--brand-maroon)] bg-[color:var(--brand-maroon)] text-white" : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400")}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-stretch gap-3">
          <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="inline-flex h-11 w-11 items-center justify-center text-neutral-700 hover:bg-neutral-100" aria-label="−"><Minus className="h-4 w-4" /></button>
            <span className="w-8 text-center text-sm font-semibold">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="inline-flex h-11 w-11 items-center justify-center text-neutral-700 hover:bg-neutral-100" aria-label="+"><Plus className="h-4 w-4" /></button>
          </div>

          {canAdd ? (
            <button onClick={handleAdd} className="bg-brand-gradient inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95">
              <ShoppingCart className="h-4 w-4" /> {t("addToCart")} · {aed(unitPrice * qty)}
            </button>
          ) : isRx ? (
            <div className="flex flex-1 flex-col items-stretch gap-1">
              <button disabled className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-500">
                <Smartphone className="h-4 w-4" /> {t("availableInApp")}
              </button>
              <p className="text-center text-xs text-neutral-500">{t("rxNote")}</p>
            </div>
          ) : (
            <button disabled className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-500">{tc("outOfStock")}</button>
          )}
        </div>

        {p.description && (
          <div className="mt-8 border-t border-[color:var(--brand-border)] pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{t("description")}</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-700">{p.description}</p>
          </div>
        )}

        <p className="mt-8 text-xs text-neutral-500">
          {t("needHelp")}{" "}
          <Link href="/contact" className="font-semibold text-[color:var(--brand-maroon)] hover:underline">{t("contactUs")}</Link>
        </p>
      </div>
    </div>
  );
}
