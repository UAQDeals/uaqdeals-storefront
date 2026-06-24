import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarketplaceList } from "./marketplace-list";

export const dynamic = "force-dynamic";

const VERTICALS: Record<string, {
  table: string;
  title: string;
  emoji: string;
  categories: string[];
}> = {
  automotive: {
    table: "automotive_listings",
    title: "Automotive",
    emoji: "🚗",
    categories: ["Used Cars for Sale", "New Cars for Sale", "Export Cars for Sale", "Rental Cars", "Motorcycles for Sale"],
  },
  real_estate: {
    table: "real_estate_listings",
    title: "Real Estate",
    emoji: "🏠",
    categories: ["Property for Sale", "Property for Rent"],
  },
  used_items: {
    table: "used_item_listings",
    title: "Used Items",
    emoji: "📦",
    categories: ["Electronics", "Fashion & Accessories", "Home & Garden", "Furniture", "Sports & Outdoors", "Books & Media", "Baby & Kids", "Other"],
  },
  fancy_numbers: {
    table: "fancy_numbers_listings",
    title: "Fancy Numbers",
    emoji: "💎",
    categories: ["Mobile Numbers", "Vehicle Plates"],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ vertical: string }> }) {
  const { vertical } = await params;
  const cfg = VERTICALS[vertical];
  return { title: cfg ? `${cfg.title} — UAQ Deals` : "Marketplace — UAQ Deals" };
}

export default async function MarketplacePage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  const cfg = VERTICALS[vertical];
  if (!cfg) notFound();

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from(cfg.table)
    .select("*")
    .eq("status", "active")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  return (
    <MarketplaceList
      vertical={vertical}
      title={cfg.title}
      emoji={cfg.emoji}
      categories={cfg.categories}
      listings={listings ?? []}
    />
  );
}
