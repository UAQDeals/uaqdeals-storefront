import { createClient } from "@/lib/supabase/server";
import { getEmirate, showProducts as emirateShowProducts } from "@/lib/emirate";
import { getTranslations, getLocale } from "next-intl/server";
import { type BannerCard } from "@/components/home-banners";
import { HomeHero } from "@/components/home-hero";
import { CategoryExplorer } from "@/components/category-explorer";
import { QuickAccessStrip } from "@/components/quick-access-strip";
import { DealsStrip, type DealCard } from "@/components/deals-strip";
import { EditorialBand } from "@/components/editorial-band";
import { FeaturedProducts, type ProductCard } from "@/components/featured-products";
import { CoinbackSpotlight } from "@/components/coinback-spotlight";
import { StoriesGrid } from "@/components/stories-grid";
import { VendorCta } from "@/components/vendor-cta";
import { AppDownloadCta } from "@/components/app-download-cta";
import { TrustBand } from "@/components/trust-band";
import { ServiceHero } from "@/components/service-hero";
import { ServiceQuickAccess } from "@/components/service-quick-access";

export const revalidate = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function HomePage() {
  const showProducts = await emirateShowProducts();

  // ── Services-only emirates: a distinct services home.
  //    No product banners, no deals, no featured products. ──
  if (!showProducts) {
    return (
      <>
        <ServiceHero />
        <ServiceQuickAccess />

        {/* Services editorial */}
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

        {/* Listings / marketplace editorial */}
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

        {/* Stories / Explore UAQ */}
        <StoriesGrid />

        <TrustBand />

        <AppDownloadCta />
      </>
    );
  }

  // ── Full emirates (UAQ + Al Hamriyah): products + services home ──
  const supabase = await createClient();
  const t = await getTranslations();
  const locale = await getLocale();
  const emirate = await getEmirate();
  const nowIso = new Date().toISOString();

  const [
    { data: dealsRaw },
    { data: productsRaw },
    { data: bannersRaw },
  ] = await Promise.all([
    supabase
      .from("deals")
      .select(
        "id, title, deal_price, original_price, discount_pct, deal_image_url, products(thumbnail_url)"
      )
      .eq("status", "active")
      .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12),

    supabase
      .from("products")
      .select(
        "id, name, price, sale_price, thumbnail_url, images, is_featured, variants, requires_prescription, stock_quantity, track_stock, condition"
      )
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12),

    supabase
      .from("banners")
      .select("id, title, image_url, link_type, link_value, sort_order")
      .eq("is_active", true)
      .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const deals: DealCard[] = (dealsRaw ?? []).map((d: Row) => ({
    id: d.id,
    title: d.title ?? "Deal",
    deal_price: d.deal_price,
    original_price: d.original_price,
    discount_pct: d.discount_pct,
    deal_image_url: d.deal_image_url,
    product_thumb: d.products?.thumbnail_url ?? null,
  }));

  const products: ProductCard[] = (productsRaw ?? []).map((p: Row) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    sale_price: p.sale_price,
    thumbnail_url: p.thumbnail_url,
    images: p.images ?? null,
    variants: p.variants ?? null,
    requires_prescription: p.requires_prescription ?? false,
    stock_quantity: p.stock_quantity ?? null,
    track_stock: p.track_stock ?? false,
    condition: p.condition ?? null,
  }));

  const banners: BannerCard[] = (bannersRaw ?? []).map((b: Row) => ({
    id: b.id,
    title: b.title,
    image_url: b.image_url,
    link_type: b.link_type,
    link_value: b.link_value,
  }));

  return (
    <>
      {/* 1. Hero — gradient, search, chips, banner carousel */}
      <HomeHero banners={banners} emirate={emirate} />

      {/* 2. Category explorer */}
      <CategoryExplorer />

      {/* 3. Quick access: Fish · Pharmacy · Food */}
      <QuickAccessStrip />

      {/* 4. Flash deals */}
      <DealsStrip
        deals={deals}
        title={t("dealsStrip.title")}
        subtitle={t("dealsStrip.subtitle")}
        seeAll={t("common.seeAll")}
      />

      {/* 5. Featured products */}
      <FeaturedProducts products={products} />

      {/* 6. Coinback loyalty spotlight */}
      <CoinbackSpotlight />

      {/* 7. Editorial band — Listings dark */}
      <EditorialBand
        eyebrow="Featured listings"
        title={"Real estate, cars & more —\nall in UAQ."}
        body="Browse verified listings for apartments, villas, used cars, fancy numbers and pre-owned items — all from trusted local sellers."
        ctaLabel="Browse listings"
        ctaHref="/categories/real_estate"
        emoji="🏠"
        dark={true}
        flip={false}
      />

      {/* 8. Editorial band — Services light */}
      <EditorialBand
        eyebrow="Book in seconds"
        title={"Trusted services,\nright at your doorstep."}
        body="Cleaning, pest control, home repairs, mobile fix, tailoring and more — browse verified service providers across UAQ."
        ctaLabel="Browse services"
        ctaHref="/services"
        emoji="🔧"
        dark={false}
        flip={true}
      />

      {/* 9. Stories / Explore UAQ grid */}
      <StoriesGrid />

      {/* 10. Vendor CTA */}
      <VendorCta />

      {/* 11. Trust band */}
      <TrustBand />

      {/* 12. App download CTA */}
      <AppDownloadCta />
    </>
  );
}
