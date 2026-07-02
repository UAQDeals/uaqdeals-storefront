import { cookies } from "next/headers";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const FULL_EMIRATES = ["Umm Al Quwain", "Al Hamriyah"];

export const ALL_EMIRATES = [
  { name: "Umm Al Quwain",  emoji: "🏘️", full: true,  grad: ["#8E1B3A", "#C72931"] },
  { name: "Al Hamriyah",    emoji: "🏝️", full: true,  grad: ["#0E7490", "#0891B2"] },
  { name: "Dubai",          emoji: "🏙️", full: false, grad: ["#1D4ED8", "#3B82F6"] },
  { name: "Abu Dhabi",      emoji: "🕌", full: false, grad: ["#0F766E", "#14B8A6"] },
  { name: "Sharjah",        emoji: "🌆", full: false, grad: ["#7E22CE", "#A855F7"] },
  { name: "Ajman",          emoji: "🌇", full: false, grad: ["#C2410C", "#EA580C"] },
  { name: "Ras Al Khaimah", emoji: "⛰️", full: false, grad: ["#15803D", "#22C55E"] },
  { name: "Fujairah",       emoji: "🏔️", full: false, grad: ["#B45309", "#F59E0B"] },
];

export async function getEmirate(): Promise<string | null> {
  const c = await cookies();
  return c.get("emirate")?.value ?? null;
}

// ── Emirate availability (admin /dashboard/emirates toggles) ──────────
// One cached fetch per request: top-level product categories and active
// vendor types, each carrying its `emirates` list. Every gate below
// derives from this, so the storefront and the mobile app read the same
// data the same way.

type AvailCategory = { id: string; name: string; emirates: string[] | null };
type AvailType = { slug: string; is_product: boolean | null; emirates: string[] | null };

export const getAvailability = cache(
  async (): Promise<{ categories: AvailCategory[]; types: AvailType[] }> => {
    try {
      const supabase = await createClient();
      const [cats, types] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name, emirates")
          .filter("parent_id", "is", null)
          .eq("is_active", true)
          .order("sort_order")
          .order("name"),
        supabase
          .from("vendor_types")
          .select("slug, is_product, emirates")
          .eq("is_active", true),
      ]);
      return {
        categories: (cats.data as AvailCategory[]) ?? [],
        types: (types.data as AvailType[]) ?? [],
      };
    } catch {
      return { categories: [], types: [] };
    }
  }
);

// null emirates = legacy default (UAQ / Al Hamriyah only) — matches the app
function inList(list: string[] | null, em: string): boolean {
  return list == null ? FULL_EMIRATES.includes(em) : list.includes(em);
}

// True when the selected emirate has any product experience enabled:
// any top-level product category OR any is_product vendor type whose
// `emirates` list includes it. Same definition as the mobile app's
// EmirateProvider.showProducts. Falls back to the legacy FULL_EMIRATES
// gate if the availability fetch failed, so a hiccup can never hide
// products for UAQ / Al Hamriyah.
export const showProducts = cache(async (): Promise<boolean> => {
  const em = await getEmirate();
  if (!em) return false;
  const { categories, types } = await getAvailability();
  if (categories.length === 0 && types.length === 0) {
    return FULL_EMIRATES.includes(em);
  }
  const catOn = categories.some((c) => inList(c.emirates, em));
  const typeOn = types.some((t) => t.is_product === true && inList(t.emirates, em));
  return catOn || typeOn;
});

// Service / vendor-type gate. Unknown slug -> visible (services have
// historically been available everywhere) — matches the app.
export const isTypeEnabled = cache(async (slug: string): Promise<boolean> => {
  const em = await getEmirate();
  if (!em) return false;
  const { types } = await getAvailability();
  const t = types.find((x) => x.slug === slug);
  if (!t) return true;
  return inList(t.emirates, em);
});

// Top-level product categories enabled for the current emirate, in
// display order — for the categories page grid and anywhere else that
// lists shoppable categories.
export const enabledProductCategories = cache(
  async (): Promise<{ id: string; name: string }[]> => {
    const em = await getEmirate();
    if (!em) return [];
    const { categories } = await getAvailability();
    return categories
      .filter((c) => inList(c.emirates, em))
      .map(({ id, name }) => ({ id, name }));
  }
);
