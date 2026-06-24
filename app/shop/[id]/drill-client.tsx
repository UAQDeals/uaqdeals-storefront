"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";

type Cat = { id: string; name: string };

const EMOJI: Record<string, string> = {
  Electronics: "📱", Grocery: "🛒", "Beauty & Fragrance": "💄",
  "Home & Kitchen": "🏠", Fashion: "👗", Baby: "👶",
  Toys: "🧸", "Health & Nutrition": "💊", Stationery: "✏️", Books: "📚",
};

const SIDEBAR_COLORS = [
  "#1565C0", "#2E7D32", "#AD1457", "#4527A0",
  "#E65100", "#00838F", "#C62828", "#37474F",
  "#558B2F", "#00695C",
];

function catEmoji(name: string): string {
  if (EMOJI[name]) return EMOJI[name];
  const map: Record<string, string> = {
    Phone: "📱", Mobile: "📱", Tablet: "📟", Laptop: "💻", TV: "📺",
    Refrigerator: "❄️", Washing: "🫧", AC: "🌬️", Apple: "🍎",
    Watch: "⌚", Smart: "🏠", Appliance: "🔌", Electric: "⚡",
    Cycle: "🚲", Scooter: "🛵", Massager: "💆", Fruit: "🍎",
    Vegetable: "🥦", Fish: "🐟", Meat: "🥩", Dairy: "🥛",
    Bakery: "🍞", Rice: "🌾", Cooking: "🫕", Frozen: "🧊",
    Snack: "🍿", Beverage: "🥤", Organic: "🌿", Pet: "🐾",
    Makeup: "💋", Skincare: "🧴", Perfume: "🌺", Hair: "💆",
    Bath: "🛁", Men: "👔", Women: "👒", Kids: "🧒",
    Furniture: "🛋️", Decor: "🖼️", Storage: "📦", Tools: "🔧",
    Toy: "🧸", Game: "🎮", Party: "🎉", Paper: "📄",
    Writing: "✒️", Fiction: "📖", Business: "💼", Arabic: "📜",
    Traditional: "🕌", Footwear: "👟", Bag: "👜", Jewel: "💎",
    Feeding: "🍼", Travel: "🧳",
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (name.includes(key)) return emoji;
  }
  return "📦";
}

const CARD_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-100", icon: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-green-50", border: "border-green-100", icon: "bg-green-100", text: "text-green-700" },
  { bg: "bg-pink-50", border: "border-pink-100", icon: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-purple-50", border: "border-purple-100", icon: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-orange-50", border: "border-orange-100", icon: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-teal-50", border: "border-teal-100", icon: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-red-50", border: "border-red-100", icon: "bg-red-100", text: "text-red-700" },
  { bg: "bg-slate-50", border: "border-slate-100", icon: "bg-slate-100", text: "text-slate-700" },
];

export function ShopDrillClient({ category, children, breadcrumb, rootCats, l1Id }: {
  category: Cat;
  children: Cat[];
  breadcrumb: Cat[];
  rootCats: Cat[];
  l1Id: string;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Sidebar = () => (
    <div className="space-y-1">
      {rootCats.map((c, i) => {
        const active = c.id === l1Id;
        const color = SIDEBAR_COLORS[i % SIDEBAR_COLORS.length];
        return (
          <Link
            key={c.id}
            href={"/shop/" + c.id}
            onClick={() => setSidebarOpen(false)}
            className={"flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center transition-all " + (active ? "bg-white shadow-sm" : "hover:bg-white/60")}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all"
              style={{ backgroundColor: active ? color : color + "22" }}
            >
              {catEmoji(c.name)}
            </div>
            <span
              className="text-[10px] font-semibold leading-tight line-clamp-2"
              style={{ color: active ? color : "#666" }}
            >
              {c.name}
            </span>
            {active && (
              <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: color }} />
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-neutral-500 mb-4 flex-wrap">
        <Link href="/" className="hover:text-[#8E1B3A]">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/categories" className="hover:text-[#8E1B3A]">Categories</Link>
        {breadcrumb.map((b, i) => (
          <span key={b.id} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            {i === breadcrumb.length - 1
              ? <span className="text-neutral-800 font-semibold">{b.name}</span>
              : <Link href={"/shop/" + b.id} className="hover:text-[#8E1B3A]">{b.name}</Link>}
          </span>
        ))}
      </nav>

      <div className="flex gap-4">

        {/* ── DESKTOP LEFT SIDEBAR ── */}
        <aside className="hidden lg:block w-[90px] flex-shrink-0 bg-neutral-50 rounded-2xl p-2 self-start sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
          <Sidebar />
        </aside>

        {/* ── MOBILE SIDEBAR TOGGLE ── */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-20 left-4 z-40 flex items-center gap-2 bg-[#8E1B3A] text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-bold"
        >
          <SlidersHorizontal className="w-4 h-4" /> Categories
        </button>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-[110px] bg-neutral-50 h-full overflow-y-auto p-2 shadow-xl">
              <button onClick={() => setSidebarOpen(false)} className="w-full flex justify-end p-1 mb-2">
                <X className="w-4 h-4 text-neutral-400" />
              </button>
              <Sidebar />
            </div>
          </div>
        )}

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-neutral-900 mb-4">{category.name}</h1>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5">
            {children.map((c, i) => {
              const col = CARD_COLORS[i % CARD_COLORS.length];
              return (
                <Link
                  key={c.id}
                  href={"/shop/" + c.id}
                  className={"group rounded-2xl border p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow " + col.bg + " " + col.border}
                >
                  <div className={"w-12 h-12 rounded-xl flex items-center justify-center text-2xl " + col.icon}>
                    {catEmoji(c.name)}
                  </div>
                  <p className={"text-[10px] font-bold text-center leading-tight " + col.text}>{c.name}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
