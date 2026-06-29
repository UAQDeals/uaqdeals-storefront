import { createClient } from "@/lib/supabase/server";
import { FeaturedProducts, type ProductCard } from "@/components/featured-products";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata = { title: "Featured Products — UAQ Deals" };
export const revalidate = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function FeaturedPage() {
  const supabase = await createClient();
  const { data: raw } = await supabase
    .from("products")
    .select("id, name, price, sale_price, thumbnail_url, images, variants, requires_prescription, stock_quantity, track_stock, condition")
    .eq("status", "active")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(48);

  const products: ProductCard[] = (raw ?? []).map((p: Row) => ({
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-neutral-500">
        <Link href="/" className="hover:text-[color:var(--brand-maroon)]">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-700">Featured Products</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[color:var(--brand-border)] bg-white p-5 sm:flex-row sm:items-center">
        <span className="bg-brand-gradient inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl text-white">
          ⭐
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Featured Products</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Hand-picked products from our top vendors across all categories.
          </p>
        </div>
        <div className="ms-auto shrink-0 text-sm font-semibold text-neutral-500">
          {products.length} product{products.length !== 1 ? "s" : ""}
        </div>
      </div>

      {products.length ? (
        <FeaturedProducts products={products} />
      ) : (
        <div className="rounded-2xl border border-dashed border-[color:var(--brand-border)] bg-white p-10 text-center">
          <p className="text-base font-semibold text-neutral-800">No featured products yet</p>
          <p className="mt-1 text-sm text-neutral-500">Admin can mark products as featured from the catalog.</p>
          <Link href="/categories"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-[color:var(--brand-maroon)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white">
            Browse all categories
          </Link>
        </div>
      )}
    </div>
  );
}
