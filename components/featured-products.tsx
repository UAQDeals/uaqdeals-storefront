import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { aed } from "@/lib/format";
import { getTranslations } from "next-intl/server";
import { QuickAddButton } from "@/components/quick-add-button";
import { rowHasOptions } from "@/lib/variants";

export type ProductCard = {
  id: string;
  name: string;
  price: number | null;
  sale_price: number | null;
  thumbnail_url: string | null;
  images: string[] | null;
  variants?: Array<{ name: string; options: string[] }> | null;
  product_options?: Array<unknown> | null;
  requires_prescription?: boolean | null;
  stock_quantity?: number | null;
  track_stock?: boolean | null;
  vendor_name?: string | null;
  condition?: string | null;
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
    <section className="border-t border-[color:var(--brand-border)] py-12 md:py-14">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        {showHeader && (
          <div className="mb-6 flex items-end justify-between">
            <div className="flex items-center gap-3.5">
              <span className="accent-bar h-9 w-1.5 rounded-full" />
              <div>
                <p className="eyebrow">{t("subtitle")}</p>
                <h2 className="font-display mt-0.5 text-[24px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[28px]">{t("title")}</h2>
              </div>
            </div>
            <Link
              href="/featured"
              className="ms-1 text-[12.5px] font-bold text-[color:var(--brand-maroon)] transition hover:text-[color:var(--brand-maroon-deep)]"
            >
              {tc("seeAll")} →
            </Link>
          </div>
        )}

        {/* Horizontal scroll — premium product row */}
        <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((p) => {
            const img = p.thumbnail_url || (Array.isArray(p.images) && p.images.length ? p.images[0] : null);
            const hasSale = p.sale_price != null && Number(p.sale_price) > 0 && p.price != null && Number(p.sale_price) < Number(p.price);
            const display = hasSale ? p.sale_price : p.price;
            const hasVariants = rowHasOptions(p);
            const oos = Boolean(p.track_stock) && (p.stock_quantity == null || Number(p.stock_quantity) <= 0);
            const salePct = hasSale ? Math.round(((Number(p.price) - Number(p.sale_price)) / Number(p.price)) * 100) : 0;

            return (
              <div key={p.id} className="group premium-card shrink-0 w-[170px] overflow-hidden md:w-[200px]">
                <Link href={`/products/${p.id}`} className="block">
                  <div className="relative w-full aspect-[4/5] overflow-hidden bg-[color:var(--paper-2)]">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-300">
                        <ShoppingBag className="h-10 w-10" />
                      </div>
                    )}
                    {hasSale && (
                      <span className="bg-brand-gradient absolute top-2.5 start-2.5 rounded-full px-2.5 py-1 text-[9.5px] font-black tracking-wider text-white shadow-sm">
                        -{salePct}%
                      </span>
                    )}
                    {p.condition === "used" && (
                      <span className="absolute top-2.5 end-2.5 rounded-full bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] px-2.5 py-1 text-[9.5px] font-black tracking-wider text-white shadow-sm">
                        USED
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide text-[color:var(--brand-muted)] truncate">
                    {p.vendor_name ?? "UAQ Deals"}
                  </p>
                  <Link href={`/products/${p.id}`}>
                    <p className="mt-0.5 min-h-[32px] text-[12.5px] leading-snug text-neutral-700 line-clamp-2 transition-colors hover:text-[color:var(--ink)]">
                      {p.name}
                    </p>
                  </Link>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[15px] font-extrabold text-[color:var(--brand-maroon)]">{aed(display)}</span>
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
