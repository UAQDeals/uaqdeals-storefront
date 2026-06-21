"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, ChevronDown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { CartIcon } from "@/components/cart-icon";
import { LanguageSwitcher } from "@/components/language-switcher";

const SHOP_GROUPS = [
  {
    icon: "🍽️",
    label: { en: "Food & Grocery", ar: "الطعام والبقالة" },
    items: [
      { en: "Restaurant & Food Delivery", ar: "مطاعم وتوصيل طعام", slug: "restaurant" },
      { en: "Grocery", ar: "بقالة", slug: "grocery" },
      { en: "Fish Market", ar: "سوق السمك", slug: "fish_market" },
      { en: "Meat Shop", ar: "محل لحوم", slug: "meat_shop" },
      { en: "Roastery", ar: "محمصة فلفل", slug: "roastery" },
    ],
  },
  {
    icon: "💊",
    label: { en: "Health & Beauty", ar: "الصحة والجمال" },
    items: [
      { en: "Pharmacy", ar: "صيدلية", slug: "pharmacy" },
      { en: "Clinics & Healthcare", ar: "عيادات ورعاية صحية", slug: "clinics" },
      { en: "Gym & Fitness", ar: "صالة رياضية", slug: "gym_fitness" },
      { en: "Jewellery", ar: "مجوهرات", slug: "jewellery" },
    ],
  },
  {
    icon: "🏠",
    label: { en: "Home & Services", ar: "المنزل والخدمات" },
    items: [
      { en: "Home Services", ar: "خدمات منزلية", slug: "home_services" },
      { en: "Cleaning Service", ar: "خدمة تنظيف", slug: "cleaning_service" },
      { en: "Construction & Painting", ar: "بناء ودهان", slug: "construction_painting" },
      { en: "Tailor Shop", ar: "محل خياطة", slug: "tailor_shop" },
      { en: "Pest Control", ar: "مكافحة الحشرات", slug: "pest_control" },
      { en: "Mobile Repair", ar: "إصلاح جوالات", slug: "mobile_repair" },
    ],
  },
  {
    icon: "🛍️",
    label: { en: "Retail", ar: "التجزئة" },
    items: [
      { en: "Electronics", ar: "إلكترونيات", slug: "electronics" },
      { en: "Gaming", ar: "ألعاب", slug: "gaming" },
      { en: "Trending & Seasonal", ar: "منتجات رائجة", slug: "trending_seasonal" },
    ],
  },
  {
    icon: "🏗️",
    label: { en: "Listings & Classifieds", ar: "الإعلانات" },
    items: [
      { en: "Real Estate", ar: "عقارات", slug: "real_estate" },
      { en: "Automotive", ar: "سيارات", slug: "automotive" },
      { en: "Used Items", ar: "مستعمل", slug: "used_items" },
      { en: "Fancy Numbers", ar: "أرقام مميزة", slug: "fancy_numbers" },
      { en: "Job Portal", ar: "بوابة وظائف", slug: "job_portal" },
    ],
  },
  {
    icon: "✈️",
    label: { en: "Travel & Experiences", ar: "السفر والتجارب" },
    items: [
      { en: "Explore UAQ", ar: "استكشف أم القيوين", slug: "explore_uaq" },
      { en: "Hotel Booking", ar: "حجز فنادق", slug: "hotel_booking" },
      { en: "Flight Booking", ar: "حجز رحلات", slug: "flight_booking" },
      { en: "Zoo & Events", ar: "حديقة الحيوان والفعاليات", slug: "zoo_events" },
    ],
  },
  {
    icon: "💼",
    label: { en: "Business & Professional", ar: "الأعمال والمهنيون" },
    items: [
      { en: "Typing Center", ar: "مركز تايبنج", slug: "typing_center" },
      { en: "Business Setup", ar: "تأسيس شركات", slug: "business_setup" },
      { en: "Accounting Software", ar: "برامج محاسبة", slug: "accounting_software" },
      { en: "SEO & Content", ar: "سيو ومحتوى", slug: "seo_content" },
      { en: "Social Media Management", ar: "إدارة سوشيال ميديا", slug: "social_media_mgmt" },
      { en: "Web Dev & Design", ar: "تطوير وتصميم مواقع", slug: "web_dev_design" },
      { en: "Mobile App Development", ar: "تطوير تطبيقات", slug: "mobile_app_dev" },
      { en: "E-commerce Development", ar: "تطوير متاجر", slug: "ecommerce_dev" },
      { en: "E-commerce Management", ar: "إدارة متاجر", slug: "ecommerce_management" },
      { en: "Custom Software", ar: "برمجيات مخصصة", slug: "custom_software" },
    ],
  },
];

