import Link from "next/link";

const SERVICE_TILES = [
  { href: "/categories/home_services",   emoji: "🛠️", title: "Home Services", subtitle: "Repairs & maintenance", bg: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" },
  { href: "/categories/cleaning_service", emoji: "🧹", title: "Cleaning",      subtitle: "Home & office",         bg: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)" },
  { href: "/services/mobile-repair",      emoji: "🔧", title: "Mobile Repair", subtitle: "Fast device fixes",     bg: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)" },
  { href: "/categories/pest_control",     emoji: "🐜", title: "Pest Control",  subtitle: "Safe & effective",      bg: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)" },
  { href: "/categories/tailor_shop",      emoji: "🧵", title: "Tailoring",     subtitle: "Custom & alterations",  bg: "linear-gradient(135deg, #db2777 0%, #ec4899 100%)" },
  { href: "/services/explore-uaq",        emoji: "🧭", title: "Explore UAQ",   subtitle: "Tours & experiences",   bg: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)" },
];

export function ServiceQuickAccess() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-6 w-1 rounded-full" style={{ background: "linear-gradient(to bottom, #8E1B3A, #F24732)" }} />
        <h2 className="text-[17px] font-extrabold text-neutral-900">Popular services</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
        {SERVICE_TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 transition-all hover:scale-[1.02] hover:shadow-lg sm:p-5"
            style={{ background: tile.bg, minHeight: 116 }}
          >
            <span className="pointer-events-none absolute -end-6 -top-6 h-20 w-20 rounded-full bg-white/10" aria-hidden />
            <span className="text-2xl leading-none sm:text-3xl">{tile.emoji}</span>
            <div className="mt-3">
              <p className="text-[14px] font-extrabold leading-tight text-white sm:text-[15px]">{tile.title}</p>
              <p className="mt-0.5 text-[11px] text-white/75">{tile.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
