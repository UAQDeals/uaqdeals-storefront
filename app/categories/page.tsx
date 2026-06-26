import { createClient } from "@/lib/supabase/server";
import { DEDICATED } from "@/lib/service-routes";
import Link from "next/link";

export const metadata = { title: "Categories — UAQ Deals" };
export const revalidate = 300;

const EMOJI: Record<string, string> = {
  Electronics: "📱", Grocery: "🛒", "Beauty & Fragrance": "💄",
  "Home & Kitchen": "🏠", Fashion: "👗", Baby: "👶",
  Toys: "🧸", "Health & Nutrition": "💊", Stationery: "✏️",
  Books: "📚", Pharmacy: "💊",
};

const CAT_COLORS: Record<string, { from: string; to: string; bg: string }> = {
  Electronics:          { from: "#2563EB", to: "#60A5FA", bg: "#EFF6FF" },
  Grocery:              { from: "#16A34A", to: "#4ADE80", bg: "#F0FDF4" },
  "Beauty & Fragrance": { from: "#DB2777", to: "#F472B6", bg: "#FDF2F8" },
  "Home & Kitchen":     { from: "#9333EA", to: "#C084FC", bg: "#FAF5FF" },
  Fashion:              { from: "#EA580C", to: "#FB923C", bg: "#FFF7ED" },
  Baby:                 { from: "#0891B2", to: "#22D3EE", bg: "#ECFEFF" },
  Toys:                 { from: "#CA8A04", to: "#FDE047", bg: "#FEFCE8" },
  "Health & Nutrition": { from: "#DC2626", to: "#F87171", bg: "#FEF2F2" },
  Stationery:           { from: "#475569", to: "#94A3B8", bg: "#F8FAFC" },
  Books:                { from: "#7C3AED", to: "#A78BFA", bg: "#F5F3FF" },
  Pharmacy:             { from: "#0F766E", to: "#2DD4BF", bg: "#F0FDFA" },
};
const DEFAULT_COLOR = { from: "#8E1B3A", to: "#C72931", bg: "#FDF2F4" };

const MARKETPLACE = ["automotive", "real_estate", "used_items", "fancy_numbers"];
// DEDICATED map now imported from lib/service-routes
function serviceRoute(slug: string): string {
  if (MARKETPLACE.includes(slug)) return "/marketplace/" + slug;
  if (DEDICATED[slug]) return DEDICATED[slug];
  return "/categories/" + slug;
}

