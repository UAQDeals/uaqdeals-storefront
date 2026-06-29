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
    <section className="border-t border-neutral-100 py-10">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="mb-5 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-brand-gradient" />
            <div>
              {eyebrow && <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-[color:var(--brand-maroon)]">{eyebrow}</p>}
              <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-900">{emoji && <span className="me-2">{emoji}</span>}{title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll("left")} className="hidden md:flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)] transition-colors">
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <button onClick={() => scroll("right")} className="hidden md:flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)] transition-colors">
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
            <Link href={viewMoreHref} className="text-[12px] font-bold text-neutral-900 underline underline-offset-2 hover:text-[color:var(--brand-maroon)] transition-colors">{viewMoreLabel} →</Link>
          </div>
        </div>
        <div ref={ref} className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((p) => {
            const img = p.thumbnail_url ?? p.images?.[0] ?? null;
            const price = p.sale_price ?? p.price;
            const hasDiscount = p.sale_price && p.price && Number(p.sale_price) < Number(p.price);
            return (
              <Link key={p.id} href={`/products/${p.id}`} className="group shrink-0 w-[150px] md:w-[180px]">
                <div className="relative w-full aspect-square bg-neutral-100 overflow-hidden rounded-xl">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl text-neutral-300">📦</div>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-2 start-2 bg-[#c72931] text-white text-[9px] font-black tracking-widest px-2 py-1 rounded-sm">SALE</span>
                  )}
                </div>
                <div className="pt-2.5">
                  <p className="text-[12px] text-neutral-700 line-clamp-2 leading-snug">{p.name}</p>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-[13.5px] font-bold text-neutral-900">{aed(price)}</span>
                    {hasDiscount && <span className="text-[11px] text-neutral-400 line-through">{aed(p.price)}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
          <Link href={viewMoreHref}
            className="shrink-0 w-[150px] md:w-[180px] flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-neutral-200 hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)] transition-colors text-neutral-400 gap-2">
            <ChevronRight className="h-6 w-6" />
            <span className="text-xs font-semibold">{viewMoreLabel}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
