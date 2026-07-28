import { notFound, redirect } from "next/navigation";
import { dedicatedFor } from "@/lib/service-routes";
import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  FeaturedProducts,
  type ProductCard,
} from "@/components/featured-products";
import { TrendingNow } from "@/components/trending-now";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendor_types")
    .select("name")
    .eq("slug", slug)
    .maybeSingle();
  return { title: data?.name ?? "Category" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // If this slug has a dedicated /services/ page, forward there.
  const dedicated = dedicatedFor(slug);
  if (dedicated) redirect(dedicated);

  const supabase = await createClient();

  // If this slug exists in the product catalog (categories table), send to
  // the richer /shop/[slug] page instead of the vendor-type page.
  const { data: catalogCat } = await supabase
    .from("categories")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();
  if (catalogCat) redirect("/shop/" + slug);

  const { data: vt } = await supabase
    .from("vendor_types")
    .select("id, name, slug, description, is_product")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!vt) notFound();

  // Vendors that belong to this type — for product filter
  const { data: vendorsInType } = await supabase
    .from("vendors")
    .select("id")
    .eq("vendor_type_id", vt.id);
  const vendorIds: string[] = (vendorsInType ?? []).map((v: Row) => v.id);

  let products: ProductCard[] = [];
  if (vendorIds.length) {
    const { data: prodRaw } = await supabase
      .from("products")
      .select("id, name, price, sale_price, thumbnail_url, images, variants, requires_prescription, stock_quantity, track_stock, condition, product_options(id)")
      .in("vendor_id", vendorIds)
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(48);

    products = (prodRaw ?? []).map((p: Row) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      sale_price: p.sale_price,
      thumbnail_url: p.thumbnail_url,
      images: p.images ?? null,
      variants: p.variants ?? null,
      product_options: p.product_options ?? null,
      condition: p.condition ?? null,
    }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-[color:var(--brand-muted)]">
        <Link href="/" className="transition-colors hover:text-[color:var(--brand-maroon)]">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        <Link
          href="/categories"
          className="transition-colors hover:text-[color:var(--brand-maroon)]"
        >
          Categories
        </Link>
        <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        <span className="font-medium text-[color:var(--ink)]">{vt.name}</span>
      </nav>

      {/* Header */}
      <div className="rise-in premium-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <span
          className="bg-brand-gradient inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
          aria-hidden
        >
          <Store className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-[26px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[32px]">
            {vt.name}
          </h1>
          {vt.description ? (
            <p className="mt-1 text-sm text-[color:var(--brand-muted)]">{vt.description}</p>
          ) : (
            <p className="mt-1 text-sm text-[color:var(--brand-muted)]">
              Products from local {vt.name.toLowerCase()} vendors.
            </p>
          )}
        </div>
      </div>

      {/* Trending Now — only on electronics */}
      {slug === "electronics" && <TrendingNow />}

      {/* Products */}
      {products.length ? (
        <div className="mt-2">
          <FeaturedProducts products={products} />
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-[color:var(--brand-border)] bg-white p-12 text-center shadow-[var(--shadow-card)]">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-[color:var(--brand-maroon)]">
            <Store className="h-7 w-7" />
          </span>
          <p className="font-display mt-4 text-[20px] font-semibold text-[color:var(--ink)]">
            No products yet
          </p>
          <p className="mt-1 text-sm text-[color:var(--brand-muted)]">
            New listings in {vt.name.toLowerCase()} will appear here.
          </p>
          <Link
            href="/categories"
            className="bg-brand-gradient mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110"
          >
            Browse other categories
          </Link>
        </div>
      )}
    </div>
  );
}
