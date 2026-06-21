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
    <section className="border-t border-neutral-100 py-10">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        {showHeader && (
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-[color:var(--brand-maroon)] mb-1">
                {t("subtitle")}
              </p>
              <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-900">{t("title")}</h2>
            </div>
            <Link
              href="/categories"
              className="text-[12px] font-bold text-neutral-900 underline underline-offset-2 hover:text-[color:var(--brand-maroon)] transition-colors"
            >
              {tc("seeAll")} →
            </Link>
          </div>
        )}

        {/* Horizontal scroll — Zalando product row */}
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((p) => {
            const img = p.thumbnail_url || (Array.isArray(p.images) && p.images.length ? p.images[0] : null);
            const hasSale = p.sale_price != null && Number(p.sale_price) > 0 && p.price != null && Number(p.sale_price) < Number(p.price);
            const display = hasSale ? p.sale_price : p.price;
            const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
            const oos = Boolean(p.track_stock) && (p.stock_quantity == null || Number(p.stock_quantity) <= 0);
            const salePct = hasSale ? Math.round(((Number(p.price) - Number(p.sale_price)) / Number(p.price)) * 100) : 0;

            return (
              <div key={p.id} className="group shrink-0 w-[170px] md:w-[200px]">
                <Link href={`/products/${p.id}`} className="block">
                  <div className="relative w-full aspect-[4/5] bg-neutral-100 overflow-hidden">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-300">
                        <ShoppingBag className="h-10 w-10" />
                      </div>
                    )}
                    {hasSale && (
                      <span className="absolute top-2 start-2 bg-[#c72931] text-white text-[9px] font-black tracking-widest px-2 py-1">
                        -{salePct}%
                      </span>
                    )}
                  </div>
                </Link>
                <div className="pt-2.5 pb-1">
                  <p className="text-[11px] font-bold text-neutral-900 uppercase tracking-wide truncate">
                    {p.vendor_name ?? "UAQ Deals"}
                  </p>
                  <Link href={`/products/${p.id}`}>
                    <p className="text-[12px] text-neutral-600 mt-0.5 line-clamp-2 leading-snug hover:text-neutral-900 transition-colors">
                      {p.name}
                    </p>
                  </Link>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[13.5px] font-bold text-neutral-900">{aed(display)}</span>
                      {hasSale && (
                        <span className="text-[11px] text-neutral-400 line-through">{aed(p.price)}</span>
                      )}
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
      </div>
    </section>
  );
}
