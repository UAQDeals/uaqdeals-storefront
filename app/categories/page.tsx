import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Categories — UAQ Deals" };
export const revalidate = 300;

const EMOJI: Record<string, string> = {
  Electronics: "📱", Grocery: "🛒", "Beauty & Fragrance": "💄",
  "Home & Kitchen": "🏠", Fashion: "👗", Baby: "👶",
  Toys: "🧸", "Health & Nutrition": "💊", Stationery: "✏️", Books: "📚",
};

const COLORS = [
  "from-blue-600 to-blue-400", "from-green-600 to-green-400",
  "from-pink-600 to-pink-400", "from-purple-600 to-purple-400",
  "from-orange-600 to-orange-400", "from-teal-600 to-teal-400",
  "from-red-600 to-red-400", "from-slate-600 to-slate-400",
  "from-lime-600 to-lime-400", "from-cyan-600 to-cyan-400",
];

const BG = [
  "bg-blue-50", "bg-green-50", "bg-pink-50", "bg-purple-50",
  "bg-orange-50", "bg-teal-50", "bg-red-50", "bg-slate-50",
  "bg-lime-50", "bg-cyan-50",
];

const MARKETPLACE = ["automotive", "real_estate", "used_items", "fancy_numbers"];
const DEDICATED: Record<string, string> = {
  hotel_booking: "/services/hotel-booking",
  flight_booking: "/services/flight-booking",
};
function serviceRoute(slug: string): string {
  if (MARKETPLACE.includes(slug)) return "/marketplace/" + slug;
  if (DEDICATED[slug]) return DEDICATED[slug];
  return "/categories/" + slug;
}

const SERVICE_SECTIONS: { title: string; items: { slug: string; name: string; emoji: string }[] }[] = [
  { title: "Featured", items: [
    { slug: "real_estate", name: "Real Estate", emoji: "🏠" },
    { slug: "automotive", name: "Automotive", emoji: "🚗" },
    { slug: "fancy_numbers", name: "Fancy Numbers", emoji: "💎" },
    { slug: "used_items", name: "Used Items", emoji: "📦" },
  ]},
  { title: "Tours, Trips & Packages", items: [
    { slug: "explore_uaq", name: "Explore UAQ", emoji: "🧭" },
    { slug: "zoo_events", name: "Zoo & Events", emoji: "🎟️" },
  ]},
  { title: "Our Top Services", items: [
    { slug: "typing_center", name: "Typing Center", emoji: "✍️" },
    { slug: "business_setup", name: "Business Setup", emoji: "📋" },
  ]},
  { title: "Our Quick Services", items: [
    { slug: "mobile_repair", name: "Mobile Repair", emoji: "🔧" },
    { slug: "pest_control", name: "Pest Control", emoji: "🐜" },
    { slug: "home_services", name: "Home Services", emoji: "🛠️" },
    { slug: "construction_painting", name: "Construction & Painting", emoji: "🏗️" },
    { slug: "cleaning_service", name: "Cleaning Services", emoji: "🧹" },
    { slug: "tailor_shop", name: "Tailor Shop", emoji: "🧵" },
  ]},
  { title: "Essentials", items: [
    { slug: "clinics", name: "Clinics & Healthcare", emoji: "🩺" },
    { slug: "job_portal", name: "Jobs", emoji: "👔" },
  ]},
  { title: "Travel", items: [
    { slug: "hotel_booking", name: "Hotel Booking", emoji: "🏨" },
    { slug: "flight_booking", name: "Flight Booking", emoji: "✈️" },
  ]},
  { title: "Tech & Digital Services", items: [
    { slug: "web_dev_design", name: "Web Development & Design", emoji: "🌐" },
    { slug: "mobile_app_dev", name: "Mobile App Development", emoji: "📱" },
    { slug: "ecommerce_dev", name: "E-commerce Development", emoji: "🛒" },
    { slug: "ecommerce_management", name: "E-commerce Management", emoji: "📊" },
    { slug: "accounting_software", name: "Accounting Software", emoji: "📈" },
    { slug: "custom_software", name: "Custom Software", emoji: "💻" },
    { slug: "seo_content", name: "SEO & Content", emoji: "📝" },
    { slug: "social_media_mgmt", name: "Social Media Management", emoji: "📣" },
  ]},
];

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: productCats } = await supabase
    .from("categories").select("id, name").filter("parent_id", "is", null)
    .eq("is_active", true).order("sort_order").order("name");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-12">

      {/* ── Product Categories ── */}
      <section>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 mb-1">Shop by Category</h1>
        <p className="text-sm text-neutral-500 mb-6">Browse our full product range</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {(productCats ?? []).map((c, i) => (
            <Link key={c.id} href={"/shop/" + c.id}
              className={"group rounded-2xl p-4 flex flex-col items-center gap-3 border border-neutral-100 hover:shadow-md transition-shadow " + BG[i % BG.length]}>
              <div className={"w-14 h-14 rounded-2xl bg-gradient-to-br " + COLORS[i % COLORS.length] + " flex items-center justify-center text-2xl shadow-sm"}>
                {EMOJI[c.name] ?? "📦"}
              </div>
              <p className="text-xs font-bold text-center text-neutral-800 leading-tight">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Service Categories (mirrors customer app) ── */}
      <section>
        <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 mb-1">Services</h2>
        <p className="text-sm text-neutral-500 mb-6">Book & enquire with local providers</p>
        <div className="space-y-8">
          {SERVICE_SECTIONS.map((sec) => (
            <div key={sec.title}>
              <h3 className="text-sm font-bold text-neutral-700 mb-3">{sec.title}</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {sec.items.map((s) => (
                  <Link key={s.slug} href={serviceRoute(s.slug)}
                    className="group rounded-2xl border border-neutral-200 bg-white p-3 flex items-center gap-3 hover:border-[#8E1B3A] hover:shadow-sm transition">
                    <span className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center text-xl flex-shrink-0">{s.emoji}</span>
                    <p className="text-sm font-semibold text-neutral-800 leading-tight">{s.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
