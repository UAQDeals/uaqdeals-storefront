"use client";
import Link from "next/link";

const ITEMS = [
  { text: "🔥 60% OFF on Deals today", href: "/deals" },
  { text: "💰 Earn 25 Welcome Coins on Signup", href: "/login" },
  { text: "🚚 Free delivery on orders above AED 100", href: "/shop/a1000000-0000-0000-0000-000000000002" },
  { text: "🏥 Pharmacy now available — upload prescription", href: "/categories/pharmacy" },
];

export function AnnouncementBar() {
  return (
    <div
      className="bg-maroon-radial relative w-full overflow-hidden py-2"
    >
      {/* Gold hairline top + bottom accents */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/40 to-transparent" aria-hidden />
      <div className="flex animate-marquee whitespace-nowrap gap-0">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <Link key={i} href={item.href}
            className="inline-flex items-center gap-6 px-8 text-[12px] font-semibold tracking-tight text-white/95 transition-colors hover:text-white">
            {item.text}
            <span className="text-[color:var(--brand-gold)]/70">•</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
