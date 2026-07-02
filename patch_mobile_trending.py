#!/usr/bin/env python3
"""
patch_mobile_trending.py

Injects a trending strip into MobileCategoryNoon (client component) by:
  1. Adding a TrendingItem type + trendingItems prop to MobileCategoryNoon
  2. Rendering a horizontal scroll strip between the banner and accordions
  3. Fetching trending data in page.tsx (server) and passing it as a prop

Run from storefront repo root:
    cd ~/uaq_deals/apps/storefront
    python3 patch_mobile_trending.py
"""

import shutil, sys
from pathlib import Path

MOBILE = Path("app/shop/[id]/mobile-category-noon.tsx")
PAGE   = Path("app/shop/[id]/page.tsx")


def fail(msg):
    print(f"FAILED: {msg}")
    print("No changes written. Paste this to Claude.")
    sys.exit(1)


# ── Patch 1: mobile-category-noon.tsx ───────────────────────────────────────

# Add TrendingItem type after existing types
OLD_TYPES = """type Cat = { id: string; name: string };
type Grand = { id: string; name: string; image: string | null };
type Section = { id: string; name: string; children: Grand[] };"""

NEW_TYPES = """type Cat = { id: string; name: string };
type Grand = { id: string; name: string; image: string | null };
type Section = { id: string; name: string; children: Grand[] };
type TrendingItem = {
  rank: number;
  search_term: string;
  catalog: { id: string; title: string; brand: string | null; main_image_url: string | null };
};"""

# Add trendingItems to props interface
OLD_PROPS = """  subtitle,
  sections,
}: {
  topCategories: Cat[];
  activeTopId: string;
  category: Cat;
  subtitle: string;
  sections: Section[];
}) {"""

NEW_PROPS = """  subtitle,
  sections,
  trendingItems = [],
}: {
  topCategories: Cat[];
  activeTopId: string;
  category: Cat;
  subtitle: string;
  sections: Section[];
  trendingItems?: TrendingItem[];
}) {"""

# Insert trending strip between the banner and the subcategory accordions
OLD_ACCORDIONS = """        {/* Subcategory accordions */}
        {sections.map((sec) => {"""

NEW_ACCORDIONS = """        {/* Trending strip */}
        {trendingItems.length > 0 && (
          <div className="px-3 pb-2 pt-1">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[color:var(--brand-maroon)]">
              🔥 Trending
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {trendingItems.map((item) => {
                const href = item.catalog.brand
                  ? `/search?q=${encodeURIComponent(item.catalog.brand)}`
                  : "/shop/electronics";
                return (
                  <Link
                    key={item.catalog.id}
                    href={href}
                    className="flex w-24 shrink-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white"
                  >
                    <div className="flex h-20 items-center justify-center overflow-hidden bg-neutral-50">
                      {item.catalog.main_image_url ? (
                        <img
                          src={item.catalog.main_image_url}
                          alt={item.catalog.title}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-neutral-200" />
                      )}
                    </div>
                    <div className="p-1.5">
                      {item.catalog.brand && (
                        <p className="text-[9px] font-bold uppercase text-[color:var(--brand-maroon)] line-clamp-1">
                          {item.catalog.brand}
                        </p>
                      )}
                      <p className="text-[10px] font-medium leading-tight text-neutral-800 line-clamp-2">
                        {item.catalog.title}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Subcategory accordions */}
        {sections.map((sec) => {"""


# ── Patch 2: page.tsx ────────────────────────────────────────────────────────

# Fetch trending in server component and pass as prop
OLD_PAGE_FETCH = """  const [{ data: catRaw }] = await Promise.all([catQuery]);"""

NEW_PAGE_FETCH = """  // Fetch trending items for electronics category
  const trendingQuery = supabase
    .from("trending_products")
    .select("rank, search_term, catalog:catalog_id(id, title, brand, main_image_url)")
    .order("rank", { ascending: true })
    .limit(20);

  const [{ data: catRaw }, { data: trendingRaw }] = await Promise.all([catQuery, trendingQuery]);
  const trendingItems = (trendingRaw ?? []) as any[];"""

