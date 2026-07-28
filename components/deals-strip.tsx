"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { aed } from "@/lib/format";
import { Reveal } from "@/components/reveal";

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
    <section className="border-t border-[color:var(--brand-border)] py-12 md:py-14">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        {/* Section header */}
        <Reveal className="mb-6 flex items-end justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <span className="accent-bar h-9 w-1.5 rounded-full" />
            <div>
              <p className="eyebrow">{subtitle}</p>
              <h2 className="font-display mt-0.5 text-[24px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[28px]">
                {title}
              </h2>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {countdown && (
              <span className="hidden items-center gap-1.5 rounded-full border border-[color:var(--brand-gold)]/40 bg-[color:var(--brand-gold)]/10 px-3 py-1.5 text-[11.5px] font-bold tabular-nums text-[color:var(--brand-maroon)] shadow-sm sm:inline-flex">
                <Flame className="h-3.5 w-3.5 text-[color:var(--brand-red)]" />
                Ends in {countdown}
              </span>
            )}
            <Link
              href="/deals"
              className="text-[12.5px] font-bold text-[color:var(--brand-maroon)] transition hover:text-[color:var(--brand-maroon-deep)]"
            >
              {seeAll} →
            </Link>
          </div>
        </Reveal>

        {/* Horizontal scroll */}
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {deals.map((d, i) => {
            const img = d.deal_image_url || d.product_thumb;
            const pct = d.discount_pct ?? 0;
            return (
              <Reveal key={d.id} delay={i * 70}>
                <Link
                  href={`/deals/${d.id}`}
                  className="group premium-card block w-[170px] shrink-0 overflow-hidden md:w-[200px]"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[color:var(--paper-2)]">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={d.title}
                        className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl text-neutral-300">🏷️</div>
                    )}
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" aria-hidden />
                    {pct > 0 && (
                      <span className="bg-brand-gradient absolute top-2.5 start-2.5 rounded-full px-2.5 py-1 text-[9.5px] font-black tracking-wider text-white shadow-sm">
                        -{Math.round(pct)}%
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <p className="eyebrow truncate text-[9.5px]">UAQ Deals</p>
                    <p className="mt-1 min-h-[32px] text-[12.5px] leading-snug text-neutral-700 line-clamp-2">{d.title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-[15px] font-extrabold text-[color:var(--brand-maroon)]">{aed(d.deal_price)}</span>
                      {d.original_price && Number(d.original_price) > Number(d.deal_price ?? 0) && (
                        <span className="text-[11px] text-neutral-400 line-through">{aed(d.original_price)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
