"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type Cat = { id: string; name: string };
type Grand = { id: string; name: string; image: string | null };
type Section = { id: string; name: string; children: Grand[] };

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

export function MobileCategoryNoon({
  topCategories,
  activeTopId,
  category,
  subtitle,
  sections,
}: {
  topCategories: Cat[];
  activeTopId: string;
  category: Cat;
  subtitle: string;
  sections: Section[];
}) {
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    sections[0] ? { [sections[0].id]: true } : {}
  );
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  return (
    <div className="flex h-[calc(100dvh-112px)]">
      {/* Department rail */}
      <aside className="w-[116px] shrink-0 overflow-y-auto border-e border-neutral-200 bg-neutral-50 pb-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {topCategories.map((d) => {
          const active = d.id === activeTopId;
          return (
            <Link
              key={d.id}
              href={"/shop/" + d.id}
              className={
                "flex items-center px-3 py-3.5 text-[12.5px] font-semibold leading-tight transition-colors " +
                (active ? "bg-white text-[color:var(--brand-maroon)]" : "text-neutral-600 hover:bg-white/60")
              }
              style={{ borderInlineStart: active ? "3px solid var(--brand-maroon)" : "3px solid transparent" }}
            >
              {d.name}
            </Link>
          );
        })}
      </aside>

      {/* Right column */}
      <div className="min-w-0 flex-1 overflow-y-auto bg-white pb-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Banner */}
        <div
          className="m-3 overflow-hidden rounded-2xl p-4 text-white"
          style={{ background: "linear-gradient(135deg, #8E1B3A 0%, #C72931 58%, #F24732 100%)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-white/70">UAQ Deals</p>
          <p className="mt-0.5 text-[18px] font-extrabold leading-tight">{category.name}</p>
          <p className="mt-1 text-[12px] leading-snug text-white/80">{subtitle}</p>
        </div>
        {/* Subcategory accordions */}
        {sections.map((sec) => {
          if (sec.children.length === 0) {
            return (
              <Link
                key={sec.id}
                href={"/shop/" + sec.id}
                className="flex items-center justify-between border-b border-neutral-100 px-4 py-3.5"
              >
                <span className="text-[14px] font-bold text-neutral-900">{sec.name}</span>
                <ChevronDown className="h-4 w-4 -rotate-90 text-neutral-400 rtl:rotate-90" />
              </Link>
            );
          }
          const isOpen = !!open[sec.id];
          return (
            <div key={sec.id} className="border-b border-neutral-100">
              <button
                onClick={() => toggle(sec.id)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-start"
              >
                <span className="text-[14px] font-bold text-neutral-900">{sec.name}</span>
                <ChevronDown className={"h-4 w-4 text-neutral-500 transition-transform " + (isOpen ? "rotate-180" : "")} />
              </button>
              {isOpen && (
                <div className="grid grid-cols-3 gap-2.5 px-3 pb-4">
                  {sec.children.map((g) => {
                    const icon = iconFor(g.name);
                    return (
                      <Link key={g.id} href={"/shop/" + g.id} className="flex flex-col items-center gap-1.5">
                        <span className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                          {g.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={g.image} alt={g.name} className="h-full w-full object-cover" />
                          ) : icon.kind === "emoji" ? (
                            <span className="text-2xl">{icon.value}</span>
                          ) : (
                            <span className="text-brand-gradient text-lg font-extrabold">{icon.value}</span>
                          )}
                        </span>
                        <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-neutral-700">
                          {g.name}
                        </span>
                      </Link>
                    );
                  })}
                  <Link
                    href={"/shop/" + sec.id}
                    className="flex items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white p-2 text-center"
                  >
                    <span className="text-[12px] font-bold text-[color:var(--brand-maroon)]">Shop all</span>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
