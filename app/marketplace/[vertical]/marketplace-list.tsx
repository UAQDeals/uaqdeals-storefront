"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Listing = Record<string, any>;

function detailFor(vertical: string, r: Listing): string {
  if (vertical === "automotive") return [r.year, r.make, r.model].filter(Boolean).join(" ") || r.category || "";
  if (vertical === "real_estate") {
    return [
      r.bedrooms ? `${r.bedrooms} BR` : null,
      r.bathrooms ? `${r.bathrooms} Bath` : null,
      r.area_sqft ? `${r.area_sqft} sqft` : null,
    ].filter(Boolean).join(" · ") || r.type || "";
  }
  if (vertical === "used_items") return [r.condition, r.category].filter(Boolean).join(" · ");
  if (vertical === "fancy_numbers") return [r.number_value, r.plate_code, r.carrier].filter(Boolean).join(" · ");
  return "";
}

export function MarketplaceList({
  vertical,
  title,
  emoji,
  categories,
  listings,
}: {
  vertical: string;
  title: string;
  emoji: string;
  categories: string[];
  listings: Listing[];
}) {
  const [selectedCat, setSelectedCat] = useState<string>(categories[0] ?? "");

  const filtered = useMemo(
    () => listings.filter((l) => (l.category ?? "") === selectedCat),
    [listings, selectedCat]
  );

  const ctaLabel: Record<string, string> = {
    used_items: "Sell Item",
    automotive: "Submit Vehicle",
    real_estate: "Submit Property",
    fancy_numbers: "List Number",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-neutral-900">{title}</h1>
          <p className="text-sm text-neutral-500">
            {filtered.length} listing{filtered.length === 1 ? "" : "s"} in {selectedCat}
          </p>
        </div>
        <Link
          href={`/marketplace/${vertical}/sell`}
          className="rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] px-4 py-2.5 text-sm font-bold text-white whitespace-nowrap"
        >
          + {ctaLabel[vertical] ?? "List"}
        </Link>
      </div>

      {/* Category chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCat(c)}
            className={
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors " +
              (selectedCat === c
                ? "bg-gradient-to-r from-[#8E1B3A] to-[#C72931] text-white"
                : "border border-neutral-300 bg-white text-neutral-700 hover:border-[#8E1B3A]/40")
            }
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-16 text-center">
          <p className="text-sm text-neutral-500">No listings in {selectedCat} right now. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => {
            const img = Array.isArray(r.images) && r.images.length > 0 ? r.images[0] : null;
            const detail = detailFor(vertical, r);
            return (
              <Link
                key={r.id}
                href={`/marketplace/${vertical}/${r.id}`}
                className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                  {img ? (
                    <img src={img} alt={r.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">{emoji}</div>
                  )}
                  {r.status === "sold" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-lg">Sold</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="truncate text-sm font-bold text-neutral-900">{r.title}</p>
                  {detail && <p className="mt-0.5 truncate text-xs text-neutral-500">{detail}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-base font-extrabold text-[#8E1B3A]">
                      {r.price ? `AED ${Number(r.price).toLocaleString()}` : "Ask price"}
                    </span>
                    {r.emirate && <span className="text-[11px] text-neutral-400">{r.emirate}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
