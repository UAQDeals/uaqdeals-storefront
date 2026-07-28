"use client";
import { useState, useCallback, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShoppingBag, SlidersHorizontal, X, Search, ChevronDown } from "lucide-react";
import { QuickAddButton } from "@/components/quick-add-button";
import { Reveal } from "@/components/reveal";
import { aed } from "@/lib/format";
import { rowHasOptions } from "@/lib/variants";

type Product = {
  id: string;
  name: string;
  price: number | null;
  sale_price: number | null;
  thumbnail_url: string | null;
  images: string[] | null;
  condition: string | null;
  track_stock: boolean | null;
  stock_quantity: number | null;
  requires_prescription: boolean | null;
  variants: Array<{ name: string; options: string[] }> | null;
  product_options?: Array<unknown> | null;
};

type Category = { id: string; name: string };

type Props = {
  products: Product[];
  categories: Category[];
  initialQ: string;
  initialCat: string;
  initialCondition: string;
  initialMin: string;
  initialMax: string;
  initialSort: string;
};

const SORTS = [
  { value: "newest",     key: "sortNewest" },
  { value: "price_asc",  key: "sortPriceAsc" },
  { value: "price_desc", key: "sortPriceDesc" },
  { value: "featured",   key: "sortFeatured" },
];

export function ShopClient({
  products, categories,
  initialQ, initialCat, initialCondition, initialMin, initialMax, initialSort,
}: Props) {
  const t        = useTranslations("shop");
  const router   = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [q,         setQ]         = useState(initialQ);
  const [cat,       setCat]       = useState(initialCat);
  const [condition, setCondition] = useState(initialCondition);
  const [min,       setMin]       = useState(initialMin);
  const [max,       setMax]       = useState(initialMax);
  const [sort,      setSort]      = useState(initialSort);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const push = useCallback((overrides: Record<string, string>) => {
    const merged = { q, cat, condition, min, max, sort, ...overrides };
    const p = new URLSearchParams();
    if (merged.q)         p.set("q", merged.q);
    if (merged.cat)       p.set("cat", merged.cat);
    if (merged.condition && merged.condition !== "all") p.set("condition", merged.condition);
    if (merged.min)       p.set("min", merged.min);
    if (merged.max)       p.set("max", merged.max);
    if (merged.sort && merged.sort !== "newest") p.set("sort", merged.sort);
    startTransition(() => router.push(pathname + (p.toString() ? "?" + p.toString() : "")));
  }, [q, cat, condition, min, max, sort, pathname, router]);

  function clearAll() {
    setQ(""); setCat(""); setCondition("all"); setMin(""); setMax(""); setSort("newest");
    startTransition(() => router.push(pathname));
  }

  const hasFilters = !!(q || cat || (condition && condition !== "all") || min || max || sort !== "newest");

  const inputCls = "w-full rounded-xl border border-[color:var(--brand-border)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[color:var(--brand-maroon)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/40";

  const Sidebar = () => (
    <div className="space-y-6 premium-card p-5">
      {/* Clear */}
      {hasFilters && (
        <button onClick={clearAll} className="flex items-center gap-1.5 text-xs font-bold text-[color:var(--brand-maroon)] transition hover:text-[color:var(--brand-maroon-deep)]">
          <X className="w-3.5 h-3.5" /> {t("clearAll")}
        </button>
      )}

      {/* Condition */}
      <div>
        <p className="eyebrow mb-2.5">{t("condition")}</p>
        <div className="space-y-1.5">
          {[["all", t("allItems")], ["new", t("new")], ["used", t("used")]].map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="condition"
                value={val}
                checked={condition === val}
                onChange={() => { setCondition(val); push({ condition: val }); }}
                className="accent-[color:var(--brand-maroon)]"
              />
              <span className="text-sm text-neutral-700">{label}</span>
              {val === "used" && (
                <span className="rounded-full bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] px-2 py-0.5 text-[10px] font-bold text-white">USED</span>
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="gold-rule" />

      {/* Price range */}
      <div>
        <p className="eyebrow mb-2.5">{t("price")}</p>
        <div className="flex items-center gap-2">
          <input
            className={inputCls}
            type="number"
            placeholder={t("min")}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            onBlur={() => push({ min, max })}
          />
          <span className="text-neutral-400 text-sm">–</span>
          <input
            className={inputCls}
            type="number"
            placeholder={t("max")}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            onBlur={() => push({ min, max })}
          />
        </div>
      </div>

      <div className="gold-rule" />

      {/* Categories */}
      <div>
        <p className="eyebrow mb-2.5">{t("category")}</p>
        <div className="max-h-72 overflow-y-auto space-y-1 pe-1 [scrollbar-width:thin]">
          <button
            onClick={() => { setCat(""); push({ cat: "" }); }}
            className={"w-full text-start rounded-full px-3 py-1.5 text-sm transition-colors " + (!cat ? "bg-[color:var(--brand-maroon)]/10 font-semibold text-[color:var(--brand-maroon)]" : "text-neutral-600 hover:bg-[color:var(--paper-2)]")}
          >
            {t("allCategories")}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCat(c.id); push({ cat: c.id }); }}
              className={"w-full text-start rounded-full px-3 py-1.5 text-sm transition-colors " + (cat === c.id ? "bg-[color:var(--brand-maroon)]/10 font-semibold text-[color:var(--brand-maroon)]" : "text-neutral-600 hover:bg-[color:var(--paper-2)]")}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1320px] px-4 md:px-8 py-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            className="w-full rounded-full border border-[color:var(--brand-border)] bg-white ps-10 pe-4 py-2.5 text-sm outline-none transition focus:border-[color:var(--brand-maroon)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/40"
            placeholder={t("searchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") push({ q }); }}
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); push({ sort: e.target.value }); }}
            className="appearance-none rounded-full border border-[color:var(--brand-border)] ps-4 pe-9 py-2.5 text-sm font-semibold outline-none transition hover:border-[color:var(--brand-gold)] focus:border-[color:var(--brand-maroon)] bg-white cursor-pointer"
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{t(s.key)}</option>)}
          </select>
          <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-[color:var(--brand-gold)] lg:hidden"
        >
          <SlidersHorizontal className="w-4 h-4" /> {t("filters")}
          {hasFilters && <span className="w-2 h-2 rounded-full bg-[color:var(--brand-maroon)]" />}
        </button>

        <p className="text-sm text-neutral-500 ms-auto">
          {isPending ? "…" : t("productCount", { count: products.length })}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="relative ms-auto w-72 bg-[color:var(--paper)] h-full overflow-y-auto p-5 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <p className="font-display text-lg font-semibold text-[color:var(--ink)]">{t("filters")}</p>
                <button onClick={() => setSidebarOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white text-neutral-600 transition hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)]"><X className="w-4.5 h-4.5" /></button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="premium-card p-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)]">
                <ShoppingBag className="w-8 h-8 text-[color:var(--brand-maroon)]" />
              </div>
              <p className="font-display text-lg font-semibold text-[color:var(--ink)]">{t("noProducts")}</p>
              <p className="text-sm text-[color:var(--brand-muted)] mt-1">{t("adjustFilters")}</p>
              {hasFilters && (
                <button onClick={clearAll} className="bg-brand-gradient mt-5 inline-flex rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-110">{t("clearFilters")}</button>
              )}
            </div>
          ) : (
            <div className={"grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 transition-opacity " + (isPending ? "opacity-50" : "opacity-100")}>
              {products.map((p, i) => {
                const img = p.thumbnail_url || (Array.isArray(p.images) && p.images.length ? p.images[0] : null);
                const hasSale = p.sale_price != null && Number(p.sale_price) > 0 && p.price != null && Number(p.sale_price) < Number(p.price);
                const display = hasSale ? p.sale_price : p.price;
                const salePct = hasSale ? Math.round(((Number(p.price) - Number(p.sale_price)) / Number(p.price)) * 100) : 0;
                const hasVariants = rowHasOptions(p);
                const oos = Boolean(p.track_stock) && (p.stock_quantity == null || Number(p.stock_quantity) <= 0);

                return (
                  <Reveal key={p.id} delay={Math.min(i, 8) * 40}>
                  <div className="group premium-card overflow-hidden">
                    <Link href={"/products/" + p.id} className="block">
                      <div className="relative aspect-square w-full overflow-hidden bg-[color:var(--paper-2)]">
                        {img ? (
                          <img src={img} alt={p.name} className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingBag className="w-10 h-10 text-neutral-300" />
                          </div>
                        )}
                        {hasSale && (
                          <span className="bg-brand-gradient absolute top-2.5 start-2.5 rounded-full px-2.5 py-1 text-[9.5px] font-black tracking-wider text-white shadow-sm">
                            -{salePct}%
                          </span>
                        )}
                        {p.condition === "used" && (
                          <span className="absolute top-2.5 end-2.5 rounded-full bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] px-2.5 py-1 text-[9.5px] font-black tracking-wider text-white shadow-sm">
                            USED
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="p-3">
                      <Link href={"/products/" + p.id}>
                        <p className="text-[12.5px] font-medium text-neutral-700 line-clamp-2 leading-snug transition-colors hover:text-[color:var(--ink)]">{p.name}</p>
                      </Link>
                      <div className="mt-2 flex items-center justify-between gap-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[15px] font-extrabold text-[color:var(--brand-maroon)]">{aed(display)}</span>
                          {hasSale && <span className="text-[11px] text-neutral-400 line-through">{aed(p.price)}</span>}
                        </div>
                        <QuickAddButton
                          product={{
                            id: p.id,
                            name: p.name,
                            price: Number(p.price ?? 0),
                            sale_price: p.sale_price != null ? Number(p.sale_price) : null,
                            thumbnail_url: p.thumbnail_url ?? null,
                            images: p.images ?? null,
                            has_variants: hasVariants,
                            requires_prescription: Boolean(p.requires_prescription),
                            oos,
                            vendor_name: null,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
