"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { aed } from "@/lib/format";

// Perpetual 2-hour flash-deals countdown (mirrors the customer app). Client-only
// (set after mount) to avoid a hydration mismatch.
function useFlashCountdown() {
  const [t, setT] = useState<string>("");
  useEffect(() => {
    const epoch = Date.UTC(2026, 0, 1);
    const cycle = 2 * 60 * 60 * 1000;
    const two = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const left = cycle - ((Date.now() - epoch) % cycle);
      setT(`${two(Math.floor(left / 3600000))}:${two(Math.floor((left % 3600000) / 60000))}:${two(Math.floor((left % 60000) / 1000))}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

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
  const countdown = useFlashCountdown();
  if (!deals.length) return null;

  return (
    <section className="border-t border-neutral-100 py-10">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        {/* Section header — Zalando style */}
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-[color:var(--brand-maroon)] mb-1">
              {subtitle}
            </p>
            <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-900">{title}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {countdown && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#c72931]/10 px-2.5 py-1 text-[11px] font-bold tabular-nums text-[#c72931]">
                🔥 Ends in {countdown}
              </span>
            )}
            <Link
              href="/deals"
              className="text-[12px] font-bold text-neutral-900 underline underline-offset-2 hover:text-[color:var(--brand-maroon)] transition-colors"
            >
              {seeAll} →
            </Link>
          </div>
        </div>

        {/* Horizontal scroll */}
        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {deals.map((d) => {
            const img = d.deal_image_url || d.product_thumb;
            const pct = d.discount_pct ?? 0;
            return (
              <Link
                key={d.id}
                href={`/deals/${d.id}`}
                className="group shrink-0 w-[170px] md:w-[200px] cursor-pointer"
              >
                {/* Image */}
                <div className="relative w-full aspect-[4/5] bg-neutral-100 overflow-hidden">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={d.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-300 text-4xl">🏷️</div>
                  )}
                  {pct > 0 && (
                    <span className="absolute top-2 start-2 bg-[#c72931] text-white text-[9px] font-black tracking-widest px-2 py-1">
                      -{Math.round(pct)}%
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className="pt-2.5 pb-1">
                  <p className="text-[11px] font-bold text-neutral-900 uppercase tracking-wide truncate">
                    UAQ Deals
                  </p>
                  <p className="text-[12px] text-neutral-600 mt-0.5 line-clamp-2 leading-snug">{d.title}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-[13.5px] font-bold text-neutral-900">{aed(d.deal_price)}</span>
                    {d.original_price && Number(d.original_price) > Number(d.deal_price ?? 0) && (
                      <span className="text-[11px] text-neutral-400 line-through">{aed(d.original_price)}</span>
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
