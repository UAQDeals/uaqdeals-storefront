"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  id: string;                 // line id (product+variant signature)
  product_id: string;
  name: string;
  price: number;              // unit price actually charged (sale_price if any)
  original_price: number | null;
  image: string | null;
  variant: string | null;     // human-readable variant summary, e.g. "Size: M"
  vendor_name: string | null;
  vendor_id?: string | null;
  qty: number;
};

type CartState = {
  items: CartItem[];
  hydrated: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  totalQty: () => number;
  subtotal: () => number;
  // drawer (not persisted)
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  // coupon (persisted with items, carried to checkout)
  coupon: { code: string; discount: number; id: string; freeShipping: boolean } | null;
  setCoupon: (c: { code: string; discount: number; id: string; freeShipping: boolean } | null) => void;
  // single-vendor enforcement for restaurant ordering
  getActiveVendorId: () => string | null;
  clearAndSetVendor: (vendorId: string | null) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      add: (item, qty = 1) => {
        const items = [...get().items];
        const existing = items.find((i) => i.id === item.id);
        if (existing) existing.qty += qty;
        else items.push({ ...item, qty });
        set({ items, drawerOpen: true });
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      setQty: (id, qty) =>
        set({
          items: get()
            .items.map((i) => (i.id === id ? { ...i, qty } : i))
            .filter((i) => i.qty > 0),
        }),
      clear: () => set({ items: [], coupon: null }),
      getActiveVendorId: () => {
        const items = get().items;
        const withVendor = items.find((i) => i.vendor_id);
        return withVendor?.vendor_id ?? null;
      },
      clearAndSetVendor: () => set({ items: [] }),
      totalQty: () => get().items.reduce((s, i) => s + i.qty, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.qty * i.price, 0),
      drawerOpen: false,
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      coupon: null,
      setCoupon: (c) => set({ coupon: c }),
    }),
    {
      name: "uaq_cart_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
