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
      <aside className="w-[116px] shrink-0 overflow-y-auto border-e border-[color:var(--brand-border)] bg-[color:var(--paper-2)] pb-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        <div className="bg-brand-gradient m-3 overflow-hidden rounded-2xl p-4 text-white shadow-[var(--shadow-card)]">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-white/70">UAQ Deals</p>
          <p className="font-display mt-0.5 text-[20px] font-semibold leading-tight">{category.name}</p>
          <p className="mt-1 text-[12px] leading-snug text-white/80">{subtitle}</p>
        </div>
        {/* Subcategory accordions */}
        {sections.map((sec) => {
          if (sec.children.length === 0) {
            return (
              <Link
                key={sec.id}
                href={"/shop/" + sec.id}
                className="flex items-center justify-between border-b border-[color:var(--brand-border)] px-4 py-3.5 transition-colors hover:bg-[color:var(--paper-2)]/50"
              >
                <span className="text-[14px] font-bold text-[color:var(--ink)]">{sec.name}</span>
                <ChevronDown className="h-4 w-4 -rotate-90 text-neutral-400 rtl:rotate-90" />
              </Link>
            );
          }
          const isOpen = !!open[sec.id];
          return (
            <div key={sec.id} className="border-b border-[color:var(--brand-border)]">
              <button
                onClick={() => toggle(sec.id)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-start"
              >
                <span className="text-[14px] font-bold text-[color:var(--ink)]">{sec.name}</span>
                <ChevronDown className={"h-4 w-4 text-[color:var(--brand-maroon)] transition-transform " + (isOpen ? "rotate-180" : "")} />
              </button>
              {isOpen && (
                <div className="grid grid-cols-3 gap-2.5 px-3 pb-4">
                  {sec.children.map((g) => {
                    const icon = iconFor(g.name);
                    return (
                      <Link key={g.id} href={"/shop/" + g.id} className="group flex flex-col items-center gap-1.5">
                        <span className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--paper-2)] shadow-[var(--shadow-sm)] transition group-hover:-translate-y-0.5 group-hover:border-[color:var(--brand-gold)]">
                          {g.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={g.image} alt={g.name} className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110" />
                          ) : icon.kind === "emoji" ? (
                            <span className="text-2xl transition-transform group-hover:scale-110">{icon.value}</span>
                          ) : (
                            <span className="text-brand-gradient text-lg font-extrabold">{icon.value}</span>
                          )}
                        </span>
                        <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-neutral-700 transition-colors group-hover:text-[color:var(--brand-maroon)]">
                          {g.name}
                        </span>
                      </Link>
                    );
                  })}
                  <Link
                    href={"/shop/" + sec.id}
                    className="flex items-center justify-center rounded-2xl border border-dashed border-[color:var(--brand-gold)]/50 bg-[color:var(--paper-2)]/40 p-2 text-center transition hover:bg-[color:var(--paper-2)]"
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
