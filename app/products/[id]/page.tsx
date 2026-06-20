import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductDetail } from "@/components/product-detail";

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

  const { data: p } = await supabase
    .from("products")
    .select(
      "id, name, description, price, sale_price, thumbnail_url, images, variants, stock_quantity, track_stock, requires_prescription, status, vendor_id, brand, unit"
    )
    .eq("id", id)
    .maybeSingle();

  if (!p || p.status !== "active") notFound();

  // Vendor name (respect masking) — fetched separately so RLS stays simple
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
    description: (p.description as string | null) ?? null,
    price: Number(p.price ?? 0),
    sale_price: p.sale_price != null ? Number(p.sale_price) : null,
    thumbnail_url: (p.thumbnail_url as string | null) ?? null,
    images: (Array.isArray(p.images) ? (p.images as string[]) : []) as string[],
    variants: (Array.isArray(p.variants) ? p.variants : []) as Array<{
      name: string;
      options: string[];
    }>,
    stock_quantity: p.stock_quantity as number | null,
    track_stock: Boolean(p.track_stock),
    requires_prescription: Boolean(p.requires_prescription),
    brand: (p.brand as string | null) ?? null,
    unit: (p.unit as string | null) ?? null,
    vendor_name,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
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
        <span className="line-clamp-1 text-neutral-700">{product.name}</span>
      </nav>

      <ProductDetail product={product} />
    </div>
  );
}
