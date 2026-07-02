import { createClient } from "@/lib/supabase/server";
import { ShopClient } from "./shop-client";
import { showProducts } from "@/lib/emirate";
import { ProductsUnavailable } from "@/components/products-unavailable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop — UAQ Deals" };

type SearchParams = { [k: string]: string | string[] | undefined };

function sp(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] : v ?? "";
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q         = sp(params.q).trim();
  const catId     = sp(params.cat);
  const condition = sp(params.condition);
  const minPrice  = parseFloat(sp(params.min)) || 0;
  const maxPrice  = parseFloat(sp(params.max)) || 0;
  const sort      = sp(params.sort) || "newest";

  const supabase = await createClient();
  if (!(await showProducts())) return <ProductsUnavailable />;

  // Restrict to Product-flagged vendor types (exclude services).
  // services live in the same products table, so filter by the vendor's kind:
  // products.vendor_id -> vendors.vendor_type_id -> vendor_types.vendor_kind
  const { data: prodTypes } = await supabase
    .from("vendor_types")
    .select("id")
    .or("vendor_kind.is.null,vendor_kind.eq.product");
  const prodVendorTypeIds = (prodTypes ?? []).map((v) => v.id);
  const { data: prodVendors } = await supabase
    .from("vendors")
    .select("id")
    .in("vendor_type_id", prodVendorTypeIds);
  const prodVendorIds = (prodVendors ?? []).map((v) => v.id);

  // Categories that have active products — deduplicated by name
  const { data: catRaw } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  const seen = new Set<string>();
  const categories: { id: string; name: string }[] = [];
  for (const c of catRaw ?? []) {
    if (!seen.has(c.name)) { seen.add(c.name); categories.push(c); }
  }

  // Products query
  let query = supabase
    .from("products")
    .select("id, name, price, sale_price, thumbnail_url, images, condition, track_stock, stock_quantity, requires_prescription, variants, category_id")
    .eq("status", "active")
    .in("vendor_id", prodVendorIds);

  if (q)         query = query.ilike("name", `%${q}%`);
  if (catId)     query = query.eq("category_id", catId);
  if (condition && condition !== "all") query = query.eq("condition", condition);
  if (minPrice)  query = query.gte("price", minPrice);
  if (maxPrice)  query = query.lte("price", maxPrice);

  if (sort === "price_asc")  query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else if (sort === "featured") query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  query = query.limit(60);

  const { data: products } = await query;

  return (
    <ShopClient
      products={products ?? []}
      categories={categories}
      initialQ={q}
      initialCat={catId}
      initialCondition={condition || "all"}
      initialMin={minPrice ? String(minPrice) : ""}
      initialMax={maxPrice ? String(maxPrice) : ""}
      initialSort={sort}
    />
  );
}
