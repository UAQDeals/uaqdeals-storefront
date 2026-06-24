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

export default async function CategoriesPage() {
  const supabase = await createClient();

  const [{ data: productCats }, { data: serviceCats }] = await Promise.all([
    supabase.from("categories").select("id, name").filter("parent_id", "is", null)
      .eq("is_active", true).order("sort_order").order("name"),
    supabase.from("vendor_types").select("id, name, slug, icon")
      .eq("is_active", true).eq("is_product", false)
      .order("display_order", { ascending: true, nullsFirst: false }).order("name"),
  ]);

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

      {/* ── Service Categories ── */}
      <section>
        <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 mb-1">Services</h2>
        <p className="text-sm text-neutral-500 mb-6">Book & enquire with local providers</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {(serviceCats ?? []).map((s) => {
            const isImg = typeof s.icon === "string" && s.icon.startsWith("http");
            return (
              <Link key={s.id} href={"/categories/" + s.slug}
                className="group rounded-2xl border border-neutral-200 bg-white p-3 flex items-center gap-3 hover:border-[#8E1B3A] hover:shadow-sm transition">
                {isImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.icon as string} alt={s.name}
                    className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <span className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center text-xl flex-shrink-0">🔧</span>
                )}
                <p className="text-sm font-semibold text-neutral-800 leading-tight">{s.name}</p>
              </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
}
