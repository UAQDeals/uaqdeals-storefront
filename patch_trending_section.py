#!/usr/bin/env python3
"""
patch_trending_section.py

Adds a "Trending Now" horizontal scroll row to the electronics category page.
- Fetches from trending_products joined to catalog_products
- Maps to ProductCard shape (image from catalog, price = null since catalog has no price)
- Shows only on the electronics slug
- Sits between the category header and the main products grid

Run from the storefront repo root:
    cd ~/uaq_deals/apps/storefront
    python3 patch_trending_section.py
"""

import shutil, sys
from pathlib import Path

TARGET = Path("app/categories/[slug]/page.tsx")

# ── New imports to add ───────────────────────────────────────────────────────
OLD_IMPORTS = '''import {
  FeaturedProducts,
  type ProductCard,
} from "@/components/featured-products";'''

NEW_IMPORTS = '''import {
  FeaturedProducts,
  type ProductCard,
} from "@/components/featured-products";
import { TrendingNow } from "@/components/trending-now";'''

# ── Insert TrendingNow between header and products grid ───────────────────────
OLD_PRODUCTS_SECTION = '''      {/* Products */}
      {products.length ? (
        <div className="mt-2">
          <FeaturedProducts products={products} />
        </div>'''

NEW_PRODUCTS_SECTION = '''      {/* Trending Now — only on electronics */}
      {slug === "electronics" && <TrendingNow />}

      {/* Products */}
      {products.length ? (
        <div className="mt-2">
          <FeaturedProducts products={products} />
        </div>'''


def fail(msg):
    print(f"FAILED: {msg}")
    print("No changes written. Paste this to Claude.")
    sys.exit(1)


def main():
    if not TARGET.exists():
        fail(f"Can't find {TARGET} — run from ~/uaq_deals/apps/storefront")

    src = TARGET.read_text(encoding="utf-8")
    original = src
    changed = []

    # 1) Add TrendingNow import
    if "trending-now" in src:
        changed.append("import: already present, skipped")
    elif OLD_IMPORTS in src:
        src = src.replace(OLD_IMPORTS, NEW_IMPORTS, 1)
        changed.append("import: added TrendingNow")
    else:
        fail("Could not find featured-products import block to anchor on")

    # 2) Insert TrendingNow component
    if "<TrendingNow" in src:
        changed.append("TrendingNow: already present, skipped")
    elif OLD_PRODUCTS_SECTION in src:
        src = src.replace(OLD_PRODUCTS_SECTION, NEW_PRODUCTS_SECTION, 1)
        changed.append("TrendingNow: inserted above products grid")
    else:
        fail("Could not find Products section comment to anchor on")

    if src == original:
        print("Nothing to do — already patched.")
        return

    shutil.copy2(TARGET, TARGET.with_suffix(".tsx.bak"))
    TARGET.write_text(src, encoding="utf-8")
    print("Patched successfully:")
    for c in changed:
        print(f"  - {c}")
    print(f"\nBackup: {TARGET.with_suffix('.tsx.bak')}")
    print("\nNext: also create components/trending-now.tsx (provided separately)")


if __name__ == "__main__":
    main()
