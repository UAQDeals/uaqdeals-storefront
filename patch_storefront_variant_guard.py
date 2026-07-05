#!/usr/bin/env python3
"""
HOTFIX: stop the storefront product page crashing on the new variant
format ({name, price, sale_price, stock_quantity} instead of
{name, options:[]}). Guards the .options access so the page loads.
Proper priced-variant UI comes in a follow-up.
Run from ~/uaq_deals/apps/storefront.
"""
from pathlib import Path
import sys

TARGET = Path("components/product-detail.tsx")
s = TARGET.read_text()

changes = []

# The crash: line ~176 does v.options.map(...) but new variants have no
# `options`. Guard it. Also the picked-state init at ~45 already guards
# with Array.isArray, so it's safe; the render is the crash point.

# Wrap the whole variants block so it only renders old-style
# (options-bearing) variants; new priced variants are skipped for now
# (they'll get proper UI in the follow-up) — this stops the crash.
old = '''        {p.variants?.length > 0 && (
          <div className="mt-6 space-y-4">
            {p.variants.map((v) => ('''
new = '''        {p.variants?.length > 0 && p.variants.some((v) => Array.isArray((v as { options?: unknown }).options)) && (
          <div className="mt-6 space-y-4">
            {p.variants.filter((v) => Array.isArray((v as { options?: unknown }).options)).map((v) => ('''
if old in s:
    s = s.replace(old, new, 1); changes.append("guard-variant-render")
else:
    sys.exit("FAILED: variant render block anchor not found")

TARGET.write_text(s)
print("hotfix applied:", ", ".join(changes))
