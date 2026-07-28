import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/reveal";
import { ContactButtons } from "./contact-buttons";

export const dynamic = "force-dynamic";

const TABLES: Record<string, { table: string; title: string }> = {
  automotive: { table: "automotive_listings", title: "Automotive" },
  real_estate: { table: "real_estate_listings", title: "Real Estate" },
  used_items: { table: "used_item_listings", title: "Used Items" },
  fancy_numbers: { table: "fancy_numbers_listings", title: "Fancy Numbers" },
};

// Which fields to show as spec rows per vertical
const SPECS: Record<string, [string, string][]> = {
  automotive: [
    ["Make", "make"], ["Model", "model"], ["Year", "year"], ["Mileage", "mileage"],
    ["Transmission", "transmission"], ["Fuel", "fuel_type"], ["Body", "body_type"], ["Color", "color"],
  ],
  real_estate: [
    ["Type", "type"], ["For", "listing_type"], ["Bedrooms", "bedrooms"], ["Bathrooms", "bathrooms"],
    ["Area (sqft)", "area_sqft"], ["Location", "location"],
  ],
  used_items: [
    ["Condition", "condition"], ["Category", "category"],
  ],
  fancy_numbers: [
    ["Number", "number_value"], ["Plate Code", "plate_code"], ["Plate Emirate", "plate_emirate"], ["Carrier", "carrier"],
  ],
};

export default async function MarketplaceDetailPage({
  params,
}: {
  params: Promise<{ vertical: string; id: string }>;
}) {
  const { vertical, id } = await params;
  const cfg = TABLES[vertical];
  if (!cfg) notFound();

  const supabase = await createClient();
  const { data: r } = await supabase
    .from(cfg.table)
    .select("*")
    .eq("id", id)
    .in("status", ["active", "sold"])
    .eq("is_approved", true)
    .maybeSingle();

  if (!r) notFound();

  const images: string[] = Array.isArray(r.images) ? r.images : [];
  const specs = (SPECS[vertical] ?? []).filter(([, key]) => r[key] != null && r[key] !== "");

  return (
    <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12.5px] text-[color:var(--brand-muted)]">
        <Link href={`/marketplace/${vertical}`} className="transition hover:text-[color:var(--brand-maroon)]">
          {cfg.title}
        </Link>
        <span className="opacity-50">/</span>
        <span className="truncate text-[color:var(--ink)]">{r.title}</span>
      </nav>

      <Reveal className="mt-5 grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Gallery */}
        <div>
          <div className="premium-card overflow-hidden rounded-3xl p-0">
            <div className="aspect-[4/3] w-full overflow-hidden bg-[color:var(--paper-2)]">
              {images[0] ? (
                <img src={images[0]} alt={r.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-5xl text-neutral-300">📷</div>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2.5">
              {images.slice(1, 5).map((img, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-xl border border-[color:var(--brand-border)] bg-[color:var(--paper-2)]">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details / buy box */}
        <div className="self-start rounded-3xl border border-[color:var(--brand-border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-7 lg:sticky lg:top-24">
          {r.status === "sold" && (
            <div className="mb-4 rounded-xl bg-[color:var(--brand-maroon)] px-4 py-2.5 text-center text-[12.5px] font-bold uppercase tracking-wider text-white">
              This item has been sold
            </div>
          )}
          <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-[color:var(--ink)] sm:text-[30px]">{r.title}</h1>
          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="text-[26px] font-extrabold text-[color:var(--brand-maroon)]">
              {r.price ? `AED ${Number(r.price).toLocaleString()}` : "Ask for price"}
            </span>
            {r.is_negotiable ? <span className="text-[12px] font-medium text-neutral-400">Negotiable</span> : null}
          </div>
          {r.emirate && (
            <p className="mt-2 text-[13px] text-[color:var(--brand-muted)]">
              <span className="me-1">📍</span>{r.emirate}{r.location ? ` · ${r.location}` : ""}
            </p>
          )}

          {specs.length > 0 && (
            <div className="mt-5 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--paper)] p-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                {specs.map(([label, key]) => (
                  <div key={key} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="text-[color:var(--brand-muted)]">{label}</span>
                    <span className="font-semibold text-[color:var(--ink)]">{String(r[key])}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {r.description && (
            <div className="mt-5">
              <p className="eyebrow">Description</p>
              <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-neutral-700">{r.description}</p>
            </div>
          )}

          <div className="mt-6 border-t border-[color:var(--brand-border)] pt-5">
            <ContactButtons vertical={vertical} listingId={r.id} listingTitle={r.title} isSold={r.status === "sold"} />
          </div>
        </div>
      </Reveal>
    </div>
  );
}
