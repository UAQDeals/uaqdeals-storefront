import Link from "next/link";
import { Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aed } from "@/lib/format";

export const metadata = { title: "Deals" };
export const revalidate = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function DealsPage() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const { data } = await supabase
    .from("deals")
    .select(
      "id, title, deal_price, original_price, discount_pct, deal_image_url, products(thumbnail_url)"
    )
    .eq("status", "active")
    .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  const deals = (data ?? []) as Row[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Today&apos;s Deals
        </h1>
        <p className="text-sm text-neutral-600">
          {deals.length === 0
            ? "No active deals right now."
            : `${deals.length} live deal${deals.length === 1 ? "" : "s"}.`}
        </p>
      </div>

      {deals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--brand-border)] bg-white p-10 text-center">
          <p className="text-base font-semibold text-neutral-800">
            No deals at the moment
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Check back soon — new deals drop every day.
          </p>
          <Link
            href="/categories"
            className="bg-brand-gradient mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          >
            Browse categories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {deals.map((d) => {
            const img = d.deal_image_url || d.products?.thumbnail_url || null;
            const pct = Number(d.discount_pct ?? 0);
            return (
              <Link
                key={d.id}
                href={`/deals/${d.id}`}
                className="group overflow-hidden rounded-2xl border border-[color:var(--brand-border)] bg-white"
              >
                <div className="relative aspect-square bg-neutral-100">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={d.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-300">
                      <Tag className="h-10 w-10" />
                    </div>
                  )}
                  {pct > 0 && (
                    <span className="bg-brand-gradient absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-bold text-white">
                      -{Math.round(pct)}%
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-neutral-900">
                    {d.title}
                  </p>
                  <div className="mt-1.5 flex items-end gap-2">
                    <span className="text-base font-bold text-[color:var(--brand-maroon)]">
                      {aed(d.deal_price)}
                    </span>
                    {d.original_price &&
                      Number(d.original_price) > Number(d.deal_price ?? 0) && (
                        <span className="text-xs text-neutral-500 line-through">
                          {aed(d.original_price)}
                        </span>
                      )}
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
