import { createClient } from "@/lib/supabase/server";
import { DEDICATED } from "@/lib/service-routes";
import Link from "next/link";
import { showProducts } from "@/lib/emirate";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Categories — UAQ Deals" };
export const revalidate = 300;

// Stock images per category
const CAT_IMAGES: Record<string, string> = {
  "Electronics":          "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=500&fit=crop&auto=format",
  "Grocery":              "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=500&fit=crop&auto=format",
  "Beauty & Fragrance":   "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop&auto=format",
  "Home & Kitchen":       "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop&auto=format",
  "Fashion":              "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop&auto=format",
  "Baby":                 "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=500&fit=crop&auto=format",
  "Toys":                 "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop&auto=format",
  "Health & Nutrition":   "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&h=500&fit=crop&auto=format",
  "Stationery":           "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&h=500&fit=crop&auto=format",
  "Books":                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=500&fit=crop&auto=format",
  "Pharmacy":             "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=500&fit=crop&auto=format",
};
const DEFAULT_IMG = "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=500&fit=crop&auto=format";

// Accent colors per category for the gradient overlay
const CAT_ACCENTS: Record<string, string> = {
  "Electronics":          "from-blue-900/80",
  "Grocery":              "from-green-900/80",
  "Beauty & Fragrance":   "from-pink-900/80",
  "Home & Kitchen":       "from-purple-900/80",
  "Fashion":              "from-orange-900/80",
  "Baby":                 "from-cyan-900/80",
  "Toys":                 "from-yellow-900/80",
  "Health & Nutrition":   "from-red-900/80",
  "Stationery":           "from-slate-900/80",
  "Books":                "from-violet-900/80",
  "Pharmacy":             "from-teal-900/80",
};

const MARKETPLACE = ["automotive", "real_estate", "used_items", "fancy_numbers"];
function serviceRoute(slug: string): string {
  if (MARKETPLACE.includes(slug)) return "/marketplace/" + slug;
  if (DEDICATED[slug]) return DEDICATED[slug];
  return "/categories/" + slug;
}

const FEATURED_LISTINGS = [
  {
    slug: "real_estate",
    name: "Real Estate",
    sub: "Apartments, villas & plots",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop&auto=format",
    accent: "from-violet-900/70",
  },
  {
    slug: "automotive",
    name: "Automotive",
    sub: "New & used vehicles",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop&auto=format",
    accent: "from-blue-900/70",
  },
  {
    slug: "fancy_numbers",
    name: "Fancy Numbers",
    sub: "Premium UAE plate & phone numbers",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop&auto=format",
    accent: "from-amber-900/70",
  },
  {
    slug: "used_items",
    name: "Used Electronics",
    sub: "Pre-owned gadgets & devices",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&auto=format",
    accent: "from-cyan-900/70",
  },
];

