import Link from "next/link";

const ITEMS: { key: string; en: string; ar: string; emoji: string; href: string }[] = [
  { key: "used_items", en: "List Used Gadgets", ar: "أجهزة مستعملة", emoji: "📱", href: "/marketplace/used_items" },
  { key: "real_estate", en: "Real Estate", ar: "العقارات", emoji: "🏠", href: "/marketplace/real_estate" },
  { key: "fancy_numbers", en: "VVIP Numbers & Plates", ar: "أرقام ولوحات مميزة", emoji: "🔢", href: "/marketplace/fancy_numbers" },
  { key: "automotive", en: "Automotive", ar: "السيارات", emoji: "🚗", href: "/marketplace/automotive" },
];

/** Category switcher shown at the top of every marketplace vertical page. */
export function MarketplaceNav({ active, isRTL }: { active: string; isRTL: boolean }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ITEMS.map((it) => {
          const isActive = it.key === active;
          return (
            <Link
              key={it.key}
              href={it.href}
              className={
                "group flex items-center gap-3 rounded-2xl border p-3.5 transition-all " +
                (isActive
                  ? "border-transparent bg-gradient-to-br from-[#8E1B3A] to-[#C72931] text-white shadow-lg"
                  : "border-neutral-200 bg-white text-neutral-800 hover:border-[#C72931]/40 hover:shadow-md")
              }
            >
              <span
                className={
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl " +
                  (isActive ? "bg-white/20" : "bg-neutral-100 group-hover:bg-[#C72931]/10")
                }
              >
                {it.emoji}
              </span>
              <span className="text-sm font-bold leading-tight">{isRTL ? it.ar : it.en}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