export function SiteHeader() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("common");

  const [shopOpen, setShopOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);

  const shopRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const label = (g: (typeof SHOP_GROUPS)[0]) =>
    locale === "ar" ? g.label.ar : g.label.en;
  const itemName = (it: (typeof SHOP_GROUPS)[0]["items"][0]) =>
    locale === "ar" ? it.ar : it.en;

  const megaPos = isRTL
    ? { right: "50%", transform: "translateX(50%)" }
    : { left: "50%", transform: "translateX(-50%)" };
  const dropPos = isRTL
    ? { right: "50%", transform: "translateX(50%)" }
    : { left: "50%", transform: "translateX(-50%)" };

  return (
    <header
      className="sticky top-0 z-40 bg-white border-b border-[color:var(--brand-border)]"
      style={{ boxShadow: "0 1px 20px rgba(142,27,58,0.07)" }}
    >
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center px-5 md:px-8">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 me-8">
          <Image
            src="/uaq_logo.png"
            alt="UAQ Deals"
            width={150}
            height={50}
            priority
            className="h-11 w-auto"
          />
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex flex-1 items-center gap-0.5">

          {/* Shop */}
          <div className="relative" ref={shopRef}>
            <button
              onClick={() => { setShopOpen(!shopOpen); setMoreOpen(false); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-medium text-neutral-600 hover:bg-[color:var(--brand-maroon)]/[0.06] hover:text-[color:var(--brand-maroon)] transition-colors"
            >
              {t("shop")}
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{ transform: shopOpen ? "rotate(180deg)" : "none" }}
              />
            </button>

            {shopOpen && (
              <div
                className="absolute top-[calc(100%+10px)] bg-white rounded-2xl overflow-hidden"
                style={{
                  ...megaPos,
                  width: 700,
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.13), 0 4px 20px rgba(142,27,58,0.05)",
                }}
              >
                <div className="flex">
                  {/* Sidebar */}
                  <div className="w-48 shrink-0 bg-neutral-50 border-e border-neutral-100 py-2">
                    {SHOP_GROUPS.map((g, i) => (
                      <button
                        key={i}
                        onMouseEnter={() => setActiveGroup(i)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] font-medium transition-colors text-start"
                        style={{
                          color: activeGroup === i ? "var(--brand-maroon)" : "#666",
                          background: activeGroup === i ? "#fff" : "transparent",
                          borderInlineStart: activeGroup === i
                            ? "2px solid var(--brand-maroon)"
                            : "2px solid transparent",
                        }}
                      >
                        <span className="text-base leading-none">{g.icon}</span>
                        {label(g)}
                      </button>
                    ))}
                  </div>

                  {/* Panel */}
                  <div className="flex-1 p-4">
                    <p className="text-[10.5px] font-semibold tracking-widest text-neutral-400 uppercase mb-3">
                      {label(SHOP_GROUPS[activeGroup])}
                    </p>
                    <div className="grid grid-cols-2 gap-0.5">
                      {SHOP_GROUPS[activeGroup].items.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/categories/${item.slug}`}
                          onClick={() => setShopOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg group transition-colors hover:bg-[color:var(--brand-maroon)]/[0.05]"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0 group-hover:opacity-100"
                            style={{ background: "var(--brand-maroon)", opacity: 0.3 }}
                          />
                          <span className="text-[12.5px] text-neutral-600 group-hover:text-[color:var(--brand-maroon)] transition-colors leading-snug">
                            {itemName(item)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 border-t border-neutral-100">
                  <span className="text-[11px] text-neutral-400">38 vendor types across UAQ</span>
                  <Link
                    href="/categories"
                    onClick={() => setShopOpen(false)}
                    className="text-[11.5px] font-semibold text-[color:var(--brand-maroon)] hover:underline"
                  >
                    {isRTL ? "← تصفح كل الفئات" : "Browse all categories →"}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Deals */}
          <Link
            href="/deals"
            className="px-3.5 py-2 rounded-lg text-[13.5px] font-medium text-neutral-600 hover:bg-[color:var(--brand-maroon)]/[0.06] hover:text-[color:var(--brand-maroon)] transition-colors"
          >
            {t("deals")}
          </Link>

          {/* Services */}
          <Link
            href="/services"
            className="px-3.5 py-2 rounded-lg text-[13.5px] font-medium text-neutral-600 hover:bg-[color:var(--brand-maroon)]/[0.06] hover:text-[color:var(--brand-maroon)] transition-colors"
          >
            {t("services")}
          </Link>

          {/* More */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => { setMoreOpen(!moreOpen); setShopOpen(false); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-medium text-neutral-600 hover:bg-[color:var(--brand-maroon)]/[0.06] hover:text-[color:var(--brand-maroon)] transition-colors"
            >
              {t("more")}
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{ transform: moreOpen ? "rotate(180deg)" : "none" }}
              />
            </button>

            {moreOpen && (
              <div
                className="absolute top-[calc(100%+10px)] bg-white rounded-xl p-1.5 min-w-44"
                style={{
                  ...dropPos,
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 8px 28px rgba(0,0,0,0.1)",
                }}
              >
                {[
                  { label: t("about"), href: "/about" },
                  { label: t("contact"), href: "/contact" },
                  { label: t("terms"), href: "/terms" },
                  { label: t("privacy"), href: "/privacy" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="block px-3.5 py-2 rounded-lg text-[13px] text-neutral-600 hover:bg-[color:var(--brand-maroon)]/[0.06] hover:text-[color:var(--brand-maroon)] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Actions */}
        <div className="ms-auto flex items-center gap-1">
          <LanguageSwitcher />
          <div className="w-px h-5 bg-neutral-200 mx-1" />
          <Link
            href="/account"
            aria-label={t("account")}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <User className="w-4 h-4" />
            {t("account")}
          </Link>
          <Link
            href="/account"
            aria-label={t("account")}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <User className="w-5 h-5" />
          </Link>
          <CartIcon />
        </div>

      </div>
    </header>
  );
}
