"use client";
import Link from "next/link";

type Tile = { href: string; image: string; badge: string | null; title: string };

const TILES: Tile[] = [
  {
    href: "/categories/fish_market",
    image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&h=600&fit=crop&auto=format",
    badge: null,
    title: "Fresh Fish Market",
  },
  {
    href: "/categories/pharmacy",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop&auto=format",
    badge: "50% OFF",
    title: "Pharmacy",
  },
  {
    href: "/categories/restaurant",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop&auto=format",
    badge: null,
    title: "Order Food",
  },
];

export function QuickAccessStrip() {
  return (
    <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-6">
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {TILES.map((tile) => (
          <Link key={tile.href} href={tile.href}
            className="group relative overflow-hidden rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl"
            style={{ aspectRatio: "1/1" }}>
            {/* Stock image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tile.image} alt={tile.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {/* Badge */}
            {tile.badge && (
              <span className="absolute top-3 end-3 bg-[#C72931] text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full">
                {tile.badge}
              </span>
            )}
            {/* Title */}
            <div className="absolute bottom-0 p-4 md:p-5">
              <p className="text-[14px] md:text-[16px] font-extrabold text-white leading-tight tracking-tight drop-shadow-sm">
                {tile.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
