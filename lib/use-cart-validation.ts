"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CartItem } from "@/lib/cart";

// Why a line's chosen variant can't be ordered anymore. save_product_variants
// is a full replace, so re-saving a product deletes the old product_variants
// rows (and mints new ids) — carts holding the dead id must be caught before
// checkout, not at Place Order.
export type VariantIssue = "unavailable" | "oos";

// Returns a map of cart line id -> issue for lines whose variant_id no longer
// resolves to a purchasable product_variants row. Re-runs whenever the set of
// (line, variant) pairs changes.
export function useCartVariantValidation(items: CartItem[]): Record<string, VariantIssue> {
  const [issues, setIssues] = useState<Record<string, VariantIssue>>({});

  const withVariant = items.filter((i) => !!i.variant_id);
  const sig = withVariant
    .map((i) => `${i.id}:${i.variant_id}`)
    .sort()
    .join(",");

  useEffect(() => {
    let cancelled = false;
    if (withVariant.length === 0) {
      setIssues({});
      return;
    }
    (async () => {
      const supabase = createClient();
      const ids = Array.from(new Set(withVariant.map((i) => i.variant_id as string)));
      const { data, error } = await supabase
        .from("product_variants")
        .select("id, product_id, is_active, stock_quantity")
        .in("id", ids);
      if (cancelled || error) return;

      const byId = new Map((data ?? []).map((v) => [v.id as string, v]));
      const next: Record<string, VariantIssue> = {};
      for (const i of withVariant) {
        const v = byId.get(i.variant_id as string);
        if (!v || v.product_id !== i.product_id || v.is_active === false) {
          next[i.id] = "unavailable"; // deleted / replaced / inactive / wrong product
        } else if ((v.stock_quantity ?? 0) <= 0) {
          next[i.id] = "oos";
        }
      }
      setIssues(next);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  return issues;
}