const SERVICE_SECTIONS: {
  title: string;
  subtitle: string;
  items: { slug: string; name: string; emoji: string; image: string; accent: string }[];
}[] = [
  {
    title: "Tours & Experiences",
    subtitle: "Discover the best of UAQ",
    items: [
      { slug: "explore_uaq", name: "Explore UAQ",  emoji: "🧭", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300&h=200&fit=crop", accent: "#16A34A" },
      { slug: "zoo_events",  name: "Zoo & Events", emoji: "🦁", image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=300&h=200&fit=crop", accent: "#EA580C" },
    ],
  },
  {
    title: "Top Services",
    subtitle: "Trusted local professionals",
    items: [
      { slug: "typing_center",         name: "Typing Center",          emoji: "✍️", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&h=200&fit=crop", accent: "#475569" },
      { slug: "business_setup",        name: "Business Setup",         emoji: "📋", image: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=300&h=200&fit=crop", accent: "#0F766E" },
      { slug: "mobile_repair",         name: "Mobile Repair",          emoji: "🔧", image: "https://images.unsplash.com/photo-1621274403997-37aace184f49?w=300&h=200&fit=crop", accent: "#2563EB" },
      { slug: "pest_control",          name: "Pest Control",           emoji: "🐜", image: "https://images.unsplash.com/photo-1470082719408-b2843ab5c9ab?w=300&h=200&fit=crop", accent: "#16A34A" },
      { slug: "home_services",         name: "Home Services",          emoji: "🛠️", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=200&fit=crop", accent: "#7C3AED" },
      { slug: "construction_painting", name: "Construction & Painting",emoji: "🏗️", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop", accent: "#EA580C" },
      { slug: "cleaning_service",      name: "Cleaning",               emoji: "🧹", image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&h=200&fit=crop", accent: "#0891B2" },
      { slug: "tailor_shop",           name: "Tailor Shop",            emoji: "🧵", image: "https://images.unsplash.com/photo-1605289355680-75fb41239154?w=300&h=200&fit=crop", accent: "#DB2777" },
    ],
  },
  {
    title: "Essentials & Travel",
    subtitle: "Healthcare, jobs and travel",
    items: [
      { slug: "clinics",        name: "Clinics",        emoji: "🩺", image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&h=200&fit=crop", accent: "#DC2626" },
      { slug: "job_portal",     name: "Jobs",           emoji: "👔", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=300&h=200&fit=crop", accent: "#475569" },
      { slug: "hotel_booking",  name: "Hotel Booking",  emoji: "🏨", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop", accent: "#7C3AED" },
      { slug: "flight_booking", name: "Flight Booking", emoji: "✈️", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=200&fit=crop", accent: "#2563EB" },
    ],
  },
  {
    title: "Tech & Digital",
    subtitle: "Grow your business online",
    items: [
      { slug: "web_dev_design",       name: "Web Development",  emoji: "🌐", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=200&fit=crop", accent: "#2563EB" },
      { slug: "mobile_app_dev",       name: "Mobile Apps",      emoji: "📱", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop", accent: "#7C3AED" },
      { slug: "seo_content",          name: "SEO & Content",    emoji: "🔍", image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=300&h=200&fit=crop", accent: "#EA580C" },
      { slug: "social_media_mgmt",    name: "Social Media",     emoji: "📣", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop", accent: "#DB2777" },
      { slug: "ecommerce_dev",        name: "E-commerce Dev",   emoji: "🛒", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop", accent: "#16A34A" },
      { slug: "accounting_software",  name: "Accounting",       emoji: "📈", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop", accent: "#CA8A04" },
    ],
  },
];

export default async function CategoriesPage() {
  const supabase = await createClient();
  const showProd = await showProducts();
  const { data: productCats } = await supabase
    .from("categories").select("id, name").filter("parent_id", "is", null)
    .eq("is_active", true).order("sort_order").order("name");

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden px-4 pt-10 pb-14"
        style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0a0f 50%, #2d0d18 100%)" }}>
        <div className="pointer-events-none absolute -top-10 -right-10 h-60 w-60 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #C72931, transparent)" }} />
        <div className="mx-auto max-w-6xl relative">
          <p className="text-[11px] font-bold tracking-[3px] uppercase text-[#F24732] mb-2">UAQ Deals</p>
          <h1 className="text-white text-[32px] font-extrabold leading-tight tracking-tight">
            Shop &amp; Services
          </h1>
          <p className="text-white/50 text-[13px] mt-2">Everything Umm Al Quwain needs, in one place</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 -mt-6 pb-20 space-y-12">

        {/* ── Product Categories — tall image cards ── */}
        {showProd && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-[color:var(--brand-maroon)]">Shop</p>
                <h2 className="text-[20px] font-extrabold text-neutral-900">Shop by Category</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {(productCats ?? []).map((c) => {
                const img = CAT_IMAGES[c.name] ?? DEFAULT_IMG;
                const accent = CAT_ACCENTS[c.name] ?? "from-neutral-900/80";
                return (
                  <Link key={c.id} href={"/shop/" + c.id}
                    className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    style={{ aspectRatio: "3/4" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={c.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${accent} to-transparent`} />
                    <div className="absolute bottom-0 p-3">
                      <p className="text-white text-[12px] font-extrabold leading-tight drop-shadow-sm">{c.name}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Featured Listings — large hero cards ── */}
        <section>
          <div className="mb-5">
            <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-[color:var(--brand-maroon)]">Marketplace</p>
            <h2 className="text-[20px] font-extrabold text-neutral-900">Featured Listings</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FEATURED_LISTINGS.map((item) => (
              <Link key={item.slug} href={serviceRoute(item.slug)}
                className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                style={{ aspectRatio: "4/3" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className={`absolute inset-0 bg-gradient-to-t ${item.accent} to-transparent`} />
                <div className="absolute bottom-0 p-3">
                  <p className="text-white text-[13px] font-extrabold leading-tight">{item.name}</p>
                  <p className="text-white/70 text-[11px] mt-0.5">{item.sub}</p>
                </div>
                <div className="absolute top-3 end-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-3.5 w-3.5 text-white" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Service Sections ── */}
        {SERVICE_SECTIONS.map((sec) => (
          <section key={sec.title}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-[color:var(--brand-maroon)]">Services</p>
                <h2 className="text-[20px] font-extrabold text-neutral-900">{sec.title}</h2>
                <p className="text-[12px] text-neutral-500">{sec.subtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {sec.items.map((s) => (
                <Link key={s.slug} href={serviceRoute(s.slug)}
                  className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 bg-white"
                  style={{ aspectRatio: "4/3" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt={s.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 p-3 flex items-end justify-between w-full">
                    <div>
                      <span className="text-xl block mb-1">{s.emoji}</span>
                      <p className="text-white text-[12.5px] font-extrabold leading-tight drop-shadow-sm">{s.name}</p>
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <ArrowRight className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

      </div>
    </div>
  );
}
