"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { aed } from "@/lib/format";
import { useCart } from "@/lib/cart";

type Variant = { name: string; options: string[] };

export function DealAddToCart({
  dealId,
  productId,
  name,
  price,
  original,
  image,
  vendorName,
  rx,
  variants,
}: {
  dealId: string;
  productId: string;
  name: string;
  price: number;
  original: number | null;
  image: string | null;
  vendorName: string | null;
  rx: boolean;
  variants: Variant[];
}) {
  const [qty, setQty] = useState(1);
  const [picked, setPicked] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const v of variants ?? []) {
      if (v?.name && Array.isArray(v.options) && v.options.length) {
        init[v.name] = v.options[0];
      }
    }
    return init;
  });
  const { add } = useCart();

  const variantSummary = useMemo(
    () =>
      Object.entries(picked)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", "),
    [picked]
  );
  const lineId =
    "deal:" +
    dealId +
    (variantSummary ? "::" + variantSummary.replace(/\s+/g, "_") : "");

  function handleAdd() {
    add(
      {
        id: lineId,
        product_id: productId,
        name,
        price,
        original_price: original,
        image,
        variant: variantSummary || null,
        vendor_name: vendorName,
      },
      qty
    );
    toast.success(`Added ${qty} × ${name} to cart`);
  }

  if (rx) {
    return (
      <div className="space-y-2">
        <button
          disabled
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-500"
        >
          <Smartphone className="h-4 w-4" />
          Available in the app
        </button>
        <p className="text-xs text-neutral-500">
          Prescription items can only be ordered through the UAQ Deals app.
        </p>
      </div>
    );
  }

  return (
    <div>
      {variants?.length > 0 && (
        <div className="mb-5 space-y-4">
          {variants.map((v) => (
            <div key={v.name}>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {v.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {v.options.map((opt) => {
                  const active = picked[v.name] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() =>
                        setPicked((s) => ({ ...s, [v.name]: opt }))
                      }
                      className={
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition " +
                        (active
                          ? "border-[color:var(--brand-maroon)] bg-[color:var(--brand-maroon)] text-white"
                          : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400")
                      }
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-stretch gap-3">
        <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="inline-flex h-11 w-11 items-center justify-center text-neutral-700 hover:bg-neutral-100"
            aria-label="Decrease"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="inline-flex h-11 w-11 items-center justify-center text-neutral-700 hover:bg-neutral-100"
            aria-label="Increase"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleAdd}
          className="bg-brand-gradient inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart · {aed(price * qty)}
        </button>
      </div>
    </div>
  );
}
