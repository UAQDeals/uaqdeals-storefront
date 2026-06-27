"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, ChevronDown, ChevronRight, Menu, X, Search, MapPin } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { CartIcon } from "@/components/cart-icon";
import { LanguageSwitcher } from "@/components/language-switcher";

function EmirateChip() {
  const [emirate, setEmirate] = useState<string | null>(null);
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )emirate=([^;]+)/);
    setEmirate(m ? decodeURIComponent(m[1]) : null);
  }, []);
  if (!emirate) return null;
  return (
    <Link href="/select-emirate"
      className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-bold text-neutral-700 hover:bg-neutral-100 transition-colors max-w-[180px]"
      title="Change location">
      <MapPin className="w-4 h-4 shrink-0" />
      <span className="truncate">{emirate}</span>
      <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
    </Link>
  );
}

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
    icon: "📱",
    label: { en: "Electronics & Gaming", ar: "إلكترونيات وألعاب" },
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
      { en: "Used Electronics", ar: "مستعمل", slug: "used_items" },
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
  "iPhone", "Samsung Galaxy", "Panadol", "Vitamin C", "Fresh Hammour",
  "Chicken Mandi", "Laptop", "AirPods", "Protein powder", "Gold ring",
];

type Suggestion = { type: "product" | "deal" | "category"; label: string; href: string };

const DEALS_MASK =
  "data:image/png;base64,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";

function DealsMark({ size = 16 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(${DEALS_MASK})`,
        maskImage: `url(${DEALS_MASK})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

function MobileDeliverBar() {
  const [emirate, setEmirate] = useState<string | null>(null);
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )emirate=([^;]+)/);
    setEmirate(m ? decodeURIComponent(m[1]) : null);
  }, []);
  if (!emirate) return null;
  return (
    <Link
      href="/select-emirate"
      className="md:hidden flex h-10 items-center gap-1.5 px-5 border-t border-neutral-100 bg-neutral-50 text-[12.5px]"
      title="Change location"
    >
      <MapPin className="w-4 h-4 shrink-0 text-[color:var(--brand-maroon)]" />
      <span className="text-neutral-500">Delivering to</span>
      <span className="font-bold text-neutral-800 truncate">{emirate}</span>
      <ChevronDown className="w-3.5 h-3.5 shrink-0 ms-auto text-neutral-400" />
    </Link>
  );
}

