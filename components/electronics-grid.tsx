import Link from "next/link";
import { aed } from "@/lib/format";
import type { CarouselProduct } from "@/components/product-carousel";

// A flat grid of electronics products shown right under the QuickNav tiles.
// Layout is intentionally fixed by breakpoint:
//   • desktop (md+): 5 per row × 3 rows = 15 items
//   • mobile:        2 per row × 5 rows = 10 items
// The last 5 items (index ≥ 10) are hidden on mobile so the mobile grid ends
// cleanly at 10 while desktop still fills its 3 rows with 15.
export function ElectronicsGrid({
  products,
  title,
  viewAllHref,
  viewAllLabel,
}: {
  products: CarouselProduct[];
  title: string;
  viewAllHref: string;
  viewAllLabel: string;
}) {
  if (!products.length) return null;
  const items = products.slice(0, 15);
  return (
    <section className="py-8 md:py-10">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="mb-5 flex items-end justify-between">
          <div className="flex items-center gap-3.5">
            <span className="accent-bar h-9 w-1.5 rounded-full" />
            <h2 className="font-display text-[24px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[28px]">
              {title}
            </h2>
          </div>
          <Link
            href={viewAllHref}
            className="ms-1 text-[12.5px] font-bold text-[color:var(--brand-maroon)] transition hover:text-[color:var(--brand-maroon-deep)]"
          >
            {viewAllLabel} →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          {items.map((p, i) => {
            const img = p.thumbnail_url ?? p.images?.[0] ?? null;
            const price = p.sale_price ?? p.price;
            const hasDiscount = p.sale_price && p.price && Number(p.sale_price) < Number(p.price);
            const off = hasDiscount ? Math.round((1 - Number(p.sale_price) / Number(p.price)) * 100) : 0;
            return (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className={
                  "group premium-card overflow-hidden" + (i >= 10 ? " hidden md:block" : "")
                }
              >
                <div className="relative w-full aspect-square overflow-hidden bg-[color:var(--paper-2)]">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl text-neutral-300">📦</div>
                  )}
                  {hasDiscount && (
                    <span className="bg-brand-gradient absolute top-2.5 start-2.5 rounded-full px-2.5 py-1 text-[9.5px] font-black tracking-wider text-white shadow-sm">
                      -{off}%
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="min-h-[32px] text-[12.5px] leading-snug text-neutral-700 line-clamp-2">{p.name}</p>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-[15px] font-extrabold text-[color:var(--brand-maroon)]">{aed(price)}</span>
                    {hasDiscount && <span className="text-[11px] text-neutral-400 line-through">{aed(p.price)}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
