"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { label: "Dashboard",        href: "/vendor/dashboard" },
  { label: "Products",         href: "/vendor/products" },
  { label: "Orders",           href: "/vendor/orders" },
  { label: "Finance",          href: "/vendor/finance" },
  { label: "Promotions",       href: "/vendor/promotions" },
  { label: "Menu",             href: "/vendor/menu" },
  { label: "Business Profile", href: "/vendor/profile" },
  { label: "Support",          href: "/vendor/support" },
];

export function VendorPortalNav({ vendorName }: { vendorName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/vendor/login");
  }

  return (
    <aside className="hidden w-56 shrink-0 sm:block">
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--brand-border)] bg-white p-4 shadow-[var(--shadow-sm)]">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/60 to-transparent" aria-hidden />
        <p className="eyebrow">Vendor</p>
        <p className="font-display mt-0.5 truncate text-[15px] font-semibold text-[color:var(--ink)]">{vendorName}</p>
      </div>
      <nav className="mt-3 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "relative block rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all " +
                (active
                  ? "bg-brand-gradient text-white shadow-[var(--shadow-card)]"
                  : "text-[color:var(--ink)]/80 hover:bg-[color:var(--paper-2)] hover:text-[color:var(--brand-maroon)]")
              }
            >
              {active && <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-[color:var(--brand-gold)]" aria-hidden />}
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={signOut}
          className="mt-2 block w-full rounded-xl px-3.5 py-2.5 text-start text-sm font-medium text-[color:var(--brand-muted)] transition-colors hover:bg-[color:var(--paper-2)] hover:text-[color:var(--brand-maroon)]"
        >
          Sign Out
        </button>
      </nav>
    </aside>
  );
}


// Horizontal pill nav — visible on mobile (sidebar is hidden there)
export function VendorPillNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/vendor/login");
  }

  return (
    <div className="sm:hidden mb-5 -mx-4 px-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-bold transition-all " +
                (active
                  ? "bg-brand-gradient text-white shadow-[var(--shadow-card)]"
                  : "border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-muted)]")
              }
            >
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={signOut}
          className="whitespace-nowrap rounded-full border border-[color:var(--brand-border)] bg-white px-4 py-2 text-[13px] font-bold text-[color:var(--brand-muted)]"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
