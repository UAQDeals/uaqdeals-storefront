#!/usr/bin/env python3
"""
Storefront ProductDetail: switch variants from attribute/options model
to PRICED-SKU model ({name, price, sale_price, sku, stock_quantity}).
- variant selection REQUIRED when variants exist
- selected variant's price REPLACES base price
- per-variant stock; out-of-stock variants disabled
- fixes the crash (no more v.options) AND implements the feature
Run from ~/uaq_deals/apps/storefront.
"""
from pathlib import Path
import sys

TARGET = Path("components/product-detail.tsx")
s = TARGET.read_text()

if "selectedVariantIdx" in s:
    sys.exit("FAILED: already applied")

changes = []

# ---- 1. Type: variants -> priced shape ----
old_type = 'variants: Array<{ name: string; options: string[] }>;'
new_type = 'variants: Array<{ name: string; price: number | null; sale_price: number | null; sku?: string | null; stock_quantity: number }>;'
if old_type in s:
    s = s.replace(old_type, new_type, 1); changes.append("type")
else:
    sys.exit("FAIL: variant type anchor")

# ---- 2. State: replace `picked` options-map with selectedVariantIdx ----
old_state = '''  const [picked, setPicked] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const v of p.variants ?? []) {
      if (v?.name && Array.isArray(v.options) && v.options.length) init[v.name] = v.options[0];
    }
    return init;
  });'''
new_state = '''  const hasVariants = (p.variants?.length ?? 0) > 0;
  // null = nothing chosen yet; selection is required when variants exist.
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(null);
  const selectedVariant = selectedVariantIdx != null ? p.variants[selectedVariantIdx] : null;'''
if old_state in s:
    s = s.replace(old_state, new_state, 1); changes.append("state")
else:
    sys.exit("FAIL: picked state anchor")

# ---- 3. Derived price/stock/line consts -> from selected variant ----
old_derived = '''  const hasSale = p.sale_price != null && p.sale_price > 0 && p.sale_price < p.price;
  const unitPrice = hasSale ? (p.sale_price as number) : p.price;
  const discountPct = hasSale ? Math.round(((p.price - (p.sale_price as number)) / p.price) * 100) : 0;
  const oos = p.track_stock && (p.stock_quantity == null || p.stock_quantity <= 0);
  const lowStock = p.track_stock && p.stock_quantity != null && p.stock_quantity > 0 && p.stock_quantity <= 5;
  const isRx = p.requires_prescription;
  const canAdd = !oos && (!isRx || rxUploaded);

  const variantSummary = Object.entries(picked).map(([k, v]) => `${k}: ${v}`).join(", ");
  const lineId = p.id + (variantSummary ? "::" + variantSummary.replace(/\\s+/g, "_") : "");'''
new_derived = '''  // Pricing: when a variant is selected, its price REPLACES the base price.
  const basePrice = selectedVariant
    ? (selectedVariant.price ?? p.price)
    : p.price;
  const baseSale = selectedVariant ? selectedVariant.sale_price : p.sale_price;
  const hasSale = baseSale != null && baseSale > 0 && baseSale < basePrice;
  const unitPrice = hasSale ? (baseSale as number) : basePrice;
  const discountPct = hasSale ? Math.round(((basePrice - (baseSale as number)) / basePrice) * 100) : 0;

  // Stock: per-variant when one is selected, else product-level.
  const variantStock = selectedVariant ? selectedVariant.stock_quantity : null;
  const oos = selectedVariant
    ? (variantStock == null || variantStock <= 0)
    : (p.track_stock && (p.stock_quantity == null || p.stock_quantity <= 0));
  const lowStock = selectedVariant
    ? (variantStock != null && variantStock > 0 && variantStock <= 5)
    : (p.track_stock && p.stock_quantity != null && p.stock_quantity > 0 && p.stock_quantity <= 5);
  const isRx = p.requires_prescription;
  // Must pick a variant when the product has them.
  const needsVariant = hasVariants && selectedVariant == null;
  const canAdd = !oos && !needsVariant && (!isRx || rxUploaded);

  const variantSummary = selectedVariant ? selectedVariant.name : "";
  const lineId = p.id + (variantSummary ? "::" + variantSummary.replace(/\\s+/g, "_") : "");'''
if old_derived in s:
    s = s.replace(old_derived, new_derived, 1); changes.append("derived")
else:
    sys.exit("FAIL: derived consts anchor")

# ---- 4. Variant UI: replace options chips with priced-variant cards ----
old_ui = '''        {p.variants?.length > 0 && p.variants.some((v) => Array.isArray((v as { options?: unknown }).options)) && (
          <div className="mt-6 space-y-4">
            {p.variants.filter((v) => Array.isArray((v as { options?: unknown }).options)).map((v) => (
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
                </div>'''
new_ui = '''        {hasVariants && (
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Options {needsVariant && <span className="text-[color:var(--brand-maroon)]">(select one)</span>}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.variants.map((v, idx) => {
                  const active = selectedVariantIdx === idx;
                  const vOos = v.stock_quantity != null && v.stock_quantity <= 0;
                  const vSale = v.sale_price != null && v.sale_price > 0 && v.price != null && v.sale_price < v.price;
                  const vPrice = vSale ? v.sale_price : v.price;
                  return (
                    <button
                      key={idx}
                      disabled={vOos}
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={"flex flex-col items-start rounded-lg border px-3 py-2 text-left text-sm transition " +
                        (vOos ? "border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed line-through "
                              : active ? "border-[color:var(--brand-maroon)] bg-[color:var(--brand-maroon)]/5 "
                              : "border-neutral-200 bg-white hover:border-neutral-400 ")}
                    >
                      <span className="font-semibold text-neutral-900">{v.name}</span>
                      {vPrice != null && (
                        <span className="text-xs text-[color:var(--brand-maroon)] font-bold">{aed(vPrice)}</span>
                      )}
                      {vOos && <span className="text-[10px] text-neutral-400">Out of stock</span>}
                    </button>
                  );
                })}
              </div>'''
if old_ui in s:
    s = s.replace(old_ui, new_ui, 1); changes.append("variant-ui")
else:
    sys.exit("FAIL: variant UI anchor (hotfix version)")

TARGET.write_text(s)
print("storefront priced-variants applied:", ", ".join(changes))
