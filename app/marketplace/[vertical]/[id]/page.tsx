import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href={`/marketplace/${vertical}`} className="text-sm text-neutral-500 hover:text-[#8E1B3A]">
        ← Back to {cfg.title}
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-100">
            {images[0] ? (
              <img src={images[0]} alt={r.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">📷</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((img, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {r.status === "sold" && (
            <div className="mb-3 rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-extrabold uppercase tracking-wider text-white">
              ⓘ This item has been sold
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-neutral-900">{r.title}</h1>
          <p className="mt-1 text-2xl font-extrabold text-[#8E1B3A]">
            {r.price ? `AED ${Number(r.price).toLocaleString()}` : "Ask for price"}
            {r.is_negotiable ? <span className="ml-2 text-xs font-medium text-neutral-400">Negotiable</span> : null}
          </p>
          {r.emirate && <p className="mt-1 text-sm text-neutral-500">📍 {r.emirate}{r.location ? ` · ${r.location}` : ""}</p>}

          {specs.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-neutral-200 bg-white p-4">
              {specs.map(([label, key]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-neutral-400">{label}</span>
                  <span className="font-semibold text-neutral-800">{String(r[key])}</span>
                </div>
              ))}
            </div>
          )}

          {r.description && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Description</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">{r.description}</p>
            </div>
          )}

          <div className="mt-6">
            <ContactButtons vertical={vertical} listingId={r.id} listingTitle={r.title} isSold={r.status === "sold"} />
          </div>
        </div>
      </div>
    </div>
  );
}
