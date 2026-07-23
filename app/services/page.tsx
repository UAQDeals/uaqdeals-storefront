import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { dedicatedFor } from "@/lib/service-routes";
import { getTranslations } from "next-intl/server";
import { isTypeEnabled } from "@/lib/emirate";

// ── Section data mirroring Flutter services_screen.dart ──────────────────────

const SECTIONS = [
  {
    title: { en: "Featured", ar: "المميز" },
    items: [
      { slug: "real_estate",  en: "Real Estate",   ar: "عقارات",       emoji: "🏠", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop&auto=format" },
      { slug: "automotive",   en: "Automotive",    ar: "سيارات",       emoji: "🚗", img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop&auto=format" },
      { slug: "fancy_numbers",en: "Fancy Numbers", ar: "أرقام مميزة",  emoji: "💎", img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop&auto=format" },
      { slug: "used_items",   en: "Used Electronics",    ar: "مستعمل",       emoji: "📦", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    title: { en: "Tours, Trips & Packages", ar: "جولات ورحلات وباقات" },
    items: [
      { slug: "explore_uaq", en: "Explore UAQ",  ar: "استكشف أم القيوين", emoji: "🧭", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop&auto=format" },
      { slug: "zoo_events",  en: "Zoo & Events", ar: "حديقة الحيوان والفعاليات", emoji: "🎟️", img: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    title: { en: "Our Top Services", ar: "خدماتنا الرائدة" },
    items: [
      { slug: "typing_center",  en: "Typing Center",  ar: "مركز تايبنج",   emoji: "✍️", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop&auto=format" },
      { slug: "business_setup", en: "Business Setup", ar: "تأسيس شركات",    emoji: "📋", img: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    title: { en: "Our Quick Services", ar: "خدماتنا السريعة" },
    items: [
      { slug: "mobile_repair",          en: "Mobile Repair",          ar: "إصلاح جوالات",       emoji: "🔧", img: "https://images.unsplash.com/photo-1621274403997-37aace184f49?w=600&h=400&fit=crop&auto=format" },
      { slug: "pest_control",           en: "Pest Control",           ar: "مكافحة الحشرات",      emoji: "🐜", img: "https://images.unsplash.com/photo-1470082719408-b2843ab5c9ab?w=600&h=400&fit=crop&auto=format" },
      { slug: "home_services",          en: "Home Services",          ar: "خدمات منزلية",        emoji: "🛠️", img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop&auto=format" },
      { slug: "construction_painting",  en: "Construction & Painting",ar: "بناء ودهان",          emoji: "🏗️", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop&auto=format" },
      { slug: "cleaning_service",       en: "Cleaning Services",      ar: "خدمات تنظيف",        emoji: "🧹", img: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=400&fit=crop&auto=format" },
      { slug: "tailor_shop",            en: "Tailor Shop",            ar: "محل خياطة",           emoji: "🧵", img: "https://images.unsplash.com/photo-1605289355680-75fb41239154?w=600&h=400&fit=crop&auto=format" },
      { slug: "barber_shop",            en: "Barber Shop",            ar: "حلاق", emoji: "💈", img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    title: { en: "Essentials", ar: "الأساسيات" },
    items: [
      { slug: "clinics",    en: "Clinics & Healthcare", ar: "عيادات ورعاية صحية", emoji: "🩺", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop&auto=format" },
      { slug: "job_portal", en: "Jobs",                 ar: "وظائف",              emoji: "👔", img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    title: { en: "Travel", ar: "السفر" },
    items: [
      { slug: "hotel_booking",  en: "Hotel Booking",  ar: "حجز فنادق",   emoji: "🏨", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&auto=format" },
      { slug: "flight_booking", en: "Flight Booking", ar: "حجز رحلات",   emoji: "✈️", img: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    title: { en: "Tech & Digital Services", ar: "الخدمات التقنية والرقمية" },
    items: [
      { slug: "web_dev_design",      en: "Web Development & Design",  ar: "تطوير وتصميم مواقع",  emoji: "🌐", img: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop&auto=format" },
      { slug: "mobile_app_dev",      en: "Mobile App Development",    ar: "تطوير تطبيقات",        emoji: "📱", img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop&auto=format" },
      { slug: "ecommerce_dev",       en: "E-commerce Development",    ar: "تطوير متاجر",          emoji: "🛒", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&auto=format" },
      { slug: "ecommerce_management",en: "E-commerce Management",     ar: "إدارة متاجر",          emoji: "📊", img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&auto=format" },
      { slug: "accounting_software", en: "Accounting Software",       ar: "برامج محاسبة",         emoji: "📈", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop&auto=format" },
      { slug: "custom_software",     en: "Custom Software",           ar: "برمجيات مخصصة",        emoji: "💻", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop&auto=format" },
      { slug: "seo_content",         en: "SEO & Content",             ar: "سيو ومحتوى",           emoji: "📝", img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&h=400&fit=crop&auto=format" },
      { slug: "social_media_mgmt",   en: "Social Media Management",   ar: "إدارة سوشيال ميديا",   emoji: "📣", img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop&auto=format" },
    ],
  },
];

// ── Slug → web route mapping (mirrors app _route) ────────────────────────────
const MARKETPLACE = ["automotive", "real_estate", "used_items", "fancy_numbers"];
function routeForSlug(slug: string): string {
  if (MARKETPLACE.includes(slug)) return `/marketplace/${slug}`;
  const dedicated = dedicatedFor(slug);
  if (dedicated) return dedicated;
  return `/categories/${slug}`;
}

// ── Service card ──────────────────────────────────────────────────────────────

function ServiceCard({
  slug, emoji, img,
  name,
}: {
  slug: string; emoji: string; img: string; name: string;
}) {
  return (
    <Link
      href={routeForSlug(slug)}
      className="group relative block overflow-hidden rounded-[20px] shadow-md ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      style={{ aspectRatio: "16/9" }}
    >
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Legibility scrim — darker toward the bottom (mirrors the app tile) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.35) 62%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      {/* Hover tint */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "rgba(142,27,58,0.18)" }}
      />
      {/* Frosted glass emoji chip */}
      <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/35 bg-white/20 text-lg backdrop-blur-sm">
        {emoji}
      </div>
      {/* Open affordance */}
      <div className="absolute bottom-3 right-3 flex h-6 w-6 translate-y-1 items-center justify-center rounded-full bg-white/90 text-neutral-800 opacity-0 shadow transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      </div>
      {/* Label */}
      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <p className="text-[13.5px] font-semibold leading-snug text-white drop-shadow-sm">
          {name}
        </p>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ServicesPage() {
  const t = await getTranslations("common");

  // Filter each section to slugs enabled for this emirate; drop
  // sections that end up empty.
  const visibleSections: typeof SECTIONS = [];
  for (const section of SECTIONS) {
    const items = [];
    for (const item of section.items) {
      if (await isTypeEnabled(item.slug)) items.push(item);
    }
    if (items.length > 0) visibleSections.push({ ...section, items });
  }
  // locale is determined by cookie via i18n/request.ts
  // We can't call useLocale in server component, so we pass both name keys
  // and let the client pick — but since this is a server page rendering static
  // sections, we use English names and rely on the link targets being correct.
  // For full AR support this page can be made a Client Component if needed.

  return (
    <main className="min-h-screen bg-[color:var(--brand-cream)]">
      {/* Page header */}
      <div
        className="border-b border-[color:var(--brand-border)]"
        style={{
          background:
            "linear-gradient(135deg, var(--brand-maroon) 0%, var(--brand-red) 60%, var(--brand-orange) 100%)",
        }}
      >
        <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-10">
          <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1">
            UAQ Deals
          </p>
          <h1 className="text-white text-3xl md:text-4xl font-bold tracking-tight">
            Services
          </h1>
          <p className="text-white/75 mt-1.5 text-sm">
            Everything you need — right here in Umm Al Quwain.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-10 space-y-10">
        {visibleSections.map((section) => (
          <section key={section.title.en}>
            {/* Section title — gold accent bar + heading (mirrors the app) */}
            <div className="mb-4 flex items-center gap-2.5">
              <span
                className="h-5 w-1 rounded-full"
                style={{ background: "linear-gradient(180deg,#E7C56A,#C9A24B)" }}
              />
              <h2 className="text-lg font-bold tracking-tight text-neutral-900">
                {section.title.en}
              </h2>
            </div>

            {/* Grid — 2-up on mobile like the app, wider on desktop */}
            <div
              className={
                "grid gap-3 sm:gap-4 " +
                (section.items.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")
              }
            >
              {section.items.map((item) => (
                <ServiceCard
                  key={item.slug}
                  slug={item.slug}
                  emoji={item.emoji}
                  img={item.img}
                  name={item.en}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
