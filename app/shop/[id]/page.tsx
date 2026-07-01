import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobileCategoryNoon } from "./mobile-category-noon";
import { CategoryHero, subtitleFor } from "@/components/category-hero";
import { ShopCategoryDesktop } from "./shop-category-desktop";
import { TrendingNow } from "@/components/trending-now";
import type { ProductCard } from "@/components/featured-products";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const { data } = await supabase.from("categories").select("name")
    .eq(isUuid ? "id" : "slug", id).maybeSingle();
  return { title: data?.name ? data.name + " — UAQ Deals" : "Shop — UAQ Deals" };
}

export default async function ShopDrillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Accept either UUID or slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const catQuery = isUuid
    ? supabase.from("categories").select("id, name, parent_id, slug").eq("id", id).maybeSingle()
    : supabase.from("categories").select("id, name, parent_id, slug").eq("slug", id).maybeSingle();

  // Fetch trending items for electronics category
  const trendingQuery = supabase
    .from("trending_products")
    .select("rank, search_term, catalog:catalog_id(id, title, brand, main_image_url)")
    .order("rank", { ascending: true })
    .limit(20);

  const [{ data: catRaw }, { data: trendingRaw }] = await Promise.all([catQuery, trendingQuery]);
  const trendingItems = (trendingRaw ?? []) as any[];
  const cat = catRaw;

  if (!cat) notFound();

  // Redirect slug URLs to canonical slug (avoid UUID in URL)
  // If accessed via UUID, redirect to slug URL for SEO
  if (isUuid && cat.slug && cat.slug !== id) {
    redirect("/shop/" + cat.slug);
  }

  const { data: children } = await supabase
    .from("categories").select("id, name, slug").eq("parent_id", cat.id)
    .eq("is_active", true).order("sort_order").order("name");
  if (!children || children.length === 0) redirect("/products?cat=" + id);

  // Build breadcrumb
  const breadcrumb: { id: string; name: string }[] = [{ id: cat.id, name: cat.name }];
  let current = cat;
  while (current.parent_id) {
    const { data: parent } = await supabase.from("categories")
      .select("id, name, parent_id, slug").eq("id", current.parent_id).maybeSingle();
    if (!parent) break;
    breadcrumb.unshift({ id: parent.id, name: parent.name });
    current = parent;
  }


  // ── Desktop (Noon-style): products across this category's whole subtree, plus
  //    a representative product image per subcategory. Products attach via
  //    category_id; the tree is walked via parent_id. ──
  const { data: allCats } = await supabase.from("categories").select("id, name, parent_id, sort_order");
  const childrenMap = new Map<string, string[]>();
  for (const c of allCats ?? []) {
    if (!c.parent_id) continue;
    const arr = childrenMap.get(c.parent_id) ?? [];
    arr.push(c.id);
    childrenMap.set(c.parent_id, arr);
  }
  const descendantsOf = (root: string): Set<string> => {
    const out = new Set<string>([root]);
    const stack = [root];
    while (stack.length) {
      const cur = stack.pop() as string;
      for (const ch of childrenMap.get(cur) ?? []) {
        if (!out.has(ch)) { out.add(ch); stack.push(ch); }
      }
    }
    return out;
  };
  const subtreeIds = Array.from(descendantsOf(id));

  const { data: gridRaw } = await supabase
    .from("products")
    .select("id, name, price, sale_price, thumbnail_url, images, condition, track_stock, stock_quantity, requires_prescription, variants, category_id")
    .in("category_id", subtreeIds)
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(24);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gridProducts: ProductCard[] = (gridRaw ?? []).map((p: any) => ({
    id: p.id, name: p.name, price: p.price, sale_price: p.sale_price,
    thumbnail_url: p.thumbnail_url, images: p.images ?? null, variants: p.variants ?? null,
    requires_prescription: p.requires_prescription ?? false,
    stock_quantity: p.stock_quantity ?? null, track_stock: p.track_stock ?? false,
    condition: p.condition ?? null,
  }));

  const { data: thumbRaw } = await supabase
    .from("products")
    .select("category_id, thumbnail_url")
    .in("category_id", subtreeIds)
    .eq("status", "active")
    .not("thumbnail_url", "is", null)
    .limit(500);
  const railImages: Record<string, string | null> = {};
  for (const child of children ?? []) {
    const desc = descendantsOf(child.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pics = (thumbRaw ?? []).filter((p: any) => desc.has(p.category_id) && p.thumbnail_url).map((p: any) => p.thumbnail_url as string);
    railImages[child.id] = pics.length ? pics[Math.floor(Math.random() * pics.length)] : null;
  }

  // ── Mobile (Noon-style): department rail (all top-level categories) + each
  //    subcategory as an accordion of its sub-subcategories (image per tile). ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortCat = (a: any, b: any) =>
    ((a.sort_order ?? 0) as number) - ((b.sort_order ?? 0) as number) ||
    String(a.name).localeCompare(String(b.name));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topCategories = ((allCats ?? []) as any[])
    .filter((c) => !c.parent_id)
    .sort(sortCat)
    .map((c) => ({ id: c.id as string, name: c.name as string }));
  const activeTopId = breadcrumb[0]?.id ?? id;
  const sections = (children ?? []).map((child) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const grand = ((allCats ?? []) as any[])
      .filter((c) => c.parent_id === child.id)
      .sort(sortCat)
      .map((g) => {
        const desc = descendantsOf(g.id as string);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pics = (thumbRaw ?? [])
          .filter((p: any) => desc.has(p.category_id) && p.thumbnail_url)
          .map((p: any) => p.thumbnail_url as string);
        return {
          id: g.id as string,
          name: g.name as string,
          image: pics.length ? pics[Math.floor(Math.random() * pics.length)] : null,
        };
      });
    return { id: child.id as string, name: child.name as string, children: grand };
  });

  // Top-level slug for conditional trending row
  const topSlug = cat.slug ?? breadcrumb[0]?.name?.toLowerCase().replace(/\s+/g, "-") ?? "";

  return (
    <>
      {/* Hero: desktop only — mobile uses the in-column banner */}
      <div className="hidden md:block">
        <CategoryHero title={cat.name} />
      </div>
      {/* Trending Now — shows on both mobile and desktop for electronics */}
      {topSlug === "electronics" && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <TrendingNow />
        </div>
      )}
      {/* Mobile: Noon department rail + subcategory accordions */}
      <div className="md:hidden">
        <MobileCategoryNoon
          topCategories={topCategories}
          activeTopId={activeTopId}
          category={cat}
          subtitle={subtitleFor(cat.name)}
          sections={sections}
          trendingItems={topSlug === "electronics" ? trendingItems : []}
        />
      </div>
      {/* Desktop: flat subcategory landing */}
      <div className="hidden md:block">
        <ShopCategoryDesktop
          category={cat}
          children={children}
          breadcrumb={breadcrumb}
          products={gridProducts}
          railImages={railImages}
        />
      </div>
    </>
  );
}
