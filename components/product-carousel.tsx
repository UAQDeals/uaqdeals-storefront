"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { aed } from "@/lib/format";

export type CarouselProduct = {
  id: string;
  name: string;
  price: number | null;
  sale_price: number | null;
  thumbnail_url: string | null;
  images: string[] | null;
};

export function ProductCarousel({
  title, eyebrow, emoji, products, viewMoreHref, viewMoreLabel = "View all",
}: {
  title: string; eyebrow?: string; emoji?: string;
  products: CarouselProduct[]; viewMoreHref: string; viewMoreLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  function scroll(dir: "left" | "right") {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === "right" ? ref.current.offsetWidth * 0.8 : -ref.current.offsetWidth * 0.8, behavior: "smooth" });
  }
  if (!products.length) return null;
  return (
    <section className="border-t border-[color:var(--brand-border)] py-12 md:py-14">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-center gap-3.5">
            <span className="accent-bar h-9 w-1.5 rounded-full" />
            <div>
              <p className="eyebrow">{eyebrow ?? "Curated for you"}</p>
              <h2 className="font-display mt-0.5 text-[24px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[28px]">{emoji && <span className="me-2">{emoji}</span>}{title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll("left")} className="hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white text-neutral-600 shadow-sm transition hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)] hover:shadow-md">
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <button onClick={() => scroll("right")} className="hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white text-neutral-600 shadow-sm transition hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)] hover:shadow-md">
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
            <Link href={viewMoreHref} className="ms-1 text-[12.5px] font-bold text-[color:var(--brand-maroon)] transition hover:text-[color:var(--brand-maroon-deep)]">{viewMoreLabel} →</Link>
          </div>
        </div>
        <div ref={ref} className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((p) => {
            const img = p.thumbnail_url ?? p.images?.[0] ?? null;
            const price = p.sale_price ?? p.price;
            const hasDiscount = p.sale_price && p.price && Number(p.sale_price) < Number(p.price);
            const off = hasDiscount ? Math.round((1 - Number(p.sale_price) / Number(p.price)) * 100) : 0;
            return (
              <Link key={p.id} href={`/products/${p.id}`} className="group premium-card shrink-0 w-[160px] overflow-hidden md:w-[190px]">
                <div className="relative w-full aspect-square overflow-hidden bg-[color:var(--paper-2)]">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={p.name} className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl text-neutral-300">📦</div>
                  )}
                  {hasDiscount && (
                    <span className="bg-brand-gradient absolute top-2.5 start-2.5 rounded-full px-2.5 py-1 text-[9.5px] font-black tracking-wider text-white shadow-sm">-{off}%</span>
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
          <Link href={viewMoreHref}
            className="group shrink-0 w-[160px] md:w-[190px] flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-[color:var(--brand-gold)]/50 bg-[color:var(--paper-2)]/40 text-[color:var(--brand-maroon)] transition hover:bg-[color:var(--paper-2)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm transition group-hover:scale-110">
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </span>
            <span className="text-[12px] font-bold">{viewMoreLabel}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
