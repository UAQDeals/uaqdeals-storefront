import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";

type Cat = { id: string; name: string };

// Maps a category name to an emoji when one fits; otherwise the caller falls
// back to a monogram. Mirrors the mobile drill so icons stay consistent.
const EMOJI_MAP: Record<string, string> = {
  Phone: "📱", Mobile: "📱", Tablet: "📟", Laptop: "💻", TV: "📺",
  Refrigerator: "❄️", Washing: "🫧", AC: "🌬️", Watch: "⌚",
  Smart: "🏠", Appliance: "🔌", Electric: "⚡", Cycle: "🚲",
  Scooter: "🛵", Massager: "💆", Fruit: "🍎", Vegetable: "🥦",
  Fish: "🐟", Meat: "🥩", Dairy: "🥛", Bakery: "🍞",
  Rice: "🌾", Cooking: "🫕", Frozen: "🧊", Snack: "🍿",
  Beverage: "🥤", Organic: "🌿", Pet: "🐾", Makeup: "💋",
  Skincare: "🧴", Perfume: "🌺", Hair: "💆", Bath: "🛁",
  Men: "👔", Women: "👒", Kids: "🧒", Furniture: "🛋️",
  Decor: "🖼️", Storage: "📦", Tools: "🔧", Toy: "🧸",
  Game: "🎮", Party: "🎉", Paper: "📄", Writing: "✒️",
  Fiction: "📖", Business: "💼", Arabic: "📜", Traditional: "🕌",
  Footwear: "👟", Bag: "👜", Jewel: "💎", Feeding: "🍼",
  Travel: "🧳", Outdoor: "🌳", Living: "🛋️", Bedroom: "🛏️",
  Dining: "🍽️", Office: "💼", Kitchen: "🍳", Laundry: "🧺",
  Paint: "🎨", Hardware: "🔩", Lighting: "💡", Bedding: "🛏️",
  Accessory: "🎒", Wearable: "⌚", Wellness: "💆",
  Spring: "🌸", Summer: "☀️", Modest: "🕌", Baby: "👶",
  Breast: "🍼", Nursery: "🍼", Stroller: "🛒",
  Notebook: "📓", Calendar: "📅", Desk: "🗂️",
  Novel: "📖", Children: "📗", Reference: "📘",
};

function iconFor(name: string): { kind: "emoji" | "mono"; value: string } {
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (name.includes(key)) return { kind: "emoji", value: emoji };
  }
  const letters = name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return { kind: "mono", value: letters || "?" };
}

export function ShopCategoryGrid({
  category,
  children,
  breadcrumb,
}: {
  category: Cat;
  children: Cat[];
  breadcrumb: Cat[];
}) {
  return (
    <div className="bg-[color:var(--brand-cream)]">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-100 bg-white">
        <nav className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-1 px-5 py-3 text-[12.5px] text-neutral-500 md:px-8">
          <Link href="/" className="transition-colors hover:text-[color:var(--brand-maroon)]">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-300 rtl:rotate-180" />
          <Link href="/categories" className="transition-colors hover:text-[color:var(--brand-maroon)]">Categories</Link>
          {breadcrumb.map((b, i) => (
            <span key={b.id} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-300 rtl:rotate-180" />
              {i === breadcrumb.length - 1 ? (
                <span className="font-semibold text-neutral-800">{b.name}</span>
              ) : (
                <Link href={"/shop/" + b.id} className="transition-colors hover:text-[color:var(--brand-maroon)]">{b.name}</Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Subcategory grid */}
      <div className="mx-auto max-w-[1320px] px-5 py-8 md:px-8 md:py-10">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-brand-gradient" />
          <h2 className="text-[17px] font-extrabold tracking-tight text-neutral-900">
            Browse {category.name}
          </h2>
          <span className="text-[12.5px] text-neutral-400">{children.length} categories</span>
        </div>

        <div className="grid grid-cols-3 gap-3 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5">
          {children.map((c) => {
            const icon = iconFor(c.name);
            return (
              <Link
                key={c.id}
                href={"/shop/" + c.id}
                className="group relative flex flex-col items-center gap-3.5 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#8E1B3A]/30 hover:shadow-xl"
              >
                <span
                  className="pointer-events-none absolute -end-8 -top-8 h-20 w-20 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "radial-gradient(circle, rgba(199,41,49,0.10), transparent 70%)" }}
                  aria-hidden
                />
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110"
                  style={{ background: "linear-gradient(135deg, #C72931 0%, #8E1B3A 100%)" }}
                >
                  {icon.kind === "emoji" ? (
                    <span className="text-3xl leading-none">{icon.value}</span>
                  ) : (
                    <span className="text-[20px] font-extrabold tracking-tight text-white">{icon.value}</span>
                  )}
                </span>
                <p className="text-[14px] font-bold leading-snug text-neutral-900 transition-colors group-hover:text-[color:var(--brand-maroon)]">
                  {c.name}
                </p>
                <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-neutral-400 transition-colors group-hover:text-[color:var(--brand-maroon)]">
                  Browse
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
