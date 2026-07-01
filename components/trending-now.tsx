import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TrendingUp } from "lucide-react";

// Fetches trending_products joined to catalog_products.
// Catalog items have no vendor price — we show the Icecat category instead.
// Clicking a card goes to the search results for that product name.

type TrendingItem = {
  rank: number;
  search_term: string;
  catalog: {
    id: string;
    title: string;
    brand: string | null;
    main_image_url: string | null;
    icecat_category: string | null;
  };
};

export async function TrendingNow() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("trending_products")
    .select(`
      rank,
      search_term,
      catalog:catalog_id (
        id,
        title,
        brand,
        main_image_url,
        icecat_category
      )
    `)
    .order("rank", { ascending: true })
    .limit(20);

  const items = ((data ?? []) as unknown as TrendingItem[]).filter(
    (d) => d.catalog?.title
  );

  if (!items.length) return null;

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-[color:var(--brand-maroon)]" />
        <h2 className="text-base font-bold text-neutral-900">Trending Now</h2>
        <span className="text-xs text-neutral-400">in UAQ</span>
      </div>

      {/* Horizontal scroll container */}
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item) => (
          <TrendingCard key={item.catalog.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function TrendingCard({ item }: { item: TrendingItem }) {
  const { catalog, search_term } = item;
  // Link to products filtered by brand name
  const href = catalog.brand
    ? `/search?q=${encodeURIComponent(catalog.brand)}`
    : `/shop/electronics`;

  return (
    <Link
      href={href}
      className="group flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:border-[color:var(--brand-maroon)] hover:shadow-sm sm:w-40"
    >
      {/* Image */}
      <div className="relative flex h-32 w-full items-center justify-center overflow-hidden bg-neutral-50 sm:h-36">
        {catalog.main_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={catalog.main_image_url}
            alt={catalog.title}
            className="h-full w-full object-contain p-2 transition group-hover:scale-105"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-neutral-200" />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        {catalog.brand && (
          <p className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--brand-maroon)]">
            {catalog.brand}
          </p>
        )}
        <p className="line-clamp-2 text-xs font-semibold leading-tight text-neutral-800">
          {catalog.title}
        </p>
        {catalog.icecat_category && (
          <p className="mt-auto text-[10px] text-neutral-400 line-clamp-1">
            {catalog.icecat_category}
          </p>
        )}
      </div>
    </Link>
  );
}
