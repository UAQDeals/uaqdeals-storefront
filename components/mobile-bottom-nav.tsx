"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Flame, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

const ITEMS = [
  { label: "Home",       href: "/",            icon: Home },
  { label: "Categories", href: "/categories",  icon: LayoutGrid },
  { label: "Deals",      href: "/deals",       icon: Flame },
  { label: "Search",     href: "/search",      icon: Search },
  { label: "Cart",       href: "/cart",        icon: ShoppingCart },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-neutral-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)", boxShadow: "0 -4px 20px rgba(0,0,0,0.12)" }}
    >
      <div className="grid grid-cols-5">
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
                    className="flex items-center justify-center w-9 h-9 -mt-4 rounded-full text-white shadow-md"
                    style={{ background: "linear-gradient(135deg, #C72931, #8E1B3A)" }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
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
