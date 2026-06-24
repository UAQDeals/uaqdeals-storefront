"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { label: "Dashboard", href: "/vendor/dashboard" },
  { label: "Products", href: "/vendor/products" },
  { label: "Orders", href: "/vendor/orders" },
  { label: "Finance", href: "/vendor/finance" },
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
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-400">Vendor</p>
        <p className="mt-0.5 truncate text-sm font-bold text-neutral-900">{vendorName}</p>
      </div>
      <nav className="mt-3 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                (active
                  ? "bg-gradient-to-r from-[#8E1B3A] to-[#C72931] text-white"
                  : "text-neutral-700 hover:bg-neutral-100")
              }
            >
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={signOut}
          className="mt-2 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-500 hover:bg-neutral-100"
        >
          Sign Out
        </button>
      </nav>
    </aside>
  );
}
