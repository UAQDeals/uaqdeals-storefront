import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { CartIcon } from "@/components/cart-icon";

const NAV = [
  { label: "Deals", href: "/deals" },
  { label: "Categories", href: "/categories" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--brand-border)] bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/uaq_logo.png"
            alt="UAQ Deals"
            width={120}
            height={40}
            priority
            className="h-9 w-auto"
          />
        </Link>
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-neutral-700 transition-colors hover:text-[color:var(--brand-maroon)]"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/account"
            aria-label="Account"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
          >
            <User className="h-5 w-5" />
          </Link>
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
