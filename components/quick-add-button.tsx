"use client";

import Link from "next/link";
import { Plus, Check, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart";

export type QuickAddProduct = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  thumbnail_url: string | null;
  images: string[] | null;
  has_variants: boolean;
  requires_prescription: boolean;
  oos: boolean;
  vendor_name: string | null;
};

export function QuickAddButton({ product: p }: { product: QuickAddProduct }) {
  const t = useTranslations("product");
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const hasSale = p.sale_price != null && p.sale_price > 0 && p.sale_price < p.price;
  const unitPrice = hasSale ? (p.sale_price as number) : p.price;
  const image = p.thumbnail_url || (Array.isArray(p.images) && p.images.length ? p.images[0] : null);

  // Rx or out of stock → no quick add; the card still links to the product page
  if (p.requires_prescription || p.oos) return null;

  // Variants → can't pick from a grid; send to product page
  if (p.has_variants) {
    return (
      <Link
        href={`/products/${p.id}`}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex h-8 items-center gap-1 rounded-full border border-[color:var(--brand-maroon)] px-3 text-xs font-semibold text-[color:var(--brand-maroon)] transition hover:bg-[color:var(--brand-maroon)] hover:text-white"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" /> {t("options")}
      </Link>
    );
  }

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(
      {
        id: p.id,
        product_id: p.id,
        name: p.name,
        price: unitPrice,
        original_price: hasSale ? p.price : null,
        image,
        variant: null,
        vendor_name: p.vendor_name,
      },
      1
    );
    toast.success(t("added1", { name: p.name }));
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <button
      onClick={quickAdd}
      aria-label={t("add")}
      className="bg-brand-gradient inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
    >
      {justAdded ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
      {t("add")}
    </button>
  );
}
