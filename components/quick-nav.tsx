import Link from "next/link";
import { ShoppingBag, ConciergeBell, UtensilsCrossed, Gamepad2 } from "lucide-react";
import { Reveal } from "@/components/reveal";

export type QuickNavItem = { key: string; label: string; href: string };

const ICONS: Record<string, typeof ShoppingBag> = {
  shop: ShoppingBag,
  services: ConciergeBell,
  food: UtensilsCrossed,
  games: Gamepad2,
};

// Per-tile accent gradient — mirrors the customer app's quick-access pills.
const ACCENT: Record<string, string> = {
  shop: "linear-gradient(135deg,#2B2F45,#1b1e30)",
  services: "linear-gradient(135deg,#E87A2C,#c85f18)",
  food: "linear-gradient(135deg,#E7B12A,#c8920f)",
  games: "linear-gradient(135deg,#8E1B3A,#6c1027)",
};

export function QuickNav({ items }: { items: QuickNavItem[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-6">
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
        {items.map((it, i) => {
          const Icon = ICONS[it.key] ?? ShoppingBag;
          return (
            <Reveal key={it.key} delay={i * 70}>
              <Link
                href={it.href}
                className="premium-card group relative flex flex-col items-center gap-2.5 overflow-hidden px-2 py-4 text-center sm:py-5"
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/60 to-transparent" aria-hidden />
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md ring-1 ring-white/30 transition-transform duration-500 group-hover:scale-110 sm:h-14 sm:w-14"
                  style={{ background: ACCENT[it.key] ?? ACCENT.shop }}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span className="font-display text-[13px] font-semibold leading-tight text-[color:var(--ink)] sm:text-[15px]">
                  {it.label}
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
