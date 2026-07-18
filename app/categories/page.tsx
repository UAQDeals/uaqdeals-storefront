import { DEDICATED } from "@/lib/service-routes";
import Link from "next/link";
import { showProducts, isTypeEnabled, enabledProductCategories } from "@/lib/emirate";

export const metadata = { title: "Categories — UAQ Deals" };
export const revalidate = 300;

const CAT_IMAGES: Record<string, string> = {
  "Electronics":          "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop&auto=format",
  "Grocery":              "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&auto=format",
  "Beauty & Fragrance":   "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop&auto=format",
  "Home & Kitchen":       "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format",
  "Fashion":              "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop&auto=format",
  "Baby":                 "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop&auto=format",
  "Toys":                 "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format",
  "Health & Nutrition":   "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&h=300&fit=crop&auto=format",
  "Stationery":           "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&h=300&fit=crop&auto=format",
  "Books":                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop&auto=format",
  "Pharmacy":             "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&auto=format",
};
const DEFAULT_IMG = "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop&auto=format";

const MARKETPLACE = ["automotive", "real_estate", "used_items", "fancy_numbers"];
function serviceRoute(slug: string): string {
  if (MARKETPLACE.includes(slug)) return "/marketplace/" + slug;
  if (DEDICATED[slug]) return DEDICATED[slug];
  return "/categories/" + slug;
}

