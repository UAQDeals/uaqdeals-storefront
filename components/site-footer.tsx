import Link from "next/link";
import { getTranslations } from "next-intl/server";

const SHOP_LINKS = [
  { en: "Electronics",          ar: "إلكترونيات",      href: "/shop/a1000000-0000-0000-0000-000000000001" },
  { en: "Grocery",              ar: "بقالة",           href: "/shop/a1000000-0000-0000-0000-000000000002" },
  { en: "Beauty & Fragrance",   ar: "جمال وعطور",      href: "/shop/a1000000-0000-0000-0000-000000000003" },
  { en: "Home & Kitchen",       ar: "منزل ومطبخ",      href: "/shop/a1000000-0000-0000-0000-000000000004" },
  { en: "Fashion",              ar: "موضة",            href: "/shop/a1000000-0000-0000-0000-000000000005" },
  { en: "Baby",                 ar: "أطفال",           href: "/shop/a1000000-0000-0000-0000-000000000006" },
  { en: "Toys",                 ar: "ألعاب",           href: "/shop/a1000000-0000-0000-0000-000000000007" },
  { en: "Health & Nutrition",   ar: "صحة وتغذية",      href: "/shop/a1000000-0000-0000-0000-000000000009" },
  { en: "Stationery",           ar: "قرطاسية",         href: "/shop/a1000000-0000-0000-0000-000000000010" },
  { en: "Books",                ar: "كتب",             href: "/shop/a1000000-0000-0000-0000-000000000011" },
  { en: "Marketplace",          ar: "سوق",             href: "/marketplace/real_estate" },
];

const SERVICES_LINKS = [
  { en: "Home Services",        ar: "خدمات منزلية",    href: "/categories/home_services" },
  { en: "Cleaning Service",     ar: "خدمة تنظيف",      href: "/categories/cleaning_service" },
  { en: "Pest Control",         ar: "مكافحة الحشرات",  href: "/categories/pest_control" },
  { en: "Mobile Repair",        ar: "إصلاح جوالات",    href: "/categories/mobile_repair" },
  { en: "Typing Center",        ar: "مركز تايبنج",     href: "/categories/typing_center" },
  { en: "Business Setup",       ar: "تأسيس شركات",     href: "/categories/business_setup" },
  { en: "Explore UAQ",          ar: "استكشف أم القيوين",href: "/categories/explore_uaq" },
  { en: "Hotel Booking",        ar: "حجز فنادق",       href: "/categories/hotel_booking" },
  { en: "Flight Booking",       ar: "حجز رحلات",       href: "/categories/flight_booking" },
];

const HELP_LINKS = [
  { en: "Track your order",     ar: "تتبع طلبك",       href: "/account" },
  { en: "Contact us",           ar: "تواصل معنا",       href: "/contact" },
  { en: "About UAQ Deals",      ar: "عن أم القيوين ديلز",href: "/about" },
  { en: "Terms of Service",     ar: "الشروط والأحكام",  href: "/terms" },
  { en: "Privacy Policy",       ar: "سياسة الخصوصية",  href: "/privacy" },
];

export async function SiteFooter() {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-400 pb-20 md:pb-0">

      {/* Main columns */}
      <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">

        {/* Brand col */}
        <div className="col-span-2 md:col-span-1">
          <div className="text-white font-extrabold text-lg tracking-tight mb-3">
            UAQ Deals
          </div>
          <p className="text-[12.5px] leading-relaxed text-neutral-500 mb-6 max-w-xs">
            Umm Al Quwain's super-app — groceries, food, services, real estate and more. Delivered locally, priced fairly.
          </p>
          {/* Social */}
          <div className="flex gap-3">
            {[
              { label: "Instagram", href: "#", icon: "📸" },
              { label: "TikTok",    href: "#", icon: "🎵" },
              { label: "WhatsApp",  href: "#", icon: "💬" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 flex items-center justify-center border border-neutral-700 text-base hover:border-neutral-400 transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Shop col */}
        <div>
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-neutral-500 mb-4">Shop</p>
          <ul className="space-y-2.5">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[12.5px] text-neutral-400 hover:text-white transition-colors"
                >
                  {l.en}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/vendor/signup"
            className="mt-4 inline-block rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] px-4 py-2 text-[12px] font-bold text-white transition-opacity hover:opacity-90"
          >
            Sell on UAQDeals
          </Link>
        </div>

        {/* Services col */}
        <div>
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-neutral-500 mb-4">Services</p>
          <ul className="space-y-2.5">
            {SERVICES_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[12.5px] text-neutral-400 hover:text-white transition-colors"
                >
                  {l.en}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/vendor/signup"
            className="mt-4 inline-block rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] px-4 py-2 text-[12px] font-bold text-white transition-opacity hover:opacity-90"
          >
            List on UAQDeals
          </Link>
        </div>

        {/* Help col */}
        <div>
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-neutral-500 mb-4">Help</p>
          <ul className="space-y-2.5">
            {HELP_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[12.5px] text-neutral-400 hover:text-white transition-colors"
                >
                  {l.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11.5px] text-neutral-600">
            {t("copyright", { year })} · Umm Al Quwain, UAE
          </p>
          <div className="flex items-center gap-4">
            {/* Payment icons text placeholders */}
            <span className="text-[11px] text-neutral-700 font-semibold">COD</span>
            <span className="text-[11px] text-neutral-700 font-semibold">VISA</span>
            <span className="text-[11px] text-neutral-700 font-semibold">MC</span>
            <span className="text-[11px] text-neutral-700 font-semibold">Apple Pay</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
