"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const TILES = [
  {
    slug: "fish_market",
    href: "/categories/fish_market",
    emoji: "🐟",
    bg: "from-[#0c4a6e] to-[#075985]",
    badge: null,
    titleKey: "quickAccess.fish",
    subtitleKey: "quickAccess.fishSub",
  },
  {
    slug: "pharmacy",
    href: "/categories/pharmacy",
    emoji: "💊",
    bg: "from-[#7e1b38] to-[#9f1239]",
    badge: "50% OFF",
    titleKey: "quickAccess.pharmacy",
    subtitleKey: "quickAccess.pharmacySub",
  },
  {
    slug: "restaurant",
    href: "/categories/restaurant",
    emoji: "🍽️",
    bg: "from-[#92400e] to-[#b45309]",
    badge: null,
    titleKey: "quickAccess.food",
    subtitleKey: "quickAccess.foodSub",
  },
] as const;

export function QuickAccessStrip() {
  const t = useTranslations("quickAccess");

  return (
    <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-5">
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {TILES.map((tile) => (
          <Link
            key={tile.slug}
            href={tile.href}
            className={`relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${tile.bg} p-4 md:p-5 group transition-opacity hover:opacity-90`}
            style={{ minHeight: 110 }}
          >
            {/* decorative circle */}
            <span
              className="pointer-events-none absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/10"
              aria-hidden
            />

            {/* top row: emoji + badge */}
            <div className="flex items-start justify-between">
              <span className="text-3xl leading-none">{tile.emoji}</span>
              {tile.badge && (
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white tracking-wide">
                  {tile.badge}
                </span>
              )}
            </div>

            {/* bottom: title + subtitle */}
            <div className="mt-3">
              <p className="text-[14px] md:text-[15px] font-bold text-white leading-tight">
                {t(tile.titleKey.split(".")[1] as any)}
              </p>
              <p className="mt-0.5 text-[11px] text-white/75 leading-snug">
                {t(tile.subtitleKey.split(".")[1] as any)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
