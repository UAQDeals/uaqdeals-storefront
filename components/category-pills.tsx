"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const PILLS = [
  { label: "Food & Grocery", emoji: "🍽️", href: "/categories/restaurant" },
  { label: "Health & Beauty", emoji: "💊", href: "/categories/pharmacy" },
  { label: "Home & Services", emoji: "🏠", href: "/services" },
  { label: "Retail",          emoji: "🛍️", href: "/shop/a1000000-0000-0000-0000-000000000001" },
  { label: "Listings",        emoji: "🏗️", href: "/marketplace/real_estate" },
  { label: "Travel",          emoji: "✈️", href: "/services/explore-uaq" },
  { label: "Business",        emoji: "💼", href: "/services/typing-center" },
];

const PILLS_AR = [
  { label: "طعام وبقالة",    emoji: "🍽️", href: "/categories/restaurant" },
  { label: "صحة وجمال",      emoji: "💊", href: "/categories/pharmacy" },
  { label: "منزل وخدمات",    emoji: "🏠", href: "/services" },
  { label: "تجزئة",          emoji: "🛍️", href: "/categories/electronics" },
  { label: "الإعلانات",      emoji: "🏗️", href: "/marketplace/real_estate" },
  { label: "سفر",            emoji: "✈️", href: "/services/explore-uaq" },
  { label: "أعمال",          emoji: "💼", href: "/services/typing-center" },
];

export function CategoryPills({ locale }: { locale: string }) {
  const isAR = locale === "ar";
  const pills = isAR ? PILLS_AR : PILLS;

  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="flex gap-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {pills.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-4 py-3.5 text-[12.5px] font-semibold text-neutral-600 hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)] transition-colors whitespace-nowrap"
            >
              <span className="text-sm">{p.emoji}</span>
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
