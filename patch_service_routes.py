#!/usr/bin/env python3
"""
Repoint Typing Center + Business Setup from the old cart flow to the
new document-enquiry form. Single edit to the shared service-routes map;
both services/page.tsx and categories/page.tsx pick it up.

Run from ~/uaq_deals/apps/storefront.
"""
from pathlib import Path
import shutil, sys

TARGET = Path("lib/service-routes.ts")

edits = [
    ('  business_setup:       "/services/cart/business_setup",',
     '  business_setup:       "/services/enquiry/business_setup",'),
    ('  typing_center:        "/services/cart/typing_center",',
     '  typing_center:        "/services/enquiry/typing_center",'),
]


def main():
    if not TARGET.exists():
        sys.exit("FAILED: run from ~/uaq_deals/apps/storefront")
    src = TARGET.read_text(encoding="utf-8")

    if "/services/enquiry/typing_center" in src:
        sys.exit("FAILED: already repointed")

    for old, _ in edits:
        if src.count(old) != 1:
            sys.exit(f"FAILED: line not unique (count={src.count(old)}):\n{old}")

    for old, new in edits:
        src = src.replace(old, new, 1)

    shutil.copy2(TARGET, TARGET.with_suffix(".ts.bak_enquiry"))
    TARGET.write_text(src, encoding="utf-8")
    print("Repointed typing_center + business_setup -> /services/enquiry/...")


if __name__ == "__main__":
    main()
