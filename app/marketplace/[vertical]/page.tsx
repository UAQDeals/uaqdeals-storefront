import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const VERTICALS: Record<string, {
  table: string;
  title: string;
  emoji: string;
  detail: (r: any) => string;
}> = {
  automotive: {
    table: "automotive_listings",
    title: "Automotive",
    emoji: "🚗",
    detail: (r) => [r.year, r.make, r.model].filter(Boolean).join(" ") || r.category || "",
  },
  real_estate: {
    table: "real_estate_listings",
    title: "Real Estate",
    emoji: "🏠",
    detail: (r) => [
      r.bedrooms ? `${r.bedrooms} BR` : null,
      r.bathrooms ? `${r.bathrooms} Bath` : null,
      r.area_sqft ? `${r.area_sqft} sqft` : null,
    ].filter(Boolean).join(" · ") || r.type || "",
  },
  used_items: {
    table: "used_item_listings",
    title: "Used Items",
    emoji: "📦",
    detail: (r) => [r.condition, r.category].filter(Boolean).join(" · "),
  },
  fancy_numbers: {
    table: "fancy_numbers_listings",
    title: "Fancy Numbers",
    emoji: "💎",
    detail: (r) => [r.number_value, r.plate_code, r.carrier].filter(Boolean).join(" · "),
  },
};

export async function generateMetadata({ params }: { params: Promise<{ vertical: string }> }) {
  const { vertical } = await params;
  const cfg = VERTICALS[vertical];
  return { title: cfg ? `${cfg.title} — UAQ Deals` : "Marketplace — UAQ Deals" };
}

export default async function MarketplacePage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  const cfg = VERTICALS[vertical];
  if (!cfg) notFound();

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from(cfg.table)
    .select("*")
    .eq("status", "active")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const items = listings ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl">{cfg.emoji}</span>
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">{cfg.title}</h1>
          <p className="text-sm text-neutral-500">{items.length} listing{items.length === 1 ? "" : "s"} in Umm Al Quwain</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-16 text-center">
          <p className="text-sm text-neutral-500">No listings available right now. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => {
            const img = Array.isArray(r.images) && r.images.length > 0 ? r.images[0] : null;
            const detail = cfg.detail(r);
            return (
              <Link
                key={r.id}
                href={`/marketplace/${vertical}/${r.id}`}
                className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                  {img ? (
                    <img src={img} alt={r.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">{cfg.emoji}</div>
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
