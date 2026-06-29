"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type BannerCard = {
  id: string;
  title: string | null;
  image_url: string;
  mobile_image_url: string | null;
  link_type: string | null;
  link_value: string | null;
};

function bannerHref(b: BannerCard): string {
  if (!b.link_type || !b.link_value) return "#";
  switch (b.link_type) {
    case "product":
      return `/products/${b.link_value}`;
    case "vendor":
      return `/vendors/${b.link_value}`;
    case "category":
      return `/categories/${b.link_value}`;
    case "deal":
      return `/deals/${b.link_value}`;
    case "url":
      return b.link_value;
    default:
      return "#";
  }
}

const AUTOPLAY_MS = 5000;

export function HomeBanners({ banners }: { banners: BannerCard[] }) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const slides = banners.slice(0, 6);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = slides.length;

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  if (count === 0) return null;

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      const forward = isRTL ? dx > 0 : dx < 0;
      go(forward ? index + 1 : index - 1);
    }
    touchStartX.current = null;
  }

  // In RTL the track is laid out right-to-left, so we translate the opposite way.
  const translatePct = (isRTL ? 1 : -1) * index * 100;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div
        className="group relative overflow-hidden rounded-2xl border border-[color:var(--brand-border)] bg-neutral-100"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${translatePct}%)` }}
        >
          {slides.map((b) => (
            <Link key={b.id} href={bannerHref(b)} className="relative block w-full shrink-0">
              <picture>
                {b.mobile_image_url && (
                  <source media="(max-width: 768px)" srcSet={b.mobile_image_url} />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image_url}
                  alt={b.title ?? "Banner"}
                  className="aspect-[4/3] w-full object-cover md:aspect-[16/7]"
                />
              </picture>
              {b.title && (
                <span className="absolute bottom-3 start-3 rounded-md bg-black/55 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                  {b.title}
                </span>
              )}
            </Link>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous"
              className="absolute start-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-neutral-800 shadow opacity-0 transition group-hover:opacity-100 sm:flex"
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Next"
              className="absolute end-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-neutral-800 shadow opacity-0 transition group-hover:opacity-100 sm:flex"
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>

            <div className="absolute bottom-3 end-3 flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={
                    "h-2 rounded-full transition-all " +
                    (i === index ? "w-5 bg-white" : "w-2 bg-white/55 hover:bg-white/80")
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
