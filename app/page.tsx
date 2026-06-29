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
import { ProductCarousel, type CarouselProduct } from "@/components/product-carousel";
import { MidBanner, type BannerItem } from "@/components/mid-banner";
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

  // Category IDs for product carousels
  const CAT_ELECTRONICS  = "a1000000-0000-0000-0000-000000000001";
  const CAT_BABY         = "a1000000-0000-0000-0000-000000000006";
  const CAT_TOYS         = "a1000000-0000-0000-0000-000000000007";
  const CAT_HEALTH       = "a1000000-0000-0000-0000-000000000009";
  const CAT_STATIONERY   = "a1000000-0000-0000-0000-000000000010";
  const CAT_BOOKS        = "a1000000-0000-0000-0000-000000000011";
  const CAT_GROCERY      = "a1000000-0000-0000-0000-000000000002";
  const CAT_BEAUTY       = "a1000000-0000-0000-0000-000000000003";
  const CAT_HOME_KITCHEN = "a1000000-0000-0000-0000-000000000004";
  const CAT_FASHION      = "a1000000-0000-0000-0000-000000000005";

  function carouselSelect() {
    return supabase.from("products")
      .select("id, name, price, sale_price, thumbnail_url, images")
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(16);
  }

  const [
    { data: dealsRaw },
    { data: productsRaw },
    { data: bannersRaw },
    { data: electronicsRaw },
    { data: groceryRaw },
    { data: fashionRaw },
    { data: beautyRaw },
    { data: homeRaw },
    { data: babyRaw },
    { data: toysRaw },
    { data: healthRaw },
    { data: stationeryRaw },
    { data: booksRaw },
  ] = await Promise.all([
    supabase
      .from("deals")
      .select("id, title, deal_price, original_price, discount_pct, deal_image_url, products(thumbnail_url)")
      .eq("status", "active")
      .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12),

    supabase
      .from("products")
      .select("id, name, price, sale_price, thumbnail_url, images, is_featured, variants, requires_prescription, stock_quantity, track_stock, condition")
      .eq("status", "active")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(12),

    supabase
      .from("banners")
      .select("id, title, image_url, mobile_image_url, link_type, link_value, sort_order")
      .eq("is_active", true)
      .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(40),

    carouselSelect().eq("category_id", CAT_ELECTRONICS),
    carouselSelect().eq("category_id", CAT_GROCERY),
    carouselSelect().eq("category_id", CAT_FASHION),
    carouselSelect().eq("category_id", CAT_BEAUTY),
    carouselSelect().eq("category_id", CAT_HOME_KITCHEN),
    carouselSelect().eq("category_id", CAT_BABY),
    carouselSelect().eq("category_id", CAT_TOYS),
    carouselSelect().eq("category_id", CAT_HEALTH),
    carouselSelect().eq("category_id", CAT_STATIONERY),
    carouselSelect().eq("category_id", CAT_BOOKS),
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

  // Split banners by position (sort_order ranges)
  const allBanners = bannersRaw ?? [];
  const banners: BannerCard[] = allBanners.filter((b: Row) => !b.sort_order || b.sort_order <= 10).map((b: Row) => ({
    id: b.id, title: b.title, image_url: b.image_url, mobile_image_url: b.mobile_image_url ?? null, link_type: b.link_type, link_value: b.link_value,
  }));
  const bannersPos2: BannerItem[] = allBanners.filter((b: Row) => b.sort_order >= 11 && b.sort_order <= 20).map((b: Row) => ({
    id: b.id, title: b.title, image_url: b.image_url, mobile_image_url: b.mobile_image_url ?? null, link_type: b.link_type, link_value: b.link_value,
  }));
  const bannersPos3: BannerItem[] = allBanners.filter((b: Row) => b.sort_order >= 21 && b.sort_order <= 30).map((b: Row) => ({
    id: b.id, title: b.title, image_url: b.image_url, mobile_image_url: b.mobile_image_url ?? null, link_type: b.link_type, link_value: b.link_value,
  }));
  const bannersPos4: BannerItem[] = allBanners.filter((b: Row) => b.sort_order >= 31 && b.sort_order <= 40).map((b: Row) => ({
    id: b.id, title: b.title, image_url: b.image_url, mobile_image_url: b.mobile_image_url ?? null, link_type: b.link_type, link_value: b.link_value,
  }));

  function toCarousel(raw: Row[] | null): CarouselProduct[] {
    return (raw ?? []).map((p: Row) => ({
      id: p.id, name: p.name, price: p.price, sale_price: p.sale_price,
      thumbnail_url: p.thumbnail_url, images: p.images ?? null,
    }));
  }
  const electronicsProducts = toCarousel(electronicsRaw);
  const groceryProducts     = toCarousel(groceryRaw);
  const fashionProducts     = toCarousel(fashionRaw);
  const beautyProducts      = toCarousel(beautyRaw);
  const homeProducts        = toCarousel(homeRaw);
  const babyProducts        = toCarousel(babyRaw);
  const toysProducts        = toCarousel(toysRaw);
  const healthProducts      = toCarousel(healthRaw);
  const stationeryProducts  = toCarousel(stationeryRaw);
  const booksProducts       = toCarousel(booksRaw);

  return (
    <>
      {/* 1. Hero — banner carousel position 1 */}
      <HomeHero banners={banners} emirate={emirate} />

      {/* 2. Deals carousel — under hero */}
      <DealsStrip
        deals={deals}
        title={t("dealsStrip.title")}
        subtitle={t("dealsStrip.subtitle")}
        seeAll={t("common.seeAll")}
      />

      {/* 3. Category pills */}
      {/* <CategoryPills locale={locale} /> */}

      {/* 4. Quick access strip */}
      <QuickAccessStrip />

      {/* 5. Category explorer — services only */}
      <CategoryExplorer />

      {/* 6. Electronics carousel */}
      <ProductCarousel
        title="Electronics"
        eyebrow="Latest tech"
        emoji="📱"
        products={electronicsProducts}
        viewMoreHref={"/shop/electronics"}
        viewMoreLabel="View all Electronics"
      />

      {/* 7. Mid banner position 2 */}
      <MidBanner banners={bannersPos2} />

      {/* 8. Grocery carousel */}
      <ProductCarousel
        title="Grocery"
        eyebrow="Fresh & local"
        emoji="🛒"
        products={groceryProducts}
        viewMoreHref={"/shop/grocery"}
        viewMoreLabel="View all Grocery"
      />

      {/* 9. Coinback loyalty spotlight */}
      <CoinbackSpotlight />

      {/* 10. Featured products */}
      <FeaturedProducts products={products} />

      {/* 11. Mid banner position 3 */}
      <MidBanner banners={bannersPos3} />

      {/* 12. Fashion carousel */}
      <ProductCarousel
        title="Fashion"
        eyebrow="Style & trends"
        emoji="👗"
        products={fashionProducts}
        viewMoreHref={"/shop/fashion"}
        viewMoreLabel="View all Fashion"
      />

      {/* 13. Beauty & Fragrance carousel */}
      <ProductCarousel
        title="Beauty & Fragrance"
        eyebrow="Look & feel great"
        emoji="💎"
        products={beautyProducts}
        viewMoreHref={"/shop/beauty-fragrance"}
        viewMoreLabel="View all Beauty"
      />

      {/* 14. Mid banner position 4 */}
      <MidBanner banners={bannersPos4} />

      {/* 15. Home & Kitchen carousel */}
      <ProductCarousel
        title="Home & Kitchen"
        eyebrow="For your home"
        emoji="🏠"
        products={homeProducts}
        viewMoreHref={"/shop/home-kitchen"}
        viewMoreLabel="View all Home & Kitchen"
      />

      {/* 16. Featured listings — Real Estate */}
      <EditorialBand
        eyebrow="Featured listings"
        title={"Real estate —\nfind your home in UAQ."}
        body="Browse verified listings for apartments, villas and plots from trusted local sellers."
        ctaLabel="Browse Real Estate"
        ctaHref="/marketplace/real_estate"
        emoji="🏠"
        dark={true}
        flip={false}
        bgImage="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=600&fit=crop&auto=format"
      />

      {/* 17. Services editorial */}
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

      {/* 18. Explore UAQ stories */}
      <StoriesGrid />

      {/* 19. More category carousels */}
      <ProductCarousel
        title="Baby"
        eyebrow="For little ones"
        emoji="👶"
        products={babyProducts}
        viewMoreHref={"/shop/baby"}
        viewMoreLabel="View all Baby"
      />
      <ProductCarousel
        title="Toys & Games"
        eyebrow="Fun for all ages"
        emoji="🧸"
        products={toysProducts}
        viewMoreHref={"/shop/toys"}
        viewMoreLabel="View all Toys"
      />
      <ProductCarousel
        title="Health & Nutrition"
        eyebrow="Stay healthy"
        emoji="💪"
        products={healthProducts}
        viewMoreHref={"/shop/health-nutrition"}
        viewMoreLabel="View all Health"
      />
      <ProductCarousel
        title="Stationery & Office"
        eyebrow="Work & study"
        emoji="✏️"
        products={stationeryProducts}
        viewMoreHref={"/shop/stationery"}
        viewMoreLabel="View all Stationery"
      />
      <ProductCarousel
        title="Books"
        eyebrow="Read & learn"
        emoji="📚"
        products={booksProducts}
        viewMoreHref={"/shop/books"}
        viewMoreLabel="View all Books"
      />

      {/* 20. Vendor CTA */}
      <VendorCta />

      {/* 20. Trust band */}
      <TrustBand />

      {/* 21. App download CTA */}
      <AppDownloadCta />
    </>
  );
}
