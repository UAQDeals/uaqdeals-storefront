"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Cat = { id: string; name: string };

function categoryEmoji(name: string): string {
  const map: Record<string, string> = {
    Phone: "📱", Mobile: "📱", Tablet: "📟", Laptop: "💻", TV: "📺",
    Refrigerator: "❄️", Washing: "🫧", AC: "🌬️", Apple: "🍎",
    Samsung: "📱", Huawei: "📱", Accessory: "🎒", Watch: "⌚",
    Wearable: "⌚", Smart: "🏠", Appliance: "🔌", Electric: "⚡",
    Cycle: "🚲", Scooter: "🛵", Massager: "💆", Fruit: "🍎",
    Vegetable: "🥦", Fish: "🐟", Meat: "🥩", Dairy: "🥛",
    Bakery: "🍞", Rice: "🌾", Cooking: "🫕", Frozen: "🧊",
    Snack: "🍿", Beverage: "🥤", Breakfast: "🥣", Organic: "🌿",
    Pet: "🐾", Makeup: "💋", Skincare: "🧴", Perfume: "🌺",
    Oud: "🕌", Hair: "💆", Bath: "🛁", Men: "👔", Women: "👒",
    Kids: "🧒", Baby: "👶", Furniture: "🛋️", Decor: "🖼️",
    Storage: "📦", Laundry: "🧺", Tools: "🔧", Toy: "🧸",
    Game: "🎮", Party: "🎉", Paper: "📄", Writing: "✒️",
    Fiction: "📖", Children: "📗", Business: "💼", Arabic: "📜",
    Grocery: "🛒", Fashion: "👗", Books: "📚", Stationery: "✏️",
    Traditional: "🕌", Footwear: "👟", Bag: "👜", Jewel: "💎",
    Feeding: "🍼", Nursery: "🍼", Travel: "🧳",
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (name.includes(key)) return emoji;
  }
  return "📦";
}

const COLORS = [
  { bg: "bg-blue-50", border: "border-blue-100", icon: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-green-50", border: "border-green-100", icon: "bg-green-100", text: "text-green-700" },
  { bg: "bg-pink-50", border: "border-pink-100", icon: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-purple-50", border: "border-purple-100", icon: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-orange-50", border: "border-orange-100", icon: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-teal-50", border: "border-teal-100", icon: "bg-teal-100", text: "text-teal-700" },
];

export function ShopDrillClient({ category, children, breadcrumb }: {
  category: Cat; children: Cat[]; breadcrumb: Cat[];
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-neutral-500 mb-6 flex-wrap">
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

      {/* Header */}
      <h1 className="text-2xl font-extrabold text-neutral-900 mb-6">{category.name}</h1>

      {/* Children grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {children.map((c, i) => {
          const col = COLORS[i % COLORS.length];
          return (
            <Link key={c.id} href={"/shop/" + c.id}
              className={"group rounded-2xl border p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow " + col.bg + " " + col.border}>
              <div className={"w-14 h-14 rounded-2xl flex items-center justify-center text-2xl " + col.icon}>
                {categoryEmoji(c.name)}
              </div>
              <p className={"text-xs font-bold text-center leading-tight " + col.text}>{c.name}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
