"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
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
    <section className="border-t border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] py-10">
      <div className="mx-auto max-w-6xl px-4">

        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--brand-maroon)]">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-[color:var(--brand-maroon)]">
                From this category
              </p>
              <h2 className="text-[20px] font-extrabold tracking-tight text-neutral-900">
                You might also like
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll("left")}
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)] transition-colors shadow-sm">
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <button onClick={() => scroll("right")}
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)] transition-colors shadow-sm">
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
            {categoryId && (
              <Link href={"/shop/" + categoryId}
                className="text-[12px] font-bold text-neutral-900 underline underline-offset-2 hover:text-[color:var(--brand-maroon)] transition-colors">
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
            return (
              <Link key={p.id} href={"/products/" + p.id}
                className="group shrink-0 w-[160px] md:w-[200px]">
                {/* Image */}
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white border border-[color:var(--brand-border)] shadow-sm">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl text-neutral-200">
                      📦
                    </div>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-2 start-2 rounded-full bg-[#C72931] px-2 py-0.5 text-[9px] font-black tracking-widest text-white">
                      SALE
                    </span>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[color:var(--brand-maroon)]/0 group-hover:bg-[color:var(--brand-maroon)]/5 transition-colors duration-300 rounded-2xl" />
                </div>

                {/* Info */}
                <div className="pt-3 pb-1">
                  <p className="text-[12.5px] font-semibold text-neutral-800 line-clamp-2 leading-snug">
                    {p.name}
                  </p>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-[14px] font-extrabold text-neutral-900">{aed(price)}</span>
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
