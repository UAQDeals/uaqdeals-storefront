import { createClient } from "@/lib/supabase/server";
import { getEmirate, showProducts as emirateShowProducts, enabledProductCategories, isTypeEnabled } from "@/lib/emirate";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { type BannerCard } from "@/components/home-banners";
import { HomeHero } from "@/components/home-hero";
import { QuickAccessStrip } from "@/components/quick-access-strip";
import { DealsStrip, type DealCard } from "@/components/deals-strip";
import { EditorialBand } from "@/components/editorial-band";
import { ProductCarousel, type CarouselProduct } from "@/components/product-carousel";
import { MidBanner, type BannerItem } from "@/components/mid-banner";
import { StoriesGrid } from "@/components/stories-grid";
import { AppDownloadCta } from "@/components/app-download-cta";
import { TrustBand } from "@/components/trust-band";
import { ServiceHero } from "@/components/service-hero";
import { ServiceQuickAccess } from "@/components/service-quick-access";
import { ServiceRail, TravelButtons, SellGadgetsBanner } from "@/components/home-service-blocks";
import { dedicatedFor } from "@/lib/service-routes";

export const revalidate = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

const SLUG_EMOJI: Record<string, string> = {
  real_estate: "🏠", automotive: "🚗", fancy_numbers: "💎", used_items: "📦",
  explore_uaq: "🧭", zoo_events: "🎟️", typing_center: "✍️", business_setup: "📋",
  mobile_repair: "🔧", pest_control: "🐜", home_services: "🛠️", construction_painting: "🏗️",
  cleaning_service: "🧹", tailor_shop: "🧵", barber_shop: "💈", clinics: "🩺", job_portal: "👔",
  hotel_booking: "🏨", flight_booking: "✈️", web_dev_design: "🌐", mobile_app_dev: "📱",
  ecommerce_dev: "🛒", ecommerce_management: "📊", accounting_software: "📈",
  custom_software: "💻", seo_content: "📝", social_media_mgmt: "📣",
};

function serviceHref(slug: string): string {
  const d = dedicatedFor(slug);
  if (d) return d;
  if (["real_estate", "automotive", "fancy_numbers", "used_items"].includes(slug)) return `/marketplace/${slug}`;
  return `/categories/${slug}`;
}

