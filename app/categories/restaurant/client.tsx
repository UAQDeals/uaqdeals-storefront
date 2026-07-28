"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Star, MapPin, Clock, ChevronRight, UtensilsCrossed, Bike, X } from "lucide-react";
import { Reveal } from "@/components/reveal";

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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = vendors.filter((v) => v.is_delivery);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((v) => v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q));
    }
    if (filter === "top_rated") list = list.filter((v) => v.rating >= 4.0);
    if (filter === "featured") list = list.filter((v) => v.is_featured);
    if (filter === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [vendors, search, filter]);

  const filters = [
    { key: "top_rated", label: "Rating 4.5+", icon: Star },
    { key: "featured",  label: "Featured",    icon: Star },
    { key: "az",        label: "A – Z",       icon: null },
  ];

  return (
    <div className="min-h-screen bg-[color:var(--paper)]">

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 border-b border-[color:var(--brand-border)] bg-white/80 backdrop-blur-md shadow-[var(--shadow-sm)]">
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-0">
          {/* Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-xl shadow-[var(--shadow-card)]">
              🍕
            </div>
            <div>
              <h1 className="font-display text-[20px] font-semibold text-[color:var(--ink)] leading-tight">UAQ Food</h1>
              <p className="text-[11px] text-[color:var(--brand-muted)]">Order from top restaurants in UAQ</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for dishes or restaurants..."
              className="w-full h-11 rounded-full border border-[color:var(--brand-border)] bg-white ps-10 pe-9 text-sm text-[color:var(--ink)] placeholder:text-neutral-400 outline-none transition focus:border-[color:var(--brand-maroon)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/40"
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
                className={"inline-flex items-center gap-1.5 shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition " +
                  (filter === f.key
                    ? "bg-brand-gradient border-transparent text-white shadow-[var(--shadow-card)]"
                    : "border-[color:var(--brand-border)] bg-white text-neutral-600 hover:border-[color:var(--brand-gold)] hover:text-[color:var(--brand-maroon)]")}>
                {f.key === "top_rated" && <Star className="h-3 w-3" />}
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Restaurant list ── */}
      <div className="mx-auto max-w-3xl px-4 py-5 space-y-5">
        {filtered.length === 0 ? (
          <div className="premium-card py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)]">
              <UtensilsCrossed className="h-8 w-8 text-[color:var(--brand-maroon)]" />
            </div>
            <p className="font-display text-[15px] text-[color:var(--brand-muted)]">
              {search ? `No results for "${search}"` : "No restaurants available for delivery"}
            </p>
          </div>
        ) : (
          filtered.map((v, i) => (
            <Reveal key={v.id} delay={Math.min(i, 8) * 45}>
            <Link href={`/vendors/${v.id}`}
              className="group premium-card block overflow-hidden">

              {/* Hero image */}
              <div className="relative h-[180px] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.logo_url ?? v.hero_url} alt={v.name}
                  className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {/* Bookmark */}
                <button className="absolute top-3 end-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur transition hover:bg-white">
                  <Star className="h-4 w-4 text-neutral-400" />
                </button>
                {/* Delivery time */}
                <div className="absolute bottom-3 start-3 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-neutral-800 shadow-sm">
                  <Clock className="h-3 w-3" /> 25-35 min
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-[18px] font-semibold text-[color:var(--ink)] leading-tight">{v.name}</h3>
                  <RatingBadge rating={v.rating} />
                </div>
                {v.description && (
                  <p className="mt-1 text-[12px] text-[color:var(--brand-muted)] line-clamp-1">{v.description}</p>
                )}
                <div className="mt-2.5 flex items-center gap-3 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {v.emirate}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-neutral-300" />
                  <span className="flex items-center gap-1">
                    <Bike className="h-3 w-3" /> Delivery
                  </span>
                  <span className="h-1 w-1 rounded-full bg-neutral-300" />
                  <span className="font-semibold text-neutral-500">AED 30 for two</span>
                  <ChevronRight className="h-3.5 w-3.5 ms-auto text-neutral-300 rtl:rotate-180" />
                </div>
              </div>
            </Link>
            </Reveal>
          ))
        )}
      </div>
    </div>
  );
}
