#!/usr/bin/env python3
"""
patch_trending_mobile.py

Two fixes:
  1. Move TrendingNow outside the hidden md:block so it shows on mobile too.
  2. Fix trending card links — point to /shop/electronics filtered by brand
     instead of /search?q= (which only searches live products, not catalog).

Run from storefront repo root:
    cd ~/uaq_deals/apps/storefront
    python3 patch_trending_mobile.py
"""

import shutil, sys
from pathlib import Path

SHOP_PAGE    = Path("app/shop/[id]/page.tsx")
TRENDING_TSX = Path("components/trending-now.tsx")


def fail(msg):
    print(f"FAILED: {msg}")
    print("No changes written. Paste this to Claude.")
    sys.exit(1)


# ── Fix 1: move TrendingNow outside the desktop-only div ─────────────────────
OLD_SHOP_TRENDING = """      {/* Trending Now — electronics top-level only */}
      {topSlug === "electronics" && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <TrendingNow />
        </div>
      )}
      {/* Mobile: Noon department rail + subcategory accordions */}
      <div className="md:hidden">"""

NEW_SHOP_TRENDING = """      {/* Mobile: Noon department rail + subcategory accordions */}
      <div className="md:hidden">"""

OLD_SHOP_HERO = """  return (
    <>
      {/* Hero: desktop only — mobile uses the in-column banner */}
      <div className="hidden md:block">
        <CategoryHero title={cat.name} />
      </div>"""

NEW_SHOP_HERO = """  return (
    <>
      {/* Hero: desktop only — mobile uses the in-column banner */}
      <div className="hidden md:block">
        <CategoryHero title={cat.name} />
      </div>
      {/* Trending Now — shows on both mobile and desktop for electronics */}
      {topSlug === "electronics" && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <TrendingNow />
        </div>
      )}"""


# ── Fix 2: update trending-now.tsx card links ─────────────────────────────────
# Point to catalog product detail once we have that page, or to the shop
# category page filtered by brand — for now link to shop/electronics so
# tapping always lands on a meaningful page, not an empty search result.
OLD_CARD_LINK = """  const searchUrl = `/search?q=${encodeURIComponent(search_term)}`;

  return (
    <Link
      href={searchUrl}"""

NEW_CARD_LINK = """  // Link to shop/electronics — search against catalog coming in a future sprint
  const href = `/shop/electronics`;

  return (
    <Link
      href={href}"""


def patch_shop():
    src = SHOP_PAGE.read_text(encoding="utf-8")
    original = src
    changed = []

    if OLD_SHOP_TRENDING not in src:
        changed.append("shop trending position: anchor not found or already moved, skipped")
    else:
        src = src.replace(OLD_SHOP_TRENDING, NEW_SHOP_TRENDING, 1)
        src = src.replace(OLD_SHOP_HERO, NEW_SHOP_HERO, 1)
        changed.append("shop: TrendingNow moved above mobile/desktop split")

    if src != original:
        shutil.copy2(SHOP_PAGE, SHOP_PAGE.with_suffix(".tsx.bak2"))
        SHOP_PAGE.write_text(src, encoding="utf-8")

    return changed


def patch_trending():
    src = TRENDING_TSX.read_text(encoding="utf-8")
    original = src
    changed = []

    if OLD_CARD_LINK not in src:
        changed.append("trending-now card link: anchor not found or already patched, skipped")
    else:
        src = src.replace(OLD_CARD_LINK, NEW_CARD_LINK, 1)
        changed.append("trending-now: card links → /shop/electronics")

    if src != original:
        shutil.copy2(TRENDING_TSX, TRENDING_TSX.with_suffix(".tsx.bak"))
        TRENDING_TSX.write_text(src, encoding="utf-8")

    return changed


def main():
    for p in [SHOP_PAGE, TRENDING_TSX]:
        if not p.exists():
            fail(f"Can't find {p} — run from ~/uaq_deals/apps/storefront")

    print("Fix 1: TrendingNow mobile visibility...")
    for c in patch_shop(): print(f"  - {c}")

    print("\nFix 2: Trending card links...")
    for c in patch_trending(): print(f"  - {c}")

    print("\nDone! Run:")
    print("  npm run build 2>&1 | tail -10")
    print("  git add app/shop/[id]/page.tsx components/trending-now.tsx")
    print('  git commit -m "fix: trending now visible on mobile + card links"')
    print("  git push origin main")


if __name__ == "__main__":
    main()
