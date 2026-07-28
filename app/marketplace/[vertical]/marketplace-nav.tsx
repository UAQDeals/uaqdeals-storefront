import Link from "next/link";
import { Smartphone, Home, Hash, Car } from "lucide-react";

const ITEMS = [
  { key: "used_items", en: "List Used Gadgets", ar: "أجهزة مستعملة", sub: "Sell your devices", subAr: "بِع أجهزتك", Icon: Smartphone },
  { key: "real_estate", en: "Real Estate", ar: "العقارات", sub: "Property & rentals", subAr: "عقارات وإيجارات", Icon: Home },
  { key: "fancy_numbers", en: "VVIP Numbers & Plates", ar: "أرقام ولوحات مميّزة", sub: "Phone & car plates", subAr: "أرقام هواتف ولوحات", Icon: Hash },
  { key: "automotive", en: "Automotive", ar: "السيارات", sub: "Cars & bikes", subAr: "سيارات ودرّاجات", Icon: Car },
] as const;

/** Premium category switcher shown at the top of every marketplace vertical. */
export function MarketplaceNav({ active, isRTL }: { active: string; isRTL: boolean }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 pb-6">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3.5">
        {ITEMS.map((it) => {
          const isActive = it.key === active;
          const Icon = it.Icon;
          return (
            <Link
              key={it.key}
              href={`/marketplace/${it.key}`}
              className={
                "group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 transition-all duration-300 sm:p-4 " +
                (isActive
                  ? "bg-brand-gradient border-transparent text-white shadow-[var(--shadow-card)]"
                  : "premium-card hover:-translate-y-0.5")
              }
            >
              <span
                className={
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 " +
                  (isActive ? "bg-white/20" : "bg-brand-gradient")
                }
              >
                <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
              </span>
              <span className="min-w-0">
                <span className={"block truncate text-sm font-bold leading-tight " + (isActive ? "text-white" : "text-[color:var(--ink)]")}>
                  {isRTL ? it.ar : it.en}
                </span>
                <span className={"block truncate text-[11px] " + (isActive ? "text-white/80" : "text-[color:var(--brand-muted)]")}>
                  {isRTL ? it.subAr : it.sub}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
