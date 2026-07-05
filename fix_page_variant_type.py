#!/usr/bin/env python3
"""Update the variant cast in page.tsx to the new priced shape."""
from pathlib import Path
import sys

TARGET = Path("app/products/[id]/page.tsx")
s = TARGET.read_text()

old = '''    variants: (Array.isArray(p.variants) ? p.variants : []) as Array<{
      name: string;
      options: string[];
    }>,'''
new = '''    variants: (Array.isArray(p.variants) ? p.variants : []) as Array<{
      name: string;
      price: number | null;
      sale_price: number | null;
      sku?: string | null;
      stock_quantity: number;
    }>,'''
if old in s:
    s = s.replace(old, new, 1)
    TARGET.write_text(s)
    print("FIXED: page.tsx variant cast -> priced shape")
else:
    print("anchor not found")
    sys.exit(1)
