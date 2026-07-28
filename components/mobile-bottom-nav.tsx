"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Flame, Search, ShoppingCart, Wrench, User, LifeBuoy } from "lucide-react";
import { useCart } from "@/lib/cart";


const PRODUCT_ITEMS = [
  { label: "Home",       href: "/",            icon: Home },
  { label: "Categories", href: "/categories",  icon: LayoutGrid },
  { label: "Deals",      href: "/deals",       icon: Flame },
  { label: "Search",     href: "/search",      icon: Search },
  { label: "Cart",       href: "/cart",        icon: ShoppingCart },
];

// Mirrors the app's services-only nav (Home / Services / Profile / Support)
const SERVICE_ITEMS = [
  { label: "Home",     href: "/",         icon: Home },
  { label: "Services", href: "/services", icon: Wrench },
  { label: "Profile",  href: "/account",  icon: User },
  { label: "Support",  href: "/contact",  icon: LifeBuoy },
];

export function MobileBottomNav({ showProducts = true }: { showProducts?: boolean }) {
  const pathname = usePathname();
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const ITEMS = showProducts ? PRODUCT_ITEMS : SERVICE_ITEMS;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-[color:var(--brand-border)]"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "color-mix(in srgb, var(--paper) 82%, white)",
        backdropFilter: "saturate(1.1) blur(8px)",
        boxShadow: "0 -6px 24px rgba(27,22,20,0.10)",
      }}
    >
      {/* Gold hairline */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent"
        aria-hidden
      />
      <div className={showProducts ? "grid grid-cols-5" : "grid grid-cols-4"}>
        {ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          const isDeals = label === "Deals";
          return (
            <Link
              key={href}
              href={href}
              className="group relative flex flex-col items-center justify-center gap-0.5 py-2"
            >
              {/* Active pill top marker */}
              {active && !isDeals && (
                <span className="accent-bar absolute top-0 h-[2.5px] w-7 rounded-full" aria-hidden />
              )}
              <div className="relative">
                {isDeals ? (
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-full ring-1 ring-[color:var(--brand-gold)]/30 transition-transform duration-300 group-active:scale-95"
                    style={{ background: "color-mix(in srgb, var(--brand-maroon) 12%, transparent)" }}
                  >
                    {/* Colourful flame — mirrors the customer app's Deals icon */}
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <defs>
                        <linearGradient id="dealsFlame" x1="12" y1="22" x2="12" y2="3" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#F97316" />
                          <stop offset="0.55" stopColor="#FB923C" />
                          <stop offset="1" stopColor="#FDE047" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
                        fill="url(#dealsFlame)"
                      />
                    </svg>
                  </div>
                ) : (
                  <Icon
                    className={
                      "w-5 h-5 transition-colors duration-200 " +
                      (active
                        ? "text-[color:var(--brand-maroon)]"
                        : "text-neutral-400 group-hover:text-[color:var(--brand-maroon)]/70")
                    }
                    strokeWidth={active ? 2.4 : 2}
                  />
                )}
                {label === "Cart" && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[color:var(--brand-maroon)] text-white text-[9px] font-bold ring-1 ring-[color:var(--brand-gold)]/40">
                    {cartCount}
                  </span>
                )}
              </div>
              <span
                className={
                  "text-[9.5px] font-semibold tracking-tight transition-colors duration-200 " +
                  (active
                    ? "text-[color:var(--brand-maroon)]"
                    : "text-neutral-400 group-hover:text-neutral-600")
                }
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
