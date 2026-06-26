"use client";
import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Cat = { id: string; name: string };

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

export function CategoryRail({
  items,
  images = {},
}: {
  items: Cat[];
  images?: Record<string, string | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  if (!items.length) return null;

  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 380, behavior: "smooth" });

  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="absolute -start-3 top-[44px] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-md transition hover:text-[color:var(--brand-maroon)]"
      >
        <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
      </button>

      <div ref={ref} className="flex gap-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((c) => {
          const img = images[c.id];
          const icon = iconFor(c.name);
          return (
            <Link
              key={c.id}
              href={"/shop/" + c.id}
              className="group flex w-[92px] shrink-0 flex-col items-center gap-2.5 text-center"
            >
              <span className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[#8E1B3A]/40 group-hover:shadow-md">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : icon.kind === "emoji" ? (
                  <span className="text-[34px] leading-none">{icon.value}</span>
                ) : (
                  <span className="text-brand-gradient text-[26px] font-extrabold tracking-tight">{icon.value}</span>
                )}
              </span>
              <span className="line-clamp-2 text-[12px] font-semibold leading-tight text-neutral-700 transition-colors group-hover:text-[color:var(--brand-maroon)]">
                {c.name}
              </span>
            </Link>
          );
        })}
      </div>

      <button
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="absolute -end-3 top-[44px] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-md transition hover:text-[color:var(--brand-maroon)]"
      >
        <ChevronRight className="h-5 w-5 rtl:rotate-180" />
      </button>
    </div>
  );
}
