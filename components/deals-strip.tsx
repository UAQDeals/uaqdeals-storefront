"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { aed } from "@/lib/format";

export type DealCard = {
  id: string;
  title: string;
  deal_price: number | null;
  original_price: number | null;
  discount_pct: number | null;
  deal_image_url: string | null;
  product_thumb: string | null;
};

export function DealsStrip({
  deals,
  title,
  subtitle,
  seeAll,
}: {
  deals: DealCard[];
  title: string;
  subtitle: string;
  seeAll: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  if (!deals.length) return null;

  function scroll(dir: -1 | 1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
          <p className="text-sm text-neutral-600">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/deals" className="hidden text-sm font-semibold text-[color:var(--brand-maroon)] hover:underline sm:inline">
            {seeAll}
          </Link>
          <button onClick={() => scroll(-1)} aria-label="Scroll" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100">
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </button>
          <button onClick={() => scroll(1)} aria-label="Scroll" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100">
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
      <div ref={ref} className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {deals.map((d) => {
          const img = d.deal_image_url || d.product_thumb;
          const pct = d.discount_pct ?? 0;
          return (
            <Link key={d.id} href={`/deals/${d.id}`} className="group w-[180px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[color:var(--brand-border)] bg-white sm:w-[210px]">
              <div className="relative aspect-[4/5] bg-neutral-100">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={d.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300"><Tag className="h-10 w-10" /></div>
                )}
                {pct > 0 && (
                  <span className="bg-brand-gradient absolute start-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-bold text-white">-{Math.round(pct)}%</span>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-semibold text-neutral-900">{d.title}</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-base font-bold text-[color:var(--brand-maroon)]">{aed(d.deal_price)}</span>
                  {d.original_price && Number(d.original_price) > Number(d.deal_price ?? 0) && (
                    <span className="text-xs text-neutral-500 line-through">{aed(d.original_price)}</span>
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
