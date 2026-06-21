"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, ChevronDown, ChevronRight, Menu, X, Search } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
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

const SUGGESTIONS_DEFAULT = [
  "Fresh fish", "Pharmacy", "Restaurants", "Grocery", "Mobile repair",
  "Real estate", "Used cars", "Cleaning service", "Business setup", "Fancy numbers",
];

type Suggestion = { type: "product" | "deal" | "category"; label: string; href: string };

export function SiteHeader() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("common");
  const router = useRouter();

  // Desktop dropdown state
  const [shopOpen, setShopOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const shopRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Mobile state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<number | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [sugLoading, setSugLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Lock body scroll for mobile drawer
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    setSugLoading(true);
    try {
      const supabase = createClient();
      const [pr, dr] = await Promise.all([
        supabase.from("products").select("id, name").eq("status", "active").ilike("name", `%${q}%`).limit(4),
        supabase.from("deals").select("id, title").eq("status", "active").ilike("title", `%${q}%`).limit(3),
      ]);
      const results: Suggestion[] = [
        ...(pr.data ?? []).map((p: any) => ({ type: "product" as const, label: p.name, href: `/products/${p.id}` })),
        ...(dr.data ?? []).map((d: any) => ({ type: "deal" as const, label: d.title, href: `/deals/${d.id}` })),
      ];
      setSuggestions(results);
    } catch { setSuggestions([]); }
    finally { setSugLoading(false); }
  }, []);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 280);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchFocused(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function handleSuggestionClick(href: string) {
    setSearchFocused(false);
    setSearchQuery("");
    router.push(href);
  }

  const showDropdown = searchFocused;
  const showSuggestions = searchQuery.length >= 2 && suggestions.length > 0;
  const showDefaults = searchQuery.length < 2;

  const label = (g: (typeof SHOP_GROUPS)[0]) => locale === "ar" ? g.label.ar : g.label.en;
  const itemName = (it: (typeof SHOP_GROUPS)[0]["items"][0]) => locale === "ar" ? it.ar : it.en;
  const megaPos = isRTL ? { right: "50%", transform: "translateX(50%)" } : { left: "50%", transform: "translateX(-50%)" };
  const dropPos = isRTL ? { right: "50%", transform: "translateX(50%)" } : { left: "50%", transform: "translateX(-50%)" };

  function closeMobile() { setMobileOpen(false); setMobileGroup(null); }

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-[color:var(--brand-border)]"
        style={{ boxShadow: "0 1px 20px rgba(142,27,58,0.07)" }}>

        {/* ── Row 1: Logo · Actions ── */}
        <div className="mx-auto flex h-[80px] max-w-[1320px] items-center px-5 md:px-8 gap-4">

          {/* Hamburger mobile */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0"
            onClick={() => { setMobileOpen(true); setMobileGroup(null); }}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center me-4">
            <Image src="/logo_transparent.png" alt="UAQ Deals" width={150} height={150} priority className="h-[72px] w-auto" />
          </Link>

          {/* Search bar — always visible on desktop, hidden on mobile */}
          <div ref={searchRef} className="hidden md:flex flex-1 relative">
            <form onSubmit={handleSearchSubmit} className="flex w-full">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search products, deals, services…"
                className="flex-1 h-11 border border-neutral-300 border-e-0 px-4 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
              <button
                type="submit"
                className="h-11 px-5 bg-[color:var(--brand-maroon)] text-white hover:opacity-90 transition-opacity shrink-0 flex items-center justify-center"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Suggestions dropdown */}
            {showDropdown && (
              <div className="absolute top-[calc(100%+2px)] left-0 right-0 bg-white border border-neutral-200 shadow-lg z-50 max-h-80 overflow-y-auto">
                {sugLoading && (
                  <div className="px-4 py-3 text-[12.5px] text-neutral-400">Searching…</div>
                )}
                {!sugLoading && showSuggestions && (
                  <>
                    <div className="px-4 pt-2.5 pb-1 text-[10px] font-bold tracking-widest uppercase text-neutral-400">Results</div>
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(s.href)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 text-start transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                        <span className="text-[13.5px] text-neutral-700 line-clamp-1">{s.label}</span>
                        <span className="ms-auto text-[10.5px] text-neutral-400 capitalize shrink-0">{s.type}</span>
                      </button>
                    ))}
                    <div className="border-t border-neutral-100 px-4 py-2">
                      <button
                        onClick={handleSearchSubmit as any}
                        className="text-[12px] font-semibold text-[color:var(--brand-maroon)] hover:underline"
                      >
                        See all results for &ldquo;{searchQuery}&rdquo; →
                      </button>
                    </div>
                  </>
                )}
                {!sugLoading && showDefaults && (
                  <>
                    <div className="px-4 pt-2.5 pb-1 text-[10px] font-bold tracking-widest uppercase text-neutral-400">Popular searches</div>
                    {SUGGESTIONS_DEFAULT.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setSearchQuery(s); fetchSuggestions(s); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 text-start transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                        <span className="text-[13.5px] text-neutral-600">{s}</span>
                      </button>
                    ))}
                  </>
                )}
                {!sugLoading && !showDefaults && !showSuggestions && searchQuery.length >= 2 && (
                  <div className="px-4 py-3 text-[12.5px] text-neutral-400">No results for &ldquo;{searchQuery}&rdquo;</div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="ms-auto md:ms-0 flex items-center gap-1 shrink-0">
            {/* Mobile search icon */}
            <Link href="/search" aria-label="Search" className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            <LanguageSwitcher />
            <div className="w-px h-5 bg-neutral-200 mx-1 hidden md:block" />
            <Link href="/account" className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 transition-colors">
              <User className="w-4 h-4" />
              {t("account")}
            </Link>
            <Link href="/account" className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <CartIcon />
          </div>
        </div>

        {/* ── Row 2: Desktop Nav ── */}
        <div className="hidden md:block border-t border-neutral-100">
          <div className="mx-auto max-w-[1320px] px-5 md:px-8">
            <nav className="flex items-center gap-0.5">

              {/* Shop */}
              <div className="relative" ref={shopRef}>
                <button
                  onClick={() => { setShopOpen(!shopOpen); setMoreOpen(false); }}
                  className="flex items-center gap-1.5 px-3.5 py-3 text-[13px] font-medium text-neutral-600 hover:text-[color:var(--brand-maroon)] transition-colors"
                >
                  {t("shop")}
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: shopOpen ? "rotate(180deg)" : "none" }} />
                </button>
                {shopOpen && (
                  <div className="absolute top-[calc(100%+1px)] bg-white rounded-b-2xl overflow-hidden"
                    style={{ ...megaPos, width: 700, border: "1px solid rgba(0,0,0,0.08)", borderTop: "none", boxShadow: "0 20px 60px rgba(0,0,0,0.13)" }}>
                    <div className="flex">
                      <div className="w-48 shrink-0 bg-neutral-50 border-e border-neutral-100 py-2">
                        {SHOP_GROUPS.map((g, i) => (
                          <button key={i} onMouseEnter={() => setActiveGroup(i)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] font-medium transition-colors text-start"
                            style={{ color: activeGroup === i ? "var(--brand-maroon)" : "#666", background: activeGroup === i ? "#fff" : "transparent", borderInlineStart: activeGroup === i ? "2px solid var(--brand-maroon)" : "2px solid transparent" }}>
                            <span className="text-base leading-none">{g.icon}</span>{label(g)}
                          </button>
                        ))}
                      </div>
                      <div className="flex-1 p-4">
                        <p className="text-[10.5px] font-semibold tracking-widest text-neutral-400 uppercase mb-3">{label(SHOP_GROUPS[activeGroup])}</p>
                        <div className="grid grid-cols-2 gap-0.5">
                          {SHOP_GROUPS[activeGroup].items.map((item) => (
                            <Link key={item.slug} href={`/categories/${item.slug}`} onClick={() => setShopOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg group transition-colors hover:bg-[color:var(--brand-maroon)]/[0.05]">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 group-hover:opacity-100" style={{ background: "var(--brand-maroon)", opacity: 0.3 }} />
                              <span className="text-[12.5px] text-neutral-600 group-hover:text-[color:var(--brand-maroon)] transition-colors leading-snug">{itemName(item)}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 border-t border-neutral-100">
                      <span className="text-[11px] text-neutral-400">38 vendor types across UAQ</span>
                      <Link href="/categories" onClick={() => setShopOpen(false)} className="text-[11.5px] font-semibold text-[color:var(--brand-maroon)] hover:underline">
                        {isRTL ? "← تصفح كل الفئات" : "Browse all categories →"}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/deals" className="px-3.5 py-3 text-[13px] font-medium text-neutral-600 hover:text-[color:var(--brand-maroon)] transition-colors">{t("deals")}</Link>
              <Link href="/services" className="px-3.5 py-3 text-[13px] font-medium text-neutral-600 hover:text-[color:var(--brand-maroon)] transition-colors">{t("services")}</Link>

              {/* More */}
              <div className="relative" ref={moreRef}>
                <button onClick={() => { setMoreOpen(!moreOpen); setShopOpen(false); }}
                  className="flex items-center gap-1.5 px-3.5 py-3 text-[13px] font-medium text-neutral-600 hover:text-[color:var(--brand-maroon)] transition-colors">
                  {t("more")}
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: moreOpen ? "rotate(180deg)" : "none" }} />
                </button>
                {moreOpen && (
                  <div className="absolute top-[calc(100%+1px)] bg-white rounded-xl p-1.5 min-w-44"
                    style={{ ...dropPos, border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 28px rgba(0,0,0,0.1)" }}>
                    {[{ label: t("about"), href: "/about" }, { label: t("contact"), href: "/contact" }, { label: t("terms"), href: "/terms" }, { label: t("privacy"), href: "/privacy" }].map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)}
                        className="block px-3.5 py-2 rounded-lg text-[13px] text-neutral-600 hover:bg-[color:var(--brand-maroon)]/[0.06] hover:text-[color:var(--brand-maroon)] transition-colors">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={closeMobile} aria-hidden />}
      <div className={`fixed top-0 z-50 h-full w-[85vw] max-w-sm bg-white flex flex-col transition-transform duration-300 ease-out md:hidden ${isRTL ? "right-0" : "left-0"} ${mobileOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          {mobileGroup !== null ? (
            <button onClick={() => setMobileGroup(null)} className="flex items-center gap-2 text-[13.5px] font-semibold text-neutral-700">
              <ChevronRight className="w-4 h-4 rotate-180" />{label(SHOP_GROUPS[mobileGroup])}
            </button>
          ) : (
            <span className="text-[15px] font-bold text-neutral-800">Menu</span>
          )}
          <button onClick={closeMobile} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile search */}
        {mobileGroup === null && (
          <div className="px-4 py-3 border-b border-neutral-100">
            <form onSubmit={(e) => { e.preventDefault(); const q = (e.currentTarget.querySelector("input") as HTMLInputElement).value.trim(); if (q) { closeMobile(); router.push(`/search?q=${encodeURIComponent(q)}`); } }} className="flex gap-2">
              <input type="text" placeholder="Search…" className="flex-1 h-10 border border-neutral-300 px-3 text-[13.5px] focus:outline-none focus:border-neutral-900" />
              <button type="submit" className="h-10 px-4 bg-[color:var(--brand-maroon)] text-white flex items-center justify-center">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {mobileGroup === null ? (
            <div className="py-2">
              <div className="px-2">
                <p className="px-3 py-2 text-[10.5px] font-bold tracking-[2px] uppercase text-neutral-400">{t("shop")}</p>
                {SHOP_GROUPS.map((g, i) => (
                  <button key={i} onClick={() => setMobileGroup(i)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-neutral-50 transition-colors">
                    <span className="flex items-center gap-3 text-[14px] font-medium text-neutral-700">
                      <span className="text-xl">{g.icon}</span>{label(g)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" style={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
                  </button>
                ))}
              </div>
              <div className="h-px bg-neutral-100 my-3 mx-5" />
              <div className="px-2">
                {[{ label: t("deals"), href: "/deals" }, { label: t("services"), href: "/services" }, { label: t("account"), href: "/account" }, { label: t("about"), href: "/about" }, { label: t("contact"), href: "/contact" }].map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeMobile}
                    className="flex items-center px-3 py-3 rounded-lg text-[14px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="h-px bg-neutral-100 my-3 mx-5" />
              <div className="px-5 pb-4"><LanguageSwitcher /></div>
            </div>
          ) : (
            <div className="py-2 px-2">
              <p className="px-3 py-2 text-[10.5px] font-bold tracking-[2px] uppercase text-neutral-400">{label(SHOP_GROUPS[mobileGroup])}</p>
              {SHOP_GROUPS[mobileGroup].items.map((item) => (
                <Link key={item.slug} href={`/categories/${item.slug}`} onClick={closeMobile}
                  className="flex items-center gap-3 px-3 py-3.5 rounded-lg hover:bg-neutral-50 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--brand-maroon)] opacity-50" />
                  <span className="text-[14px] text-neutral-700">{itemName(item)}</span>
                </Link>
              ))}
              <div className="px-3 pt-4">
                <Link href="/categories" onClick={closeMobile}
                  className="block text-center py-3 border border-[color:var(--brand-maroon)] text-[13px] font-bold text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white transition-colors">
                  {isRTL ? "تصفح كل الفئات" : "Browse all categories"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
