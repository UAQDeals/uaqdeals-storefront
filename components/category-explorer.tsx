import Link from "next/link";
import {
  ArrowUpRight,
  UtensilsCrossed,
  HeartPulse,
  Home,
  Smartphone,
  Building2,
  Plane,
  Briefcase,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

const GROUPS: {
  Icon: LucideIcon;
  label: string;
  sub: string;
  href: string;
}[] = [
  { Icon: UtensilsCrossed, label: "Food & Grocery",       sub: "Restaurants · Grocery · Fish", href: "/categories/restaurant" },
  { Icon: HeartPulse,      label: "Health & Beauty",      sub: "Pharmacy · Clinics · Salons",  href: "/categories/pharmacy" },
  { Icon: Home,            label: "Home & Services",      sub: "Cleaning · Repairs · Tailor",  href: "/categories/home_services" },
  { Icon: Smartphone,      label: "Electronics",          sub: "Phones · Gaming · Gadgets",    href: "/shop/electronics" },
  { Icon: Building2,       label: "Listings",             sub: "Real estate · Cars · Used",    href: "/marketplace/real_estate" },
  { Icon: Plane,           label: "Travel & Experiences", sub: "Explore · Hotels · Flights",   href: "/services/explore-uaq" },
  { Icon: Briefcase,       label: "Business & Pro",       sub: "Typing · Setup · Software",     href: "/services/typing-center" },
  { Icon: LayoutGrid,      label: "Browse all",           sub: "38 categories across UAQ",     href: "/categories" },
];

export function CategoryExplorer() {
  return (
    <section className="relative overflow-hidden border-t border-neutral-100 bg-gradient-to-b from-white to-[#faf6f5] py-14">
      {/* Ambient brand glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 end-[-6rem] h-72 w-72 rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "radial-gradient(circle, #C72931 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="mb-7 flex items-end justify-between">
          <div className="flex items-center gap-3.5">
            <span className="h-9 w-1.5 rounded-full bg-brand-gradient" />
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[2.5px] text-[color:var(--brand-maroon)]">
                Shop by category
              </p>
              <h2 className="mt-1 text-[26px] font-extrabold tracking-tight text-neutral-900">
                Everything UAQ has to offer
              </h2>
            </div>
          </div>
          <Link
            href="/categories"
            className="group hidden items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[12.5px] font-bold text-neutral-800 shadow-sm transition-all hover:border-[color:var(--brand-maroon)]/30 hover:text-[color:var(--brand-maroon)] hover:shadow sm:inline-flex"
          >
            See all
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
          {GROUPS.map(({ Icon, label, sub, href }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--brand-maroon)]/25 hover:shadow-[0_18px_40px_-16px_rgba(142,27,58,0.28)]"
            >
              {/* Hover wash */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[color:var(--brand-maroon)]/[0.045] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--brand-maroon)]/[0.13] to-[color:var(--brand-maroon)]/[0.04] text-[color:var(--brand-maroon)] shadow-sm ring-1 ring-inset ring-[color:var(--brand-maroon)]/10 transition-transform duration-300 group-hover:scale-[1.07]">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </span>

              <div className="relative min-w-0 flex-1">
                <p className="text-[14px] font-extrabold leading-tight text-neutral-900 transition-colors group-hover:text-[color:var(--brand-maroon)]">
                  {label}
                </p>
                <p className="mt-1 truncate text-[11.5px] text-neutral-500">{sub}</p>
              </div>

              <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 transition-all duration-300 group-hover:bg-[color:var(--brand-maroon)] group-hover:text-white">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
