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
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-neutral-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)", boxShadow: "0 -4px 20px rgba(0,0,0,0.12)" }}
    >
      <div className={showProducts ? "grid grid-cols-5" : "grid grid-cols-4"}>
        {ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          const isDeals = label === "Deals";
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center gap-0.5 py-2"
            >
              <div className="relative">
                {isDeals ? (
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-full"
                    style={{ background: "rgba(199,41,49,0.12)" }}
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
                    className="w-5 h-5"
                    style={{ color: active ? "#8E1B3A" : "#9ca3af" }}
                  />
                )}
                {label === "Cart" && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#C72931] text-white text-[9px] font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <span
                className="text-[9.5px] font-semibold"
                style={{ color: active ? "#8E1B3A" : "#9ca3af" }}
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
