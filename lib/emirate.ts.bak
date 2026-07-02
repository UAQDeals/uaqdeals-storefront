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

// True when the selected emirate has at least one active PRODUCT vendor type
// (vendor_kind 'product' or null) whose `emirates` list includes it. This makes
// the products-vs-services gate data-driven: enabling a product vendor type for,
// say, Dubai in the admin will automatically light up the products home there.
// Falls back to the legacy FULL_EMIRATES gate if the query can't run, so a hiccup
// can never hide products for UAQ / Al Hamriyah.
export const showProducts = cache(async (): Promise<boolean> => {
  const em = await getEmirate();
  if (!em) return false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vendor_types")
      .select("id")
      .eq("is_active", true)
      .or("vendor_kind.eq.product,vendor_kind.is.null")
      .contains("emirates", [em])
      .limit(1);
    if (error) return FULL_EMIRATES.includes(em);
    return (data?.length ?? 0) > 0;
  } catch {
    return FULL_EMIRATES.includes(em);
  }
});