const SERVICE_SECTIONS: {
  title: string;
  subtitle: string;
  items: { slug: string; name: string; emoji: string; accent: string }[];
}[] = [
  {
    title: "Featured",
    subtitle: "Premium listings & marketplace",
    items: [
      { slug: "real_estate",   name: "Real Estate",   emoji: "🏠", accent: "#7C3AED" },
      { slug: "automotive",    name: "Automotive",    emoji: "🚗", accent: "#2563EB" },
      { slug: "fancy_numbers", name: "Fancy Numbers", emoji: "💎", accent: "#CA8A04" },
      { slug: "used_items",    name: "Used Items",    emoji: "📦", accent: "#0891B2" },
    ],
  },
  {
    title: "Tours & Experiences",
    subtitle: "Discover the best of UAQ",
    items: [
      { slug: "explore_uaq", name: "Explore UAQ",  emoji: "🧭", accent: "#16A34A" },
      { slug: "zoo_events",  name: "Zoo & Events", emoji: "🎟️", accent: "#EA580C" },
    ],
  },
  {
    title: "Top Services",
    subtitle: "Trusted local professionals",
    items: [
      { slug: "typing_center",  name: "Typing Center",  emoji: "✍️", accent: "#475569" },
      { slug: "business_setup", name: "Business Setup", emoji: "📋", accent: "#0F766E" },
      { slug: "mobile_repair",  name: "Mobile Repair",  emoji: "🔧", accent: "#2563EB" },
      { slug: "pest_control",   name: "Pest Control",   emoji: "🐜", accent: "#16A34A" },
      { slug: "home_services",  name: "Home Services",  emoji: "🛠️", accent: "#7C3AED" },
      { slug: "construction_painting", name: "Construction & Painting", emoji: "🏗️", accent: "#EA580C" },
      { slug: "cleaning_service", name: "Cleaning",     emoji: "🧹", accent: "#0891B2" },
      { slug: "tailor_shop",    name: "Tailor Shop",    emoji: "🧵", accent: "#DB2777" },
    ],
  },
  {
    title: "Essentials & Travel",
    subtitle: "Healthcare, jobs and travel",
    items: [
      { slug: "clinics",        name: "Clinics",        emoji: "🩺", accent: "#DC2626" },
      { slug: "job_portal",     name: "Jobs",           emoji: "👔", accent: "#475569" },
      { slug: "hotel_booking",  name: "Hotel Booking",  emoji: "🏨", accent: "#7C3AED" },
      { slug: "flight_booking", name: "Flight Booking", emoji: "✈️", accent: "#2563EB" },
    ],
  },
  {
    title: "Tech & Digital",
    subtitle: "Grow your business online",
    items: [
      { slug: "web_dev_design",       name: "Web Development",     emoji: "🌐", accent: "#2563EB" },
      { slug: "mobile_app_dev",       name: "Mobile Apps",         emoji: "📱", accent: "#7C3AED" },
      { slug: "ecommerce_dev",        name: "E-commerce Dev",      emoji: "🛒", accent: "#16A34A" },
      { slug: "ecommerce_management", name: "Store Management",    emoji: "📊", accent: "#0891B2" },
      { slug: "accounting_software",  name: "Accounting",          emoji: "📈", accent: "#CA8A04" },
      { slug: "custom_software",      name: "Custom Software",     emoji: "💻", accent: "#475569" },
      { slug: "seo_content",          name: "SEO & Content",       emoji: "🔍", accent: "#EA580C" },
      { slug: "social_media_mgmt",    name: "Social Media",        emoji: "📣", accent: "#DB2777" },
    ],
  },
];

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: productCats } = await supabase
    .from("categories").select("id, name").filter("parent_id", "is", null)
    .eq("is_active", true).order("sort_order").order("name");

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Page header ── */}
      <div style={{ background: "linear-gradient(135deg, #8E1B3A 0%, #C72931 55%, #F24732 100%)" }}
        className="px-4 pt-8 pb-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-white/60 text-[12px] font-semibold tracking-widest uppercase mb-1">UAQ Deals</p>
          <h1 className="text-white text-[28px] font-extrabold leading-tight">Shop &amp; Services</h1>
          <p className="text-white/70 text-[13px] mt-1">Everything Umm Al Quwain needs, in one place</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 -mt-5 pb-16 space-y-10">

        {/* ── Product Categories ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(to bottom, #8E1B3A, #F24732)" }} />
            <div>
              <h2 className="text-[17px] font-extrabold text-neutral-900">Shop by Category</h2>
              <p className="text-[12px] text-neutral-500">Browse our full product range</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {(productCats ?? []).map((c) => {
              const col = CAT_COLORS[c.name] ?? DEFAULT_COLOR;
              return (
                <Link key={c.id} href={"/shop/" + c.id}
                  className="group flex flex-col items-center gap-2 p-3 rounded-2xl border border-neutral-100 hover:border-neutral-200 hover:shadow-md transition-all duration-200"
                  style={{ background: col.bg }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[22px] shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${col.from}, ${col.to})` }}>
                    {EMOJI[c.name] ?? "📦"}
                  </div>
                  <p className="text-[11px] font-bold text-center text-neutral-800 leading-tight line-clamp-2">{c.name}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Service Sections ── */}
        {SERVICE_SECTIONS.map((sec) => (
          <section key={sec.title} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(to bottom, #8E1B3A, #F24732)" }} />
              <div>
                <h2 className="text-[17px] font-extrabold text-neutral-900">{sec.title}</h2>
                <p className="text-[12px] text-neutral-500">{sec.subtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
              {sec.items.map((s) => (
                <Link key={s.slug} href={serviceRoute(s.slug)}
                  className="group flex items-center gap-3 p-3.5 rounded-xl border border-neutral-100 bg-neutral-50 hover:bg-white hover:border-neutral-200 hover:shadow-md transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shrink-0 shadow-sm"
                    style={{ background: s.accent + "18" }}>
                    <span>{s.emoji}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-neutral-800 leading-tight line-clamp-2">{s.name}</p>
                  </div>
                  <svg className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: s.accent }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        ))}

      </div>
    </div>
  );
}
