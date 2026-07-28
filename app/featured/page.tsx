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
    .select("id, name, price, sale_price, thumbnail_url, images, variants, requires_prescription, stock_quantity, track_stock, condition, product_options(id)")
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
    product_options: p.product_options ?? null,
    requires_prescription: p.requires_prescription ?? false,
    stock_quantity: p.stock_quantity ?? null,
    track_stock: p.track_stock ?? false,
    condition: p.condition ?? null,
  }));

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-10 md:px-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-[color:var(--brand-muted)]">
        <Link href="/" className="transition-colors hover:text-[color:var(--brand-maroon)]">Home</Link>
        <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        <span className="text-[color:var(--ink)]">Featured Products</span>
      </nav>

      {/* Header */}
      <div className="premium-card mb-9 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <span className="bg-brand-gradient inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl text-white shadow-[var(--shadow-card)]">
          ⭐
        </span>
        <div className="min-w-0">
          <p className="eyebrow">Featured</p>
          <h1 className="font-display mt-0.5 text-[28px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[34px]">Featured Products</h1>
          <p className="mt-1.5 text-sm text-[color:var(--brand-muted)]">
            Hand-picked products from our top vendors across all categories.
          </p>
        </div>
        <div className="ms-auto shrink-0 rounded-full border border-[color:var(--brand-border)] bg-[color:var(--paper-2)]/60 px-4 py-1.5 text-sm font-semibold text-[color:var(--brand-muted)]">
          {products.length} product{products.length !== 1 ? "s" : ""}
        </div>
      </div>

      {products.length ? (
        <FeaturedProducts products={products} />
      ) : (
        <div className="premium-card flex flex-col items-center p-12 text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-3xl">⭐</span>
          <p className="font-display text-[20px] font-semibold text-[color:var(--ink)]">No featured products yet</p>
          <p className="mt-1.5 text-sm text-[color:var(--brand-muted)]">Admin can mark products as featured from the catalog.</p>
          <Link href="/categories"
            className="bg-brand-gradient mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110">
            Browse all categories
          </Link>
        </div>
      )}
    </div>
  );
}
