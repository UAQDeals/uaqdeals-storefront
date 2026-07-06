import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { ProductDetail } from "@/components/product-detail";
import { showProducts } from "@/lib/emirate";
import { ProductsUnavailable } from "@/components/products-unavailable";
import { RelatedProducts } from "@/components/related-products";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name, meta_title, meta_description")
    .eq("id", id)
    .maybeSingle();
  return {
    title: data?.meta_title ?? data?.name ?? "Product",
    description: data?.meta_description ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const tc = await getTranslations("common");
  if (!(await showProducts())) return <ProductsUnavailable />;

  const [{ data: p }, { data: reviewsRaw }] = await Promise.all([
    supabase
    .from("products")
    .select(
      "id, name, name_ar, description, description_ar, price, sale_price, thumbnail_url, images, variants, stock_quantity, track_stock, requires_prescription, status, vendor_id, category_id, brand, unit, average_rating, review_count, condition, specs, sku, is_halal, weight_based, weight_unit"
    )
    .eq("id", id)
    .maybeSingle(),

  supabase
    .from("reviews")
    .select("id, rating, comment, created_at, profiles(full_name, avatar_url)")
    .eq("product_id", id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(20),
  ]);

  // Fetch related products from same category
  let relatedProducts: Row[] = [];
  if (p?.category_id) {
    const { data: related } = await supabase
      .from("products")
      .select("id, name, price, sale_price, thumbnail_url, images")
      .eq("category_id", p.category_id)
      .eq("status", "active")
      .neq("id", id)
      .order("is_featured", { ascending: false })
      .limit(10);
    relatedProducts = related ?? [];
  }

  if (!p || p.status !== "active") notFound();

  let vendor_name: string | null = null;
  if (p.vendor_id) {
    const { data: v } = await supabase
      .from("vendors")
      .select("name, vendor_types(name, mask_vendor_identity)")
      .eq("id", p.vendor_id)
      .maybeSingle();
    if (v) {
      const masked = (v as Row).vendor_types?.mask_vendor_identity;
      vendor_name = masked ? "UAQ Deals Mart" : ((v as Row).name ?? null);
    }
  }

  const product = {
    id: p.id as string,
    name: p.name as string,
    name_ar: (p.name_ar as string | null) ?? null,
    description: (p.description as string | null) ?? null,
    description_ar: (p.description_ar as string | null) ?? null,
    price: Number(p.price ?? 0),
    sale_price: p.sale_price != null ? Number(p.sale_price) : null,
    thumbnail_url: (p.thumbnail_url as string | null) ?? null,
    images: (Array.isArray(p.images) ? (p.images as string[]) : []) as string[],
    variants: (Array.isArray(p.variants) ? p.variants : []) as Array<{
      name: string;
      price: number | null;
      sale_price: number | null;
      sku?: string | null;
      stock_quantity: number;
    }>,
    stock_quantity: p.stock_quantity as number | null,
    track_stock: Boolean(p.track_stock),
    requires_prescription: Boolean(p.requires_prescription),
    vendor_id: (p.vendor_id as string | null) ?? null,
    brand: (p.brand as string | null) ?? null,
    unit: (p.unit as string | null) ?? null,
    vendor_name,
    condition: (p.condition as string | null) ?? null,
    average_rating: (p.average_rating as number | null) ?? null,
    review_count: (p.review_count as number | null) ?? 0,
    specs: (p.specs && typeof p.specs === "object" ? (p.specs as Record<string, unknown>) : {}) as Record<string, string>,
    sku: (p.sku as string | null) ?? null,
    is_halal: Boolean(p.is_halal),
    weight_based: Boolean(p.weight_based),
    weight_unit: (p.weight_unit as string | null) ?? null,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 flex items-center gap-1 text-xs text-neutral-500">
        <Link href="/" className="hover:text-[color:var(--brand-maroon)]">
          {tc("home")}
        </Link>
        <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        <Link href="/categories" className="hover:text-[color:var(--brand-maroon)]">
          {tc("categories")}
        </Link>
        <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        <span className="line-clamp-1 text-neutral-700">{product.name}</span>
      </nav>

      <ProductDetail
        product={product}
        reviews={(reviewsRaw ?? []).map((r: Row) => ({
          id: r.id,
          rating: Number(r.rating),
          comment: (r.comment as string | null) ?? null,
          created_at: r.created_at,
          reviewer_name: (r.profiles as any)?.full_name ?? null,
          reviewer_avatar: (r.profiles as any)?.avatar_url ?? null,
        }))}
      />
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} categoryId={(p?.category_id as string | null) ?? null} />
      )}
    </div>
  );
}
