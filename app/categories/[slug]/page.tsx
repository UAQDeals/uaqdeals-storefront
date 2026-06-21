import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  FeaturedProducts,
  type ProductCard,
} from "@/components/featured-products";

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
  const supabase = await createClient();

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
      .select("id, name, price, sale_price, thumbnail_url, images, variants, requires_prescription, stock_quantity, track_stock")
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
    }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-neutral-500">
        <Link href="/" className="hover:text-[color:var(--brand-maroon)]">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href="/categories"
          className="hover:text-[color:var(--brand-maroon)]"
        >
          Categories
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-700">{vt.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[color:var(--brand-border)] bg-white p-5 sm:flex-row sm:items-center">
        <span
          className="bg-brand-gradient inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
          aria-hidden
        >
          <Store className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {vt.name}
          </h1>
          {vt.description ? (
            <p className="mt-1 text-sm text-neutral-600">{vt.description}</p>
          ) : (
            <p className="mt-1 text-sm text-neutral-600">
              Products from local {vt.name.toLowerCase()} vendors.
            </p>
          )}
        </div>
      </div>

      {/* Products */}
      {products.length ? (
        <div className="mt-2">
          <FeaturedProducts products={products} />
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-[color:var(--brand-border)] bg-white p-10 text-center">
          <p className="text-base font-semibold text-neutral-800">
            No products yet
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            New listings in {vt.name.toLowerCase()} will appear here.
          </p>
          <Link
            href="/categories"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-[color:var(--brand-maroon)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white"
          >
            Browse other categories
          </Link>
        </div>
      )}
    </div>
  );
}
