"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { aed } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  price: number | null;
  sale_price: number | null;
  thumbnail_url: string | null;
  images: string[] | null;
};

export function RelatedProducts({
  products,
  categoryId,
}: {
  products: Product[];
  categoryId: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: dir === "right" ? ref.current.offsetWidth * 0.75 : -ref.current.offsetWidth * 0.75,
      behavior: "smooth",
    });
  }

  if (!products.length) return null;

  return (
    <section className="border-t border-[color:var(--brand-border)] py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-8">

        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-center gap-3.5">
            <span className="accent-bar h-9 w-1.5 rounded-full" />
            <div>
              <p className="eyebrow">
                From this category
              </p>
              <h2 className="font-display mt-0.5 text-[24px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[28px]">
                You might also like
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll("left")}
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white text-neutral-600 shadow-sm transition hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)] hover:shadow-md">
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <button onClick={() => scroll("right")}
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white text-neutral-600 shadow-sm transition hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)] hover:shadow-md">
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
            {categoryId && (
              <Link href={"/shop/" + categoryId}
                className="ms-1 text-[12.5px] font-bold text-[color:var(--brand-maroon)] transition hover:text-[color:var(--brand-maroon-deep)]">
                View all →
              </Link>
            )}
          </div>
        </div>

        {/* Carousel */}
        <div ref={ref}
          className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((p) => {
            const img = p.thumbnail_url ?? p.images?.[0] ?? null;
            const price = p.sale_price ?? p.price;
            const hasDiscount = p.sale_price && p.price && Number(p.sale_price) < Number(p.price);
            const off = hasDiscount ? Math.round((1 - Number(p.sale_price) / Number(p.price)) * 100) : 0;
            return (
              <Link key={p.id} href={"/products/" + p.id}
                className="group premium-card shrink-0 w-[160px] overflow-hidden md:w-[200px]">
                {/* Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-[color:var(--paper-2)]">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl text-neutral-300">
                      📦
                    </div>
                  )}
                  {hasDiscount && (
                    <span className="bg-brand-gradient absolute top-2.5 start-2.5 rounded-full px-2.5 py-1 text-[9.5px] font-black tracking-wider text-white shadow-sm">
                      -{off}%
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="min-h-[32px] text-[12.5px] leading-snug text-neutral-700 line-clamp-2">
                    {p.name}
                  </p>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-[15px] font-extrabold text-[color:var(--brand-maroon)]">{aed(price)}</span>
                    {hasDiscount && (
                      <span className="text-[11px] text-neutral-400 line-through">{aed(p.price)}</span>
                    )}
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
