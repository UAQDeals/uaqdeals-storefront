import Link from "next/link";
import { Search, Tag, ShoppingBag, Handshake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aed } from "@/lib/format";
import { SearchInput } from "@/components/search-input";

export const revalidate = 0;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q} — UAQ Deals` : "Search — UAQ Deals" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();

  let products: Row[] = [];
  let deals: Row[] = [];
  let listings: Row[] = [];

  if (query.length >= 2) {
    const [pr, dr, lr] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, price, sale_price, thumbnail_url, images")
        .eq("status", "active")
        .ilike("name", `%${query}%`)
        .limit(12),

      supabase
        .from("deals")
        .select("id, title, deal_price, original_price, discount_pct, deal_image_url, products(thumbnail_url)")
        .eq("status", "active")
        .ilike("title", `%${query}%`)
        .limit(8),

      supabase
        .from("listings")
        .select("id, name, price, images, vendor_types(name, slug)")
        .eq("status", "active")
        .ilike("name", `%${query}%`)
        .limit(8),
    ]);

    products = pr.data ?? [];
    deals    = dr.data ?? [];
    listings = lr.data ?? [];
  }

  const total = products.length + deals.length + listings.length;
  const hasQuery = query.length >= 2;

  return (
    <div className="min-h-screen bg-white">
      {/* Search bar header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-6">
          <SearchInput initialValue={query} />
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-8">

        {/* Empty / no query state */}
        {!hasQuery && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="w-12 h-12 text-neutral-200 mb-4" />
            <p className="text-[15px] font-semibold text-neutral-500">Search for products, deals and services</p>
            <p className="text-[13px] text-neutral-400 mt-1">Try "groceries", "pharmacy", "mobile repair"…</p>
          </div>
        )}

        {/* No results */}
        {hasQuery && total === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="w-12 h-12 text-neutral-200 mb-4" />
            <p className="text-[15px] font-semibold text-neutral-700">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-[13px] text-neutral-400 mt-1">Try a different search term or browse categories</p>
            <Link href="/categories" className="mt-6 inline-block bg-neutral-900 text-white text-[13px] font-bold px-6 py-3 hover:bg-neutral-700 transition-colors">
              Browse all categories
            </Link>
          </div>
        )}

        {/* Results */}
        {hasQuery && total > 0 && (
          <div className="space-y-12">
            <p className="text-[13px] text-neutral-500">
              <span className="font-bold text-neutral-900">{total}</span> results for &ldquo;{query}&rdquo;
            </p>

            {/* Products */}
            {products.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-[color:var(--brand-maroon)] mb-1">Products</p>
                    <h2 className="text-[20px] font-extrabold tracking-tight text-neutral-900">
                      {products.length} product{products.length !== 1 ? "s" : ""} found
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {products.map((p: Row) => {
                    const img = p.thumbnail_url || (Array.isArray(p.images) && p.images.length ? p.images[0] : null);
                    const hasSale = p.sale_price && p.price && Number(p.sale_price) < Number(p.price);
                    const display = hasSale ? p.sale_price : p.price;
                    return (
                      <Link key={p.id} href={`/products/${p.id}`} className="group">
                        <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-8 w-8" /></div>
                          )}
                          {hasSale && (
                            <span className="absolute top-2 start-2 bg-[#c72931] text-white text-[9px] font-black tracking-widest px-2 py-1">
                              -{Math.round(((Number(p.price) - Number(p.sale_price)) / Number(p.price)) * 100)}%
                            </span>
                          )}
                        </div>
                        <div className="pt-2">
                          <p className="text-[12px] text-neutral-700 line-clamp-2 leading-snug">{p.name}</p>
                          <div className="mt-1 flex items-baseline gap-1.5">
                            <span className="text-[13px] font-bold text-neutral-900">{aed(display)}</span>
                            {hasSale && <span className="text-[11px] text-neutral-400 line-through">{aed(p.price)}</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Deals */}
            {deals.length > 0 && (
              <section>
                <div className="mb-5">
                  <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-[color:var(--brand-maroon)] mb-1">Deals</p>
                  <h2 className="text-[20px] font-extrabold tracking-tight text-neutral-900">
                    {deals.length} deal{deals.length !== 1 ? "s" : ""} found
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {deals.map((d: Row) => {
                    const img = d.deal_image_url || d.products?.thumbnail_url;
                    const pct = d.discount_pct ?? 0;
                    return (
                      <Link key={d.id} href={`/deals/${d.id}`} className="group">
                        <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={d.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-300"><Tag className="h-8 w-8" /></div>
                          )}
                          {pct > 0 && (
                            <span className="absolute top-2 start-2 bg-[#c72931] text-white text-[9px] font-black tracking-widest px-2 py-1">
                              -{Math.round(pct)}%
                            </span>
                          )}
                        </div>
                        <div className="pt-2">
                          <p className="text-[12px] text-neutral-700 line-clamp-2 leading-snug">{d.title}</p>
                          <div className="mt-1 flex items-baseline gap-1.5">
                            <span className="text-[13px] font-bold text-neutral-900">{aed(d.deal_price)}</span>
                            {d.original_price && <span className="text-[11px] text-neutral-400 line-through">{aed(d.original_price)}</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Listings / Services */}
            {listings.length > 0 && (
              <section>
                <div className="mb-5">
                  <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-[color:var(--brand-maroon)] mb-1">Services & Listings</p>
                  <h2 className="text-[20px] font-extrabold tracking-tight text-neutral-900">
                    {listings.length} listing{listings.length !== 1 ? "s" : ""} found
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {listings.map((l: Row) => {
                    const imgs = l.images;
                    const img = Array.isArray(imgs) && imgs.length ? (imgs[0] as any)?.src ?? imgs[0] : null;
                    const typeName = l.vendor_types?.name ?? "Service";
                    const typeSlug = l.vendor_types?.slug;
                    return (
                      <Link
                        key={l.id}
                        href={typeSlug ? `/categories/${typeSlug}` : "/services"}
                        className="group flex items-center gap-3 border border-neutral-100 p-3 hover:border-neutral-300 transition-colors"
                      >
                        <div className="w-16 h-16 shrink-0 bg-neutral-100 overflow-hidden">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={l.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-300"><Handshake className="h-6 w-6" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--brand-maroon)]">{typeName}</p>
                          <p className="text-[13px] font-semibold text-neutral-800 line-clamp-1 mt-0.5">{l.name}</p>
                          {l.price && <p className="text-[12px] text-neutral-500 mt-0.5">{aed(l.price)}</p>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
