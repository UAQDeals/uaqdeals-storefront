import { createClient } from "@/lib/supabase/server";
import { CartDrawer, type UpsellProduct } from "@/components/cart-drawer";

// Server component: fetches featured products once, hands them to the client drawer.
export async function CartDrawerLoader() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, price, sale_price, thumbnail_url, is_featured")
    .eq("status", "active")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(8);

  const upsells: UpsellProduct[] = (data ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    price: Number(p.price ?? 0),
    sale_price: p.sale_price != null ? Number(p.sale_price) : null,
    thumbnail_url: (p.thumbnail_url as string | null) ?? null,
    vendor_name: null,
  }));

  return <CartDrawer upsells={upsells} />;
}
