"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const TILES = [
  {
    slug: "fish_market",
    href: "/categories/fish_market",
    emoji: "🐟",
    bg: "#0c4a6e",
    badge: null,
    titleKey: "fish",
    subtitleKey: "fishSub",
  },
  {
    slug: "pharmacy",
    href: "/categories/pharmacy",
    emoji: "💊",
    bg: "#7e1b38",
    badge: "50% OFF",
    titleKey: "pharmacy",
    subtitleKey: "pharmacySub",
  },
  {
    slug: "restaurant",
    href: "/categories/restaurant",
    emoji: "🍽️",
    bg: "#92400e",
    badge: null,
    titleKey: "food",
    subtitleKey: "foodSub",
  },
] as const;

export function QuickAccessStrip() {
  const t = useTranslations("quickAccess");

  return (
    <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-6">
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {TILES.map((tile) => (
          <Link
            key={tile.slug}
            href={tile.href}
            className="group relative flex flex-col justify-between overflow-hidden p-5 md:p-6 transition-opacity hover:opacity-90"
            style={{ background: tile.bg, minHeight: 130 }}
          >
            {/* decorative circle */}
            <span
              className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10"
              aria-hidden
            />
            {/* top row */}
            <div className="flex items-start justify-between">
              <span className="text-3xl leading-none">{tile.emoji}</span>
              {tile.badge && (
                <span className="bg-[#c72931] text-white text-[9px] font-black tracking-widest px-2 py-1">
                  {tile.badge}
                </span>
              )}
            </div>
            {/* bottom */}
            <div className="mt-4">
              <p className="text-[15px] font-extrabold text-white leading-tight tracking-tight">
                {t(tile.titleKey as any)}
              </p>
              <p className="mt-1 text-[11.5px] text-white/70">
                {t(tile.subtitleKey as any)}
              </p>
              <p className="mt-3 text-[11px] font-bold text-white underline underline-offset-2">
                Shop now →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
