"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Cat = { id: string; name: string };

const SIDEBAR_COLORS = [
  "#1565C0", "#2E7D32", "#AD1457", "#4527A0",
  "#E65100", "#00838F", "#C62828", "#37474F",
  "#558B2F", "#00695C", "#1565C0", "#AD1457",
];

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

function catEmoji(name: string): string {
  const map: Record<string, string> = {
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
    Outdoor_play: "🌳", RC: "🚗", Indoor: "🎮",
    Notebook: "📓", Calendar: "📅", Desk: "🗂️",
    Novel: "📖", Children: "📗", Reference: "📘",
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (name.includes(key)) return emoji;
  }
  return "📦";
}

export function ShopDrillClient({ category, children, breadcrumb }: {
  category: Cat;
  children: Cat[];
  breadcrumb: Cat[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [selectedSidebar, setSelectedSidebar] = useState<Cat | null>(children[0] ?? null);
  const [rightItems, setRightItems] = useState<Cat[]>([]);
  const [loadingRight, setLoadingRight] = useState(false);
  // Desktop shows a flat grid instead; gate this mobile drill's data + redirect
  // so it stays inert (no /products redirect) while hidden on desktop (md+).
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Load right panel when sidebar selection changes
  useEffect(() => {
    if (!enabled || !selectedSidebar) return;
    setLoadingRight(true);
    supabase
      .from("categories")
      .select("id, name")
      .eq("parent_id", selectedSidebar.id)
      .eq("is_active", true)
      .order("sort_order")
      .order("name")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setRightItems(data as Cat[]);
        } else {
          // No children — navigate to products
          router.push("/products?cat=" + selectedSidebar.id);
        }
        setLoadingRight(false);
      });
  }, [selectedSidebar?.id, enabled]);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="px-3 py-2.5 bg-white border-b border-neutral-100">
        <nav className="flex items-center gap-1 text-xs text-neutral-500 flex-wrap">
          <Link href="/" className="hover:text-[#8E1B3A]">Home</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link href="/categories" className="hover:text-[#8E1B3A]">Categories</Link>
          {breadcrumb.map((b, i) => (
            <span key={b.id} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              {i === breadcrumb.length - 1
                ? <span className="text-neutral-800 font-semibold">{b.name}</span>
                : <Link href={"/shop/" + b.id} className="hover:text-[#8E1B3A]">{b.name}</Link>}
            </span>
          ))}
        </nav>
      </div>

      {/* Two-panel layout */}
      <div className="flex bg-[#f5f5f5]">

        {/* LEFT SIDEBAR — subcategories of current category */}
        <aside className="w-[82px] flex-shrink-0 bg-[#f0f0f0] border-r border-neutral-200">
          {children.map((c, i) => {
            const active = selectedSidebar?.id === c.id;
            const color = SIDEBAR_COLORS[i % SIDEBAR_COLORS.length];
            return (
              <button
                key={c.id}
                onClick={() => setSelectedSidebar(c)}
                className={"w-full flex flex-col items-center gap-1.5 px-1.5 py-3 text-center transition-all " + (active ? "bg-white" : "hover:bg-white/60")}
                style={active ? { borderRight: `3px solid ${color}` } : { borderRight: "3px solid transparent" }}
              >
                <div
                  className="w-[46px] h-[46px] rounded-xl flex items-center justify-center text-[22px]"
                  style={{ backgroundColor: active ? color + "25" : color + "15" }}
                >
                  {catEmoji(c.name)}
                </div>
                <span
                  className="text-[9.5px] font-semibold leading-tight line-clamp-2 w-full text-center"
                  style={{ color: active ? color : "#666" }}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </aside>

        {/* RIGHT PANEL */}
        <div className="flex-1 min-w-0 bg-white">
          <div className="px-3 pt-4 pb-2 border-b border-neutral-50">
            <h1 className="text-[15px] font-extrabold text-neutral-900">
              {selectedSidebar?.name ?? category.name}
            </h1>
          </div>

          {loadingRight ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-3 border-neutral-200 border-t-[#8E1B3A] animate-spin" style={{ borderWidth: 3 }} />
            </div>
          ) : (
            <div className="p-3 grid grid-cols-3 gap-2.5">
              {rightItems.map((c, i) => {
                const col = CARD_COLORS[i % CARD_COLORS.length];
                return (
                  <Link
                    key={c.id}
                    href={"/shop/" + c.id}
                    className={"group rounded-2xl border p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform " + col.bg + " " + col.border}
                  >
                    <div className={"w-12 h-12 rounded-xl flex items-center justify-center text-2xl " + col.icon}>
                      {catEmoji(c.name)}
                    </div>
                    <p className={"text-[10px] font-bold text-center leading-tight " + col.text}>{c.name}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
