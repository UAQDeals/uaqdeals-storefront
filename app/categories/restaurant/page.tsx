import { createClient } from "@/lib/supabase/server";
import { RestaurantClient } from "./client";

export const metadata = { title: "UAQ Food — Restaurants & Delivery" };
export const revalidate = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

const FOOD_IMAGES = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=400&fit=crop&auto=format",
];

export default async function RestaurantPage() {
  const supabase = await createClient();
  const { data: vendorTypeRow } = await supabase
    .from("vendor_types").select("id").eq("slug", "restaurant").maybeSingle();

  const { data: raw } = await supabase
    .from("vendors")
    .select("id, name, description, logo_url, rating, review_count, is_featured, emirate, vendor_types(vendor_kind)")
    .eq("vendor_type_id", vendorTypeRow?.id ?? "")
    .eq("status", "approved")
    .order("is_featured", { ascending: false })
    .order("rating", { ascending: false });

  const vendors = (raw ?? []).map((v: Row, i: number) => {
    const vk = (v.vendor_types as any)?.vendor_kind ?? "restaurant";
    return {
      id: v.id,
      name: v.name ?? "Restaurant",
      description: v.description ?? "",
      logo_url: v.logo_url ?? null,
      hero_url: FOOD_IMAGES[i % FOOD_IMAGES.length],
      rating: Number(v.rating ?? 0),
      review_count: Number(v.review_count ?? 0),
      is_featured: Boolean(v.is_featured),
      emirate: v.emirate ?? "Umm Al Quwain",
      is_dine_in: vk === "dine_in" || vk === "both",
      is_delivery: vk !== "dine_in",
    };
  });

  return <RestaurantClient vendors={vendors} />;
}
