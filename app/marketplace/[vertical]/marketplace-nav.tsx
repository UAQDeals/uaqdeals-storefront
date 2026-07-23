import Link from "next/link";
import { Smartphone, Home, Hash, Car } from "lucide-react";

const ITEMS = [
  { key: "used_items", en: "List Used Gadgets", ar: "أجهزة مستعملة", sub: "Sell your devices", subAr: "بِع أجهزتك", Icon: Smartphone, grad: ["#7C3AED", "#9333EA"] },
  { key: "real_estate", en: "Real Estate", ar: "العقارات", sub: "Property & rentals", subAr: "عقارات وإيجارات", Icon: Home, grad: ["#0D9488", "#0F766E"] },
  { key: "fancy_numbers", en: "VVIP Numbers & Plates", ar: "أرقام ولوحات مميّزة", sub: "Phone & car plates", subAr: "أرقام هواتف ولوحات", Icon: Hash, grad: ["#2563EB", "#1D4ED8"] },
  { key: "automotive", en: "Automotive", ar: "السيارات", sub: "Cars & bikes", subAr: "سيارات ودرّاجات", Icon: Car, grad: ["#8E1B3A", "#C72931"] },
] as const;

/** Premium category switcher shown at the top of every marketplace vertical. */
export function MarketplaceNav({ active, isRTL }: { active: string; isRTL: boolean }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 pb-6">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3.5">
        {ITEMS.map((it) => {
          const isActive = it.key === active;
          const Icon = it.Icon;
          const gradient = `linear-gradient(135deg, ${it.grad[0]}, ${it.grad[1]})`;
          return (
            <Link
              key={it.key}
              href={`/marketplace/${it.key}`}
              style={isActive ? { backgroundImage: gradient } : undefined}
              className={
                "group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 transition-all duration-200 sm:p-4 " +
                (isActive
                  ? "border-transparent text-white shadow-lg shadow-black/10"
                  : "border-neutral-200/80 bg-white hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md")
              }
            >
              <span
                style={!isActive ? { backgroundImage: gradient } : undefined}
                className={
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm " +
                  (isActive ? "bg-white/20" : "")
                }
              >
                <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
              </span>
              <span className="min-w-0">
                <span className={"block truncate text-sm font-bold leading-tight " + (isActive ? "text-white" : "text-neutral-900")}>
                  {isRTL ? it.ar : it.en}
                </span>
                <span className={"block truncate text-[11px] " + (isActive ? "text-white/80" : "text-neutral-500")}>
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
