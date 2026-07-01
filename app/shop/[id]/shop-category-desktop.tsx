import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { aed } from "@/lib/format";
import { CategoryRail } from "./category-rail";
import { QuickAddButton } from "@/components/quick-add-button";
import type { ProductCard } from "@/components/featured-products";

type Cat = { id: string; name: string };
type TrendingItem = {
  rank: number;
  search_term: string;
  catalog: { id: string; title: string; brand: string | null; main_image_url: string | null };
};

export function ShopCategoryDesktop({
  category,
  children,
  breadcrumb,
  products,
  railImages = {},
  trendingItems = [],
}: {
  category: Cat;
  children: Cat[];
  breadcrumb: Cat[];
  products: ProductCard[];
  railImages?: Record<string, string | null>;
  trendingItems?: TrendingItem[];
}) {
  return (
    <div className="bg-[color:var(--brand-cream)] pb-12">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-100 bg-white">
        <nav className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-1 px-5 py-3 text-[12.5px] text-neutral-500 md:px-8">
          <Link href="/" className="transition-colors hover:text-[color:var(--brand-maroon)]">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-300 rtl:rotate-180" />
          <Link href="/categories" className="transition-colors hover:text-[color:var(--brand-maroon)]">Categories</Link>
          {breadcrumb.map((b, i) => (
            <span key={b.id} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-300 rtl:rotate-180" />
              {i === breadcrumb.length - 1 ? (
                <span className="font-semibold text-neutral-800">{b.name}</span>
              ) : (
                <Link href={"/shop/" + b.id} className="transition-colors hover:text-[color:var(--brand-maroon)]">{b.name}</Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Subcategory rail */}
      {children.length > 0 && (
        <div className="mx-auto max-w-[1320px] px-5 pt-8 md:px-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-6 w-1.5 rounded-full bg-brand-gradient" />
            <h2 className="text-[17px] font-extrabold tracking-tight text-neutral-900">Shop {category.name}</h2>
          </div>
          <CategoryRail items={children} images={railImages} />
        </div>
      )}

      {/* Trending Now */}
      {trendingItems.length > 0 && (
        <div className="mx-auto max-w-[1320px] px-5 pt-8 md:px-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-6 w-1.5 rounded-full bg-brand-gradient" />
            <h2 className="text-[17px] font-extrabold tracking-tight text-neutral-900">🔥 Trending Now</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {trendingItems.map((item) => {
              const href = item.catalog.brand
                ? `/search?q=${encodeURIComponent(item.catalog.brand)}`
                : "/shop/electronics";
              return (
                <Link
                  key={item.catalog.id}
                  href={href}
                  className="group/card flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:border-[color:var(--brand-maroon)] hover:shadow-sm"
                >
                  <div className="flex h-32 items-center justify-center overflow-hidden bg-neutral-50">
                    {item.catalog.main_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.catalog.main_image_url}
                        alt={item.catalog.title}
                        className="h-full w-full object-contain p-2 transition group-hover/card:scale-105"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-neutral-200" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-2.5">
                    {item.catalog.brand && (
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--brand-maroon)] line-clamp-1">
                        {item.catalog.brand}
                      </p>
                    )}
                    <p className="line-clamp-2 text-xs font-semibold leading-tight text-neutral-800">
                      {item.catalog.title}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="mx-auto max-w-[1320px] px-5 pt-10 md:px-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-brand-gradient" />
          <h2 className="text-[17px] font-extrabold tracking-tight text-neutral-900">Popular in {category.name}</h2>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-14 text-center">
            <p className="text-[13.5px] text-neutral-500">
              Products in this category are on the way. Pick a subcategory above to explore.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((p) => {
              const img = p.thumbnail_url || (Array.isArray(p.images) && p.images.length ? p.images[0] : null);
              const hasSale =
                p.sale_price != null && Number(p.sale_price) > 0 && p.price != null && Number(p.sale_price) < Number(p.price);
              const display = hasSale ? p.sale_price : p.price;
              const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
              const oos = Boolean(p.track_stock) && (p.stock_quantity == null || Number(p.stock_quantity) <= 0);
              const salePct = hasSale ? Math.round(((Number(p.price) - Number(p.sale_price)) / Number(p.price)) * 100) : 0;

              return (
                <div key={p.id} className="group">
                  <Link href={`/products/${p.id}`} className="block">
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-300">
                          <ShoppingBag className="h-10 w-10" />
                        </div>
                      )}
                      {hasSale && (
                        <span className="absolute start-2 top-2 bg-[#c72931] px-2 py-1 text-[9px] font-black tracking-widest text-white">
                          -{salePct}%
                        </span>
                      )}
                      {p.condition === "used" && (
                        <span className="absolute end-2 top-2 bg-amber-500 px-2 py-1 text-[9px] font-black tracking-widest text-white">
                          USED
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="pb-1 pt-2.5">
                    <p className="truncate text-[11px] font-bold uppercase tracking-wide text-neutral-900">
                      {p.vendor_name ?? "UAQ Deals"}
                    </p>
                    <Link href={`/products/${p.id}`}>
                      <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-neutral-600 transition-colors hover:text-neutral-900">
                        {p.name}
                      </p>
                    </Link>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[13.5px] font-bold text-neutral-900">{aed(display)}</span>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
