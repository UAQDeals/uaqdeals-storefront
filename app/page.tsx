import { createClient } from "@/lib/supabase/server";
import { showProducts as emirateShowProducts } from "@/lib/emirate";
import { getTranslations, getLocale } from "next-intl/server";
import { HomeBanners, type BannerCard } from "@/components/home-banners";
import { QuickAccessStrip } from "@/components/quick-access-strip";
import { DealsStrip, type DealCard } from "@/components/deals-strip";
import { EditorialBand } from "@/components/editorial-band";
import { FeaturedProducts, type ProductCard } from "@/components/featured-products";
import { StoriesGrid } from "@/components/stories-grid";
import { AppDownloadCta } from "@/components/app-download-cta";
import { TrustBand } from "@/components/trust-band";

export const revalidate = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function HomePage() {
  const supabase = await createClient();
  const t = await getTranslations();
  const locale = await getLocale();
  const nowIso = new Date().toISOString();
  const showProducts = await emirateShowProducts();

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
      {/* 3. Banner carousel (kept for admin-managed promos) */}
      <HomeBanners banners={banners} />

      {/* 4. Quick access: Fish · Pharmacy · Food */}
      <QuickAccessStrip />

      {/* 5. Flash deals horizontal scroll — products only */}
      {showProducts && (
        <DealsStrip
          deals={deals}
          title={t("dealsStrip.title")}
          subtitle={t("dealsStrip.subtitle")}
          seeAll={t("common.seeAll")}
        />
      )}

      {/* 6. Editorial band — Listings dark */}
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

      {/* 7. Featured products horizontal scroll — products only */}
      {showProducts && <FeaturedProducts products={products} />}

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

      <TrustBand />

      {/* 10. App download CTA */}
      <AppDownloadCta />
    </>
  );
}
