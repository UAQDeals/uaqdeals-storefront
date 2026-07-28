"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Reveal } from "@/components/reveal";

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
          <p className="text-sm text-[color:var(--brand-muted)]">
            {isRTL
              ? `${filtered.length} إعلان في ${catLabel(selectedCat)}`
              : `${filtered.length} listing${filtered.length === 1 ? "" : "s"} in ${selectedCat}`}
          </p>
        </div>
        <Link
          href={`/marketplace/${vertical}/sell`}
          className="bg-brand-gradient whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110"
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
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 " +
              (selectedCat === c
                ? "bg-brand-gradient text-white shadow-[var(--shadow-card)]"
                : "border border-[color:var(--brand-border)] bg-white text-neutral-700 hover:-translate-y-0.5 hover:border-[color:var(--brand-gold)] hover:text-[color:var(--brand-maroon)]")
            }
          >
            {catLabel(c)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="premium-card flex flex-col items-center gap-3 p-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-3xl">{emoji}</span>
          <p className="font-display text-[17px] text-[color:var(--ink)]">{isRTL ? `لا توجد إعلانات في ${catLabel(selectedCat)} حالياً. تحقق مرة أخرى قريباً.` : `No listings in ${selectedCat} right now. Check back soon.`}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r, i) => {
            const img = Array.isArray(r.images) && r.images.length > 0 ? r.images[0] : null;
            const detail = detailFor(vertical, r, isRTL);
            return (
              <Reveal key={r.id} delay={(i % 3) * 70}>
                <Link
                  href={`/marketplace/${vertical}/${r.id}`}
                  className="premium-card group block h-full overflow-hidden"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[color:var(--paper-2)]">
                    {img ? (
                      <img src={img} alt={r.title} className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl text-neutral-300">{emoji}</div>
                    )}
                    {r.status === "sold" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="bg-brand-gradient rounded-full px-4 py-1.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-lg">{isRTL ? "تم البيع" : "Sold"}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="truncate text-sm font-bold text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--brand-maroon)]">{r.title}</p>
                    {detail && <p className="mt-0.5 truncate text-xs text-[color:var(--brand-muted)]">{detail}</p>}
                    <span className="gold-rule my-2.5 block" />
                    <div className="flex items-center justify-between">
                      <span className="text-base font-extrabold text-[color:var(--brand-maroon)]">
                        {r.price ? `${isRTL ? "درهم" : "AED"} ${Number(r.price).toLocaleString()}` : (isRTL ? "السعر عند الطلب" : "Ask price")}
                      </span>
                      {r.emirate && <span className="text-[11px] text-neutral-400">{r.emirate}</span>}
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
