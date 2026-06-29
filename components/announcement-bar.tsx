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
    <div className="w-full overflow-hidden py-2"
      style={{ background: "linear-gradient(90deg, #8E1B3A 0%, #C72931 50%, #8E1B3A 100%)" }}>
      <div className="flex animate-marquee whitespace-nowrap gap-0">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <Link key={i} href={item.href}
            className="inline-flex items-center gap-6 px-8 text-[12px] font-semibold text-white hover:text-white/80 transition-colors">
            {item.text}
            <span className="text-white/40">•</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
