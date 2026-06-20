import { createClient } from "@/lib/supabase/server";
import { HomeHero } from "@/components/home-hero";
import { HomeBanners, type BannerCard } from "@/components/home-banners";
import { DealsStrip, type DealCard } from "@/components/deals-strip";
import { CategoriesGrid, type CategoryTile } from "@/components/categories-grid";
import {
  FeaturedProducts,
  type ProductCard,
} from "@/components/featured-products";

export const revalidate = 60; // ISR — refresh home data once a minute

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function HomePage() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [
    { data: dealsRaw },
    { data: vendorTypesRaw },
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
      .from("vendor_types")
      .select("id, name, slug, icon, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("name")
      .limit(12),

    supabase
      .from("products")
      .select(
        "id, name, price, sale_price, thumbnail_url, images, is_featured"
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

  const categories: CategoryTile[] = (vendorTypesRaw ?? []).map((v: Row) => ({
    id: v.id,
    name: v.name,
    slug: v.slug,
    icon: v.icon ?? null,
  }));

  const products: ProductCard[] = (productsRaw ?? []).map((p: Row) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    sale_price: p.sale_price,
    thumbnail_url: p.thumbnail_url,
    images: p.images ?? null,
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
      <HomeHero />
      <HomeBanners banners={banners} />
      <DealsStrip deals={deals} />
      <CategoriesGrid items={categories} />
      <FeaturedProducts products={products} />
    </>
  );
}