export function SiteHeader({ showProducts = true }: { showProducts?: boolean }) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("common");
  const router = useRouter();

  // Desktop dropdown state
  const [shopOpen, setShopOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Category images for mega menu
  const [catImages, setCatImages] = useState<Record<string, string | null>>({});
  const catImagesFetched = useRef(false);

  async function fetchCategoryImages() {
    if (catImagesFetched.current) return;
    catImagesFetched.current = true;
    try {
      const supabase = createClient();
      const allSlugs = SHOP_GROUPS.flatMap((g) => g.items.map((i) => i.slug));
      const { data: vendorTypes } = await supabase
        .from("vendor_types")
        .select("id, slug")
        .in("slug", allSlugs);
      if (!vendorTypes?.length) return;
      const vtMap: Record<string, string> = {};
      vendorTypes.forEach((vt: any) => { vtMap[vt.id] = vt.slug; });
      const vtIds = vendorTypes.map((vt: any) => vt.id);
      const { data: vendors } = await supabase
        .from("vendors")
        .select("id, vendor_type_id")
        .in("vendor_type_id", vtIds)
        .eq("status", "approved")
        .limit(200);
      if (!vendors?.length) return;
      const vendorIds = vendors.map((v: any) => v.id);
      const { data: products } = await supabase
        .from("products")
        .select("vendor_id, thumbnail_url")
        .in("vendor_id", vendorIds)
        .eq("status", "active")
        .not("thumbnail_url", "is", null)
        .limit(500);
      if (!products?.length) return;
      const vendorToSlug: Record<string, string> = {};
      vendors.forEach((v: any) => { vendorToSlug[v.id] = vtMap[v.vendor_type_id]; });
      const imgs: Record<string, string | null> = {};
      products.forEach((p: any) => {
        const slug = vendorToSlug[p.vendor_id];
        if (slug && !imgs[slug] && p.thumbnail_url) imgs[slug] = p.thumbnail_url;
      });
      setCatImages(imgs);
    } catch (_) {}
  }
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
  const megaPos = isRTL ? { right: 0 } : { left: 0 };
  const dropPos = isRTL ? { right: "50%", transform: "translateX(50%)" } : { left: "50%", transform: "translateX(-50%)" };

  function closeMobile() { setMobileOpen(false); setMobileGroup(null); }

  return (
    <>
      <style>{`
        @keyframes uaqFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-4px) scale(1.015); }
        }
        @keyframes uaqGlint {
          0%   { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
          12%  { opacity: 0.55; }
          24%  { transform: translateX(220%) skewX(-20deg); opacity: 0; }
          100% { transform: translateX(220%) skewX(-20deg); opacity: 0; }
        }
        .uaq-logo-wrap {
          position: relative;
          display: inline-block;
          border-radius: 16px;
          overflow: hidden;
        }
        .uaq-logo-anim {
          animation: uaqFloat 4s ease-in-out infinite;
          will-change: transform;
        }
        .uaq-logo-wrap::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 35%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          animation: uaqGlint 5s ease-in-out infinite;
          pointer-events: none;
        }
        .uaq-logo-wrap:hover .uaq-logo-anim {
          animation-play-state: paused;
        }
      `}</style>
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

        {/* ── Row 1: Logo · Actions ── */}
        <div className="mx-auto flex h-[112px] max-w-[1320px] items-center px-5 md:px-8 gap-4">

          {/* Hamburger mobile */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0 order-first"
            onClick={() => { setMobileOpen(true); setMobileGroup(null); }}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center me-4">
            <div className="uaq-logo-wrap"><Image src="/uaq-logo.png" alt="UAQ Deals" width={200} height={200} priority className="h-[100px] w-[100px] rounded-2xl object-cover uaq-logo-anim" /></div>
          </Link>

          {/* Mobile spacer — pushes language + profile to the far right */}
          <div className="flex-1 md:hidden" />

          {/* Search bar — always visible on desktop, hidden on mobile */}
          <div ref={searchRef} className="hidden md:flex w-[480px] relative ms-auto">
            <form onSubmit={handleSearchSubmit} className="flex w-full">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search products, deals, services…"
                className="flex-1 h-11 bg-neutral-100 border border-neutral-200 border-r-0 rounded-l-full px-5 text-[14px] font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-neutral-50"
              />
              <button
                type="submit"
                className="h-11 px-5 bg-[color:var(--brand-maroon)] border border-[color:var(--brand-maroon)] border-l-0 rounded-r-full text-white hover:opacity-90 transition-opacity shrink-0 flex items-center justify-center"
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
          <div className="flex items-center gap-1 shrink-0">
            <EmirateChip />
            <div className="text-neutral-700 [&_button]:text-neutral-700 [&_button]:border-neutral-300 [&_button:hover]:bg-neutral-100"><LanguageSwitcher /></div>
            <div className="w-px h-5 bg-neutral-200 mx-1 hidden md:block" />
            <Link href="/account" className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-bold text-neutral-700 hover:bg-neutral-100 transition-colors">
              <User className="w-4 h-4" />
              {t("account")}
            </Link>
            <Link href="/account" className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <div className="hidden md:block text-neutral-700 [&_svg]:text-neutral-700"><CartIcon /></div>
          </div>
        </div>

        {/* ── Row 2: Desktop Nav ── */}
        {/* Mobile: deliver-to bar (emirate selector) */}
        <MobileDeliverBar />

        <div className="hidden md:block bg-white border-t border-neutral-100">
          <div className="mx-auto max-w-[1320px] px-5 md:px-8">
            <nav className="flex items-center gap-0.5 w-full">

              {/* Category links */}
              <div className="relative" ref={shopRef}>
                <div className="w-0 h-0 overflow-hidden">
                {shopOpen && (
                  <div className="absolute top-[calc(100%+1px)] bg-white rounded-b-2xl overflow-hidden"
                    style={{ ...megaPos, width: 780, border: "1px solid rgba(0,0,0,0.08)", borderTop: "none", boxShadow: "0 20px 60px rgba(0,0,0,0.13)" }}>
                    <div className="flex" style={{ minHeight: 320 }}>
                      {/* Left: Group tabs */}
                      <div className="w-44 shrink-0 bg-neutral-50 border-e border-neutral-100 py-2">
                        {SHOP_GROUPS.map((g, i) => (
                          <button key={i} onMouseEnter={() => setActiveGroup(i)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-medium transition-colors text-start"
                            style={{ color: activeGroup === i ? "var(--brand-maroon)" : "#555", background: activeGroup === i ? "#fff" : "transparent", borderInlineStart: activeGroup === i ? "2px solid var(--brand-maroon)" : "2px solid transparent" }}>
                            {label(g)}
                          </button>
                        ))}
                      </div>
                      {/* Right: Image cards grid */}
                      <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 420 }}>

                        <div className="grid grid-cols-3 gap-2.5">
                          {SHOP_GROUPS[activeGroup].items.map((item) => {
                            const img = catImages[item.slug];
                            return (
                              <Link key={item.slug} href={`/categories/${item.slug}`} onClick={() => setShopOpen(false)}
                                className="group flex flex-col overflow-hidden border border-neutral-100 hover:border-[color:var(--brand-maroon)] transition-colors">
                                <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
                                  {img ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={img} alt={itemName(item)}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                  ) : (
                                    <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                                      <span className="text-[10px] text-neutral-400 font-medium text-center px-1 leading-snug">{itemName(item)}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="px-2 py-1.5">
                                  <p className="text-[11px] font-semibold text-neutral-700 group-hover:text-[color:var(--brand-maroon)] transition-colors leading-snug line-clamp-1">
                                    {itemName(item)}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
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
              </div>

              <div className="flex items-center justify-center flex-1 gap-0.5">
                {showProducts && (<>
                {[
                  { label: "Electronics",    id: "a1000000-0000-0000-0000-000000000001" },
                  { label: "Grocery",        id: "a1000000-0000-0000-0000-000000000002" },
                  { label: "Beauty",         id: "a1000000-0000-0000-0000-000000000003" },
                  { label: "Home & Kitchen", id: "a1000000-0000-0000-0000-000000000004" },
                  { label: "Fashion",        id: "a1000000-0000-0000-0000-000000000005" },
                  { label: "Baby",           id: "a1000000-0000-0000-0000-000000000006" },
                  { label: "Toys",           id: "a1000000-0000-0000-0000-000000000007" },
                  { label: "Books",          id: "a1000000-0000-0000-0000-000000000011" },
                ].map((c) => (
                  <Link key={c.id} href={"/shop/" + c.id}
                    className="relative px-3 py-3 text-[13px] font-semibold text-neutral-700 whitespace-nowrap group transition-colors hover:text-[#8E1B3A]">
                    {c.label}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-[#8E1B3A] rounded-full transition-all duration-200 group-hover:w-full" />
                  </Link>
                ))}
                <div className="w-px h-4 bg-neutral-200 mx-1" />
                </>)}
                <Link href="/services"
                  className="relative px-3 py-3 text-[13px] font-semibold text-neutral-700 whitespace-nowrap group transition-colors hover:text-[#8E1B3A]">
                  {t("services")}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-[#8E1B3A] rounded-full transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link href="/marketplace/real_estate"
                  className="relative px-3 py-3 text-[13px] font-semibold text-neutral-700 whitespace-nowrap group transition-colors hover:text-[#8E1B3A]">
                  Marketplace
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-[#8E1B3A] rounded-full transition-all duration-200 group-hover:w-full" />
                </Link>
              </div>
              {showProducts && (
              <Link href="/deals"
                className="ml-auto inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-extrabold text-white whitespace-nowrap transition-all hover:scale-105"
                style={{ background: "#C72931", boxShadow: "0 2px 12px rgba(199,41,49,0.5)" }}>
                <DealsMark size={15} />Deals
              </Link>
              )}


            </nav>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={closeMobile} aria-hidden />}
      <div className={`fixed top-0 z-50 h-full w-[85vw] max-w-sm bg-white flex flex-col transition-transform duration-300 ease-out md:hidden ${isRTL ? "right-0" : "left-0"} ${mobileOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100" style={{ background: "linear-gradient(to right, #C72931, #8E1B3A)" }}>
          {mobileGroup !== null ? (
            <button onClick={() => setMobileGroup(null)} className="flex items-center gap-2 text-[13.5px] font-semibold text-neutral-700">
              <ChevronRight className="w-4 h-4 rotate-180" />{label(SHOP_GROUPS[mobileGroup])}
            </button>
          ) : (
            <span className="text-[15px] font-bold text-white">Menu</span>
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
              {showProducts && (<>
              {/* Deals button */}
              <div className="px-3 pt-3 pb-2">
                <Link href="/deals" onClick={closeMobile}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[14px] font-extrabold text-white"
                  style={{ background: "linear-gradient(to right, #C72931, #8E1B3A)" }}>
                  <DealsMark size={18} />Deals &amp; Offers
                </Link>
              </div>
              <div className="h-px bg-neutral-100 my-2 mx-5" />
              {/* Product Categories */}
              <div className="px-2">
                <p className="px-3 py-2 text-[10.5px] font-bold tracking-[2px] uppercase text-neutral-400">Shop</p>
                {[
                  { label: "Electronics", id: "a1000000-0000-0000-0000-000000000001", emoji: "📱" },
                  { label: "Grocery", id: "a1000000-0000-0000-0000-000000000002", emoji: "🛒" },
                  { label: "Beauty & Fragrance", id: "a1000000-0000-0000-0000-000000000003", emoji: "💄" },
                  { label: "Home & Kitchen", id: "a1000000-0000-0000-0000-000000000004", emoji: "🏠" },
                  { label: "Fashion", id: "a1000000-0000-0000-0000-000000000005", emoji: "👗" },
                  { label: "Baby", id: "a1000000-0000-0000-0000-000000000006", emoji: "👶" },
                  { label: "Toys", id: "a1000000-0000-0000-0000-000000000007", emoji: "🧸" },
                  { label: "Health & Nutrition", id: "a1000000-0000-0000-0000-000000000009", emoji: "💊" },
                  { label: "Stationery", id: "a1000000-0000-0000-0000-000000000010", emoji: "✏️" },
                  { label: "Books", id: "a1000000-0000-0000-0000-000000000011", emoji: "📚" },
                ].map((c) => (
                  <Link key={c.id} href={"/shop/" + c.id} onClick={closeMobile}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors">
                    <span className="text-xl">{c.emoji}</span>
                    <span className="text-[14px] font-medium text-neutral-700">{c.label}</span>
                  </Link>
                ))}
              </div>
              <div className="h-px bg-neutral-100 my-2 mx-5" />
              </>)}
              {/* Other links */}
              <div className="px-2">
                <p className="px-3 py-2 text-[10.5px] font-bold tracking-[2px] uppercase text-neutral-400">More</p>
                {[
                  { label: "Marketplace", href: "/marketplace/real_estate", emoji: "🏗️" },
                  { label: "Services", href: "/services", emoji: "🔧" },
                  { label: "Account", href: "/account", emoji: "👤" },
                  { label: "About", href: "/about", emoji: "ℹ️" },
                  { label: "Contact", href: "/contact", emoji: "📞" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeMobile}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                    <span className="text-xl">{item.emoji}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="h-px bg-neutral-100 my-2 mx-5" />
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
