import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { MarketplaceList } from "./marketplace-list";
import { CategoryHero } from "@/components/category-hero";
import Link from "next/link";

export const dynamic = "force-dynamic";

const VERTICALS: Record<string, {
  table: string;
  title: string;
  titleAr: string;
  emoji: string;
  categories: string[];
  landingOnly?: boolean;
}> = {
  automotive: {
    table: "automotive_listings",
    title: "Automotive",
    titleAr: "السيارات",
    emoji: "🚗",
    categories: ["Used Cars for Sale", "New Cars for Sale", "Export Cars for Sale", "Rental Cars", "Motorcycles for Sale"],
  },
  real_estate: {
    table: "real_estate_listings",
    title: "Real Estate",
    titleAr: "العقارات",
    emoji: "🏠",
    categories: ["Property for Sale", "Property for Rent"],
  },
  used_items: {
    table: "",
    title: "Sell Your Electronic Devices",
    titleAr: "بيع أجهزتك الإلكترونية",
    emoji: "📱",
    categories: [],
    landingOnly: true,
  },
  fancy_numbers: {
    table: "fancy_numbers_listings",
    title: "Fancy Numbers",
    titleAr: "الأرقام المميزة",
    emoji: "💎",
    categories: ["Mobile Numbers", "Vehicle Plates"],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ vertical: string }> }) {
  const { vertical } = await params;
  const cfg = VERTICALS[vertical];
  const isRTL = (await getLocale()) === "ar";
  if (!cfg) return { title: isRTL ? "المتجر — UAQ Deals" : "Marketplace — UAQ Deals" };
  return { title: `${isRTL ? cfg.titleAr : cfg.title} — UAQ Deals` };
}

export default async function MarketplacePage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  const cfg = VERTICALS[vertical];
  if (!cfg) notFound();

  const isRTL = (await getLocale()) === "ar";

  // Used items: landing page only — items surface in the main shop with USED badge
  if (cfg.landingOnly) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mb-6 text-6xl">📱</div>
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-3">
          {isRTL ? "بيع أجهزتك الإلكترونية" : "Sell Your Electronic Devices"}
        </h1>
        <p className="text-neutral-500 text-base mb-2">
          {isRTL ? "لديك هاتف أو جهاز لوحي أو حاسوب محمول أو جهاز لم تعد بحاجة إليه؟" : "Got a phone, tablet, laptop, or gadget you no longer need?"}
        </p>
        <p className="text-neutral-500 text-base mb-8">
          {isRTL ? (
            <>
              أرسل جهازك — بمجرد مراجعة فريقنا والموافقة عليه، سيتم إدراجه في متجر UAQ Deals مع شارة <span className="font-semibold text-[#C72931]">مستعمل</span> ليجده المشترون.
            </>
          ) : (
            <>
              Submit your device — once our team reviews and approves it, it will be listed in the UAQ Deals shop with a <span className="font-semibold text-[#C72931]">USED</span> badge for buyers to find.
            </>
          )}
        </p>
        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 mb-8 text-start space-y-3">
          <p className="font-semibold text-neutral-800 text-sm">{isRTL ? "كيف تعمل الخدمة" : "How it works"}</p>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#C72931] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <p className="text-sm text-neutral-600">{isRTL ? "أدخل تفاصيل جهازك وارفع الصور" : "Fill in your device details and upload photos"}</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#C72931] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <p className="text-sm text-neutral-600">{isRTL ? "يراجع فريقنا طلبك ويحدد سعراً عادلاً" : "Our team reviews your submission and sets a fair price"}</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#C72931] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <p className="text-sm text-neutral-600">{isRTL ? "يُنشر جهازك في المتجر — ويتواصل معنا المشترون مباشرة" : "Your device goes live in the shop — buyers contact us directly"}</p>
          </div>
        </div>
        <Link
          href="/marketplace/used_items/sell"
          className="inline-block rounded-xl bg-gradient-to-r from-[#8E1B3A] to-[#C72931] px-8 py-3.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-opacity"
        >
          {isRTL ? "أدرج جهازي ←" : "List My Device →"}
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
    <>
      <CategoryHero title={isRTL ? cfg.titleAr : cfg.title} />
      <MarketplaceList
        vertical={vertical}
        title={isRTL ? cfg.titleAr : cfg.title}
        emoji={cfg.emoji}
        categories={cfg.categories}
        listings={listings ?? []}
      />
    </>
  );
}
