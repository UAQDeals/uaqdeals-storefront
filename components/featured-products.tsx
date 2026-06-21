import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { aed } from "@/lib/format";
import { getTranslations } from "next-intl/server";
import { QuickAddButton } from "@/components/quick-add-button";

export type ProductCard = {
  id: string;
  name: string;
  price: number | null;
  sale_price: number | null;
  thumbnail_url: string | null;
  images: string[] | null;
  // optional extras for quick-add (cards still render without them)
  variants?: Array<{ name: string; options: string[] }> | null;
  requires_prescription?: boolean | null;
  stock_quantity?: number | null;
  track_stock?: boolean | null;
  vendor_name?: string | null;
};

export async function FeaturedProducts({
  products,
  showHeader = true,
}: {
  products: ProductCard[];
  showHeader?: boolean;
}) {
  if (!products.length) return null;
  const t = await getTranslations("featuredProducts");
  const tc = await getTranslations("common");
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {showHeader && (
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h2>
            <p className="text-sm text-neutral-600">{t("subtitle")}</p>
          </div>
          <Link href="/categories" className="hidden text-sm font-semibold text-[color:var(--brand-maroon)] hover:underline sm:inline">
            {tc("seeAll")}
          </Link>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {products.map((p) => {
          const img = p.thumbnail_url || (Array.isArray(p.images) && p.images.length ? p.images[0] : null);
          const hasSale = p.sale_price != null && Number(p.sale_price) > 0 && p.price != null && Number(p.sale_price) < Number(p.price);
          const display = hasSale ? p.sale_price : p.price;
          const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
          const oos = Boolean(p.track_stock) && (p.stock_quantity == null || Number(p.stock_quantity) <= 0);

          return (
            <div key={p.id} className="group flex flex-col overflow-hidden rounded-2xl border border-[color:var(--brand-border)] bg-white">
              <Link href={`/products/${p.id}`} className="block">
                <div className="relative aspect-square bg-neutral-100">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-10 w-10" /></div>
                  )}
                  {hasSale && (
                    <span className="bg-brand-gradient absolute start-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-bold text-white">
                      -{Math.round(((Number(p.price) - Number(p.sale_price)) / Number(p.price)) * 100)}%
                    </span>
                  )}
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-3">
                <Link href={`/products/${p.id}`} className="block">
                  <p className="line-clamp-2 text-sm font-semibold text-neutral-900">{p.name}</p>
                </Link>
                <div className="mt-1.5 flex items-end justify-between gap-2">
                  <div className="flex items-end gap-2">
                    <span className="text-base font-bold text-[color:var(--brand-maroon)]">{aed(display)}</span>
                    {hasSale && <span className="text-xs text-neutral-500 line-through">{aed(p.price)}</span>}
                  </div>
                  <QuickAddButton
                    product={{
                      id: p.id,
                      name: p.name,
                      price: Number(p.price ?? 0),
                      sale_price: p.sale_price != null ? Number(p.sale_price) : null,
                      thumbnail_url: p.thumbnail_url ?? null,
                      images: p.images ?? null,
                      has_variants: hasVariants,
                      requires_prescription: Boolean(p.requires_prescription),
                      oos,
                      vendor_name: p.vendor_name ?? null,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
