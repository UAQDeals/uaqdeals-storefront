"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

export function CartIcon() {
  const { hydrated, totalQty } = useCart();
  const n = hydrated ? totalQty() : 0;
  return (
    <Link
      href="/cart"
      aria-label="Cart"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
    >
      <ShoppingCart className="h-5 w-5" />
      {n > 0 && (
        <span className="bg-brand-gradient absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white">
          {n > 99 ? "99+" : n}
        </span>
      )}
    </Link>
  );
}