# Pass trendingItems prop to MobileCategoryNoon
OLD_MOBILE_CALL = """        <MobileCategoryNoon
          topCategories={topCategories}
          activeTopId={activeTopId}
          category={cat}
          subtitle={subtitleFor(cat.name)}
          sections={sections}
        />"""

NEW_MOBILE_CALL = """        <MobileCategoryNoon
          topCategories={topCategories}
          activeTopId={activeTopId}
          category={cat}
          subtitle={subtitleFor(cat.name)}
          sections={sections}
          trendingItems={topSlug === "electronics" ? trendingItems : []}
        />"""


def patch_mobile():
    src = MOBILE.read_text(encoding="utf-8")
    original = src
    changed = []

    if "TrendingItem" in src:
        changed.append("types: already patched, skipped")
    elif OLD_TYPES in src:
        src = src.replace(OLD_TYPES, NEW_TYPES, 1)
        changed.append("types: TrendingItem type added")
    else:
        fail("Could not find type definitions anchor in mobile-category-noon.tsx")

    if "trendingItems" in src and "trendingItems = []" in src:
        changed.append("props: already patched, skipped")
    elif OLD_PROPS in src:
        src = src.replace(OLD_PROPS, NEW_PROPS, 1)
        changed.append("props: trendingItems prop added")
    else:
        fail("Could not find props interface anchor in mobile-category-noon.tsx")

    if "Trending strip" in src:
        changed.append("trending strip: already present, skipped")
    elif OLD_ACCORDIONS in src:
        src = src.replace(OLD_ACCORDIONS, NEW_ACCORDIONS, 1)
        changed.append("trending strip: inserted above accordions")
    else:
        fail("Could not find subcategory accordions anchor in mobile-category-noon.tsx")

    if src != original:
        shutil.copy2(MOBILE, MOBILE.with_suffix(".tsx.bak"))
        MOBILE.write_text(src, encoding="utf-8")

    return changed


def patch_page():
    src = PAGE.read_text(encoding="utf-8")
    original = src
    changed = []

    if "trendingQuery" in src:
        changed.append("page fetch: already patched, skipped")
    elif OLD_PAGE_FETCH in src:
        src = src.replace(OLD_PAGE_FETCH, NEW_PAGE_FETCH, 1)
        changed.append("page fetch: trending query added")
    else:
        fail("Could not find catRaw fetch anchor in page.tsx")

    if "trendingItems={" in src:
        changed.append("page MobileCategoryNoon prop: already patched, skipped")
    elif OLD_MOBILE_CALL in src:
        src = src.replace(OLD_MOBILE_CALL, NEW_MOBILE_CALL, 1)
        changed.append("page: trendingItems passed to MobileCategoryNoon")
    else:
        fail("Could not find MobileCategoryNoon call anchor in page.tsx")

    if src != original:
        shutil.copy2(PAGE, PAGE.with_suffix(".tsx.bak3"))
        PAGE.write_text(src, encoding="utf-8")

    return changed


def main():
    for p in [MOBILE, PAGE]:
        if not p.exists():
            fail(f"Can't find {p} — run from ~/uaq_deals/apps/storefront")

    print("Patch 1: mobile-category-noon.tsx...")
    for c in patch_mobile(): print(f"  - {c}")

    print("\nPatch 2: page.tsx...")
    for c in patch_page(): print(f"  - {c}")

    print("\nDone! Run:")
    print("  npm run build 2>&1 | tail -10")
    print("  git add app/shop/[id]/mobile-category-noon.tsx app/shop/[id]/page.tsx")
    print('  git commit -m "feat: trending strip inside mobile category view"')
    print("  git push origin main")


if __name__ == "__main__":
    main()
