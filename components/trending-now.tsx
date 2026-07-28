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
    <section className="mt-10">
      <div className="mb-5 flex items-center gap-3.5">
        <span className="accent-bar h-9 w-1.5 rounded-full" />
        <div>
          <p className="eyebrow flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            in UAQ
          </p>
          <h2 className="font-display mt-0.5 text-[24px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[28px]">
            Trending Now
          </h2>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        className="flex gap-4 overflow-x-auto pb-3"
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
      className="group premium-card flex w-40 shrink-0 flex-col overflow-hidden sm:w-44"
    >
      {/* Image */}
      <div className="relative flex h-32 w-full items-center justify-center overflow-hidden bg-[color:var(--paper-2)] sm:h-36">
        {catalog.main_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={catalog.main_image_url}
            alt={catalog.title}
            className="h-full w-full object-contain p-2 transition-transform duration-[600ms] ease-out group-hover:scale-110"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-neutral-200" />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        {catalog.brand && (
          <p className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--brand-maroon)]">
            {catalog.brand}
          </p>
        )}
        <p className="line-clamp-2 text-xs font-semibold leading-tight text-neutral-800">
          {catalog.title}
        </p>
        {catalog.icecat_category && (
          <p className="mt-auto text-[10px] text-[color:var(--brand-muted)] line-clamp-1">
            {catalog.icecat_category}
          </p>
        )}
      </div>
    </Link>
  );
}
