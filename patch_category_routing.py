#!/usr/bin/env python3
"""
patch_category_routing.py

Two fixes:
  1. categories/[slug]/page.tsx — after the `dedicatedFor` check, look up the
     slug in the `categories` table (product catalog). If found, redirect to
     /shop/[slug] so Electronics/etc go to the rich Noon-style page instead
     of the empty vendor-type page.

  2. shop/[id]/page.tsx — import TrendingNow and insert it between the
     CategoryHero (desktop hero) and the MobileCategoryNoon block, only when
     the top-level category slug is "electronics".

Run from the storefront repo root:
    cd ~/uaq_deals/apps/storefront
    python3 patch_category_routing.py
"""

import shutil, sys
from pathlib import Path

CATEGORIES_PAGE = Path("app/categories/[slug]/page.tsx")
SHOP_PAGE       = Path("app/shop/[id]/page.tsx")


def fail(msg):
    print(f"FAILED: {msg}")
    print("No changes written. Paste this to Claude.")
    sys.exit(1)


# ── Patch 1: categories/[slug]/page.tsx ─────────────────────────────────────
OLD_DEDICATED = """  // If this slug has a dedicated /services/ page, forward there.
  const dedicated = dedicatedFor(slug);
  if (dedicated) redirect(dedicated);

  const supabase = await createClient();"""

NEW_DEDICATED = """  // If this slug has a dedicated /services/ page, forward there.
  const dedicated = dedicatedFor(slug);
  if (dedicated) redirect(dedicated);

  const supabase = await createClient();

  // If this slug exists in the product catalog (categories table), send to
  // the richer /shop/[slug] page instead of the vendor-type page.
  const { data: catalogCat } = await supabase
    .from("categories")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();
  if (catalogCat) redirect("/shop/" + slug);"""


# ── Patch 2: shop/[id]/page.tsx ─────────────────────────────────────────────
OLD_SHOP_IMPORTS = """import { MobileCategoryNoon } from "./mobile-category-noon";
import { CategoryHero, subtitleFor } from "@/components/category-hero";
import { ShopCategoryDesktop } from "./shop-category-desktop";"""

NEW_SHOP_IMPORTS = """import { MobileCategoryNoon } from "./mobile-category-noon";
import { CategoryHero, subtitleFor } from "@/components/category-hero";
import { ShopCategoryDesktop } from "./shop-category-desktop";
import { TrendingNow } from "@/components/trending-now";"""

OLD_SHOP_JSX = """  return (
    <>
      {/* Hero: desktop only — mobile uses the in-column banner */}
      <div className="hidden md:block">
        <CategoryHero title={cat.name} />
      </div>
      {/* Mobile: Noon department rail + subcategory accordions */}
      <div className="md:hidden">"""

NEW_SHOP_JSX = """  // Top-level slug for conditional trending row
  const topSlug = breadcrumb[0]?.name?.toLowerCase().replace(/\\s+/g, "-") ?? cat.slug ?? "";

  return (
    <>
      {/* Hero: desktop only — mobile uses the in-column banner */}
      <div className="hidden md:block">
        <CategoryHero title={cat.name} />
      </div>
      {/* Trending Now — electronics top-level only */}
      {topSlug === "electronics" && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <TrendingNow />
        </div>
      )}
      {/* Mobile: Noon department rail + subcategory accordions */}
      <div className="md:hidden">"""


def patch_categories():
    src = CATEGORIES_PAGE.read_text(encoding="utf-8")
    original = src
    changed = []

    if "catalog catalog" in src or "/shop/" + '" + slug' in src or "catalogCat" in src:
        changed.append("categories redirect: already patched, skipped")
    elif OLD_DEDICATED in src:
        src = src.replace(OLD_DEDICATED, NEW_DEDICATED, 1)
        changed.append("categories redirect: added /shop/ redirect for catalog slugs")
    else:
        fail(f"Could not find dedicatedFor anchor in {CATEGORIES_PAGE}")

    if src != original:
        shutil.copy2(CATEGORIES_PAGE, CATEGORIES_PAGE.with_suffix(".tsx.bak2"))
        CATEGORIES_PAGE.write_text(src, encoding="utf-8")

    return changed


def patch_shop():
    src = SHOP_PAGE.read_text(encoding="utf-8")
    original = src
    changed = []

    # Import
    if "trending-now" in src:
        changed.append("shop import: already present, skipped")
    elif OLD_SHOP_IMPORTS in src:
        src = src.replace(OLD_SHOP_IMPORTS, NEW_SHOP_IMPORTS, 1)
        changed.append("shop import: added TrendingNow")
    else:
        fail(f"Could not find shop page imports anchor in {SHOP_PAGE}")

    # JSX
    if "TrendingNow" in src and "topSlug" in src:
        changed.append("shop TrendingNow: already present, skipped")
    elif OLD_SHOP_JSX in src:
        src = src.replace(OLD_SHOP_JSX, NEW_SHOP_JSX, 1)
        changed.append("shop TrendingNow: inserted after hero")
    else:
        fail(f"Could not find shop page JSX anchor in {SHOP_PAGE}")

    if src != original:
        shutil.copy2(SHOP_PAGE, SHOP_PAGE.with_suffix(".tsx.bak"))
        SHOP_PAGE.write_text(src, encoding="utf-8")

    return changed


def main():
    if not CATEGORIES_PAGE.exists():
        fail(f"Can't find {CATEGORIES_PAGE} — run from ~/uaq_deals/apps/storefront")
    if not SHOP_PAGE.exists():
        fail(f"Can't find {SHOP_PAGE} — run from ~/uaq_deals/apps/storefront")

    print("Patch 1: categories/[slug] redirect...")
    c1 = patch_categories()
    for c in c1: print(f"  - {c}")

    print("\nPatch 2: shop/[id] TrendingNow...")
    c2 = patch_shop()
    for c in c2: print(f"  - {c}")

    print("\nDone! Next:")
    print("  npm run build 2>&1 | tail -15")
    print("  # if clean:")
    print('  git add "app/categories/[slug]/page.tsx" "app/shop/[id]/page.tsx" components/trending-now.tsx')
    print('  git commit -m "feat: trending now on shop page + categories redirect to shop"')
    print("  git push origin main")


if __name__ == "__main__":
    main()
