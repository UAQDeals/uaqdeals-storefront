import Link from "next/link";
import { Fish, Pill, UtensilsCrossed, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";

export type QuickTile = {
  key: string;
  href: string;
  title: string;
  imageUrl: string | null;
  badge?: string | null;
};

const ICONS: Record<string, typeof Fish> = {
  fish: Fish,
  pharmacy: Pill,
  food: UtensilsCrossed,
};

export function QuickAccessStrip({ tiles }: { tiles: QuickTile[] }) {
  if (!tiles || tiles.length === 0) return null;
  return (
    <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-7">
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {tiles.map((tile, i) => {
          const Icon = ICONS[tile.key] ?? UtensilsCrossed;
          return (
            <Reveal key={tile.href} delay={i * 80}>
              <Link
                href={tile.href}
                className="group relative block overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                style={{ aspectRatio: "1/1" }}
              >
                {tile.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tile.imageUrl}
                    alt={tile.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="bg-maroon-radial absolute inset-0 flex items-center justify-center">
                    <Icon className="h-12 w-12 text-white/80 transition-transform duration-500 group-hover:scale-110" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/60 to-transparent" aria-hidden />
                {tile.badge && (
                  <span className="bg-brand-gradient absolute top-3 end-3 rounded-full px-2.5 py-1 text-[9px] font-black tracking-widest text-white shadow-sm">
                    {tile.badge}
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 md:p-5">
                  <p className="font-display text-[15px] font-semibold leading-tight text-white drop-shadow sm:text-[18px]">
                    {tile.title}
                  </p>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
