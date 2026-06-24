import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarketplaceList } from "./marketplace-list";
import Link from "next/link";

export const dynamic = "force-dynamic";

const VERTICALS: Record<string, {
  table: string;
  title: string;
  emoji: string;
  categories: string[];
  landingOnly?: boolean;
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
    table: "",
    title: "Sell Your Electronic Devices",
    emoji: "📱",
    categories: [],
    landingOnly: true,
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

  // Used items: landing page only — items surface in the main shop with USED badge
  if (cfg.landingOnly) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mb-6 text-6xl">📱</div>
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-3">
          Sell Your Electronic Devices
        </h1>
        <p className="text-neutral-500 text-base mb-2">
          Got a phone, tablet, laptop, or gadget you no longer need?
        </p>
        <p className="text-neutral-500 text-base mb-8">
          Submit your device — once our team reviews and approves it, it will be listed in the UAQ Deals shop with a <span className="font-semibold text-[#C72931]">USED</span> badge for buyers to find.
        </p>
        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 mb-8 text-left space-y-3">
          <p className="font-semibold text-neutral-800 text-sm">How it works</p>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#C72931] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <p className="text-sm text-neutral-600">Fill in your device details and upload photos</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#C72931] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <p className="text-sm text-neutral-600">Our team reviews your submission and sets a fair price</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#C72931] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <p className="text-sm text-neutral-600">Your device goes live in the shop — buyers contact us directly</p>
          </div>
        </div>
        <Link
          href="/marketplace/used_items/sell"
          className="inline-block rounded-xl bg-gradient-to-r from-[#8E1B3A] to-[#C72931] px-8 py-3.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-opacity"
        >
          List My Device →
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from(cfg.table)
    .select("*")
    .in("status", ["active", "sold"])
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
