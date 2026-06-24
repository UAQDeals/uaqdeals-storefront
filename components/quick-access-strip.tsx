"use client";
import Link from "next/link";

const TILES = [
  {
    href: "/shop/c2020000-0000-0000-0000-000000000001",
    emoji: "🐟",
    bg: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)",
    badge: null,
    title: "Fresh Fish Market",
    subtitle: "Straight from UAQ fishermen",
  },
  {
    href: "/categories/pharmacy",
    emoji: "💊",
    bg: "linear-gradient(135deg, #7e1b38 0%, #C72931 100%)",
    badge: "50% OFF",
    title: "Pharmacy",
    subtitle: "Medicines & health essentials",
  },
  {
    href: "https://uaqdeals.ae/food",
    emoji: "🍔",
    bg: "linear-gradient(135deg, #92400e 0%, #d97706 100%)",
    badge: null,
    title: "Order Food",
    subtitle: "Open in UAQ Deals app",
    external: true,
  },
] satisfies { href: string; emoji: string; bg: string; badge: string | null; title: string; subtitle: string; external?: boolean }[];

export function QuickAccessStrip() {
  return (
    <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-6">
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            {...(tile.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 md:p-6 transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{ background: tile.bg, minHeight: 130 }}
          >
            <span className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" aria-hidden />
            <div className="flex items-start justify-between">
              <span className="text-3xl leading-none">{tile.emoji}</span>
              {tile.badge && (
                <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] font-black tracking-widest px-2 py-1 rounded-full">
                  {tile.badge}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-[15px] font-extrabold text-white leading-tight tracking-tight">{tile.title}</p>
              <p className="mt-1 text-[11.5px] text-white/70">{tile.subtitle}</p>
              <p className="mt-3 text-[11px] font-bold text-white/90 underline underline-offset-2">
                {tile.external ? "Open app →" : "Shop now →"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