// Mirror of services page SECTIONS structure
const SERVICE_SECTIONS = [
  {
    title: "Featured Listings",
    items: [
      { slug: "real_estate",   name: "Real Estate",      img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop&auto=format" },
      { slug: "automotive",    name: "Automotive",       img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop&auto=format" },
      { slug: "fancy_numbers", name: "Fancy Numbers",    img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop&auto=format" },
      { slug: "used_items",    name: "Used Electronics", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    title: "Tours, Trips & Packages",
    items: [
      { slug: "explore_uaq", name: "Explore UAQ",  img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop&auto=format" },
      { slug: "zoo_events",  name: "Zoo & Events", img: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    title: "Our Top Services",
    items: [
      { slug: "typing_center",  name: "Typing Center",  img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop&auto=format" },
      { slug: "business_setup", name: "Business Setup", img: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    title: "Our Quick Services",
    items: [
      { slug: "mobile_repair",         name: "Mobile Repair",          img: "https://images.unsplash.com/photo-1621274403997-37aace184f49?w=600&h=400&fit=crop&auto=format" },
      { slug: "pest_control",          name: "Pest Control",           img: "https://images.unsplash.com/photo-1470082719408-b2843ab5c9ab?w=600&h=400&fit=crop&auto=format" },
      { slug: "home_services",         name: "Home Services",          img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop&auto=format" },
      { slug: "construction_painting", name: "Construction & Painting",img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop&auto=format" },
      { slug: "cleaning_service",      name: "Cleaning Services",      img: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=400&fit=crop&auto=format" },
      { slug: "tailor_shop",           name: "Tailor Shop",            img: "https://images.unsplash.com/photo-1605289355680-75fb41239154?w=600&h=400&fit=crop&auto=format" },
      { slug: "barber_shop",           name: "Barber Shop",            img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    title: "Essentials",
    items: [
      { slug: "clinics",        name: "Clinics & Healthcare", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop&auto=format" },
      { slug: "job_portal",     name: "Jobs",                 img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    title: "Travel",
    items: [
      { slug: "hotel_booking",  name: "Hotel Booking",  img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&auto=format" },
      { slug: "flight_booking", name: "Flight Booking", img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop&auto=format" },
    ],
  },
  {
    title: "Tech & Digital Services",
    items: [
      { slug: "web_dev_design",       name: "Web Development & Design",  img: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop&auto=format" },
      { slug: "mobile_app_dev",       name: "Mobile App Development",    img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop&auto=format" },
      { slug: "ecommerce_dev",        name: "E-commerce Development",    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&auto=format" },
      { slug: "ecommerce_management", name: "E-commerce Management",     img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&auto=format" },
      { slug: "accounting_software",  name: "Accounting Software",       img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop&auto=format" },
      { slug: "custom_software",      name: "Custom Software",           img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop&auto=format" },
      { slug: "seo_content",          name: "SEO & Content",             img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&h=400&fit=crop&auto=format" },
      { slug: "social_media_mgmt",    name: "Social Media Management",   img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop&auto=format" },
    ],
  },
];

function ServiceCard({ slug, name, img }: { slug: string; name: string; img: string }) {
  return (
    <Link href={serviceRoute(slug)}
      className="group relative block overflow-hidden rounded-2xl"
      style={{ aspectRatio: "16/9" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 100%)" }} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "rgba(142,27,58,0.18)" }} />
      <div className="absolute bottom-0 inset-x-0 p-3.5">
        <p className="text-white font-semibold text-[13.5px] leading-snug drop-shadow-sm">{name}</p>
      </div>
    </Link>
  );
}

export default async function CategoriesPage() {
  const showProd = await showProducts();
  const productCats = await enabledProductCategories();

  // Service sections filtered by the admin Emirates toggles; empty
  // sections disappear entirely.
  const serviceSections: { title: string; items: { slug: string; name: string; img: string }[] }[] = [];
  for (const sec of SERVICE_SECTIONS) {
    const items: { slug: string; name: string; img: string }[] = [];
    for (const s of sec.items) {
      if (await isTypeEnabled(s.slug)) items.push(s);
    }
    if (items.length > 0) serviceSections.push({ title: sec.title, items });
  }

  return (
    <div className="min-h-screen bg-[color:var(--brand-cream)]">

      {/* ── Hero header ── */}
      <div className="border-b border-[color:var(--brand-border)]"
        style={{ background: "linear-gradient(135deg, var(--brand-maroon) 0%, var(--brand-red) 60%, var(--brand-orange) 100%)" }}>
        <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-10">
          <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1">UAQ Deals</p>
          <h1 className="text-white text-3xl md:text-4xl font-bold tracking-tight">Shop &amp; Services</h1>
          <p className="text-white/75 mt-1.5 text-sm">Everything Umm Al Quwain needs, in one place</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-10 space-y-10">

        {/* ── Product Categories ── */}
        {showProd && (
          <section>
            <div className="flex items-center gap-3 mb-4 mt-2">
              <h2 className="text-[15px] font-bold text-neutral-800">Shop by Category</h2>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
              {(productCats ?? []).map((c) => {
                // Prefer the admin-uploaded category image; fall back to curated.
                const img = (c.image_url && c.image_url.length > 0)
                  ? c.image_url
                  : (CAT_IMAGES[c.name] ?? DEFAULT_IMG);
                return (
                  <Link key={c.id} href={"/shop/" + c.id}
                    className="group relative block overflow-hidden rounded-2xl"
                    style={{ aspectRatio: "16/9" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={c.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0"
                      style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.6) 100%)" }} />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "rgba(142,27,58,0.18)" }} />
                    <div className="absolute bottom-0 inset-x-0 p-3">
                      <p className="text-white font-semibold text-[12.5px] leading-snug drop-shadow-sm">{c.name}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Service Sections — mirrors /services page layout ── */}
        {serviceSections.map((sec) => (
          <section key={sec.title}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[15px] font-bold text-neutral-800">{sec.title}</h2>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>
            <div className="grid gap-3"
              style={{
                gridTemplateColumns: sec.items.length === 2
                  ? "repeat(2, 1fr)"
                  : "repeat(auto-fill, minmax(240px, 1fr))",
              }}>
              {sec.items.map((s) => (
                <ServiceCard key={s.slug} slug={s.slug} name={s.name} img={s.img} />
              ))}
            </div>
          </section>
        ))}

      </div>
    </div>
  );
}
