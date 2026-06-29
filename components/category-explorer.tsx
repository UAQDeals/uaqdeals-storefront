import Link from "next/link";
import { ArrowRight } from "lucide-react";

const GROUPS = [
  { emoji: "🍽️", label: "Food & Grocery",      sub: "Restaurants · Grocery · Fish",  href: "/categories/restaurant" },
  { emoji: "💊", label: "Health & Beauty",     sub: "Pharmacy · Clinics · Salons",   href: "/categories/pharmacy" },
  { emoji: "🏠", label: "Home & Services",     sub: "Cleaning · Repairs · Tailor",   href: "/categories/home_services" },
  { emoji: "📱", label: "Electronics",         sub: "Phones · Gaming · Gadgets",     href: "/shop/electronics" },
  { emoji: "🏗️", label: "Listings",            sub: "Real estate · Cars · Used",     href: "/marketplace/real_estate" },
  { emoji: "✈️", label: "Travel & Experiences", sub: "Explore · Hotels · Flights",    href: "/services/explore-uaq" },
  { emoji: "💼", label: "Business & Pro",       sub: "Typing · Setup · Software",     href: "/services/typing-center" },
  { emoji: "🧭", label: "Browse all",          sub: "38 categories across UAQ",      href: "/categories" },
];

export function CategoryExplorer() {
  return (
    <section className="border-t border-neutral-100 py-10">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="mb-5 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-brand-gradient" />
            <div>
              <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-[color:var(--brand-maroon)]">
                Shop by category
              </p>
              <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-900">
                Everything UAQ has to offer
              </h2>
            </div>
          </div>
          <Link
            href="/categories"
            className="hidden text-[12px] font-bold text-neutral-900 underline underline-offset-2 transition-colors hover:text-[color:var(--brand-maroon)] sm:inline"
          >
            See all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
          {GROUPS.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-neutral-100 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-[#8E1B3A]/25 hover:shadow-lg md:p-4 min-h-[72px]"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm transition-transform duration-300 group-hover:scale-110"
                style={{ background: "linear-gradient(135deg, #C72931, #8E1B3A)" }}
              >
                {g.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-extrabold leading-tight text-neutral-900 transition-colors group-hover:text-[color:var(--brand-maroon)] break-words hyphens-auto">
                  {g.label}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-neutral-500">{g.sub}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-[color:var(--brand-maroon)] rtl:rotate-180" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