export default async function HomePage() {
  const showProducts = await emirateShowProducts();

  // ── Services-only emirates: a distinct services home. ──
  if (!showProducts) {
    return (
      <>
        <ServiceHero />
        <ServiceQuickAccess />
        <EditorialBand
          eyebrow="Book in seconds"
          title={"Trusted services,\nright at your doorstep."}
          body="Cleaning, pest control, home repairs, mobile fix, tailoring, business setup and more — browse verified service providers across the UAE."
          ctaLabel="Browse services"
          ctaHref="/services"
          emoji="🔧"
          dark={false}
          flip={true}
        />
        <EditorialBand
          eyebrow="Featured listings"
          title={"Real estate, cars & more —\nfind it locally."}
          body="Browse verified listings for apartments, villas, used cars, fancy numbers and pre-owned items from trusted local sellers."
          ctaLabel="Browse listings"
          ctaHref="/marketplace/real_estate"
          emoji="🏠"
          dark={true}
          flip={false}
        />
        <StoriesGrid />
        <TrustBand />
        <AppDownloadCta />
      </>
    );
  }

  // ── Full emirates: CONFIG-DRIVEN home from `home_sections` ──
  //    The admin /dashboard/home-screen controls the app AND the web from the
  //    same table: section order, which category/service carousels appear, etc.
  const supabase = await createClient();
  const t = await getTranslations();
  const emirate = await getEmirate();
  const nowIso = new Date().toISOString();
  const enabledCats = await enabledProductCategories();
  const enabledNames = new Set(enabledCats.map((c) => c.name));

  // Admin-managed section order
  const { data: sectionsRaw } = await supabase
    .from("home_sections")
    .select("section_key, section_type, config, sort_order, is_enabled")
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true });
  const sections = (sectionsRaw ?? []) as Row[];

  // Root categories: name -> { id, slug }
  const { data: catsRaw } = await supabase
    .from("categories")
    .select("id, name, slug")
    .is("parent_id", null)
    .eq("is_active", true);
  const catByName = new Map<string, { id: string; slug: string }>();
  for (const c of (catsRaw ?? []) as Row[]) catByName.set(c.name, { id: c.id, slug: c.slug });

  // Category names the config needs (enabled for this emirate)
  const neededCats = Array.from(
    new Set(
      sections
        .filter((s) => s.section_type === "category_carousel")
        .map((s) => s.config?.category_name as string | undefined)
        .filter((n): n is string => !!n && enabledNames.has(n) && catByName.has(n))
    )
  );

  // Fetch category products + banners + deals in parallel
  const [catResults, { data: bannersRaw }, { data: dealsRaw }] = await Promise.all([
    Promise.all(
      neededCats.map(async (name) => {
        const cat = catByName.get(name)!;
        const { data } = await supabase
          .from("products")
          .select("id, name, price, sale_price, thumbnail_url, images")
          .eq("status", "active")
          .eq("category_id", cat.id)
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(16);
        return [name, (data ?? []) as Row[]] as const;
      })
    ),
    supabase
      .from("banners")
      .select("id, title, image_url, mobile_image_url, link_type, link_value, sort_order, emirates")
      .eq("is_active", true)
      .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .limit(90),
    supabase
      .from("deals")
      .select("id, title, deal_price, original_price, discount_pct, deal_image_url, products(thumbnail_url)")
      .eq("status", "active")
      .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const catProducts = new Map<string, CarouselProduct[]>();
  for (const [name, raw] of catResults) {
    catProducts.set(
      name,
      raw.map((p) => ({
        id: p.id, name: p.name, price: p.price, sale_price: p.sale_price,
        thumbnail_url: p.thumbnail_url, images: p.images ?? null,
      }))
    );
  }

  const deals: DealCard[] = (dealsRaw ?? []).map((d: Row) => ({
    id: d.id, title: d.title ?? "Deal", deal_price: d.deal_price, original_price: d.original_price,
    discount_pct: d.discount_pct, deal_image_url: d.deal_image_url, product_thumb: d.products?.thumbnail_url ?? null,
  }));

  // Banners filtered to this emirate; grouped by 10-wide position buckets.
  const allBanners = ((bannersRaw ?? []) as Row[]).filter((b) => {
    const list = b.emirates;
    if (Array.isArray(list) && list.length > 0) return emirate ? list.includes(emirate) : false;
    return true;
  });
  const toBannerItem = (b: Row): BannerItem => ({
    id: b.id, title: b.title, image_url: b.image_url, mobile_image_url: b.mobile_image_url ?? null,
    link_type: b.link_type, link_value: b.link_value,
  });
  const bannersAt = (pos: number) => {
    const lo = (pos - 1) * 10 + 1;
    const hi = pos * 10;
    return allBanners.filter((b) => (b.sort_order ?? 0) >= lo && (b.sort_order ?? 0) <= hi).map(toBannerItem);
  };
  const pos1Banners: BannerCard[] = allBanners
    .filter((b) => !b.sort_order || b.sort_order <= 10)
    .map((b) => ({
      id: b.id, title: b.title, image_url: b.image_url, mobile_image_url: b.mobile_image_url ?? null,
      link_type: b.link_type, link_value: b.link_value,
    }));

  // Hero chips + quick-access tiles (emirate-gated)
  const heroChips = [
    ...(enabledNames.has("Grocery") ? [{ label: "Grocery", href: "/shop/grocery" }] : []),
    ...((await isTypeEnabled("restaurant")) ? [{ label: "Restaurants", href: "/categories/restaurant" }] : []),
    ...(enabledNames.has("Pharmacy") ? [{ label: "Pharmacy", href: "/categories/pharmacy" }] : []),
    ...(enabledNames.has("Electronics") ? [{ label: "Electronics", href: "/shop/electronics" }] : []),
    { label: "Services", href: "/services" },
    ...((await isTypeEnabled("real_estate")) ? [{ label: "Real Estate", href: "/marketplace/real_estate" }] : []),
  ];
  const quickTiles = [
    ...((await isTypeEnabled("fish_market")) ? ["fish"] : []),
    ...(enabledNames.has("Pharmacy") ? ["pharmacy"] : []),
    ...((await isTypeEnabled("restaurant")) ? ["food"] : []),
  ];

  // ── Render sections in the admin-defined order ──
  const out: ReactNode[] = [];
  let travelDone = false;
  for (const s of sections) {
    const type = s.section_type as string;
    const key = s.section_key as string;
    const cfg = (s.config ?? {}) as Row;

    if (key === "banner_top") {
      out.push(<HomeHero key={key} banners={pos1Banners} emirate={emirate} chips={heroChips} />);
    } else if (type === "banner_pos") {
      const b = bannersAt(Number(cfg.pos) || 0);
      if (b.length) out.push(<MidBanner key={`bp-${cfg.pos}`} banners={b} />);
    } else if (key === "flash_deals" || type === "flash_deals") {
      out.push(
        <DealsStrip key="deals" deals={deals} title={t("dealsStrip.title")} subtitle={t("dealsStrip.subtitle")} seeAll={t("common.seeAll")} />
      );
    } else if (key === "quick_access_tiles") {
      out.push(<QuickAccessStrip key="qat" visible={quickTiles} />);
    } else if (key === "quick_services") {
      out.push(<ServiceQuickAccess key="qs" />);
    } else if (type === "category_carousel") {
      const name = cfg.category_name as string | undefined;
      if (name && enabledNames.has(name)) {
        const prods = catProducts.get(name) ?? [];
        if (prods.length) {
          const cat = catByName.get(name);
          out.push(
            <ProductCarousel
              key={`cc-${name}`}
              title={name}
              products={prods}
              viewMoreHref={cat ? `/shop/${cat.slug}` : "/products"}
              viewMoreLabel={`View all ${name}`}
            />
          );
        }
      }
    } else if (type === "service_carousel") {
      const slug = cfg.slug as string | undefined;
      const name = (cfg.vendor_type_name as string | undefined) ?? slug ?? "Service";
      if (slug === "flight_booking" || slug === "hotel_booking") {
        if (!travelDone) {
          const sf = await isTypeEnabled("flight_booking");
          const sh = await isTypeEnabled("hotel_booking");
          if (sf || sh) {
            travelDone = true;
            out.push(<TravelButtons key="travel" showFlight={sf} showHotel={sh} />);
          }
        }
      } else if (slug && (await isTypeEnabled(slug))) {
        if (slug === "used_items") {
          out.push(<SellGadgetsBanner key="sell" />);
        } else {
          out.push(<ServiceRail key={`svc-${slug}`} title={name} href={serviceHref(slug)} emoji={SLUG_EMOJI[slug] ?? "🧩"} />);
        }
      }
    }
  }

  return <>{out}</>;
}
