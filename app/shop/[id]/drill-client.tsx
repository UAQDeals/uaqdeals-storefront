"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Cat = { id: string; name: string; slug?: string | null };

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
      .select("id, name, slug")
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
      <div className="border-b border-[color:var(--brand-border)] bg-white px-3 py-2.5">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-[color:var(--brand-muted)]">
          <Link href="/" className="transition-colors hover:text-[color:var(--brand-maroon)]">Home</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0 rtl:rotate-180" />
          <Link href="/categories" className="transition-colors hover:text-[color:var(--brand-maroon)]">Categories</Link>
          {breadcrumb.map((b, i) => (
            <span key={b.id} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 flex-shrink-0 rtl:rotate-180" />
              {i === breadcrumb.length - 1
                ? <span className="font-semibold text-[color:var(--ink)]">{b.name}</span>
                : <Link href={"/shop/" + (b.slug || b.id)} className="transition-colors hover:text-[color:var(--brand-maroon)]">{b.name}</Link>}
            </span>
          ))}
        </nav>
      </div>

      {/* Two-panel layout */}
      <div className="flex bg-[color:var(--paper)]">

        {/* LEFT SIDEBAR — subcategories of current category */}
        <aside className="w-[82px] flex-shrink-0 border-e border-[color:var(--brand-border)] bg-[color:var(--paper-2)]">
          {children.map((c) => {
            const active = selectedSidebar?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedSidebar(c)}
                className={"flex w-full flex-col items-center gap-1.5 border-e-[3px] px-1.5 py-3 text-center transition-all " + (active ? "border-[color:var(--brand-maroon)] bg-white" : "border-transparent hover:bg-white/60")}
              >
                <div
                  className={"flex h-[46px] w-[46px] items-center justify-center rounded-xl text-[22px] transition-colors " + (active ? "bg-brand-gradient" : "bg-white")}
                >
                  {catEmoji(c.name)}
                </div>
                <span
                  className={"line-clamp-2 w-full text-center text-[9.5px] font-semibold leading-tight " + (active ? "text-[color:var(--brand-maroon)]" : "text-[color:var(--brand-muted)]")}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </aside>

        {/* RIGHT PANEL */}
        <div className="min-w-0 flex-1 bg-white">
          <div className="border-b border-[color:var(--brand-border)] px-3 pt-4 pb-2">
            <h1 className="font-display text-[16px] font-semibold text-[color:var(--ink)]">
              {selectedSidebar?.name ?? category.name}
            </h1>
          </div>

          {loadingRight ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-[color:var(--paper-2)] border-t-[color:var(--brand-maroon)]" style={{ borderWidth: 3 }} />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 p-3">
              {rightItems.map((c) => (
                <Link
                  key={c.id}
                  href={"/shop/" + (c.slug || c.id)}
                  className="premium-card group flex flex-col items-center gap-2 p-3 transition-transform active:scale-95"
                >
                  <div className="bg-brand-gradient flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-sm transition-transform duration-300 group-hover:scale-110">
                    {catEmoji(c.name)}
                  </div>
                  <p className="text-center text-[10px] font-bold leading-tight text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--brand-maroon)]">{c.name}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
