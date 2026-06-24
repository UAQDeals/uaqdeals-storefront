import Link from "next/link";
import { getTranslations } from "next-intl/server";

const SHOP_LINKS = [
  { en: "Food & Grocery",       ar: "طعام وبقالة",     href: "/categories/restaurant" },
  { en: "Health & Beauty",      ar: "صحة وجمال",       href: "/categories/pharmacy" },
  { en: "Home & Services",      ar: "منزل وخدمات",     href: "/services" },
  { en: "Retail",               ar: "تجزئة",           href: "/categories/electronics" },
  { en: "Real Estate",          ar: "عقارات",          href: "/categories/real_estate" },
  { en: "Automotive",           ar: "سيارات",          href: "/categories/automotive" },
  { en: "Used Items",           ar: "مستعمل",          href: "/categories/used_items" },
  { en: "Fancy Numbers",        ar: "أرقام مميزة",     href: "/categories/fancy_numbers" },
  { en: "Job Portal",           ar: "بوابة وظائف",     href: "/categories/job_portal" },
];

const SERVICES_LINKS = [
  { en: "Typing Center",        ar: "مركز تايبنج",     href: "/categories/typing_center" },
  { en: "Business Setup",       ar: "تأسيس شركات",     href: "/categories/business_setup" },
  { en: "Mobile Repair",        ar: "إصلاح جوالات",    href: "/categories/mobile_repair" },
  { en: "Cleaning Service",     ar: "خدمة تنظيف",      href: "/categories/cleaning_service" },
  { en: "Pest Control",         ar: "مكافحة الحشرات",  href: "/categories/pest_control" },
  { en: "Web Dev & Design",     ar: "تطوير مواقع",     href: "/categories/web_dev_design" },
  { en: "SEO & Content",        ar: "سيو ومحتوى",      href: "/categories/seo_content" },
  { en: "Explore UAQ",          ar: "استكشف أم القيوين",href: "/categories/explore_uaq" },
];

const HELP_LINKS = [
  { en: "Track your order",     ar: "تتبع طلبك",       href: "/account" },
  { en: "Contact us",           ar: "تواصل معنا",       href: "/contact" },
  { en: "About UAQ Deals",      ar: "عن أم القيوين ديلز",href: "/about" },
  { en: "Terms of Service",     ar: "الشروط والأحكام",  href: "/terms" },
  { en: "Privacy Policy",       ar: "سياسة الخصوصية",  href: "/privacy" },
  { en: "Vendor Sign Up",       ar: "انضم كبائع",       href: "/vendor/signup" },
];

const PROMISES = [
  { emoji: "🚚", en: "Free delivery on AED 100+", ar: "توصيل مجاني عند AED 100+" },
  { emoji: "🔒", en: "Secure checkout",            ar: "دفع آمن" },
  { emoji: "✅", en: "Verified local vendors",     ar: "بائعون محليون موثوقون" },
  { emoji: "🪙", en: "Earn coins on every order",  ar: "اكسب عملات مع كل طلب" },
];

export async function SiteFooter() {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-400">

      {/* Promise bar */}
      <div className="border-b border-neutral-800">
        <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {PROMISES.map((p) => (
            <div key={p.en} className="flex items-center gap-3">
              <span className="text-xl">{p.emoji}</span>
              <span className="text-[12.5px] font-semibold text-neutral-300">{p.en}</span>
            </div>
          ))}
        </div>
      </div>

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

          {/* App links */}
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-neutral-500 mt-8 mb-4">Get the app</p>
          <div className="flex flex-col gap-2">
            <a href="#" className="inline-block border border-neutral-700 text-neutral-300 text-[12px] font-semibold px-4 py-2 hover:border-neutral-400 hover:text-white transition-colors">
              📱 App Store
            </a>
            <a href="#" className="inline-block border border-neutral-700 text-neutral-300 text-[12px] font-semibold px-4 py-2 hover:border-neutral-400 hover:text-white transition-colors">
              🤖 Google Play
            </a>
          </div>
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
