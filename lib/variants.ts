// Relational product-variant model returned by the `get_product_variants` RPC,
// plus the pure "nested availability" logic shared by the PDP variant selector.
//
// The whole point of the selector is nested availability: when a value is
// picked in one option, every value in the OTHER options is checked for whether
// a purchasable (in_stock && is_active) variant exists that contains both.
// Values with no such variant are greyed out — never hidden. This single
// predicate covers all three cases: (a) no variant row for the combination,
// (b) the variant exists but in_stock is false, (c) is_active is false.

export type VOptionValue = {
  id: string;
  value: string;
  value_ar: string | null;
  swatch_hex: string | null;
  position: number;
};

export type VOption = {
  id: string;
  name: string;
  name_ar: string | null;
  position: number;
  values: VOptionValue[];
};

export type VVariant = {
  id: string;
  sku: string | null;
  price: number | null;
  sale_price: number | null;
  stock_quantity: number | null;
  is_active: boolean;
  in_stock: boolean;
  option_value_ids: string[];
  images: string[];
};

export type VariantTree = { options: VOption[]; variants: VVariant[] };

// selection: optionId -> valueId
export type VariantSelection = Record<string, string>;

/* eslint-disable @typescript-eslint/no-explicit-any */

// Coerce the raw RPC json (unknown shape) into a typed tree, sorted by position.
export function normalizeVariantTree(raw: unknown): VariantTree {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const rawOptions: any[] = Array.isArray(obj.options) ? obj.options : [];
  const rawVariants: any[] = Array.isArray(obj.variants) ? obj.variants : [];

  const options: VOption[] = rawOptions
    .map((o: any) => ({
      id: String(o.id),
      name: String(o.name ?? ""),
      name_ar: o.name_ar ?? null,
      position: Number(o.position ?? 0),
      values: (Array.isArray(o.values) ? o.values : [])
        .map((v: any) => ({
          id: String(v.id),
          value: String(v.value ?? ""),
          value_ar: v.value_ar ?? null,
          swatch_hex: v.swatch_hex ?? null,
          position: Number(v.position ?? 0),
        }))
        .sort((a: VOptionValue, b: VOptionValue) => a.position - b.position),
    }))
    .sort((a: VOption, b: VOption) => a.position - b.position);

  const variants: VVariant[] = rawVariants.map((v: any) => ({
    id: String(v.id),
    sku: v.sku ?? null,
    price: v.price != null ? Number(v.price) : null,
    sale_price: v.sale_price != null ? Number(v.sale_price) : null,
    stock_quantity: v.stock_quantity != null ? Number(v.stock_quantity) : null,
    is_active: v.is_active !== false,
    in_stock: v.in_stock === true,
    option_value_ids: Array.isArray(v.option_value_ids) ? v.option_value_ids.map(String) : [],
    images: Array.isArray(v.images) ? v.images.filter(Boolean).map(String) : [],
  }));

  return { options, variants };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const purchasable = (v: VVariant) => v.in_stock && v.is_active;

// A value is available iff some purchasable variant contains it together with
// the currently-selected value of every OTHER option. Greys out all three
// cases (no row / out of stock / inactive) with one test.
export function isValueAvailable(
  tree: VariantTree,
  selected: VariantSelection,
  optionId: string,
  valueId: string,
): boolean {
  const required: string[] = [valueId];
  for (const [oid, vid] of Object.entries(selected)) {
    if (oid !== optionId && vid) required.push(vid);
  }
  return tree.variants.some(
    (v) => purchasable(v) && required.every((r) => v.option_value_ids.includes(r)),
  );
}

// The variant matching a complete selection (one value per option), or null
// when the selection is incomplete or no such variant row exists.
export function resolveVariant(tree: VariantTree, selected: VariantSelection): VVariant | null {
  if (tree.options.length === 0) return null;
  const chosen = tree.options.map((o) => selected[o.id]);
  if (chosen.some((c) => !c)) return null; // incomplete
  return tree.variants.find((v) => chosen.every((c) => v.option_value_ids.includes(c!))) ?? null;
}

// Colour-type options render swatch dots; everything else renders text chips.
export function isColourOption(o: VOption): boolean {
  if (/colou?r|shade|hue/i.test(o.name)) return true;
  return o.values.some((v) => !!v.swatch_hex);
}

// Lowest active variant price — used for the "from …" price shown before a
// complete selection is made.
export function minVariantPrice(tree: VariantTree): number | null {
  const prices = tree.variants
    .filter((v) => v.is_active)
    .map((v) => (v.sale_price != null && v.sale_price > 0 ? v.sale_price : v.price))
    .filter((n): n is number => n != null && n > 0);
  return prices.length ? Math.min(...prices) : null;
}
