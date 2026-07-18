#!/usr/bin/env python3
"""
Patch: messages/en.json + messages/ar.json

Adds the 4 missing checkout error-message keys (outOfStock,
groceryUnavailable, groceryNoZone, phoneInUse) right after the
existing "fillRequired" key inside the "checkout" namespace.

Anchors on "fillRequired" being immediately followed by "orderPlaced"
(only true in the checkout block -- the contact-form namespace also
has its own "fillRequired" key, followed by "sendError" instead, so
that one is left untouched).

Safe to re-run.
"""
import json
import re
import shutil
import sys
from pathlib import Path

BASE = Path("~/uaq_deals/apps/storefront/messages").expanduser()

NEW_KEYS = {
    "en.json": {
        "outOfStock": "Sorry, one of the items in your cart is currently out of stock.",
        "groceryUnavailable": "Sorry, {department} isn't available for delivery to your address yet.",
        "groceryNoZone": "Grocery delivery isn't available in your area yet.",
        "phoneInUse": "This phone number is linked to another account. Please use a different number.",
    },
    "ar.json": {
        "outOfStock": "عذراً، أحد المنتجات في سلتك غير متوفر حالياً.",
        "groceryUnavailable": "عذراً، قسم {department} غير متوفر للتوصيل إلى عنوانك حالياً.",
        "groceryNoZone": "توصيل البقالة غير متوفر في منطقتك حالياً.",
        "phoneInUse": "رقم الهاتف هذا مرتبط بحساب آخر. يرجى استخدام رقم مختلف.",
    },
}

ANCHOR = re.compile(
    r'([ \t]*)"fillRequired":\s*"(?:[^"\\]|\\.)*",\n(?=[ \t]*"orderPlaced":)'
)


def patch_file(filename: str, keys: dict) -> None:
    target = BASE / filename
    print(f"--- {filename} ---")
    if not target.exists():
        sys.exit(f"File not found: {target}")

    original = target.read_text(encoding="utf-8")
    content = original

    if '"phoneInUse"' in content:
        print("  [skip] keys already present")
        return

    matches = list(ANCHOR.finditer(content))
    if len(matches) != 1:
        sys.exit(
            f"Expected exactly 1 checkout-namespace fillRequired anchor in {filename}, "
            f"found {len(matches)}. Aborting rather than guess."
        )
    indent = matches[0].group(1)

    new_lines = "".join(
        f'{indent}"{k}": {json.dumps(v, ensure_ascii=False)},\n' for k, v in keys.items()
    )

    def build_replacement(m):
        return m.group(0) + new_lines

    content = ANCHOR.sub(build_replacement, content, count=1)

    # Hard requirement: the result must still be valid JSON.
    try:
        json.loads(content)
    except json.JSONDecodeError as e:
        sys.exit(f"ABORT: patched {filename} is not valid JSON: {e}")

    backup = target.with_suffix(target.suffix + ".bak")
    shutil.copy2(target, backup)
    target.write_text(content, encoding="utf-8")
    print(f"  [ok]   added {', '.join(keys.keys())}")
    print(f"  Patched: {target}")
    print(f"  Backup:  {backup}")


def main():
    for filename, keys in NEW_KEYS.items():
        patch_file(filename, keys)


if __name__ == "__main__":
    main()
