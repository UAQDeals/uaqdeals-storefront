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
    <div className="min-h-screen bg-[color:var(--paper)]">
      {/* Search bar header */}
      <div className="border-b border-[color:var(--brand-border)] bg-white">
        <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-6">
          <SearchInput initialValue={query} />
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-8">

        {/* Empty / no query state */}
        {!hasQuery && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-[color:var(--brand-maroon)]">
              <Search className="h-7 w-7" />
            </span>
            <p className="font-display text-[20px] font-semibold text-[color:var(--ink)]">Search for products, deals and services</p>
            <p className="text-[13px] text-[color:var(--brand-muted)] mt-1.5">Try "groceries", "pharmacy", "mobile repair"…</p>
          </div>
        )}

        {/* No results */}
        {hasQuery && total === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-[color:var(--brand-maroon)]">
              <Search className="h-7 w-7" />
            </span>
            <p className="font-display text-[20px] font-semibold text-[color:var(--ink)]">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-[13px] text-[color:var(--brand-muted)] mt-1.5">Try a different search term or browse categories</p>
            <Link href="/categories" className="bg-brand-gradient mt-6 inline-block rounded-full text-white text-[13px] font-bold px-6 py-3 shadow-[var(--shadow-card)] transition hover:brightness-110">
              Browse all categories
            </Link>
          </div>
        )}

        {/* Results */}
        {hasQuery && total > 0 && (
          <div className="space-y-12">
            <p className="text-[13px] text-[color:var(--brand-muted)]">
              <span className="font-bold text-[color:var(--ink)]">{total}</span> results for &ldquo;{query}&rdquo;
            </p>

            {/* Products */}
            {products.length > 0 && (
              <section>
                <div className="mb-5 flex items-center gap-3.5">
                  <span className="accent-bar h-9 w-1.5 rounded-full" />
                  <div>
                    <p className="eyebrow">Products</p>
                    <h2 className="font-display mt-0.5 text-[22px] font-semibold tracking-tight text-[color:var(--ink)]">
                      {products.length} product{products.length !== 1 ? "s" : ""} found
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                  {products.map((p: Row) => {
                    const img = p.thumbnail_url || (Array.isArray(p.images) && p.images.length ? p.images[0] : null);
                    const hasSale = p.sale_price && p.price && Number(p.sale_price) < Number(p.price);
                    const display = hasSale ? p.sale_price : p.price;
                    return (
                      <Link key={p.id} href={`/products/${p.id}`} className="group premium-card overflow-hidden">
                        <div className="relative aspect-[4/5] bg-[color:var(--paper-2)] overflow-hidden">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={p.name} className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-300"><ShoppingBag className="h-8 w-8" /></div>
                          )}
                          {hasSale && (
                            <span className="bg-brand-gradient absolute top-2.5 start-2.5 rounded-full text-white text-[9.5px] font-black tracking-wider px-2.5 py-1 shadow-sm">
                              -{Math.round(((Number(p.price) - Number(p.sale_price)) / Number(p.price)) * 100)}%
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="min-h-[32px] text-[12.5px] text-neutral-700 line-clamp-2 leading-snug">{p.name}</p>
                          <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-[15px] font-extrabold text-[color:var(--brand-maroon)]">{aed(display)}</span>
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
                <div className="mb-5 flex items-center gap-3.5">
                  <span className="accent-bar h-9 w-1.5 rounded-full" />
                  <div>
                    <p className="eyebrow">Deals</p>
                    <h2 className="font-display mt-0.5 text-[22px] font-semibold tracking-tight text-[color:var(--ink)]">
                      {deals.length} deal{deals.length !== 1 ? "s" : ""} found
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {deals.map((d: Row) => {
                    const img = d.deal_image_url || d.products?.thumbnail_url;
                    const pct = d.discount_pct ?? 0;
                    return (
                      <Link key={d.id} href={`/deals/${d.id}`} className="group premium-card overflow-hidden">
                        <div className="relative aspect-[4/5] bg-[color:var(--paper-2)] overflow-hidden">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={d.title} className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-300"><Tag className="h-8 w-8" /></div>
                          )}
                          {pct > 0 && (
                            <span className="bg-brand-gradient absolute top-2.5 start-2.5 rounded-full text-white text-[9.5px] font-black tracking-wider px-2.5 py-1 shadow-sm">
                              -{Math.round(pct)}%
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="min-h-[32px] text-[12.5px] text-neutral-700 line-clamp-2 leading-snug">{d.title}</p>
                          <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-[15px] font-extrabold text-[color:var(--brand-maroon)]">{aed(d.deal_price)}</span>
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
                <div className="mb-5 flex items-center gap-3.5">
                  <span className="accent-bar h-9 w-1.5 rounded-full" />
                  <div>
                    <p className="eyebrow">Services &amp; Listings</p>
                    <h2 className="font-display mt-0.5 text-[22px] font-semibold tracking-tight text-[color:var(--ink)]">
                      {listings.length} listing{listings.length !== 1 ? "s" : ""} found
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {listings.map((l: Row) => {
                    const imgs = l.images;
                    const img = Array.isArray(imgs) && imgs.length ? (imgs[0] as any)?.src ?? imgs[0] : null;
                    const typeName = l.vendor_types?.name ?? "Service";
                    const typeSlug = l.vendor_types?.slug;
                    return (
                      <Link
                        key={l.id}
                        href={typeSlug ? `/categories/${typeSlug}` : "/services"}
                        className="group premium-card flex items-center gap-3 overflow-hidden p-3"
                      >
                        <div className="w-16 h-16 shrink-0 rounded-xl bg-[color:var(--paper-2)] overflow-hidden">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={l.name} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-300"><Handshake className="h-6 w-6" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--brand-maroon)]">{typeName}</p>
                          <p className="text-[13px] font-semibold text-[color:var(--ink)] line-clamp-1 mt-0.5">{l.name}</p>
                          {l.price && <p className="text-[12px] font-bold text-[color:var(--brand-maroon)] mt-0.5">{aed(l.price)}</p>}
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
