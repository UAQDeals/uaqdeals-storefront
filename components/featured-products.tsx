import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { aed } from "@/lib/format";

export type ProductCard = {
  id: string;
  name: string;
  price: number | null;
  sale_price: number | null;
  thumbnail_url: string | null;
  images: string[] | null;
};

export function FeaturedProducts({ products }: { products: ProductCard[] }) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Featured Products
          </h2>
          <p className="text-sm text-neutral-600">Hand-picked from local vendors.</p>
        </div>
        <Link
          href="/products"
          className="hidden text-sm font-semibold text-[color:var(--brand-maroon)] hover:underline sm:inline"
        >
          See all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {products.map((p) => {
          const img =
            p.thumbnail_url ||
            (Array.isArray(p.images) && p.images.length ? p.images[0] : null);
          const hasSale =
            p.sale_price != null &&
            Number(p.sale_price) > 0 &&
            p.price != null &&
            Number(p.sale_price) < Number(p.price);
          const display = hasSale ? p.sale_price : p.price;
          return (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="group overflow-hidden rounded-2xl border border-[color:var(--brand-border)] bg-white"
            >
              <div className="relative aspect-square bg-neutral-100">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={p.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300">
                    <ShoppingBag className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-semibold text-neutral-900">
                  {p.name}
                </p>
                <div className="mt-1.5 flex items-end gap-2">
                  <span className="text-base font-bold text-[color:var(--brand-maroon)]">
                    {aed(display)}
                  </span>
                  {hasSale && (
                    <span className="text-xs text-neutral-500 line-through">
                      {aed(p.price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
