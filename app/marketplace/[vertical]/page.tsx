import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { MarketplaceList } from "./marketplace-list";
import { MarketplaceNav } from "./marketplace-nav";
import { CategoryHero } from "@/components/category-hero";
import { Reveal } from "@/components/reveal";
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
      <>
      <MarketplaceNav active={vertical} isRTL={isRTL} />
      <div className="mx-auto max-w-2xl px-5 md:px-8 pt-12 pb-20 text-center">
        <Reveal>
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-3xl">📱</span>
          <h1 className="font-display mt-6 text-[30px] font-semibold leading-tight tracking-tight text-[color:var(--ink)] sm:text-[38px]">
            {isRTL ? "بيع أجهزتك الإلكترونية" : "Sell Your Electronic Devices"}
          </h1>
          <span className="gold-rule mx-auto mt-5 block h-px w-24" />
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-[color:var(--brand-muted)]">
            {isRTL ? "لديك هاتف أو جهاز لوحي أو حاسوب محمول أو جهاز لم تعد بحاجة إليه؟" : "Got a phone, tablet, laptop, or gadget you no longer need?"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-[color:var(--brand-muted)]">
            {isRTL ? (
              <>
                أرسل جهازك — بمجرد مراجعة فريقنا والموافقة عليه، سيتم إدراجه في متجر UAQ Deals مع شارة <span className="font-semibold text-[color:var(--brand-maroon)]">مستعمل</span> ليجده المشترون.
              </>
            ) : (
              <>
                Submit your device — once our team reviews and approves it, it will be listed in the UAQ Deals shop with a <span className="font-semibold text-[color:var(--brand-maroon)]">USED</span> badge for buyers to find.
              </>
            )}
          </p>
        </Reveal>

        <Reveal delay={90} className="premium-card mt-8 p-6 text-start sm:p-7">
          <p className="eyebrow">{isRTL ? "كيف تعمل الخدمة" : "How it works"}</p>
          <div className="mt-4 space-y-4">
            {[
              isRTL ? "أدخل تفاصيل جهازك وارفع الصور" : "Fill in your device details and upload photos",
              isRTL ? "يراجع فريقنا طلبك ويحدد سعراً عادلاً" : "Our team reviews your submission and sets a fair price",
              isRTL ? "يُنشر جهازك في المتجر — ويتواصل معنا المشترون مباشرة" : "Your device goes live in the shop — buyers contact us directly",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3.5">
                <span className="bg-brand-gradient flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm">{i + 1}</span>
                <p className="pt-0.5 text-[14px] leading-relaxed text-neutral-700">{step}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={160}>
          <Link
            href="/marketplace/used_items/sell"
            className="bg-brand-gradient mt-8 inline-flex items-center rounded-full px-8 py-3.5 text-[14px] font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110"
          >
            {isRTL ? "أدرج جهازي ←" : "List My Device →"}
          </Link>
        </Reveal>
      </div>
      </>
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
      <MarketplaceNav active={vertical} isRTL={isRTL} />
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
