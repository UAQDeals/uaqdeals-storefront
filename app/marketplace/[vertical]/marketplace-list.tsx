"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";

type Listing = Record<string, any>;

const CAT_AR: Record<string, string> = {
  "Used Cars for Sale": "سيارات مستعملة للبيع",
  "New Cars for Sale": "سيارات جديدة للبيع",
  "Export Cars for Sale": "سيارات للتصدير",
  "Rental Cars": "سيارات للإيجار",
  "Motorcycles for Sale": "دراجات نارية للبيع",
  "Property for Sale": "عقارات للبيع",
  "Property for Rent": "عقارات للإيجار",
  "Mobile Numbers": "أرقام الهواتف",
  "Vehicle Plates": "لوحات المركبات",
};

function detailFor(vertical: string, r: Listing, isRTL: boolean): string {
  if (vertical === "automotive") return [r.year, r.make, r.model].filter(Boolean).join(" ") || r.category || "";
  if (vertical === "real_estate") {
    return [
      r.bedrooms ? `${r.bedrooms} ${isRTL ? "غرفة" : "BR"}` : null,
      r.bathrooms ? `${r.bathrooms} ${isRTL ? "حمام" : "Bath"}` : null,
      r.area_sqft ? `${r.area_sqft} ${isRTL ? "قدم²" : "sqft"}` : null,
    ].filter(Boolean).join(" · ") || r.type || "";
  }
  if (vertical === "used_items") return [r.condition, r.category].filter(Boolean).join(" · ");
  if (vertical === "fancy_numbers") return [r.number_value, r.plate_code, r.carrier].filter(Boolean).join(" · ");
  return "";
}

export function MarketplaceList({
  vertical,
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
  const isRTL = useLocale() === "ar";
  const catLabel = (c: string) => (isRTL ? CAT_AR[c] ?? c : c);
  const [selectedCat, setSelectedCat] = useState<string>(categories[0] ?? "");

  // Real estate stores its category in `listing_type` ("For Sale"/"For Rent"),
  // while the tabs read "Property for Sale"/"Property for Rent". Map it.
  function catOf(l: Listing): string {
    if (vertical === "real_estate") {
      const lt = (l.listing_type ?? "").toLowerCase();
      if (lt.includes("rent")) return "Property for Rent";
      if (lt.includes("sale")) return "Property for Sale";
      return l.category ?? "";
    }
    return l.category ?? "";
  }

  const filtered = useMemo(
    () => listings.filter((l) => catOf(l) === selectedCat),
    [listings, selectedCat]
  );

  const ctaLabel: Record<string, string> = isRTL
    ? {
        used_items: "بيع منتج",
        automotive: "إضافة مركبة",
        real_estate: "إضافة عقار",
        fancy_numbers: "إدراج رقم",
      }
    : {
        used_items: "Sell Item",
        automotive: "Submit Vehicle",
        real_estate: "Submit Property",
        fancy_numbers: "List Number",
      };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* hero-stripped */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm text-neutral-500">
            {isRTL
              ? `${filtered.length} إعلان في ${catLabel(selectedCat)}`
              : `${filtered.length} listing${filtered.length === 1 ? "" : "s"} in ${selectedCat}`}
          </p>
        </div>
        <Link
          href={`/marketplace/${vertical}/sell`}
          className="rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] px-4 py-2.5 text-sm font-bold text-white whitespace-nowrap"
        >
          + {ctaLabel[vertical] ?? (isRTL ? "إدراج" : "List")}
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
            {catLabel(c)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-16 text-center">
          <p className="text-sm text-neutral-500">{isRTL ? `لا توجد إعلانات في ${catLabel(selectedCat)} حالياً. تحقق مرة أخرى قريباً.` : `No listings in ${selectedCat} right now. Check back soon.`}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => {
            const img = Array.isArray(r.images) && r.images.length > 0 ? r.images[0] : null;
            const detail = detailFor(vertical, r, isRTL);
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
                      <span className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-lg">{isRTL ? "تم البيع" : "Sold"}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="truncate text-sm font-bold text-neutral-900">{r.title}</p>
                  {detail && <p className="mt-0.5 truncate text-xs text-neutral-500">{detail}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-base font-extrabold text-[#8E1B3A]">
                      {r.price ? `${isRTL ? "درهم" : "AED"} ${Number(r.price).toLocaleString()}` : (isRTL ? "السعر عند الطلب" : "Ask price")}
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
