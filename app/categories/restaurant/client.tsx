"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Star, MapPin, Clock, ChevronRight, UtensilsCrossed, Bike, X } from "lucide-react";

type Vendor = {
  id: string; name: string; description: string;
  logo_url: string | null; hero_url: string;
  rating: number; review_count: number; is_featured: boolean;
  emirate: string; is_dine_in: boolean; is_delivery: boolean;
};

function RatingBadge({ rating }: { rating: number }) {
  const bg = rating >= 4.0 ? "bg-green-700" : rating >= 3.0 ? "bg-orange-600" : "bg-red-700";
  return (
    <span className={"inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px] font-bold text-white " + bg}>
      {rating.toFixed(1)} <Star className="h-2.5 w-2.5 fill-white" />
    </span>
  );
}

export function RestaurantClient({ vendors }: { vendors: Vendor[] }) {
  const [tab, setTab] = useState<"delivery" | "dine_in">("delivery");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = vendors.filter((v) => tab === "delivery" ? v.is_delivery : v.is_dine_in);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((v) => v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q));
    }
    if (filter === "top_rated") list = list.filter((v) => v.rating >= 4.0);
    if (filter === "featured") list = list.filter((v) => v.is_featured);
    if (filter === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [vendors, tab, search, filter]);

  const filters = [
    { key: "top_rated", label: "Rating 4.5+", icon: Star },
    { key: "featured",  label: "Featured",    icon: Star },
    { key: "az",        label: "A – Z",       icon: null },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 shadow-sm">
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-0">
          {/* Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
              style={{ background: "linear-gradient(135deg, #8E1B3A, #C72931)" }}>
              🍕
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-neutral-900 leading-tight">UAQ Food</h1>
              <p className="text-[11px] text-neutral-500">Order from top restaurants in UAQ</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for dishes or restaurants..."
              className="w-full h-10 rounded-xl bg-neutral-100 ps-9 pe-9 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-[color:var(--brand-maroon)]/20"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute end-3 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-neutral-400" />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none]">
            {filters.map((f) => (
              <button key={f.key}
                onClick={() => setFilter(filter === f.key ? null : f.key)}
                className={"inline-flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors " +
                  (filter === f.key
                    ? "border-[color:var(--brand-maroon)] bg-[color:var(--brand-maroon)] text-white"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300")}>
                {f.key === "top_rated" && <Star className="h-3 w-3" />}
                {f.label}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-neutral-100">
            {[
              { key: "delivery", label: "Delivery", icon: Bike },
              { key: "dine_in",  label: "Dining Out", icon: UtensilsCrossed },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key}
                onClick={() => setTab(key as "delivery" | "dine_in")}
                className={"flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold border-b-2 transition-colors " +
                  (tab === key
                    ? "border-[color:var(--brand-maroon)] text-[color:var(--brand-maroon)]"
                    : "border-transparent text-neutral-500 hover:text-neutral-700")}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Restaurant list ── */}
      <div className="mx-auto max-w-3xl px-4 py-5 space-y-5">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 text-neutral-200" />
            <p className="text-neutral-500 text-sm">
              {search ? `No results for "${search}"` : tab === "delivery" ? "No restaurants available for delivery" : "No dine-in restaurants available"}
            </p>
          </div>
        ) : (
          filtered.map((v) => (
            <Link key={v.id} href={`/vendors/${v.id}`}
              className="group block rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-neutral-100">

              {/* Hero image */}
              <div className="relative h-[180px] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.logo_url ?? v.hero_url} alt={v.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {/* Bookmark */}
                <button className="absolute top-3 end-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90">
                  <Star className="h-4 w-4 text-neutral-400" />
                </button>
                {/* Delivery time */}
                {tab === "delivery" && (
                  <div className="absolute bottom-3 start-3 flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-bold text-neutral-800">
                    <Clock className="h-3 w-3" /> 25-35 min
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[17px] font-extrabold text-neutral-900 leading-tight">{v.name}</h3>
                  <RatingBadge rating={v.rating} />
                </div>
                {v.description && (
                  <p className="mt-1 text-[12px] text-neutral-500 line-clamp-1">{v.description}</p>
                )}
                <div className="mt-2.5 flex items-center gap-3 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {v.emirate}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-neutral-300" />
                  <span className="flex items-center gap-1">
                    {tab === "delivery"
                      ? <><Bike className="h-3 w-3" /> Delivery</>
                      : <><UtensilsCrossed className="h-3 w-3" /> Dine In</>}
                  </span>
                  {tab === "delivery" && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-neutral-300" />
                      <span className="font-semibold text-neutral-500">AED 30 for two</span>
                    </>
                  )}
                  <ChevronRight className="h-3.5 w-3.5 ms-auto text-neutral-300" />
                </div>

                {tab === "dine_in" && (
                  <button className="mt-3 w-full rounded-xl border border-[color:var(--brand-maroon)] py-2 text-sm font-bold text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white transition-colors">
                    Reserve a Table
                  </button>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
