import Link from "next/link";
import { Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { aed } from "@/lib/format";
import { showProducts } from "@/lib/emirate";
import { ProductsUnavailable } from "@/components/products-unavailable";
import { Reveal } from "@/components/reveal";

export async function generateMetadata() {
  const t = await getTranslations("deals");
  return { title: t("title") };
}
export const revalidate = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export default async function DealsPage() {
  const supabase = await createClient();
  if (!(await showProducts())) return <ProductsUnavailable />;
  const t = await getTranslations("deals");
  const tc = await getTranslations("common");
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
    <div className="mx-auto max-w-[1320px] px-5 py-10 md:px-8 md:py-12">
      <Reveal className="mb-8 border-b border-[color:var(--brand-border)] pb-6">
        <div className="flex items-center gap-3.5">
          <span className="accent-bar h-9 w-1.5 rounded-full" />
          <div>
            <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-[color:var(--ink)] sm:text-[34px]">
              {t("title")}
            </h1>
            <p className="mt-1 text-[13.5px] text-[color:var(--brand-muted)]">
              {t("count", { count: deals.length })}
            </p>
          </div>
        </div>
      </Reveal>

      {deals.length === 0 ? (
        <Reveal className="mx-auto max-w-md py-8 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-[color:var(--brand-maroon)]">
            <Tag className="h-9 w-9" />
          </span>
          <p className="font-display mt-6 text-[22px] font-semibold text-[color:var(--ink)]">
            {t("noDeals")}
          </p>
          <p className="mx-auto mt-2 max-w-xs text-[13.5px] leading-relaxed text-[color:var(--brand-muted)]">
            {t("noDealsDesc")}
          </p>
          <Link
            href="/categories"
            className="bg-brand-gradient mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110"
          >
            {tc("browseCategories")}
          </Link>
        </Reveal>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
          {deals.map((d, i) => {
            const img = d.deal_image_url || d.products?.thumbnail_url || null;
            const pct = Number(d.discount_pct ?? 0);
            return (
              <Reveal key={d.id} delay={Math.min(i, 8) * 45} className="h-full">
                <Link
                  href={`/deals/${d.id}`}
                  className="group premium-card flex h-full flex-col overflow-hidden"
                >
                  <div className="relative aspect-square overflow-hidden bg-[color:var(--paper-2)]">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={d.title}
                        className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-300">
                        <Tag className="h-10 w-10" />
                      </div>
                    )}
                    {pct > 0 && (
                      <span className="bg-brand-gradient absolute start-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-wider text-white shadow-sm">
                        -{Math.round(pct)}%
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <p className="min-h-[36px] text-[12.5px] font-semibold leading-snug text-neutral-800 line-clamp-2">
                      {d.title}
                    </p>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-[15px] font-extrabold text-[color:var(--brand-maroon)]">
                        {aed(d.deal_price)}
                      </span>
                      {d.original_price &&
                        Number(d.original_price) > Number(d.deal_price ?? 0) && (
                          <span className="text-[11px] text-neutral-400 line-through">
                            {aed(d.original_price)}
                          </span>
                        )}
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
