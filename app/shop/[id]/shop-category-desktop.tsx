import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { aed } from "@/lib/format";
import { CategoryRail } from "./category-rail";
import { QuickAddButton } from "@/components/quick-add-button";
import { Reveal } from "@/components/reveal";
import type { ProductCard } from "@/components/featured-products";
import { rowHasOptions } from "@/lib/variants";

type Cat = { id: string; name: string; slug?: string | null };

export function ShopCategoryDesktop({
  category,
  children,
  breadcrumb,
  products,
  railImages = {},
}: {
  category: Cat;
  children: Cat[];
  breadcrumb: Cat[];
  products: ProductCard[];
  railImages?: Record<string, string | null>;
}) {
  return (
    <div className="bg-[color:var(--paper)] pb-12">
      {/* Breadcrumb */}
      <div className="border-b border-[color:var(--brand-border)] bg-white">
        <nav className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-1 px-5 py-3 text-[12.5px] text-[color:var(--brand-muted)] md:px-8">
          <Link href="/" className="transition-colors hover:text-[color:var(--brand-maroon)]">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-300 rtl:rotate-180" />
          <Link href="/categories" className="transition-colors hover:text-[color:var(--brand-maroon)]">Categories</Link>
          {breadcrumb.map((b, i) => (
            <span key={b.id} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-300 rtl:rotate-180" />
              {i === breadcrumb.length - 1 ? (
                <span className="font-semibold text-[color:var(--ink)]">{b.name}</span>
              ) : (
                <Link href={"/shop/" + (b.slug || b.id)} className="transition-colors hover:text-[color:var(--brand-maroon)]">{b.name}</Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Subcategory rail */}
      {children.length > 0 && (
        <div className="mx-auto max-w-[1320px] px-5 pt-8 md:px-8">
          <div className="mb-5 flex items-center gap-3.5">
            <span className="accent-bar h-9 w-1.5 rounded-full" />
            <div>
              <p className="eyebrow">{category.name}</p>
              <h2 className="font-display mt-0.5 text-[22px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[26px]">Shop {category.name}</h2>
            </div>
          </div>
          <CategoryRail items={children} images={railImages} />
        </div>
      )}

      {/* Products */}
      <div className="mx-auto max-w-[1320px] px-5 pt-10 md:px-8">
        <div className="mb-5 flex items-center gap-3.5">
          <span className="accent-bar h-9 w-1.5 rounded-full" />
          <div>
            <p className="eyebrow">{category.name}</p>
            <h2 className="font-display mt-0.5 text-[22px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[26px]">Popular in {category.name}</h2>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="premium-card p-14 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)]">
              <ShoppingBag className="h-8 w-8 text-[color:var(--brand-maroon)]" />
            </div>
            <p className="font-display text-[15px] text-[color:var(--brand-muted)]">
              Products in this category are on the way. Pick a subcategory above to explore.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((p, i) => {
              const img = p.thumbnail_url || (Array.isArray(p.images) && p.images.length ? p.images[0] : null);
              const hasSale =
                p.sale_price != null && Number(p.sale_price) > 0 && p.price != null && Number(p.sale_price) < Number(p.price);
              const display = hasSale ? p.sale_price : p.price;
              const hasVariants = rowHasOptions(p);
              const oos = Boolean(p.track_stock) && (p.stock_quantity == null || Number(p.stock_quantity) <= 0);
              const salePct = hasSale ? Math.round(((Number(p.price) - Number(p.sale_price)) / Number(p.price)) * 100) : 0;

              return (
                <Reveal key={p.id} delay={Math.min(i, 10) * 35}>
                <div className="group premium-card overflow-hidden">
                  <Link href={`/products/${p.id}`} className="block">
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[color:var(--paper-2)]">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={p.name} className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-300">
                          <ShoppingBag className="h-10 w-10" />
                        </div>
                      )}
                      {hasSale && (
                        <span className="bg-brand-gradient absolute start-2.5 top-2.5 rounded-full px-2.5 py-1 text-[9.5px] font-black tracking-wider text-white shadow-sm">
                          -{salePct}%
                        </span>
                      )}
                      {p.condition === "used" && (
                        <span className="absolute end-2.5 top-2.5 rounded-full bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] px-2.5 py-1 text-[9.5px] font-black tracking-wider text-white shadow-sm">
                          USED
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-3">
                    <p className="truncate text-[10.5px] font-bold uppercase tracking-wide text-[color:var(--brand-muted)]">
                      {p.vendor_name ?? "UAQ Deals"}
                    </p>
                    <Link href={`/products/${p.id}`}>
                      <p className="mt-0.5 min-h-[32px] line-clamp-2 text-[12.5px] leading-snug text-neutral-700 transition-colors hover:text-[color:var(--ink)]">
                        {p.name}
                      </p>
                    </Link>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[15px] font-extrabold text-[color:var(--brand-maroon)]">{aed(display)}</span>
                        {hasSale && <span className="text-[11px] text-neutral-400 line-through">{aed(p.price)}</span>}
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
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
