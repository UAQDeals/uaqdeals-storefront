"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Search, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import type { BannerCard } from "@/components/home-banners";

const CHIPS = [
  { label: "Grocery", ar: "بقالة", href: "/shop/grocery" },
  { label: "Restaurants", ar: "مطاعم", href: "/categories/restaurant" },
  { label: "Pharmacy", ar: "صيدلية", href: "/categories/pharmacy" },
  { label: "Electronics", ar: "إلكترونيات", href: "/shop/electronics" },
  { label: "Services", ar: "خدمات", href: "/services" },
  { label: "Real Estate", ar: "عقارات", href: "/marketplace/real_estate" },
];

const AR_EMIRATES: Record<string, string> = {
  "Umm Al Quwain": "أم القيوين",
  "Al Hamriyah": "الحمرية",
};

// Arabic labels for hero chips keyed by href (chips may be built server-side in English).
const AR_CHIP: Record<string, string> = {
  "/shop/grocery": "بقالة",
  "/categories/restaurant": "مطاعم",
  "/categories/pharmacy": "صيدلية",
  "/shop/electronics": "إلكترونيات",
  "/services": "خدمات",
  "/marketplace/real_estate": "عقارات",
};

function bannerHref(b: BannerCard): string {
  if (!b.link_type || !b.link_value) return "#";
  switch (b.link_type) {
    case "product":  return `/products/${b.link_value}`;
    case "vendor":   return `/vendors/${b.link_value}`;
    case "category": return `/categories/${b.link_value}`;
    case "deal":     return `/deals/${b.link_value}`;
    case "url":      return b.link_value;
    default:         return "#";
  }
}

const AUTOPLAY_MS = 5000;

export function HomeHero({
  banners,
  emirate,
  chips,
}: {
  banners: BannerCard[];
  emirate: string | null;
  chips?: { label: string; href: string }[];
}) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const place = emirate ?? "Umm Al Quwain";
  const placeName = isRTL ? (AR_EMIRATES[place] ?? place) : place;

  const slides = banners.slice(0, 6);
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

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

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go((isRTL ? dx > 0 : dx < 0) ? index + 1 : index - 1);
    touchStartX.current = null;
  }

  const translatePct = (isRTL ? 1 : -1) * index * 100;

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #8E1B3A 0%, #C72931 52%, #F24732 100%)" }}
    >
      {/* decorative glows */}
      <span className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-white/10" aria-hidden />
      <span className="pointer-events-none absolute -bottom-28 -start-20 h-80 w-80 rounded-full bg-black/10" aria-hidden />

      <div className="relative mx-auto max-w-[1320px] px-5 md:px-8 py-9 md:py-14">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
          {/* Left — copy, search, chips */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11.5px] font-bold text-white backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5" />
              {placeName}
            </span>
            <h1 className="mt-4 text-[30px] font-extrabold leading-[1.08] tracking-[-0.5px] text-white sm:text-[40px]">
              {isRTL ? (<>كل شيء في {placeName}،<br className="hidden sm:block" /> يصلك اليوم.</>)
                     : (<>Everything in {placeName},<br className="hidden sm:block" /> delivered today.</>)}
            </h1>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/85 sm:text-[15px]">
              {isRTL
                ? `بقالة وطعام وصيدلية وخدمات وقوائم محلية — تطبيق واحد شامل لكل ${placeName}.`
                : `Groceries, food, pharmacy, services and local listings — one super-app for all of ${placeName}.`}
            </p>

            {/* Search (routes to /search) */}
            <Link
              href="/search"
              className="mt-6 flex w-full max-w-md items-center gap-3 rounded-full bg-white px-5 py-3.5 shadow-lg transition hover:shadow-xl"
            >
              <Search className="h-4.5 w-4.5 shrink-0 text-[color:var(--brand-maroon)]" style={{ width: 18, height: 18 }} />
              <span className="text-[13.5px] font-medium text-neutral-400">
                {isRTL ? "ابحث عن منتجات وعروض وخدمات…" : "Search products, deals, services…"}
              </span>
            </Link>

            {/* Quick chips */}
            <div className="mt-5 flex flex-wrap gap-2">
              {(chips ?? CHIPS).map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  {isRTL ? (AR_CHIP[c.href] ?? (c as { ar?: string }).ar ?? c.label) : c.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right — banner carousel in a glass frame */}
          {count > 0 && (
            <div className="rounded-3xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-sm">
              <div
                className="group relative overflow-hidden rounded-2xl bg-black/10"
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
                        {b.mobile_image_url && <source media="(max-width: 768px)" srcSet={b.mobile_image_url} />}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.image_url} alt={b.title ?? "Banner"} className="aspect-[2/1] w-full object-cover md:aspect-[16/5]" />
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
                      className="absolute start-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow opacity-0 transition group-hover:opacity-100 sm:flex"
                    >
                      <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
                    </button>
                    <button
                      onClick={() => go(index + 1)}
                      aria-label="Next"
                      className="absolute end-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow opacity-0 transition group-hover:opacity-100 sm:flex"
                    >
                      <ChevronRight className="h-5 w-5 rtl:rotate-180" />
                    </button>
                    <div className="absolute bottom-3 end-3 flex items-center gap-1.5">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => go(i)}
                          aria-label={`Go to slide ${i + 1}`}
                          className={"h-2 rounded-full transition-all " + (i === index ? "w-5 bg-white" : "w-2 bg-white/55 hover:bg-white/80")}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
